"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { attempts, practiceSessions, skills } from "@/db/schema";
import { requireActiveStudent } from "@/lib/data/students";
import {
  listSkills,
  loadCategoryWeights,
  recordAttempt,
} from "@/lib/data/progress";
import { getGenerator } from "@/lib/items/registry";
import { scoreItem } from "@/lib/items/build";
import { toPublicItem, type PublicItem } from "@/lib/items/public";
import { passageClipUrl } from "@/lib/audio/clips";
import type { Item, ItemResponse } from "@/lib/items/types";
import { buildPaper, paperLength, paperMinutes } from "@/lib/mock/paper";
import { GENERATORS } from "@/lib/items/registry";

/**
 * A mock test.
 *
 * Three things make this different from practice, and each one is the reason
 * the score means something:
 *
 *   1. The paper is fixed when the test starts, from a seed stored on the
 *      session. Reloading returns the same questions. A test you can reroll
 *      by refreshing is not a test.
 *   2. Nothing is revealed until the end. No verdict per question, no hints,
 *      no explanation. A student who learns the answer to question 4 before
 *      answering question 5 is not sitting a test any more.
 *   3. Questions are drawn from the blueprint, never from what the child is
 *      weak at. Adaptive selection would report a score worse than the truth.
 *
 * Attempts are still recorded against the child's mastery, because they are
 * real evidence of what the child can do. What is kept apart is the session
 * mode, so a mock score is never averaged into practice statistics.
 */

export interface MockQuestion {
  index: number;
  total: number;
  item: PublicItem;
}

export interface MockSession {
  sessionId: string;
  subject: "math" | "ela";
  total: number;
  minutesAllowed: number;
  /** Milliseconds already elapsed, so a reload does not reset the clock. */
  elapsedMs: number;
  answered: number;
}

/** Regenerates the paper from the stored seed. Never stored question by question. */
async function paperFor(
  studentId: string,
  grade: number,
  subject: "math" | "ela",
  seed: number,
) {
  const [allSkills, weights] = await Promise.all([
    listSkills({ upToGrade: grade, subject }),
    loadCategoryWeights(grade, subject),
  ]);
  return buildPaper({ skills: allSkills, weights, grade, seed });
}

/**
 * Starts a test, or resumes the one already open.
 *
 * Resuming rather than starting fresh is deliberate: a child whose tab
 * crashed halfway through should not lose the paper, and a child who
 * discovers that closing the tab gives them a new set of questions has
 * discovered a way to shop for an easier test.
 */
export async function startMock(subject: "math" | "ela"): Promise<MockSession | null> {
  const active = await requireActiveStudent();
  if (!active) return null;

  const [open] = await db
    .select()
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.studentId, active.student.id),
        eq(practiceSessions.mode, "mock"),
        eq(practiceSessions.subject, subject),
        isNull(practiceSessions.endedAt),
      ),
    )
    .limit(1);

  const grade = active.student.grade;

  if (open?.paperSeed) {
    const answered = await countAnswered(open.id);
    return {
      sessionId: open.id,
      subject,
      total: paperLength(grade),
      minutesAllowed: paperMinutes(grade),
      elapsedMs: Date.now() - open.startedAt.getTime(),
      answered,
    };
  }

  const seed = Math.floor(Math.random() * 2_000_000_000);
  const [created] = await db
    .insert(practiceSessions)
    .values({
      studentId: active.student.id,
      subject,
      mode: "mock",
      paperSeed: seed,
    })
    .returning();

  return {
    sessionId: created.id,
    subject,
    total: paperLength(grade),
    minutesAllowed: paperMinutes(grade),
    elapsedMs: 0,
    answered: 0,
  };
}

async function countAnswered(sessionId: string): Promise<number> {
  const rows = await db
    .select({ id: attempts.id })
    .from(attempts)
    .where(eq(attempts.sessionId, sessionId));
  return rows.length;
}

/** The question at a given position on the paper. */
export async function mockQuestion(
  sessionId: string,
  index: number,
): Promise<MockQuestion | null> {
  const active = await requireActiveStudent();
  if (!active) return null;

  const [session] = await db
    .select()
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.id, sessionId),
        eq(practiceSessions.studentId, active.student.id),
      ),
    )
    .limit(1);
  if (!session?.paperSeed || session.endedAt) return null;

  const paper = await paperFor(
    active.student.id,
    active.student.grade,
    session.subject,
    session.paperSeed,
  );
  const q = paper[index];
  if (!q) return null;

  const candidates = GENERATORS.filter((g) => g.skillSlug === q.skillSlug);
  if (candidates.length === 0) return null;
  const generator = candidates[q.seed % candidates.length];

  return {
    index,
    total: paper.length,
    // On a test the band is fixed rather than chosen from mastery: a harder
    // question for a stronger student would make scores incomparable.
    item: toPublicItem(
      generator.generate({ seed: q.seed, difficulty: "core" }),
      passageClipUrl,
    ),
  };
}

const answerSchema = z.object({
  sessionId: z.string().uuid(),
  index: z.number().int().min(0).max(60),
  templateKey: z.string().min(1),
  seed: z.coerce.number().int(),
  response: z.record(z.string(), z.unknown()),
  timeMs: z.coerce.number().int().min(0).max(1000 * 60 * 60),
});

