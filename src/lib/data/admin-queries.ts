import "server-only";
import { and, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  attempts,
  parents,
  skillMastery,
  skills,
  students,
  studentSeats,
  subscriptions,
} from "@/db/schema";

/* ------------------------------------------------------------------ *
 * Business metrics
 * ------------------------------------------------------------------ */

export interface Metrics {
  parents: number;
  students: number;
  activeSubscriptions: number;
  trialing: number;
  pastDue: number;
  seatsPaid: number;
  mrrCents: number;
  attemptsToday: number;
  attempts7d: number;
  /** Parents who signed up but whose children have never answered anything. */
  neverPractised: number;
  activeStudents7d: number;
}

export async function metrics(): Promise<Metrics> {
  // ISO strings, not Date objects: a Date interpolated into a raw sql
  // fragment is handed to the driver unconverted and rejected.
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [counts] = await db
    .select({
      parents: sql<number>`(select count(*) from ${parents})::int`,
      students: sql<number>`(select count(*) from ${students} where active)::int`,
      active: sql<number>`(select count(*) from ${subscriptions} where status = 'active')::int`,
      trialing: sql<number>`(select count(*) from ${subscriptions} where status = 'trialing')::int`,
      pastDue: sql<number>`(select count(*) from ${subscriptions} where status in ('past_due','unpaid'))::int`,
      seats: sql<number>`(select coalesce(sum(seat_quantity),0) from ${subscriptions} where status in ('active','trialing'))::int`,
    })
    .from(sql`(select 1) as _`);

  const [activity] = await db
    .select({
      today: sql<number>`count(*) filter (where ${attempts.createdAt} >= ${dayAgo})::int`,
      week: sql<number>`count(*) filter (where ${attempts.createdAt} >= ${weekAgo})::int`,
      activeStudents: sql<number>`count(distinct ${attempts.studentId}) filter (where ${attempts.createdAt} >= ${weekAgo})::int`,
    })
    .from(attempts);

  const [idle] = await db
    .select({
      n: sql<number>`count(*)::int`,
    })
    .from(parents)
    .where(
      sql`not exists (
        select 1 from ${students} s
        join ${attempts} a on a.student_id = s.id
        where s.parent_id = ${parents.id}
      )`,
    );

  // Trials are not revenue until they convert, so only active subscriptions
  // count towards MRR. Annual plans are spread across twelve months.
  const [revenue] = await db
    .select({
      cents: sql<number>`coalesce(sum(
        case when ${subscriptions.stripePriceId} = ${process.env.STRIPE_PRICE_ANNUAL ?? ""}
             then ${subscriptions.seatQuantity} * 10000 / 12
             else ${subscriptions.seatQuantity} * 1000
        end
      ), 0)::int`,
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));

  return {
    parents: counts?.parents ?? 0,
    students: counts?.students ?? 0,
    activeSubscriptions: counts?.active ?? 0,
    trialing: counts?.trialing ?? 0,
    pastDue: counts?.pastDue ?? 0,
    seatsPaid: counts?.seats ?? 0,
    mrrCents: revenue?.cents ?? 0,
    attemptsToday: activity?.today ?? 0,
    attempts7d: activity?.week ?? 0,
    activeStudents7d: activity?.activeStudents ?? 0,
    neverPractised: idle?.n ?? 0,
  };
}

/* ------------------------------------------------------------------ *
 * Accounts
 * ------------------------------------------------------------------ */

export interface AccountRow {
  parentId: string;
  email: string;
  name: string | null;
  createdAt: Date;
  childCount: number;
  status: string | null;
  seatQuantity: number | null;
}

/**
 * Finds families by parent email, parent name, or a child's first name.
 *
 * Searching by child name matters for support: a parent writes in about
 * "Mateo" far more often than about their own account id.
 */
export async function searchAccounts(query: string): Promise<AccountRow[]> {
  const q = `%${query.trim()}%`;
  const matchesChild = sql<boolean>`exists (
    select 1 from ${students} s
    where s.parent_id = ${parents.id} and s.first_name ilike ${q}
  )`;

  return db
    .select({
      parentId: parents.id,
      email: parents.email,
      name: parents.name,
      createdAt: parents.createdAt,
      childCount: sql<number>`(select count(*) from ${students} s where s.parent_id = ${parents.id} and s.active)::int`,
      status: subscriptions.status,
      seatQuantity: subscriptions.seatQuantity,
    })
    .from(parents)
    .leftJoin(subscriptions, eq(subscriptions.parentId, parents.id))
    .where(
      query.trim()
        ? or(ilike(parents.email, q), ilike(parents.name, q), matchesChild)
        : sql`true`,
    )
    .orderBy(desc(parents.createdAt))
    .limit(50);
}

