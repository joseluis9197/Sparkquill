import "server-only";
import { and, desc, eq, inArray, isNotNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  attempts,
  benchmarks,
  practiceSessions,
  reportingCategories,
  skillMastery,
  skillPrerequisites,
  skills,
} from "@/db/schema";
import {
  applyAttempt,
  initialSkillState,
  masteryFraction,
  type MasteryLevel,
  type SkillState,
} from "@/lib/adaptive/mastery";
import type { MisconceptionKey } from "@/lib/items/types";

export interface SkillRow {
  id: string;
  slug: string;
  title: string;
  benchmarkCode: string;
  benchmarkDescription: string;
  /** "MA.4.FR" — what a parent's focus is set against. */
  strandCode: string;
  reportingCategory: string | null;
  grade: number;
  subject: Subject;
}

export type Subject = "math" | "ela";

/**
 * Skills a particular child may be asked to practise.
 *
 * Bounded by grade, and deliberately inclusive of the grades below. Serving
 * work from above a child's grade teaches them they are behind when they are
 * not; serving work from below is the whole point of the remediation tier in
 * the selector, which reaches for the earlier skill a child is actually
 * missing rather than repeating the one they keep failing.
 *
 * Unbounded is not an option here. Without the ceiling every child received
 * whatever grade happened to have content, which silently gave a fifth grader
 * second grade arithmetic and reported it as mastery.
 */
export async function listSkills(opts: {
  upToGrade: number;
  subject?: Subject;
}): Promise<SkillRow[]> {
  return db
    .select({
      id: skills.id,
      slug: skills.slug,
      title: skills.title,
      benchmarkCode: skills.benchmarkCode,
      benchmarkDescription: benchmarks.description,
      strandCode: benchmarks.strandCode,
      reportingCategory: benchmarks.reportingCategory,
      grade: benchmarks.grade,
      subject: benchmarks.subject,
    })
    .from(skills)
    .innerJoin(benchmarks, eq(skills.benchmarkCode, benchmarks.code))
    .where(
      and(
        lte(benchmarks.grade, opts.upToGrade),
        opts.subject ? eq(benchmarks.subject, opts.subject) : undefined,
      ),
    )
    .orderBy(skills.sortOrder);
}

/**
 * How much practice exists for a grade, counting only that grade's own work.
 *
 * The practice page asks before it offers anything. A child whose grade has
 * nothing behind it must be told so plainly — falling back to a lower grade
 * would hand them someone else's curriculum and call it theirs.
 */
export async function gradeCoverage(
  grade: number,
): Promise<Record<Subject, number>> {
  const rows = await db
    .select({
      subject: benchmarks.subject,
      n: sql<number>`count(*)::int`,
    })
    .from(skills)
    .innerJoin(benchmarks, eq(skills.benchmarkCode, benchmarks.code))
    .where(eq(benchmarks.grade, grade))
    .groupBy(benchmarks.subject);

  const out: Record<Subject, number> = { math: 0, ela: 0 };
  for (const r of rows) out[r.subject] = r.n;
  return out;
}

/** Mastery rows for one student, keyed by skill id. */
export async function loadMastery(
  studentId: string,
): Promise<Map<string, SkillState>> {
  const rows = await db
    .select()
    .from(skillMastery)
    .where(eq(skillMastery.studentId, studentId));

  const out = new Map<string, SkillState>();
  for (const r of rows) {
    out.set(r.skillId, {
      rating: r.rating,
      level: r.level as MasteryLevel,
      recentResults: (r.recentResults as boolean[]) ?? [],
      attemptCount: r.attemptCount,
      correctCount: r.correctCount,
      reviewStage: r.reviewStage,
      nextReviewAt: r.nextReviewAt,
      lastSeenAt: r.lastSeenAt,
    });
  }
  return out;
}

export interface RecordAttemptInput {
  studentId: string;
  skillId: string;
  templateKey: string;
  seed: number;
  response: unknown;
  correct: boolean;
  misconception?: MisconceptionKey;
  itemDifficulty: number;
  timeMs: number;
  hintsUsed: number;
  sessionId?: string;
}

export interface RecordAttemptResult {
  state: SkillState;
  justMastered: boolean;
  regressed: boolean;
}

