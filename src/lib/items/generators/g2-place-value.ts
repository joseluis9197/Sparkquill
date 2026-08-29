import type { ItemGenerator, GeneratorContext, Item } from "../types";
import { Rng } from "../rng";
import { buildMultipleChoice } from "../build";
import {
  expandedForm,
  numberToWords,
  placeValueParts,
  roundTo,
  roundWrongDirection,
} from "../numbers";

const RANGES = {
  easy: [101, 399],
  core: [100, 999],
  stretch: [100, 1000],
} as const;

function pickNumber(rng: Rng, ctx: GeneratorContext): number {
  const [min, max] = RANGES[ctx.difficulty];
  return rng.int(min, Math.min(max, 999));
}

/**
 * MA.2.NSO.1.1 — Read and write numbers 0-1,000 in standard, expanded and
 * word form.
 *
 * The interesting error here is place-value confusion on numbers with an
 * internal zero: a child who reads 305 as "thirty-five" has a real, nameable
 * gap, and the distractor set is built to catch exactly that.
 */
export const wordForm: ItemGenerator = {
  key: "g2.pv.wordForm",
  benchmark: "MA.2.NSO.1.1",
  skillSlug: "read-write-numbers-to-1000",
  skillTitle: "Reading and writing numbers to 1,000",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    // Bias towards numbers with a zero somewhere; that is where the
    // misconception lives.
    const n = rng.bool(0.4)
      ? rng.pick([
          rng.int(1, 9) * 100 + rng.int(1, 9),
          rng.int(1, 9) * 100 + rng.int(1, 9) * 10,
        ])
      : pickNumber(rng, ctx);

    const { hundreds, tens, ones } = placeValueParts(n);
    const digitsOnly = Number(`${hundreds}${ones}`) || n;
    const swapped = hundreds * 100 + ones * 10 + tens;

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `Which number is **${numberToWords(n)}**?`,
      audioText: `Which number is ${numberToWords(n)}?`,
      correct: String(n),
      distractors: [
        { value: String(digitsOnly), misconception: "place_value_confusion" },
        { value: String(swapped), misconception: "digit_reversal" },
        {
          // Shifting a hundred is the point of this distractor, but the
          // benchmark caps grade 2 at 1,000 — shift down when adding would
          // push past it.
          value: String(n + 100 <= 999 ? n + 100 : n - 100),
          misconception: "place_value_confusion",
        },
        { value: String(n >= 10 ? n - 10 : n + 10), misconception: "off_by_one" },
      ],
      explanation: `${numberToWords(n)} is ${hundreds} hundred${hundreds === 1 ? "" : "s"}, ${tens} ten${tens === 1 ? "" : "s"} and ${ones} one${ones === 1 ? "" : "s"}, which is written ${n}.`,
      hints: [
        "How many hundreds do you hear?",
        "A zero holds the place when there are none of that unit.",
      ],
      difficulty: ctx.difficulty === "easy" ? 900 : 1020,
      fallback: (taken) => {
        for (let d = 1; d < 200; d++) {
          for (const v of [n + d, n - d]) {
            if (v > 0 && v < 1000 && !taken.has(String(v))) return String(v);
          }
        }
        return null;
      },
    });
  },
};

/**
 * MA.2.NSO.1.2 — Compose and decompose three-digit numbers using hundreds,
 * tens and ones.
 */
export const expandedFormItem: ItemGenerator = {
  key: "g2.pv.expandedForm",
  benchmark: "MA.2.NSO.1.2",
  skillSlug: "compose-decompose-to-1000",
  skillTitle: "Breaking numbers into hundreds, tens and ones",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const n = pickNumber(rng, ctx);
    const { hundreds, tens, ones } = placeValueParts(n);

    // The classic error: writing the digits rather than their values.
    const digitSum = `${hundreds} + ${tens} + ${ones}`;
    const shifted = expandedForm(hundreds * 100 + ones * 10 + tens);

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `Which shows **${n}** in expanded form?`,
      audioText: `Which one shows ${numberToWords(n)} in expanded form?`,
      correct: expandedForm(n),
      distractors: [
        { value: digitSum, misconception: "place_value_confusion" },
        { value: shifted, misconception: "digit_reversal" },
        {
          value: expandedForm(n + 100),
          misconception: "place_value_confusion",
        },
        { value: `${hundreds * 100} + ${tens} + ${ones}`, misconception: "place_value_confusion" },
      ],
      explanation: `The ${hundreds} is worth ${hundreds * 100}, the ${tens} is worth ${tens * 10}, and the ${ones} is worth ${ones}. Together: ${expandedForm(n)}.`,
      hints: [
        "Each digit is worth more than the digit itself.",
        "What is the 4 in 342 really worth?",
      ],
      difficulty: 1000,
      widget: { key: "place-value-chart", config: { value: n } },
      fallback: (taken) => {
        for (let d = 1; d < 50; d++) {
          const v = expandedForm(Math.min(999, n + d));
          if (!taken.has(v)) return v;
        }
        return null;
      },
    });
  },
};

