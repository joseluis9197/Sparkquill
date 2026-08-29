/**
 * Billing rules, kept pure and separate from Stripe and the database.
 *
 * These are the decisions that determine whether a family can use what they
 * paid for. Getting one wrong either locks out a paying customer or gives the
 * product away, so they are worth stating in one place and testing directly
 * rather than inferring from whatever the API happened to return.
 */

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

export type AccessState = "active" | "grace" | "none";

/**
 * Every way a family can be entitled, including free access granted by staff.
 *
 * Kept as one type with one predicate so a new state cannot be added and then
 * forgotten at one of the several places that gate practice.
 */
export type EntitlementState = AccessState | "complimentary";

/** Whether a child may practise, whoever is paying — or nobody. */
export function grantsPractice(
  state: EntitlementState,
): state is "active" | "complimentary" {
  return state === "active" || state === "complimentary";
}

/** Whether the parent may read reports. */
export function grantsReports(state: EntitlementState): boolean {
  return state !== "none";
}

/**
 * What a status entitles the family to.
 *
 * `trialing` grants full access: a trial that does not let the child practise
 * is not a trial. `past_due` and `unpaid` are a grace state rather than a
 * cut-off, because the parent still needs to reach their reports and their
 * card details, and a child's history must never be hidden over a billing
 * problem.
 */
export function accessFor(status: SubscriptionStatus | null): AccessState {
  switch (status) {
    case "trialing":
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "grace";
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
    case null:
    default:
      return "none";
  }
}

/** Whether a child may practise right now. */
export function canPractise(status: SubscriptionStatus | null): boolean {
  return accessFor(status) === "active";
}

/**
 * Whether the parent may still read reports.
 *
 * True in the grace state on purpose: they are the person who has to fix the
 * payment, and hiding the reason they subscribed makes that less likely, not
 * more.
 */
export function canViewReports(status: SubscriptionStatus | null): boolean {
  return accessFor(status) !== "none";
}

export interface SeatMath {
  paid: number;
  used: number;
  spare: number;
  /** Children on the account who cannot practise because seats ran out. */
  unseated: number;
}

export function seatMath(opts: {
  paid: number;
  used: number;
  childCount: number;
}): SeatMath {
  const paid = Math.max(0, opts.paid);
  const used = Math.max(0, Math.min(opts.used, paid));
  return {
    paid,
    used,
    spare: paid - used,
    unseated: Math.max(0, opts.childCount - paid),
  };
}

/**
 * Whether a seat change should bill immediately.
 *
 * Adding a seat prorates, so the child starts today and the family pays for
 * the part of the period they use. Removing one does not refund and does not
 * revoke the seat: the period was already paid for, so taking it away early
 * would be charging for something and then withholding it.
 */
export function prorationFor(
  currentSeats: number,
  requestedSeats: number,
): "create_prorations" | "none" {
  return requestedSeats > currentSeats ? "create_prorations" : "none";
}

/** Monthly cost in cents for a seat count. */
export function monthlyCents(seats: number, perSeatCents = 1000): number {
  return Math.max(0, seats) * perSeatCents;
}

/**
 * Whether a webhook event should be acted on.
 *
 * Stripe retries delivery, so an event already recorded must be skipped:
 * re-running a seat assignment or a credit is how a billing integration
 * quietly double-charges.
 */
export function shouldProcessEvent(opts: {
  alreadyRecorded: boolean;
  handled: boolean;
}): boolean {
  return !opts.alreadyRecorded && opts.handled;
}