/**
 * Records an answer without saying anything about it.
 *
 * Returns only whether it was accepted. The verdict, the explanation and the
 * answer key are withheld until the paper is finished — which is the whole
 * difference between a test and a practice session.
 */
export async function answerMock(
  raw: z.input<typeof answerSchema>,
): Promise<{ ok: boolean; error?: string }> {
  const active = await requireActiveStudent();
  if (!active) return { ok: false, error: "Your session has ended." };

  const parsed = answerSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "That answer could not be read." };
  const { sessionId, templateKey, seed, response, timeMs } = parsed.data;

  const [session] = await db
    .select()
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.id, sessionId),
        eq(practiceSessions.studentId, active.student.id),
        isNull(practiceSessions.endedAt),
      ),
    )
    .limit(1);
  if (!session) return { ok: false, error: "That test is not open." };

  let item: Item;
  try {
    item = getGenerator(templateKey).generate({ seed, difficulty: "core" });
  } catch {
    return { ok: false, error: "That question is no longer available." };
  }

  const typed = response as unknown as ItemResponse;
  if (item.type !== typed.type) {
    return { ok: false, error: "That answer did not match the question." };
  }
  const scored = scoreItem(item, typed);

  const [skill] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(eq(skills.slug, item.skillSlug))
    .limit(1);
  if (!skill) return { ok: false, error: "This skill is not set up yet." };

  await recordAttempt({
    studentId: active.student.id,
    skillId: skill.id,
    templateKey,
    seed,
    response: typed,
    correct: scored.correct,
    misconception: scored.misconception,
    itemDifficulty: item.difficulty,
    timeMs,
    hintsUsed: 0,
    sessionId,
  });

  return { ok: true };
}

export interface MockReport {
  total: number;
  correct: number;
  minutes: number;
  byCategory: {
    name: string;
    correct: number;
    total: number;
    weight: number;
  }[];
  weakest: { skill: string; correct: number; total: number }[];
  /** Null for grades 1 and 2, where Florida publishes no blueprint. */
  blueprint: boolean;
}

/** Ends the test and returns the report. Everything is revealed here, at once. */
export async function finishMock(sessionId: string): Promise<MockReport | null> {
  const active = await requireActiveStudent();
  if (!active) return null;

  const [session] = await db
    .select()
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.id, sessionId),
        eq(practiceSessions.studentId, active.student.id),
      ),
    )
    .limit(1);
  if (!session) return null;

  const rows = await db
    .select({
      correct: attempts.correct,
      skillTitle: skills.title,
      skillSlug: skills.slug,
    })
    .from(attempts)
    .innerJoin(skills, eq(skills.id, attempts.skillId))
    .where(eq(attempts.sessionId, sessionId));

  const allSkills = await listSkills({
    upToGrade: active.student.grade,
    subject: session.subject,
  });
  const categoryBySlug = new Map(
    allSkills.map((s) => [s.slug, s.reportingCategory]),
  );
  const weights = await loadCategoryWeights(
    active.student.grade,
    session.subject,
  );
  const weightByName = new Map(weights.map((w) => [w.name, w.weight]));

  const cats = new Map<string, { correct: number; total: number }>();
  const bySkill = new Map<string, { correct: number; total: number }>();
  for (const r of rows) {
    const cat = categoryBySlug.get(r.skillSlug) ?? "Other";
    const c = cats.get(cat) ?? { correct: 0, total: 0 };
    c.total += 1;
    if (r.correct) c.correct += 1;
    cats.set(cat, c);

    const s = bySkill.get(r.skillTitle) ?? { correct: 0, total: 0 };
    s.total += 1;
    if (r.correct) s.correct += 1;
    bySkill.set(r.skillTitle, s);
  }

  if (!session.endedAt) {
    await db
      .update(practiceSessions)
      .set({
        endedAt: new Date(),
        itemsAttempted: rows.length,
        itemsCorrect: rows.filter((r) => r.correct).length,
      })
      .where(eq(practiceSessions.id, sessionId));
  }

  return {
    total: rows.length,
    correct: rows.filter((r) => r.correct).length,
    minutes: Math.max(
      1,
      Math.round(
        ((session.endedAt ?? new Date()).getTime() - session.startedAt.getTime()) /
          60000,
      ),
    ),
    byCategory: [...cats.entries()]
      .map(([name, v]) => ({
        name,
        correct: v.correct,
        total: v.total,
        weight: weightByName.get(name) ?? 0,
      }))
      .sort((a, b) => b.total - a.total),
    weakest: [...bySkill.entries()]
      .map(([skill, v]) => ({ skill, ...v }))
      .filter((s) => s.correct < s.total)
      .sort((a, b) => a.correct / a.total - b.correct / b.total)
      .slice(0, 5),
    blueprint: weights.length > 0,
  };
}

/** Abandons an open test without recording a score. */
export async function abandonMock(sessionId: string): Promise<void> {
  const active = await requireActiveStudent();
  if (!active) return;
  await db
    .update(practiceSessions)
    .set({ endedAt: new Date() })
    .where(
      and(
        eq(practiceSessions.id, sessionId),
        eq(practiceSessions.studentId, active.student.id),
      ),
    );
}