/**
 * Writes one attempt and advances the child's mastery for that skill.
 *
 * Both writes happen in a single transaction. A recorded attempt whose mastery
 * update was lost would quietly corrupt the adaptive engine's picture of the
 * child — the attempt count and the rating would disagree, and the skill would
 * be served at the wrong difficulty from then on.
 */
export async function recordAttempt(
  input: RecordAttemptInput,
): Promise<RecordAttemptResult> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(skillMastery)
      .where(
        and(
          eq(skillMastery.studentId, input.studentId),
          eq(skillMastery.skillId, input.skillId),
        ),
      )
      .limit(1);

    const before: SkillState = existing
      ? {
          rating: existing.rating,
          level: existing.level as MasteryLevel,
          recentResults: (existing.recentResults as boolean[]) ?? [],
          attemptCount: existing.attemptCount,
          correctCount: existing.correctCount,
          reviewStage: existing.reviewStage,
          nextReviewAt: existing.nextReviewAt,
          lastSeenAt: existing.lastSeenAt,
        }
      : initialSkillState();

    const now = new Date();
    const transition = applyAttempt(before, {
      correct: input.correct,
      itemDifficulty: input.itemDifficulty,
      at: now,
    });

    await tx.insert(attempts).values({
      studentId: input.studentId,
      sessionId: input.sessionId,
      templateKey: input.templateKey,
      seed: input.seed,
      skillId: input.skillId,
      response: input.response,
      correct: input.correct,
      misconception: input.misconception,
      itemDifficulty: input.itemDifficulty,
      timeMs: input.timeMs,
      hintsUsed: input.hintsUsed,
    });

    const next = transition.state;
    await tx
      .insert(skillMastery)
      .values({
        studentId: input.studentId,
        skillId: input.skillId,
        rating: next.rating,
        level: next.level,
        recentResults: next.recentResults,
        attemptCount: next.attemptCount,
        correctCount: next.correctCount,
        reviewStage: next.reviewStage,
        nextReviewAt: next.nextReviewAt,
        lastSeenAt: next.lastSeenAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [skillMastery.studentId, skillMastery.skillId],
        set: {
          rating: next.rating,
          level: next.level,
          recentResults: next.recentResults,
          attemptCount: next.attemptCount,
          correctCount: next.correctCount,
          reviewStage: next.reviewStage,
          nextReviewAt: next.nextReviewAt,
          lastSeenAt: next.lastSeenAt,
          updatedAt: now,
        },
      });

    return {
      state: next,
      justMastered: transition.justMastered,
      regressed: transition.regressed,
    };
  });
}

/* ------------------------------------------------------------------ *
 * Reporting for the parent dashboard
 * ------------------------------------------------------------------ */

export interface SkillProgress extends SkillRow {
  level: MasteryLevel;
  fraction: number;
  attemptCount: number;
  correctCount: number;
  lastSeenAt: Date | null;
}

/**
 * `grade` bounds the report the same way it bounds practice, so the parent's
 * "12 of 40 mastered" denominator counts the work their child is actually
 * given and not the whole catalogue up to sixth grade.
 */
export async function skillProgressFor(
  studentId: string,
  grade: number,
): Promise<SkillProgress[]> {
  const [allSkills, mastery] = await Promise.all([
    listSkills({ upToGrade: grade }),
    loadMastery(studentId),
  ]);

  return allSkills.map((s) => {
    const state = mastery.get(s.id) ?? initialSkillState();
    return {
      ...s,
      level: state.level,
      fraction: masteryFraction(state),
      attemptCount: state.attemptCount,
      correctCount: state.correctCount,
      lastSeenAt: state.lastSeenAt,
    };
  });
}

export interface StudentSummary {
  totalAttempts: number;
  totalCorrect: number;
  skillsMastered: number;
  skillsTotal: number;
  minutesPractised: number;
  /** Misconceptions ordered by how often they have tripped the child up. */
  topMisconceptions: { key: string; count: number }[];
}

/**
 * Attempts made under test conditions, which practice statistics must exclude.
 *
 * A mock test is deliberately harder than practice: no hints, no second look,
 * and questions drawn from the blueprint rather than from what the child is
 * ready for. Counting those attempts into "how accurate is my child in
 * practice" drags the figure down for a reason that has nothing to do with
 * their practice, and makes a parent who encourages test-taking see a worse
 * number for it.
 */
