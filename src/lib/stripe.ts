import "server-only";
import Stripe from "stripe";

/**
 * Stripe client, created on first use.
 *
 * Lazy for the same reason the database client is: `next build` imports these
 * modules while collecting page data, where no keys exist and none are needed.
 *
 * The API version is deliberately left at the SDK's own pin rather than
 * hard-coded here. Overriding it with a string that the installed SDK's types
 * do not know about is the usual way this integration ends up lying about what
 * shape the responses have.
 */
let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Billing is unavailable until it is configured.",
    );
  }
  cached = new Stripe(key, { typescript: true });
  return cached;
}

/**
 * Whether billing is configured at all.
 *
 * Every billing surface checks this first, so a deployment without Stripe keys
 * runs normally with the paid features clearly marked as unavailable, rather
 * than throwing a 500 at a parent.
 */
export function billingConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_MONTHLY &&
      process.env.STRIPE_WEBHOOK_SECRET,
  );
}

export const PRICE_MONTHLY_CENTS = 1000;
export const PRICE_ANNUAL_CENTS = 10000;
export const TRIAL_DAYS = 7;

/** Statuses that entitle a child to practise. */
export const ACTIVE_STATUSES = ["trialing", "active"] as const;

/**
 * Statuses where the parent keeps access to reports but children cannot
 * practise. A lapsed card must never destroy a child's history, so this is a
 * downgrade rather than a deletion.
 */
export const GRACE_STATUSES = ["past_due", "unpaid"] as const;