export interface FamilyDetail {
  parent: typeof parents.$inferSelect;
  /**
   * Whether a free-access grant is still running. Derived here rather than in
   * the page, so the clock that decides is the server's — the same one the
   * practice gate consults — and not the browser's.
   */
  complimentaryActive: boolean;
  subscription: typeof subscriptions.$inferSelect | null;
  children: {
    student: typeof students.$inferSelect;
    attemptCount: number;
    correctCount: number;
    mastered: number;
    lastSeen: Date | null;
    hasSeat: boolean;
  }[];
}

export async function familyDetail(
  parentId: string,
): Promise<FamilyDetail | null> {
  const [parent] = await db
    .select()
    .from(parents)
    .where(eq(parents.id, parentId))
    .limit(1);
  if (!parent) return null;

  const complimentaryActive =
    parent.complimentaryUntil !== null &&
    parent.complimentaryUntil.getTime() > Date.now();

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.parentId, parentId))
    .limit(1);

  const kids = await db
    .select()
    .from(students)
    .where(eq(students.parentId, parentId))
    .orderBy(students.createdAt);

  const children = await Promise.all(
    kids.map(async (student) => {
      const [stats] = await db
        .select({
          total: sql<number>`count(*)::int`,
          correct: sql<number>`count(*) filter (where ${attempts.correct})::int`,
          last: sql<Date | null>`max(${attempts.createdAt})`,
        })
        .from(attempts)
        .where(eq(attempts.studentId, student.id));

      const [mastery] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(skillMastery)
        .where(
          and(
            eq(skillMastery.studentId, student.id),
            eq(skillMastery.level, "mastered"),
          ),
        );

      const [seat] = await db
        .select({ id: studentSeats.id })
        .from(studentSeats)
        .where(
          and(
            eq(studentSeats.studentId, student.id),
            sql`${studentSeats.releasedAt} is null`,
          ),
        )
        .limit(1);

      return {
        student,
        attemptCount: stats?.total ?? 0,
        correctCount: stats?.correct ?? 0,
        mastered: mastery?.n ?? 0,
        lastSeen: stats?.last ?? null,
        hasSeat: Boolean(seat),
      };
    }),
  );

  return {
    parent,
    complimentaryActive,
    subscription: subscription ?? null,
    children,
  };
}

/** What a child actually saw, for answering "my daughter says it was wrong". */
export async function studentAttempts(studentId: string, limit = 50) {
  return db
    .select({
      id: attempts.id,
      templateKey: attempts.templateKey,
      seed: attempts.seed,
      correct: attempts.correct,
      misconception: attempts.misconception,
      itemDifficulty: attempts.itemDifficulty,
      timeMs: attempts.timeMs,
      createdAt: attempts.createdAt,
      skillTitle: skills.title,
      benchmarkCode: skills.benchmarkCode,
    })
    .from(attempts)
    .innerJoin(skills, eq(attempts.skillId, skills.id))
    .where(eq(attempts.studentId, studentId))
    .orderBy(desc(attempts.createdAt))
    .limit(limit);
}

/* ------------------------------------------------------------------ *
 * Item health
 * ------------------------------------------------------------------ */

export interface ItemHealth {
  templateKey: string;
  attempts: number;
  correct: number;
  pValue: number;
  meanTimeMs: number;
}

/**
 * How each generator is performing in the wild.
 *
 * p-value is the proportion answered correctly. Below 0.2 usually means the
 * item is broken or the wording is impenetrable rather than that children are
 * weak; above 0.95 means it teaches nothing. Both are worth a look, which is
 * why the view flags them rather than leaving a wall of numbers.
 */
export async function itemHealth(minAttempts = 5): Promise<ItemHealth[]> {
  const rows = await db
    .select({
      templateKey: attempts.templateKey,
      n: sql<number>`count(*)::int`,
      correct: sql<number>`count(*) filter (where ${attempts.correct})::int`,
      meanTime: sql<number>`avg(${attempts.timeMs})::int`,
    })
    .from(attempts)
    .groupBy(attempts.templateKey)
    .having(sql`count(*) >= ${minAttempts}`)
    .orderBy(sql`count(*) desc`);

  return rows.map((r) => ({
    templateKey: r.templateKey,
    attempts: r.n,
    correct: r.correct,
    pValue: r.n === 0 ? 0 : r.correct / r.n,
    meanTimeMs: r.meanTime ?? 0,
  }));
}

export { gte };