/**
 * MA.2.NSO.1.4 — Round whole numbers 0-100 to the nearest 10.
 *
 * Note the benchmark's range: rounding at grade 2 stops at 100. Generating
 * three-digit rounding here would be teaching grade 3 content a year early.
 */
export const roundToTen: ItemGenerator = {
  key: "g2.pv.roundToTen",
  benchmark: "MA.2.NSO.1.4",
  skillSlug: "round-to-nearest-ten",
  skillTitle: "Rounding to the nearest ten",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    // A number ending in 5 is the case children get wrong most often, so it
    // is over-represented at the stretch level and rare at easy.
    const endsInFive =
      ctx.difficulty === "stretch"
        ? rng.bool(0.5)
        : ctx.difficulty === "core"
          ? rng.bool(0.25)
          : false;

    const n = endsInFive
      ? rng.int(1, 9) * 10 + 5
      : (() => {
          let candidate = rng.int(11, 99);
          if (candidate % 10 === 5) candidate += 1;
          return candidate;
        })();

    const correct = roundTo(n, 10);
    const wrongWay = roundWrongDirection(n, 10);

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `Round **${n}** to the nearest ten.`,
      audioText: `Round ${numberToWords(n)} to the nearest ten.`,
      correct: String(correct),
      distractors: [
        { value: String(wrongWay), misconception: "rounded_wrong_direction" },
        { value: String(n), misconception: "rounded_wrong_place" },
        { value: String(roundTo(n, 100)), misconception: "rounded_wrong_place" },
        {
          // MA.2.NSO.1.4 rounds within 100, so overshooting the top of the
          // range would put a number on screen the benchmark never uses.
          value: String(correct + 10 <= 100 ? correct + 10 : correct - 20),
          misconception: "rounded_wrong_direction",
        },
      ],
      explanation:
        n % 10 === 5
          ? `${n} sits exactly halfway. The rule is to round up, so ${n} becomes ${correct}.`
          : `${n} is closer to ${correct} than to ${wrongWay}, so it rounds to ${correct}.`,
      hints: [
        "Which two tens is this number between?",
        "Which one is it closer to on the number line?",
      ],
      difficulty: endsInFive ? 1120 : 950,
      widget: { key: "number-line-zoom", config: { value: n, place: 10 } },
      fallback: (taken) => {
        for (let d = 10; d <= 100; d += 10) {
          for (const v of [correct + d, correct - d]) {
            if (v >= 0 && v <= 100 && !taken.has(String(v))) return String(v);
          }
        }
        return null;
      },
    });
  },
};

/** MA.2.NSO.1.3 — Plot, order and compare whole numbers up to 1,000. */
export const compareNumbers: ItemGenerator = {
  key: "g2.pv.compare",
  benchmark: "MA.2.NSO.1.3",
  skillSlug: "compare-numbers-to-1000",
  skillTitle: "Comparing numbers to 1,000",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const a = pickNumber(rng, ctx);
    // Numbers that share a leading digit are much harder than obvious ones.
    const b =
      ctx.difficulty === "easy"
        ? pickNumber(rng, ctx)
        : Math.floor(a / 100) * 100 + rng.int(0, 99);

    const [lo, hi] = a === b ? [a, a + 1] : a < b ? [a, b] : [b, a];
    const correct = `${hi} > ${lo}`;

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `Which statement is true?`,
      audioText: `Which statement is true about ${numberToWords(lo)} and ${numberToWords(hi)}?`,
      correct,
      distractors: [
        { value: `${lo} > ${hi}`, misconception: "digit_reversal" },
        { value: `${lo} = ${hi}`, misconception: "place_value_confusion" },
        { value: `${hi} < ${lo}`, misconception: "digit_reversal" },
      ],
      explanation: `Compare the hundreds first, then the tens, then the ones. ${hi} is the larger number.`,
      hints: [
        "Start at the biggest place value, not the last digit.",
        "The wide end of the symbol always opens towards the larger number.",
      ],
      difficulty: ctx.difficulty === "easy" ? 880 : 1050,
      widget: { key: "number-line-zoom", config: { marks: [lo, hi] } },
    });
  },
};
