import type { ItemGenerator, GeneratorContext, Item } from "../types";
import { Rng } from "../rng";
import { buildMultipleChoice } from "../build";
import {
  addColumnsIndependently,
  addWithoutRegrouping,
  numberToWords,
  requiresBorrowing,
  requiresRegrouping,
  subtractWithoutBorrowing,
} from "../numbers";

/**
 * MA.2.NSO.2.3 — Add and subtract whole numbers up to 100 with procedural
 * reliability.
 *
 * The distractors are the entire point of this generator. Each wrong answer
 * is the number a child actually produces from a specific, catalogued error,
 * so a pattern of wrong answers tells the engine which lesson to serve rather
 * than just "give them more sums".
 */

const BANDS = {
  easy: { min: 11, max: 49, regroup: false },
  core: { min: 15, max: 89, regroup: true },
  stretch: { min: 25, max: 99, regroup: true },
} as const;

function pickAddends(rng: Rng, ctx: GeneratorContext): [number, number] {
  const band = BANDS[ctx.difficulty];
  for (let attempt = 0; attempt < 60; attempt++) {
    const a = rng.int(band.min, band.max);
    // The sum is capped at 100 by the benchmark, so once `a` is large there
    // may be no legal second addend at all — reroll rather than invert the
    // range.
    const bMax = Math.min(band.max, 100 - a);
    if (bMax < band.min) continue;
    const b = rng.int(band.min, bMax);
    if (requiresRegrouping(a, b) === band.regroup) return [a, b];
  }
  // Deterministic fallback that still satisfies the band.
  return band.regroup ? [47, 25] : [23, 41];
}

export const additionWithinHundred: ItemGenerator = {
  key: "g2.add.within100",
  benchmark: "MA.2.NSO.2.3",
  skillSlug: "add-two-digit-within-100",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const [a, b] = pickAddends(rng, ctx);
    const sum = a + b;

    const noCarry = addWithoutRegrouping(a, b);
    const columns = addColumnsIndependently(a, b);
    const subtracted = Math.abs(a - b);

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `${a} + ${b} = ?`,
      audioText: `What is ${numberToWords(a)} plus ${numberToWords(b)}?`,
      correct: String(sum),
      distractors: [
        { value: String(noCarry), misconception: "no_regrouping" },
        { value: String(columns), misconception: "column_independent" },
        { value: String(subtracted), misconception: "wrong_operation" },
        { value: String(sum + 10), misconception: "no_regrouping" },
        { value: String(sum - 1), misconception: "off_by_one" },
      ],
      explanation:
        requiresRegrouping(a, b)
          ? `${a % 10} + ${b % 10} makes ${(a % 10) + (b % 10)}, which is more than ten. Write the ${((a % 10) + (b % 10)) % 10} and carry one ten across, so the answer is ${sum}.`
          : `Add the ones, then add the tens: ${sum}.`,
      hints: [
        "Start with the ones column.",
        requiresRegrouping(a, b)
          ? "The ones make more than ten, so one ten has to move across."
          : "The ones stay under ten, so nothing moves across.",
      ],
      difficulty: ctx.difficulty === "easy" ? 850 : ctx.difficulty === "core" ? 1000 : 1150,
      widget: { key: "base-ten-blocks", config: { a, b, operation: "add" } },
      fallback: (taken) => {
        for (let delta = 2; delta < 30; delta++) {
          for (const v of [sum + delta, sum - delta]) {
            if (v > 0 && !taken.has(String(v))) return String(v);
          }
        }
        return null;
      },
    });
  },
};

/**
 * MA.2.NSO.2.3 — the subtraction half. Kept as a separate generator because
 * the misconceptions are genuinely different: failing to borrow produces a
 * distinctive answer that failing to carry does not.
 */
export const subtractionWithinHundred: ItemGenerator = {
  key: "g2.sub.within100",
  benchmark: "MA.2.NSO.2.3",
  skillSlug: "subtract-two-digit-within-100",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const wantBorrow = ctx.difficulty !== "easy";

    let a = 0;
    let b = 0;
    for (let attempt = 0; attempt < 60; attempt++) {
      a = rng.int(ctx.difficulty === "stretch" ? 40 : 25, 99);
      b = rng.int(11, a - 1);
      if (requiresBorrowing(a, b) === wantBorrow) break;
    }
    if (a <= b) [a, b] = wantBorrow ? [62, 47] : [68, 25];

    const difference = a - b;
    const noBorrow = subtractWithoutBorrowing(a, b);

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `${a} − ${b} = ?`,
      audioText: `What is ${numberToWords(a)} minus ${numberToWords(b)}?`,
      correct: String(difference),
      distractors: [
        { value: String(noBorrow), misconception: "no_regrouping" },
        { value: String(a + b), misconception: "wrong_operation" },
        { value: String(difference + 10), misconception: "no_regrouping" },
        { value: String(difference - 1), misconception: "off_by_one" },
        { value: String(difference + 1), misconception: "off_by_one" },
      ],
      explanation: requiresBorrowing(a, b)
        ? `There are not enough ones to take away ${b % 10}, so open one ten from the ${Math.floor(a / 10)} tens. That leaves ${difference}.`
        : `Take away the ones, then the tens: ${difference}.`,
      hints: [
        "Look at the ones column first.",
        requiresBorrowing(a, b)
          ? "There are not enough ones. Break open one of the tens."
          : "There are enough ones, so you can subtract straight down.",
      ],
      difficulty: ctx.difficulty === "easy" ? 880 : ctx.difficulty === "core" ? 1030 : 1180,
      widget: { key: "base-ten-blocks", config: { a, b, operation: "subtract" } },
      fallback: (taken) => {
        for (let delta = 2; delta < 30; delta++) {
          for (const v of [difference + delta, difference - delta]) {
            if (v > 0 && !taken.has(String(v))) return String(v);
          }
        }
        return null;
      },
    });
  },
};
