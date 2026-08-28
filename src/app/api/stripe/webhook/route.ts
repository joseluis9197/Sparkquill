import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { parents, stripeEvents, subscriptions } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { fillSeats } from "@/lib/data/subscriptions";
import { accessFor, type SubscriptionStatus } from "@/lib/billing/rules";

/**
 * Stripe webhook.
 *
 * Two rules govern everything here.
 *
 * First, Stripe is the source of truth and this database is a cache. Every
 * handler writes what Stripe just told us, rather than computing what it
 * thinks the state should be.
 *
 * Second, every event is recorded before it is acted on. Stripe retries
 * delivery, and without that record a redelivered `subscription.updated`
 * would re-run seat assignment and a redelivered invoice event would double
 * a credit.
 */

export const runtime = "nodejs";
// The signature is computed over the raw bytes, so nothing may reparse or
// re-encode the body before it is verified.
export const dynamic = "force-dynamic";

const HANDLED = new Set<string>([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Billing is not configured." },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    // An unverified body is not a Stripe event and must never be acted on.
    console.error("[stripe] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Claim the event. A duplicate delivery loses the race and exits here.
  const claimed = await db
    .insert(stripeEvents)
    .values({ id: event.id, type: event.type, payload: event as unknown })
    .onConflictDoNothing()
    .returning({ id: stripeEvents.id });

  if (claimed.length === 0) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (!HANDLED.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    await handle(event);
  } catch (err) {
    // Returning 500 makes Stripe retry. The event row is removed first, or the
    // retry would be rejected as a duplicate and the change lost for good.
    await db.delete(stripeEvents).where(eq(stripeEvents.id, event.id));
    console.error(`[stripe] handler failed for ${event.type}`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handle(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const parentId = session.client_reference_id ?? session.metadata?.parentId;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      if (parentId && customerId) {
        await db
          .update(parents)
          .set({ stripeCustomerId: customerId })
          .where(eq(parents.id, parentId));
      }

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (subscriptionId) {
        const sub = await stripe().subscriptions.retrieve(subscriptionId);
        await upsertSubscription(sub, parentId ?? undefined);
      }
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await upsertSubscription(event.data.object as Stripe.Subscription);
      return;
    }

    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = subscriptionIdFromInvoice(invoice);
      if (!subId) return;
      // Re-read from Stripe rather than inferring status from the invoice:
      // the subscription object is the authority on what state it is in.
      const sub = await stripe().subscriptions.retrieve(subId);
      await upsertSubscription(sub);
      return;
    }
  }
}

/** The subscription id on an invoice, across the shapes Stripe has used. */
function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const direct = (invoice as unknown as { subscription?: string | { id: string } })
    .subscription;
  if (typeof direct === "string") return direct;
  if (direct && typeof direct === "object") return direct.id;

  // Newer API versions carry it on the line items instead.
  for (const line of invoice.lines?.data ?? []) {
    const parent = (line as unknown as {
      parent?: { subscription_item_details?: { subscription?: string } };
    }).parent;
    const id = parent?.subscription_item_details?.subscription;
    if (typeof id === "string") return id;
  }
  return null;
}

async function upsertSubscription(
  sub: Stripe.Subscription,
  parentIdHint?: string,
) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  let parentId = parentIdHint;
  if (!parentId) {
    const [row] = await db
      .select({ id: parents.id })
      .from(parents)
      .where(eq(parents.stripeCustomerId, customerId))
      .limit(1);
    parentId = row?.id;
  }
  if (!parentId) {
    // Nothing to attach it to. Recorded and skipped rather than throwing, so
    // Stripe is not made to retry an event we can never satisfy.
    console.warn(`[stripe] no parent for customer ${customerId}`);
    return;
  }

  const item = sub.items.data[0];
  const priceId = item?.price?.id ?? "";
  const quantity = item?.quantity ?? 1;

  // Period end moved onto the item in recent API versions.
  const periodEnd =
    (item as unknown as { current_period_end?: number })?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;

  const values = {
    parentId,
    stripeSubscriptionId: sub.id,
    stripePriceId: priceId,
    status: sub.status as typeof subscriptions.$inferInsert.status,
    seatQuantity: quantity,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
    updatedAt: new Date(),
  };

  const [saved] = await db
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({
      target: subscriptions.stripeSubscriptionId,
      set: {
        status: values.status,
        seatQuantity: values.seatQuantity,
        currentPeriodEnd: values.currentPeriodEnd,
        cancelAtPeriodEnd: values.cancelAtPeriodEnd,
        trialEnd: values.trialEnd,
        updatedAt: values.updatedAt,
      },
    })
    .returning({ id: subscriptions.id, status: subscriptions.status });

  // Seat the children whenever the subscription is live. Safe to repeat:
  // assignSeat is a no-op for a child that already holds a seat.
  if (saved && accessFor(saved.status as SubscriptionStatus) === "active") {
    await fillSeats(parentId, saved.id);
  }
}