/*
 * The outer parentheses are the whole point of this line.
 *
 * Without them the fragment is `a is null or a not in (...)`, and every
 * caller combines it with `and(eq(studentId, ...), thisFilter)`. AND binds
 * tighter than OR, so Postgres read that as
 *
 *   (student_id = $1 and session_id is null) or (session_id not in (...))
 *
 * — and the right-hand side names no student at all. Any attempt whose
 * session was not a mock counted towards whoever happened to be asking, and
 * when the table held no mock sessions the subquery was empty, `null not in
 * ()` is true, and a parent's report counted every attempt in the database.
 *
 * Found by an integration test, in code whose commit message claimed to be
 * fixing this exact area. A missing pair of brackets does not look like a
 * data leak, which is why it survived review.
 */
const mockAttemptFilter = sql`(${attempts.sessionId} is null or ${attempts.sessionId} not in (
  select id from ${practiceSessions} where mode = 'mock'
))`;

/**
 * `grade` bounds the denominator.
 *
 * Without it the report said "0 of 299 skills mastered" to the parent of a
 * second grader, where 299 counts every skill from grade 1 to grade 6. The
 * child can never be set most of them, so the figure measured nothing and
 * made steady progress look like none — the same mistake as serving a child
 * another grade's questions, arriving by a different route.
 */
export async function summaryFor(
  studentId: string,
  grade: number,
): Promise<StudentSummary> {
  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      correct: sql<number>`count(*) filter (where ${attempts.correct})::int`,
      ms: sql<number>`coalesce(sum(${attempts.timeMs}), 0)::bigint`,
    })
    .from(attempts)
    .where(and(eq(attempts.studentId, studentId), mockAttemptFilter));

  const misconceptions = await db
    .select({
      key: attempts.misconception,
      count: sql<number>`count(*)::int`,
    })
    .from(attempts)
    .where(
      and(
        eq(attempts.studentId, studentId),
        eq(attempts.correct, false),
        sql`${attempts.misconception} is not null`,
        mockAttemptFilter,
      ),
    )
    .groupBy(attempts.misconception)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const mastery = await db
    .select({ level: skillMastery.level })
    .from(skillMastery)
    .where(eq(skillMastery.studentId, studentId));

  const skillCount = await db
    .select({ id: skills.id })
    .from(skills)
    .innerJoin(benchmarks, eq(benchmarks.code, skills.benchmarkCode))
    .where(lte(benchmarks.grade, grade));

  return {
    totalAttempts: totals?.total ?? 0,
    totalCorrect: totals?.correct ?? 0,
    skillsMastered: mastery.filter((m) => m.level === "mastered").length,
    skillsTotal: skillCount.length,
    minutesPractised: Math.round(Number(totals?.ms ?? 0) / 60000),
    topMisconceptions: misconceptions
      .filter((m): m is { key: string; count: number } => m.key !== null)
      .map((m) => ({ key: m.key, count: m.count })),
  };
}

