"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { parents, subscriptions } from "@/db/schema";
import { auth } from "@/auth";
import { billingConfigured, stripe, TRIAL_DAYS } from "@/lib/stripe";
import { prorationFor } from "@/lib/billing/rules";
import { entitlementFor, releaseSeat } from "@/lib/data/subscriptions";
import { listStudents } from "@/lib/data/students";

export interface BillingState {
  error?: string;
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** Finds or creates the Stripe customer for this parent. */
async function customerFor(parentId: string): Promise<string> {
  const [parent] = await db
    .select()
    .from(parents)
    .where(eq(parents.id, parentId))
    .limit(1);
  if (!parent) throw new Error("Parent not found");
  if (parent.stripeCustomerId) return parent.stripeCustomerId;

  const customer = await stripe().customers.create({
    email: parent.email,
    name: parent.name ?? undefined,
    metadata: { parentId },
  });

  await db
    .update(parents)
    .set({ stripeCustomerId: customer.id })
    .where(eq(parents.id, parentId));

  return customer.id;
}

/**
 * Starts checkout.
 *
 * One subscription per family with a seat quantity, not one subscription per
 * child: a family with three children otherwise gets three invoices, three
 * renewal dates and three chances for a payment to fail.
 *
 * The card taken here is also what makes the parental consent verifiable
 * under COPPA, which is why the trial takes a card rather than skipping it.
 */
export async function startCheckout(
  _prev: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) return { error: "Please sign in again." };

  if (!billingConfigured()) {
    return { error: "Billing is not set up on this deployment yet." };
  }

  const plan = formData.get("plan") === "annual" ? "annual" : "monthly";
  const priceId =
    plan === "annual"
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY;
  if (!priceId) return { error: "That plan is not available yet." };

  // One seat per child already on the account, minimum one.
  const kids = await listStudents(parentId);
  const quantity = Math.max(1, kids.length);

  const customerId = await customerFor(parentId);

  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: parentId,
    line_items: [
      {
        price: priceId,
        quantity,
        // Let the parent change the number of children on the Stripe page
        // itself, rather than making them come back and adjust it afterwards.
        adjustable_quantity: { enabled: true, minimum: 1, maximum: 10 },
      },
    ],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { parentId },
    },
    allow_promotion_codes: true,
    success_url: `${appUrl()}/parent?checkout=done`,
    cancel_url: `${appUrl()}/parent?checkout=cancelled`,
    metadata: { parentId },
  });

  if (!checkout.url) return { error: "Could not start checkout." };
  redirect(checkout.url);
}

/**
 * Opens the Stripe customer portal.
 *
 * Card details, invoices and cancellation all live there. Rebuilding those
 * screens would mean handling card data on surfaces we control, for no gain.
 */
export async function openBillingPortal(): Promise<BillingState> {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) return { error: "Please sign in again." };
  if (!billingConfigured()) {
    return { error: "Billing is not set up on this deployment yet." };
  }

  const customerId = await customerFor(parentId);

  // The account is shared with other products, and its default portal
  // configuration belongs to them. Naming Sparkquill's own means a parent sees
  // our heading and our legal links, not another business's.
  const configuration = process.env.STRIPE_PORTAL_CONFIGURATION;

  const portal = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl()}/parent`,
    ...(configuration ? { configuration } : {}),
  });

  redirect(portal.url);
}

/**
 * Changes how many children the family is paying for.
 *
 * Adding a seat prorates immediately, so the child can start today. Removing
 * one does not refund and does not release the seat: it was paid for, so it
 * stays usable until the period ends. The asymmetry is deliberate and is
 * explained to the parent in the interface.
 */
export async function changeSeatCount(
  _prev: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) return { error: "Please sign in again." };
  if (!billingConfigured()) {
    return { error: "Billing is not set up on this deployment yet." };
  }

  const requested = Number(formData.get("seats"));
  if (!Number.isInteger(requested) || requested < 1 || requested > 10) {
    return { error: "Choose between one and ten children." };
  }

  const entitlement = await entitlementFor(parentId);
  if (entitlement.state === "none" || entitlement.state === "complimentary") {
    return { error: "There is no subscription to change." };
  }

  const sub = entitlement.subscription;
  if (requested === sub.seatQuantity) return {};

  const stripeSub = await stripe().subscriptions.retrieve(
    sub.stripeSubscriptionId,
  );
  const item = stripeSub.items.data[0];
  if (!item) return { error: "That subscription has no billable item." };

  await stripe().subscriptions.update(sub.stripeSubscriptionId, {
    items: [{ id: item.id, quantity: requested }],
    proration_behavior: prorationFor(sub.seatQuantity, requested),
  });

  // The webhook will write the new quantity. Nothing is updated here, so the
  // two paths cannot disagree about what Stripe actually did.
  return {};
}

/**
 * Removes a child's seat without cancelling anything.
 *
 * Their progress is untouched — a child who stops for a term and comes back
 * should find their history intact.
 */
export async function unseatStudent(studentId: string): Promise<BillingState> {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) return { error: "Please sign in again." };

  const kids = await listStudents(parentId);
  if (!kids.some((k) => k.id === studentId)) {
    return { error: "That profile is not on this account." };
  }

  await releaseSeat(studentId);
  return {};
}

/** Read-only view of the family's billing state, for the dashboard. */
export async function billingSummary(parentId: string) {
  const entitlement = await entitlementFor(parentId);
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.parentId, parentId))
    .limit(1);

  const seated =
    entitlement.state === "active" || entitlement.state === "grace"
      ? entitlement.seatsUsed
      : 0;

  return {
    configured: billingConfigured(),
    state: entitlement.state,
    seatsPaid: sub?.seatQuantity ?? 0,
    seatsUsed: seated,
    status: sub?.status ?? null,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    trialEnd: sub?.trialEnd ?? null,
    complimentaryUntil:
      entitlement.state === "complimentary" ? entitlement.until : null,
    complimentaryReason:
      entitlement.state === "complimentary" ? entitlement.reason : null,
  };
}
