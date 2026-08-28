/**
 * Elo rating for the student-skill pair.
 *
 * Chosen over full IRT deliberately. A 2PL model needs thousands of responses
 * per item before its parameters mean anything; Elo gives a usable estimate
 * from the first answer and degrades gracefully. The plan is to migrate once
 * there are roughly 50,000 responses per grade to calibrate against — before
 * that, an IRT model would be fitting noise and presenting it as precision.
 */

/** Everything starts here, including new items. */
export const DEFAULT_RATING = 1000;

/**
 * The success rate we aim to serve. High enough that a child keeps going,
 * low enough that they are still being taught something. Well-established in
 * the mastery-learning literature as the productive band.
 */
export const TARGET_SUCCESS_RATE = 0.75;

/** Probability the student answers an item of this difficulty correctly. */
export function expectedScore(rating: number, difficulty: number): number {
  return 1 / (1 + Math.pow(10, (difficulty - rating) / 400));
}

/**
 * Rating change per answer. Larger while we know little about the student, so
 * a child who is misplaced by the initial guess is not stuck grinding through
 * questions at the wrong level for a week.
 */
export function kFactor(attemptCount: number): number {
  if (attemptCount < 10) return 40;
  if (attemptCount < 30) return 24;
  return 16;
}

/** Items move too, but far more slowly — one child should barely shift them. */
const ITEM_K = 4;

export interface EloUpdate {
  rating: number;
  itemDifficulty: number;
}

export function updateRatings(opts: {
  rating: number;
  itemDifficulty: number;
  correct: boolean;
  attemptCount: number;
}): EloUpdate {
  const expected = expectedScore(opts.rating, opts.itemDifficulty);
  const actual = opts.correct ? 1 : 0;
  const k = kFactor(opts.attemptCount);

  return {
    rating: opts.rating + k * (actual - expected),
    // The item moves the opposite way: an item everyone gets right is easier
    // than we thought.
    itemDifficulty: opts.itemDifficulty - ITEM_K * (actual - expected),
  };
}

/**
 * The item difficulty that produces TARGET_SUCCESS_RATE for this student.
 *
 * Inverting the Elo expectation: at a 0.75 target this sits about 191 points
 * below the student's rating.
 */
export function targetDifficulty(
  rating: number,
  successRate: number = TARGET_SUCCESS_RATE,
): number {
  if (successRate <= 0 || successRate >= 1) {
    throw new Error(`targetDifficulty: successRate must be in (0, 1), got ${successRate}`);
  }
  return rating + 400 * Math.log10(successRate / (1 - successRate)) * -1;
}

export type DifficultyBand = "easy" | "core" | "stretch";

/**
 * Maps a target rating onto the three bands the generators understand.
 * The thresholds are the midpoints between the bands' own nominal ratings
 * (roughly 880, 1030 and 1170 across the current generators).
 */
export function bandForDifficulty(target: number): DifficultyBand {
  if (target < 955) return "easy";
  if (target < 1100) return "core";
  return "stretch";
}

/** Convenience: which band to serve a student at this rating right now. */
export function bandForStudent(rating: number): DifficultyBand {
  return bandForDifficulty(targetDifficulty(rating));
}
