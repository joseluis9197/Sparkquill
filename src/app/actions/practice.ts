"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { skills } from "@/db/schema";
import { requireActiveStudent } from "@/lib/data/students";
import { loadMastery, recordAttempt } from "@/lib/data/progress";
import { getGenerator } from "@/lib/items/registry";
import { scoreItem } from "@/lib/items/build";
import type { Item, ItemResponse } from "@/lib/items/types";
import {
  NO_REVEAL,
  revealFor,
  toPublicItem,
  type PublicItem,
  type Reveal,
} from "@/lib/items/public";
import { bandForStudent } from "@/lib/adaptive/elo";
import { initialSkillState } from "@/lib/adaptive/mastery";

/**
 * The response, whichever kind of item it answers.
 *
 * Validated as a discriminated union rather than a bag of optional fields, so
 * a client cannot send a hot-text answer to a multiple-choice item and have
 * the server quietly score it against nothing.
 */
const responseSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("multiple_choice"), choiceId: z.string().min(1) }),
  z.object({
    type: z.literal("multiselect"),
    choiceIds: z.array(z.string().min(1)).min(1).max(10),
  }),
  z.object({
    type: z.literal("equation_editor"),
    // Length-capped: this is the one item type that takes free text, and an
    // unbounded string from the browser has no business reaching the scorer.
    value: z.string().max(40),
  }),
  z.object({
    type: z.literal("table_match"),
    pairs: z.record(z.string(), z.string()),
  }),
  z.object({
    type: z.literal("hot_text"),
    tokenIds: z.array(z.string().min(1)).max(80),
  }),
  z.object({
    type: z.literal("ebsr"),
    partA: z.string().min(1),
    partB: z.string().min(1),
  }),
]);

const submitSchema = z.object({
  templateKey: z.string().min(1),
  seed: z.coerce.number().int(),
  difficulty: z.enum(["easy", "core", "stretch"]),
  response: responseSchema,
  timeMs: z.coerce.number().int().min(0).max(1000 * 60 * 30),
  hintsUsed: z.coerce.number().int().min(0).max(10),
});

export interface SubmitResult {
  correct: boolean;
  reveal: Reveal;
  explanation: string;
  misconception?: string;
  justMastered: boolean;
  error?: string;
}


/**
 * Records one answer.
 *
 * The item is regenerated on the server from its template key and seed, and
 * scored there. The client never sends whether it got the question right — it
 * sends which option was tapped, and the server decides. Trusting a
 * client-side verdict would make the whole progress record meaningless, and
 * the mastery data is the thing a parent is actually paying for.
 */
export async function submitAnswer(
  raw: z.input<typeof submitSchema>,
): Promise<SubmitResult> {
  const active = await requireActiveStudent();
  if (!active) {
    return {
      correct: false,
      reveal: NO_REVEAL,
      explanation: "",
      justMastered: false,
      error: "Your session has ended. Please choose your profile again.",
    };
  }

  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      correct: false,
      reveal: NO_REVEAL,
      explanation: "",
      justMastered: false,
      error: "That answer could not be read.",
    };
  }

  const { templateKey, seed, difficulty, response, timeMs, hintsUsed } =
    parsed.data;

  let generator;
  try {
    generator = getGenerator(templateKey);
  } catch {
    return {
      correct: false,
      reveal: NO_REVEAL,
      explanation: "",
      justMastered: false,
      error: "That question is no longer available.",
    };
  }

  // Regenerating from (template, seed) reproduces the item byte for byte,
  // which is what makes server-side scoring possible without storing it.
  const item: Item = generator.generate({ seed, difficulty });

  // A response of the wrong kind would make scoreItem throw. Rejecting it
  // here turns a crash into a message, and there is no legitimate client that
  // can produce one.
  if (item.type !== response.type) {
    return {
      correct: false,
      reveal: NO_REVEAL,
      explanation: "",
      justMastered: false,
      error: "That answer did not match the question.",
    };
  }
  const scored = scoreItem(item, response as ItemResponse);

  const [skill] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(eq(skills.slug, generator.skillSlug))
    .limit(1);

  if (!skill) {
    return {
      correct: scored.correct,
      reveal: revealFor(item),
      explanation: item.explanation,
      justMastered: false,
      error: "This skill is not set up yet, so the answer was not saved.",
    };
  }

  const result = await recordAttempt({
    studentId: active.student.id,
    skillId: skill.id,
    templateKey,
    seed,
    response,
    correct: scored.correct,
    misconception: scored.misconception,
    itemDifficulty: item.difficulty,
    timeMs,
    hintsUsed,
  });

  return {
    correct: scored.correct,
    reveal: revealFor(item),
    explanation: item.explanation,
    misconception: scored.misconception,
    justMastered: result.justMastered,
  };
}