/** Recent attempts, for the "what did they actually see" support view. */
export async function recentAttempts(studentId: string, limit = 20) {
  return db
    .select({
      id: attempts.id,
      templateKey: attempts.templateKey,
      seed: attempts.seed,
      correct: attempts.correct,
      misconception: attempts.misconception,
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

export { inArray };

/**
 * The prerequisite graph, as slug to prerequisite slugs.
 *
 * Read from the database rather than from the source file so the graph can be
 * corrected without a deploy, and so an edge pointing at a skill that does not
 * exist simply does not load rather than crashing the practice page.
 */
export async function loadPrerequisites(): Promise<Map<string, string[]>> {
  const rows = await db
    .select({
      skill: skills.slug,
      prerequisite: sql<string>`prereq.slug`,
    })
    .from(skillPrerequisites)
    .innerJoin(skills, eq(skills.id, skillPrerequisites.skillId))
    .innerJoin(
      sql`${skills} as prereq`,
      sql`prereq.id = ${skillPrerequisites.prerequisiteId}`,
    );

  const out = new Map<string, string[]>();
  for (const r of rows) {
    const list = out.get(r.skill) ?? [];
    list.push(r.prerequisite);
    out.set(r.skill, list);
  }
  return out;
}

/**
 * How much each reporting category is worth on the real test, as a fraction.
 *
 * Florida publishes a range rather than a fixed percentage, so the midpoint is
 * used: it is the best single estimate available, and the selector only needs
 * the weights to rank categories against each other.
 *
 * Worth knowing before anyone "fixes" this: within a single grade Florida's
 * mathematics blueprint gives every category the same band — four categories
 * at 23-29% each, or three at 31-37%. That is the real published blueprint,
 * not missing data. The weight therefore separates almost nothing inside a
 * grade, and the work in the selector's ranking is done by how weak the child
 * is in each category. The weights still matter across grades, where a
 * child's pool spans several.
 *
 * Grades 1 and 2 have no published blueprint and return nothing, which the
 * selector reads as "weight every skill equally" — the honest position when
 * there is no blueprint to weight by.
 */
export async function loadCategoryWeights(
  grade: number,
  subject: Subject,
): Promise<{ name: string; weight: number }[]> {
  const rows = await db
    .select({
      name: reportingCategories.name,
      min: reportingCategories.weightMin,
      max: reportingCategories.weightMax,
    })
    .from(reportingCategories)
    .where(
      and(
        eq(reportingCategories.grade, grade),
        eq(reportingCategories.subject, subject),
      ),
    );

  return rows.map((r) => ({
    name: r.name,
    weight: (Number(r.min) + Number(r.max)) / 2,
  }));
}

export interface MockResult {
  id: string;
  subject: Subject;
  takenAt: Date;
  total: number;
  correct: number;
  minutes: number;
  /** Per reporting category, empty for grades with no published blueprint. */
  byCategory: { name: string; correct: number; total: number }[];
}

/**
 * Every practice test a child has finished, newest first.
 *
 * The reason this exists separately from `summaryFor`: a mock score is the one
 * number on this platform that can be compared with a real test, and it is
 * only meaningful if it stands alone. Averaged into practice it means nothing;
 * listed on its own, a parent can watch it move across a term.
 *
 * Abandoned tests are excluded. A test somebody walked away from halfway
 * through is not a result, and showing it as one would tell a parent their
 * child scored 30% when their child scored nothing and went outside.
 */
export async function mockHistoryFor(
  studentId: string,
  limit = 6,
): Promise<MockResult[]> {
  const sessions = await db
    .select({
      id: practiceSessions.id,
      subject: practiceSessions.subject,
      startedAt: practiceSessions.startedAt,
      endedAt: practiceSessions.endedAt,
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.studentId, studentId),
        eq(practiceSessions.mode, "mock"),
        isNotNull(practiceSessions.endedAt),
      ),
    )
    .orderBy(desc(practiceSessions.startedAt))
    .limit(limit);

  if (sessions.length === 0) return [];

  const rows = await db
    .select({
      sessionId: attempts.sessionId,
      correct: attempts.correct,
      category: benchmarks.reportingCategory,
    })
    .from(attempts)
    .innerJoin(skills, eq(skills.id, attempts.skillId))
    .innerJoin(benchmarks, eq(benchmarks.code, skills.benchmarkCode))
    .where(
      inArray(
        attempts.sessionId,
        sessions.map((s) => s.id),
      ),
    );

  return sessions
    .map((s) => {
      const mine = rows.filter((r) => r.sessionId === s.id);
      const cats = new Map<string, { correct: number; total: number }>();
      for (const r of mine) {
        if (!r.category) continue;
        const c = cats.get(r.category) ?? { correct: 0, total: 0 };
        c.total += 1;
        if (r.correct) c.correct += 1;
        cats.set(r.category, c);
      }
      return {
        id: s.id,
        subject: s.subject,
        takenAt: s.startedAt,
        total: mine.length,
        correct: mine.filter((r) => r.correct).length,
        minutes: Math.max(
          1,
          Math.round(
            ((s.endedAt ?? s.startedAt).getTime() - s.startedAt.getTime()) / 60000,
          ),
        ),
        byCategory: [...cats.entries()].map(([name, v]) => ({ name, ...v })),
      };
    })
    // A finished session with no answers is somebody who opened a test and
    // pressed finish. Not a result.
    .filter((r) => r.total > 0);
}
