import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { parents, studentSeats, students, subscriptions } from "@/db/schema";
import { accessFor, type SubscriptionStatus } from "@/lib/billing/rules";

export type Subscription = typeof subscriptions.$inferSelect;

export type Entitlement =
  | { state: "active"; subscription: Subscription; seatsUsed: number }
  | { state: "grace"; subscription: Subscription; seatsUsed: number }
  /**
   * Free access granted by staff. Deliberately its own state rather than a
   * pretend subscription: the dashboard should tell a family the truth about
   * why they are not being charged, and the metrics should not count them as
   * revenue.
   */
  | { state: "complimentary"; until: Date; reason: string | null }
  | { state: "none" };

/**
 * What this family is currently entitled to.
 *
 * "grace" is deliberately distinct from "none": a card that failed is a
 * billing problem, not a reason to hide a child's progress from their parent.
 * Reports stay visible; only practice stops.
 */
export async function entitlementFor(parentId: string): Promise<Entitlement> {
  // Checked before Stripe, so a family given free access is not blocked by a
  // lapsed card from before the grant.
  const [parent] = await db
    .select({
      until: parents.complimentaryUntil,
      reason: parents.complimentaryReason,
    })
    .from(parents)
    .where(eq(parents.id, parentId))
    .limit(1);

  if (parent?.until && parent.until.getTime() > Date.now()) {
    return {
      state: "complimentary",
      until: parent.until,
      reason: parent.reason,
    };
  }

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.parentId, parentId))
    .orderBy(asc(subscriptions.createdAt))
    .limit(1);

  if (!sub) return { state: "none" };

  const seatsUsed = await countAssignedSeats(sub.id);

  const access = accessFor(sub.status as SubscriptionStatus);
  if (access === "none") return { state: "none" };
  return { state: access, subscription: sub, seatsUsed };
}

export async function countAssignedSeats(subscriptionId: string) {
  const rows = await db
    .select({ id: studentSeats.id })
    .from(studentSeats)
    .where(
      and(
        eq(studentSeats.subscriptionId, subscriptionId),
        isNull(studentSeats.releasedAt),
      ),
    );
  return rows.length;
}

/** Whether this particular child currently holds a paid seat. */
export async function studentHasSeat(studentId: string): Promise<boolean> {
  const [row] = await db
    .select({ status: subscriptions.status })
    .from(studentSeats)
    .innerJoin(
      subscriptions,
      eq(studentSeats.subscriptionId, subscriptions.id),
    )
    .where(
      and(
        eq(studentSeats.studentId, studentId),
        isNull(studentSeats.releasedAt),
      ),
    )
    .limit(1);

  if (!row) return false;
  return accessFor(row.status as SubscriptionStatus) === "active";
}

/**
 * Gives a child a seat, if one is spare.
 *
 * Returns false rather than silently overselling when every seat is taken —
 * the caller then either raises the quantity in Stripe or tells the parent.
 */
export async function assignSeat(
  subscriptionId: string,
  studentId: string,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [sub] = await tx
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);
    if (!sub) return false;

    const held = await tx
      .select({ id: studentSeats.id, studentId: studentSeats.studentId })
      .from(studentSeats)
      .where(
        and(
          eq(studentSeats.subscriptionId, subscriptionId),
          isNull(studentSeats.releasedAt),
        ),
      );

    if (held.some((h) => h.studentId === studentId)) return true; // already seated
    if (held.length >= sub.seatQuantity) return false;

    await tx.insert(studentSeats).values({ subscriptionId, studentId });
    return true;
  });
}

/**
 * Releases a seat.
 *
 * The row is marked released rather than deleted, so the history of who held
 * which seat when survives — that is what a billing dispute is settled with.
 */
export async function releaseSeat(studentId: string) {
  await db
    .update(studentSeats)
    .set({ releasedAt: new Date() })
    .where(
      and(
        eq(studentSeats.studentId, studentId),
        isNull(studentSeats.releasedAt),
      ),
    );
}

/**
 * Seats every child on the account that does not have one, up to the paid
 * quantity. Run after a successful checkout and after a quantity increase.
 */
export async function fillSeats(parentId: string, subscriptionId: string) {
  const kids = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.parentId, parentId), eq(students.active, true)))
    .orderBy(asc(students.createdAt));

  for (const kid of kids) {
    const ok = await assignSeat(subscriptionId, kid.id);
    if (!ok) break; // out of seats; the rest stay unseated until quantity rises
  }
}
