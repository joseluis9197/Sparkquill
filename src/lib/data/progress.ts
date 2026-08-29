import "server-only";
import { and, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { attempts, benchmarks, skillMastery, skills } from "@/db/schema";
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

export async function summaryFor(studentId: string): Promise<StudentSummary> {
  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      correct: sql<number>`count(*) filter (where ${attempts.correct})::int`,
      ms: sql<number>`coalesce(sum(${attempts.timeMs}), 0)::bigint`,
    })
    .from(attempts)
    .where(eq(attempts.studentId, studentId));

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
      ),
    )
    .groupBy(attempts.misconception)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const mastery = await db
    .select({ level: skillMastery.level })
    .from(skillMastery)
    .where(eq(skillMastery.studentId, studentId));

  const skillCount = await db.select({ id: skills.id }).from(skills);

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
