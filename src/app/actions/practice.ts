"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { skills } from "@/db/schema";
import { requireActiveStudent } from "@/lib/data/students";
import { loadMastery, recordAttempt } from "@/lib/data/progress";
import { getGenerator } from "@/lib/items/registry";
import { scoreItem } from "@/lib/items/build";
import type { ItemResponse, MultipleChoiceItem } from "@/lib/items/types";
import { bandForStudent } from "@/lib/adaptive/elo";
import { initialSkillState } from "@/lib/adaptive/mastery";

const submitSchema = z.object({
  templateKey: z.string().min(1),
  seed: z.coerce.number().int(),
  difficulty: z.enum(["easy", "core", "stretch"]),
  choiceId: z.string().min(1),
  timeMs: z.coerce.number().int().min(0).max(1000 * 60 * 30),
  hintsUsed: z.coerce.number().int().min(0).max(10),
});

export interface SubmitResult {
  correct: boolean;
  correctChoiceId: string;
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
      correctChoiceId: "",
      explanation: "",
      justMastered: false,
      error: "Your session has ended. Please choose your profile again.",
    };
  }

  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      correct: false,
      correctChoiceId: "",
      explanation: "",
      justMastered: false,
      error: "That answer could not be read.",
    };
  }

  const { templateKey, seed, difficulty, choiceId, timeMs, hintsUsed } =
    parsed.data;

  let generator;
  try {
    generator = getGenerator(templateKey);
  } catch {
    return {
      correct: false,
      correctChoiceId: "",
      explanation: "",
      justMastered: false,
      error: "That question is no longer available.",
    };
  }

  // Regenerating from (template, seed) reproduces the item byte for byte,
  // which is what makes server-side scoring possible without storing it.
  const item = generator.generate({ seed, difficulty }) as MultipleChoiceItem;
  const response: ItemResponse = { type: "multiple_choice", choiceId };
  const scored = scoreItem(item, response);

  const [skill] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(eq(skills.slug, generator.skillSlug))
    .limit(1);

  if (!skill) {
    return {
      correct: scored.correct,
      correctChoiceId: item.correctId,
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
    correctChoiceId: item.correctId,
    explanation: item.explanation,
    misconception: scored.misconception,
    justMastered: result.justMastered,
  };
}

/**
 * The item as the browser sees it: everything needed to render the question,
 * with the answer key and the explanation removed. Those come back only in
 * the response to submitAnswer, so the answer is never sitting in the page
 * before the child has committed to a choice.
 */
export type PublicItem = Omit<
  MultipleChoiceItem,
  "correctId" | "explanation"
> & {
  choices: { id: string; label: string }[];
};

export interface NextQuestion {
  item: PublicItem;
  difficulty: "easy" | "core" | "stretch";
  reason: string;
}

/**
 * Built field by field rather than by omitting keys from the full item, so a
 * field added to MultipleChoiceItem later cannot leak to the browser just
 * because nobody remembered to exclude it.
 */
function toPublicItem(item: MultipleChoiceItem): PublicItem {
  return {
    id: item.id,
    templateKey: item.templateKey,
    seed: item.seed,
    benchmark: item.benchmark,
    skillSlug: item.skillSlug,
    type: item.type,
    stem: item.stem,
    audioText: item.audioText,
    widget: item.widget,
    passage: item.passage,
    hints: item.hints,
    difficulty: item.difficulty,
    // The misconception label on each distractor is a giveaway too, so the
    // choices are reduced to id and text.
    choices: item.choices.map((c) => ({ id: c.id, label: c.label })),
  };
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

  const { selectNextSkill } = await import("@/lib/adaptive/select");
  const { listSkills } = await import("@/lib/data/progress");
  const { GENERATORS } = await import("@/lib/items/registry");

  // Bounded by the child's own grade. The ceiling is the important half: the
  // selector will happily reach down for a missing prerequisite, but nothing
  // should ever hand a child work from a grade they have not reached.
  const [allSkills, mastery] = await Promise.all([
    listSkills({ upToGrade: active.student.grade, subject }),
    loadMastery(active.student.id),
  ]);

  const selection = selectNextSkill({
    candidates: allSkills.map((s) => ({
      skillId: s.id,
      skillSlug: s.slug,
      benchmark: s.benchmarkCode,
      reportingCategory: s.reportingCategory,
      prerequisiteIds: [],
      state: mastery.get(s.id) ?? initialSkillState(),
    })),
    // Grades 1-2 have no published blueprint, so nothing is weighted here.
    categoryWeights: [],
    now: new Date(),
    recentlyServed,
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
    item: toPublicItem(
      generator.generate({ seed, difficulty }) as MultipleChoiceItem,
    ),
    difficulty,
    reason: selection.explanation,
  };
}