export interface NextQuestion {
  item: PublicItem;
  difficulty: "easy" | "core" | "stretch";
  reason: string;
}

/**
 * Chooses and generates the next question for the active child.
 *
 * Runs on the server so the selection reflects stored mastery rather than
 * whatever a browser tab happens to remember.
 */
export async function nextQuestion(
  subject: "math" | "ela",
  recentlyServed: string[] = [],
): Promise<NextQuestion | null> {
  const active = await requireActiveStudent();
  if (!active) return null;

  const { selectNextSkill, isMissingFoundation } = await import(
    "@/lib/adaptive/select"
  );
  const { listSkills, loadPrerequisites, loadCategoryWeights } = await import(
    "@/lib/data/progress"
  );
  const { activeFocus } = await import("@/lib/data/focus");
  const { GENERATORS } = await import("@/lib/items/registry");

  // Bounded by the child's own grade. The ceiling is the important half: the
  // selector will happily reach down for a missing prerequisite, but nothing
  // should ever hand a child work from a grade they have not reached.
  const [allSkills, mastery, prerequisites, categoryWeights, focus] =
    await Promise.all([
      listSkills({ upToGrade: active.student.grade, subject }),
      loadMastery(active.student.id),
      loadPrerequisites(),
      loadCategoryWeights(active.student.grade, subject),
      // Null unless a parent has set one and it has not run out. It narrows
      // what the selector chooses from; it never postpones a due review.
      activeFocus(active.student.id),
    ]);

  /*
   * A prerequisite is passed to the selector only when there is evidence the
   * child is actually missing it. Handing over the whole graph would gate a
   * new student out of their own grade — nothing is mastered on day one, so
   * every skill with a prerequisite would look blocked and the selector would
   * drop them into first grade counting.
   *
   * Filtering here rather than inside the selector keeps the selector pure and
   * makes the rule visible next to the data it applies to.
   */
  const bySlug = new Map(allSkills.map((s) => [s.slug, s.id]));
  const struggling = (skillId: string) => {
    const state = mastery.get(skillId);
    return state !== undefined && isMissingFoundation(state);
  };

  const selection = selectNextSkill({
    candidates: allSkills.map((s) => ({
      skillId: s.id,
      skillSlug: s.slug,
      benchmark: s.benchmarkCode,
      strandCode: s.strandCode,
      reportingCategory: s.reportingCategory,
      prerequisiteIds: (prerequisites.get(s.slug) ?? [])
        .map((slug) => bySlug.get(slug))
        .filter((id): id is string => id !== undefined && struggling(id)),
      state: mastery.get(s.id) ?? initialSkillState(),
    })),
    // Empty for grades 1 and 2, which have no published blueprint. The
    // selector already treats every skill as equally weighted in that case.
    categoryWeights,
    now: new Date(),
    recentlyServed,
    focus,
  });
  if (!selection) return null;

  const candidates = GENERATORS.filter(
    (g) => g.skillSlug === selection.candidate.skillSlug,
  );
  if (candidates.length === 0) return null;

  const state = mastery.get(selection.candidate.skillId) ?? initialSkillState();
  const difficulty = bandForStudent(state.rating);

  // A fresh seed each time, so a child cannot memorise a fixed sequence and
  // so the same question does not recur across sessions.
  const seed = Math.floor(Math.random() * 2_000_000_000);
  const generator = candidates[seed % candidates.length];

  return {
    item: toPublicItem(generator.generate({ seed, difficulty })),
    difficulty,
    reason: selection.explanation,
  };
}
