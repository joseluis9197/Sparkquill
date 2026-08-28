import { describe, it, expect } from "vitest";
import {
  accessFor,
  canPractise,
  canViewReports,
  monthlyCents,
  prorationFor,
  seatMath,
  shouldProcessEvent,
  type SubscriptionStatus,
} from "../rules";

const ALL_STATUSES: SubscriptionStatus[] = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
];

describe("access rules", () => {
  it("lets a trialing family practise", () => {
    // A trial that does not let the child practise is not a trial.
    expect(canPractise("trialing")).toBe(true);
    expect(accessFor("trialing")).toBe("active");
  });

  it("treats a failed payment as grace, not a cut-off", () => {
    for (const status of ["past_due", "unpaid"] as const) {
      expect(accessFor(status)).toBe("grace");
      // Practice stops...
      expect(canPractise(status)).toBe(false);
      // ...but the parent keeps the reports they need in order to care about
      // fixing the card, and a child's history is never hidden over billing.
      expect(canViewReports(status)).toBe(true);
    }
  });

  it("denies access once a subscription is cancelled or never started", () => {
    for (const status of [
      "canceled",
      "incomplete",
      "incomplete_expired",
      "paused",
      null,
    ] as const) {
      expect(accessFor(status)).toBe("none");
      expect(canPractise(status)).toBe(false);
      expect(canViewReports(status)).toBe(false);
    }
  });

  it("classifies every status Stripe can send", () => {
    // A status that fell through to a default would silently grant or deny
    // access, so each one must map explicitly.
    for (const status of ALL_STATUSES) {
      expect(["active", "grace", "none"]).toContain(accessFor(status));
    }
  });

  it("never grants practice without also granting reports", () => {
    for (const status of [...ALL_STATUSES, null]) {
      if (canPractise(status)) expect(canViewReports(status)).toBe(true);
    }
  });
});

describe("seat maths", () => {
  it("reports spare seats", () => {
    expect(seatMath({ paid: 3, used: 1, childCount: 1 })).toEqual({
      paid: 3,
      used: 1,
      spare: 2,
      unseated: 0,
    });
  });

  it("reports children who cannot practise because seats ran out", () => {
    const m = seatMath({ paid: 2, used: 2, childCount: 4 });
    expect(m.spare).toBe(0);
    expect(m.unseated).toBe(2);
  });

  it("never reports more seats used than paid for", () => {
    // Overselling would mean a child practising on a seat nobody paid for.
    const m = seatMath({ paid: 2, used: 5, childCount: 5 });
    expect(m.used).toBe(2);
    expect(m.spare).toBe(0);
  });

  it("copes with a zero or negative seat count", () => {
    const m = seatMath({ paid: 0, used: 0, childCount: 2 });
    expect(m).toEqual({ paid: 0, used: 0, spare: 0, unseated: 2 });
    expect(seatMath({ paid: -3, used: -1, childCount: 0 }).paid).toBe(0);
  });
});

describe("proration", () => {
  it("bills immediately when a seat is added", () => {
    // The child starts today, so the family pays for the part of the period
    // they actually use.
    expect(prorationFor(1, 2)).toBe("create_prorations");
    expect(prorationFor(2, 5)).toBe("create_prorations");
  });

  it("does not refund when a seat is removed", () => {
    // The period was already paid for; the seat stays usable until it ends.
    // Charging for something and then withholding it is the alternative.
    expect(prorationFor(3, 1)).toBe("none");
    expect(prorationFor(2, 2)).toBe("none");
  });
});

describe("pricing", () => {
  it("charges ten dollars per child", () => {
    expect(monthlyCents(1)).toBe(1000);
    expect(monthlyCents(3)).toBe(3000);
    expect(monthlyCents(0)).toBe(0);
  });

  it("never returns a negative charge", () => {
    expect(monthlyCents(-2)).toBe(0);
  });
});

describe("webhook idempotency", () => {
  it("skips an event that has already been recorded", () => {
    // Stripe retries delivery. Re-running a seat assignment or a credit is
    // how an integration quietly double-charges.
    expect(shouldProcessEvent({ alreadyRecorded: true, handled: true })).toBe(
      false,
    );
  });

  it("skips event types it does not handle", () => {
    expect(shouldProcessEvent({ alreadyRecorded: false, handled: false })).toBe(
      false,
    );
  });

  it("processes a new, handled event", () => {
    expect(shouldProcessEvent({ alreadyRecorded: false, handled: true })).toBe(
      true,
    );
  });
});
