import { DEFAULT_RATING, kFactor, updateRatings } from "./elo";

/**
 * Mastery tracking and spaced repetition.
 *
 * The rule is four correct out of the last five, at or above grade-level
 * difficulty. Requiring the difficulty floor matters: a child who answers
 * five easy questions correctly has demonstrated that they can do easy
 * questions, which is not the same as mastering the benchmark.
 */

export type MasteryLevel =
  | "not_started"
  | "learning"
  | "practicing"
  | "mastered";

/** Days until the next review at each stage. */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 21] as const;

/** Below this, a correct answer does not count towards mastery. */
export const GRADE_LEVEL_DIFFICULTY = 960;

/** How many recent results the mastery window keeps. */
export const WINDOW_SIZE = 5;
const REQUIRED_CORRECT = 4;

export interface SkillState {
  rating: number;
  level: MasteryLevel;
  /** Most recent last. Only attempts at or above grade level are recorded. */
  recentResults: boolean[];
  attemptCount: number;
  correctCount: number;
  reviewStage: number;
  nextReviewAt: Date | null;
  lastSeenAt: Date | null;
}

export function initialSkillState(): SkillState {
  return {
    rating: DEFAULT_RATING,
    level: "not_started",
    recentResults: [],
    attemptCount: 0,
    correctCount: 0,
    reviewStage: 0,
    nextReviewAt: null,
    lastSeenAt: null,
  };
}

export interface AttemptOutcome {
  correct: boolean;
  itemDifficulty: number;
  at: Date;
}

export interface MasteryTransition {
  state: SkillState;
  itemDifficulty: number;
  /** True when this attempt moved the skill into `mastered`. */
  justMastered: boolean;
  /** True when a mastered skill was answered wrong and dropped back. */
  regressed: boolean;
}

function addDays(date: Date, days: number): Date {
  const out = new Date(date.getTime());
  out.setDate(out.getDate() + days);
  return out;
}

function countCorrect(window: boolean[]): number {
  return window.filter(Boolean).length;
}

/**
 * Applies one attempt to a skill's state.
 *
 * Regression is deliberately gentle: one wrong answer on a mastered skill
 * moves it back to `practicing` and resets the review ladder by one step
 * rather than all the way to zero. Children have bad days, and wiping weeks
 * of progress because of a single slip is both inaccurate and demoralising.
 */
export function applyAttempt(
  state: SkillState,
  outcome: AttemptOutcome,
): MasteryTransition {
  const { rating, itemDifficulty } = updateRatings({
    rating: state.rating,
    itemDifficulty: outcome.itemDifficulty,
    correct: outcome.correct,
    attemptCount: state.attemptCount,
  });

  // Only attempts at grade level or above tell us anything about mastery.
  const countsTowardsMastery = outcome.itemDifficulty >= GRADE_LEVEL_DIFFICULTY;
  const recentResults = countsTowardsMastery
    ? [...state.recentResults, outcome.correct].slice(-WINDOW_SIZE)
    : state.recentResults;

  const attemptCount = state.attemptCount + 1;
  const correctCount = state.correctCount + (outcome.correct ? 1 : 0);

  const wasMastered = state.level === "mastered";
  let level: MasteryLevel = state.level;
  let reviewStage = state.reviewStage;
  let justMastered = false;
  let regressed = false;

  if (
    recentResults.length >= WINDOW_SIZE &&
    countCorrect(recentResults) >= REQUIRED_CORRECT
  ) {
    if (!wasMastered) {
      justMastered = true;
      reviewStage = 0;
    } else if (outcome.correct) {
      // Passed a review: move further out on the ladder.
      reviewStage = Math.min(reviewStage + 1, REVIEW_INTERVALS_DAYS.length - 1);
    }
    level = "mastered";
  } else if (wasMastered) {
    level = "practicing";
    reviewStage = Math.max(0, reviewStage - 1);
    regressed = true;
  } else if (attemptCount >= 3) {
    level = "practicing";
  } else {
    level = "learning";
  }

  const nextReviewAt =
    level === "mastered"
      ? addDays(outcome.at, REVIEW_INTERVALS_DAYS[reviewStage])
      : null;

  return {
    state: {
      rating,
      level,
      recentResults,
      attemptCount,
      correctCount,
      reviewStage,
      nextReviewAt,
      lastSeenAt: outcome.at,
    },
    itemDifficulty,
    justMastered,
    regressed,
  };
}

export function isDueForReview(state: SkillState, now: Date): boolean {
  if (state.level !== "mastered" || !state.nextReviewAt) return false;
  return state.nextReviewAt.getTime() <= now.getTime();
}

/** Fraction of the skill considered learned, for progress bars. */
export function masteryFraction(state: SkillState): number {
  switch (state.level) {
    case "not_started":
      return 0;
    case "learning":
      return 0.25;
    case "practicing": {
      if (state.recentResults.length === 0) return 0.4;
      const hit = countCorrect(state.recentResults) / WINDOW_SIZE;
      return 0.4 + hit * 0.5;
    }
    case "mastered":
      return 1;
  }
}

export { kFactor };
