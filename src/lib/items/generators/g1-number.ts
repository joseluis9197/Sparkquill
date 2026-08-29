import { mcGenerator, nearbyNumbers } from "../build";
import { expandedForm, numberToWords, placeValueParts } from "../numbers";

/**
 * Grade 1, Number Sense and Operations.
 *
 * The numbers stay inside each benchmark's stated ceiling — 120 for counting,
 * 100 for place value, 20 for facts. That bound is not decoration: a first
 * grader who meets 143 in a "within 120" question learns that the rules move,
 * which is the opposite of what number sense is.
 */

/**
 * Counting by ones is in the benchmark too, so it stays in the mix — it is
 * the step an easy item should offer, and dropping it would leave the
 * "count forward and backward within 120" half of the standard untested.
 */
const SKIP_STEPS = {
  easy: [1, 1, 2, 10],
  core: [1, 2, 5, 10],
  stretch: [2, 5, 10],
} as const;

/** MA.1.NSO.1.1 — Count forward and backward within 120; skip count. */
export const countSequence = mcGenerator({
  key: "g1.nso.countSequence",
  benchmark: "MA.1.NSO.1.1",
  skillSlug: "count-within-120",
  skillTitle: "Counting and skip counting to 120",
  build(rng, ctx) {
    const step = rng.pick(SKIP_STEPS[ctx.difficulty]);
    const backward = ctx.difficulty !== "easy" && rng.bool(0.4);
    // Skip counting by 2s stops at 20 and by 5s at 100, per the benchmark.
    const ceiling = step === 2 ? 20 : step === 5 ? 100 : 120;
    const shown = 4;
    const start = rng.int(step, Math.max(step, ceiling - step * shown));
    const from = backward ? start + step * shown : start;
    const dir = backward ? -step : step;

    const seq = Array.from({ length: shown }, (_, i) => from + dir * i);
    const answer = from + dir * shown;

    return {
      stem: `What number comes next?\n\n**${seq.join(", ")}, ___**`,
      audioText: `What number comes next? ${seq.join(", ")}, blank.`,
      correct: String(answer),
      distractors: [
        {
          // Carried on by ones instead of by the step.
          value: String(seq[shown - 1] + (backward ? -1 : 1)),
          misconception: "skip_count_wrong_step",
        },
        {
          // Kept going in the direction they expected rather than the one shown.
          value: String(seq[shown - 1] - dir),
          misconception: "counted_endpoints",
        },
        { value: String(answer + dir), misconception: "off_by_one" },
      ],
      explanation:
        step === 1
          ? `The numbers go ${backward ? "down" : "up"} by 1 each time, so after ${seq[shown - 1]} comes ${answer}.`
          : `The numbers ${backward ? "go down" : "go up"} by ${step} each time. ${seq[shown - 1]} ${backward ? "−" : "+"} ${step} = ${answer}.`,
      hints: [
        "How much does the number change from one to the next?",
        `Try counting ${backward ? "back" : "on"} by ${step}.`,
      ],
      difficulty: ctx.difficulty === "easy" ? 850 : 960,
      fallback: nearbyNumbers(answer, { min: 0, max: 120 }),
    };
  },
});

/** MA.1.NSO.1.2 — Read and write numbers 0-100 in three forms. */
export const g1WordForm = mcGenerator({
  key: "g1.nso.wordForm",
  benchmark: "MA.1.NSO.1.2",
  skillSlug: "read-write-numbers-to-100",
  skillTitle: "Reading and writing numbers to 100",
  build(rng, ctx) {
    const n = rng.int(ctx.difficulty === "easy" ? 11 : 20, 99);
    const { tens, ones } = placeValueParts(n);
    // The classic first grade slip: "forty-two" written as 24.
    const reversed = ones * 10 + tens;

    return {
      stem: `Which number is **${numberToWords(n)}**?`,
      audioText: `Which number is ${numberToWords(n)}?`,
      correct: String(n),
      distractors: [
        { value: String(reversed), misconception: "digit_reversal" },
        { value: String(tens + ones), misconception: "place_value_confusion" },
        { value: String(n + 10), misconception: "place_value_confusion" },
        { value: String(n + 1), misconception: "off_by_one" },
      ],
      explanation: `${numberToWords(n)} means ${tens} ten${tens === 1 ? "" : "s"} and ${ones} one${ones === 1 ? "" : "s"}. That is written ${n}.`,
      hints: [
        "Which part of the word tells you the tens?",
        "The tens digit comes first when you write the number.",
      ],
      difficulty: ctx.difficulty === "easy" ? 880 : 970,
      fallback: nearbyNumbers(n, { min: 0, max: 100 }),
    };
  },
});

/** MA.1.NSO.1.3 — Compose and decompose two-digit numbers. */
export const g1TensAndOnes = mcGenerator({
  key: "g1.nso.tensAndOnes",
  benchmark: "MA.1.NSO.1.3",
  skillSlug: "compose-decompose-to-100",
  skillTitle: "Breaking numbers into tens and ones",
  build(rng, ctx) {
    const n = rng.int(21, 99);
    const { tens, ones } = placeValueParts(n);
    const askForParts = rng.bool();

    if (askForParts) {
      const correct = `${tens} tens and ${ones} ones`;
      // For 33 the reversed option reads the same as the answer, so a
      // different wrong idea has to take its place.
      const reversedIsSame = tens === ones;
      return {
        stem: `How many tens and ones are in **${n}**?`,
        audioText: `How many tens and ones are in ${n}?`,
        correct,
        distractors: [
          ...(reversedIsSame
            ? []
            : [
                {
                  value: `${ones} tens and ${tens} ones`,
                  misconception: "digit_reversal" as const,
                },
              ]),
          {
            value: `${n} tens and 0 ones`,
            misconception: "place_value_confusion" as const,
          },
          {
            value: `${tens} tens and ${(ones + 1) % 10} ones`,
            misconception: "off_by_one" as const,
          },
          {
            value: `${(tens % 9) + 1} tens and ${ones} ones`,
            misconception: "place_value_confusion" as const,
          },
          {
            value: `${tens + ones} tens and 0 ones`,
            misconception: "place_value_confusion" as const,
          },
        ],
        explanation: `${n} is ${tens} ten${tens === 1 ? "" : "s"} (${tens * 10}) and ${ones} one${ones === 1 ? "" : "s"}, because ${tens * 10} + ${ones} = ${n}.`,
        hints: [
          "The first digit counts the tens.",
          "Blocks of ten first, then the loose ones.",
        ],
        difficulty: 950,
        widget: { key: "base-ten-blocks", config: { a: n } },
      };
    }

    return {
      stem: `**${tens} tens and ${ones} ones** make which number?`,
      audioText: `${tens} tens and ${ones} ones make which number?`,
      correct: String(n),
      distractors: [
        { value: String(ones * 10 + tens), misconception: "digit_reversal" },
        { value: String(tens + ones), misconception: "place_value_confusion" },
        { value: String(n + 10), misconception: "off_by_one" },
      ],
      explanation: `${tens} ten${tens === 1 ? "" : "s"} is ${tens * 10}. Add the ${ones} one${ones === 1 ? "" : "s"}: ${tens * 10} + ${ones} = ${n}.`,
      hints: ["One ten is worth 10.", `${tens} tens is ${tens * 10}.`],
      difficulty: 950,
      fallback: nearbyNumbers(n, { min: 0, max: 100 }),
    };
  },
});

/** MA.1.NSO.1.4 — Plot, order and compare whole numbers to 100. */
export const g1Compare = mcGenerator({
  key: "g1.nso.compare",
  benchmark: "MA.1.NSO.1.4",
  skillSlug: "compare-numbers-to-100",
  skillTitle: "Comparing numbers to 100",
  build(rng, ctx) {
    // Same tens digit on purpose: it forces a look at the ones rather than a
    // guess from which number "looks bigger".
    const sameTens = ctx.difficulty !== "easy" && rng.bool(0.5);
    const tens = rng.int(1, 9);
    const a = sameTens ? tens * 10 + rng.int(0, 9) : rng.int(10, 99);
    let b = sameTens ? tens * 10 + rng.int(0, 9) : rng.int(10, 99);
    while (b === a) b = sameTens ? tens * 10 + rng.int(0, 9) : rng.int(10, 99);

    const bigger = Math.max(a, b);
    const smaller = Math.min(a, b);
    const wantLarger = rng.bool();

    return {
      stem: `Which number is **${wantLarger ? "greater" : "less"}**: ${a} or ${b}?`,
      audioText: `Which number is ${wantLarger ? "greater" : "less"}, ${a} or ${b}?`,
      correct: String(wantLarger ? bigger : smaller),
      distractors: [
        {
          value: String(wantLarger ? smaller : bigger),
          misconception: "compared_wrong_direction",
        },
        { value: String(bigger + 1), misconception: "off_by_one" },
        { value: String(smaller - 1), misconception: "off_by_one" },
      ],
      explanation: `${bigger} is greater than ${smaller}${
        Math.floor(a / 10) === Math.floor(b / 10)
          ? ", because they have the same number of tens and " +
            `${bigger % 10} ones is more than ${smaller % 10} ones.`
          : `, because ${Math.floor(bigger / 10)} tens is more than ${Math.floor(smaller / 10)} tens.`
      }`,
      hints: [
        "Compare the tens first.",
        "If the tens are the same, look at the ones.",
      ],
      difficulty: ctx.difficulty === "easy" ? 870 : 990,
      fallback: nearbyNumbers(wantLarger ? bigger : smaller, {
        min: 0,
        max: 100,
      }),
    };
  },
});

/** MA.1.NSO.2.1 — Addition facts to 10 and related subtraction. */
export const g1FactsToTen = mcGenerator({
  key: "g1.nso.factsToTen",
  benchmark: "MA.1.NSO.2.1",
  skillSlug: "facts-to-ten",
  skillTitle: "Addition and subtraction facts to 10",
  build(rng) {
    const sum = rng.int(4, 10);
    const a = rng.int(1, sum - 1);
    const b = sum - a;
    const subtract = rng.bool();

    const stem = subtract ? `${sum} − ${a} = ?` : `${a} + ${b} = ?`;
    const answer = subtract ? b : sum;

    return {
      stem: `**${stem}**`,
      audioText: subtract
        ? `${sum} minus ${a} equals what?`
        : `${a} plus ${b} equals what?`,
      correct: String(answer),
      distractors: [
        {
          value: String(subtract ? sum + a : sum - Math.min(a, b) * 2),
          misconception: "wrong_operation",
        },
        { value: String(answer + 1), misconception: "off_by_one" },
        { value: String(Math.max(0, answer - 1)), misconception: "off_by_one" },
        { value: String(answer + 2), misconception: "distractor_plausible" },
      ],
      explanation: subtract
        ? `${a} and ${b} make ${sum}, so taking ${a} away from ${sum} leaves ${b}.`
        : `${a} and ${b} together make ${sum}.`,
      hints: [
        subtract ? "What goes with " + a + " to make " + sum + "?" : "Count on from the bigger number.",
        "Addition and subtraction are two ways to see the same three numbers.",
      ],
      difficulty: 830,
      fallback: nearbyNumbers(answer, { min: 0, max: 20 }),
    };
  },
});

/** MA.1.NSO.2.2 — Add numbers with sums to 20 and subtract using related facts. */
export const g1SumsToTwenty = mcGenerator({
  key: "g1.nso.sumsToTwenty",
  benchmark: "MA.1.NSO.2.2",
  skillSlug: "sums-to-twenty",
  skillTitle: "Adding and subtracting within 20",
  build(rng, ctx) {
    // Bridging ten is the whole difficulty of this benchmark, so most items
    // cross it rather than staying safely below.
    const crossTen = ctx.difficulty !== "easy";
    const a = rng.int(crossTen ? 6 : 2, 9);
    const b = rng.int(crossTen ? 11 - a : 1, Math.min(9, 20 - a));
    const sum = a + b;
    const subtract = rng.bool(0.4);

    const answer = subtract ? a : sum;

    return {
      stem: subtract ? `**${sum} − ${b} = ?**` : `**${a} + ${b} = ?**`,
      audioText: subtract
        ? `${sum} minus ${b} equals what?`
        : `${a} plus ${b} equals what?`,
      correct: String(answer),
      distractors: [
        {
          // Forgot to cross the ten and stopped at the digit.
          value: String(subtract ? sum - b - 1 : (a + b) % 10),
          misconception: "no_regrouping",
        },
        { value: String(answer + 1), misconception: "off_by_one" },
        { value: String(Math.max(0, answer - 1)), misconception: "off_by_one" },
        {
          value: String(subtract ? sum + b : Math.abs(a - b)),
          misconception: "wrong_operation",
        },
      ],
      explanation: subtract
        ? `${b} and ${a} make ${sum}, so ${sum} − ${b} = ${a}.`
        : `Make ten first: ${a} + ${10 - a} = 10, then ${10} + ${b - (10 - a)} = ${sum}.`,
      hints: ["Make a ten first.", `How many more does ${a} need to reach 10?`],
      difficulty: ctx.difficulty === "easy" ? 900 : 1000,
      fallback: nearbyNumbers(answer, { min: 0, max: 20 }),
    };
  },
});

/** MA.1.NSO.2.3 — One more/less and ten more/less. */
export const g1OneTenMoreLess = mcGenerator({
  key: "g1.nso.oneTenMoreLess",
  benchmark: "MA.1.NSO.2.3",
  skillSlug: "one-ten-more-less",
  skillTitle: "One more, one less, ten more, ten less",
  build(rng) {
    const n = rng.int(15, 89);
    const byTen = rng.bool();
    const more = rng.bool();
    const step = byTen ? 10 : 1;
    const answer = more ? n + step : n - step;
    const words = `${byTen ? "ten" : "one"} ${more ? "more than" : "less than"}`;

    return {
      stem: `What number is **${words} ${n}**?`,
      audioText: `What number is ${words} ${n}?`,
      correct: String(answer),
      distractors: [
        {
          // Moved the right amount in the wrong direction.
          value: String(more ? n - step : n + step),
          misconception: "wrong_operation",
        },
        {
          // Moved by the other unit: ones where tens were asked, or vice versa.
          value: String(more ? n + (byTen ? 1 : 10) : n - (byTen ? 1 : 10)),
          misconception: "place_value_confusion",
        },
        { value: String(n), misconception: "distractor_plausible" },
      ],
      explanation: byTen
        ? `Ten ${more ? "more" : "less"} changes only the tens digit: ${n} becomes ${answer}.`
        : `One ${more ? "more" : "less"} moves ${n} ${more ? "up" : "down"} by one, to ${answer}.`,
      hints: [
        byTen ? "Which digit does ten change?" : "Count on or back by one.",
        "Ten more adds a whole block of ten.",
      ],
      difficulty: 900,
      widget: { key: "base-ten-blocks", config: { a: n } },
      fallback: nearbyNumbers(answer, { min: 0, max: 120 }),
    };
  },
});

/** MA.1.NSO.2.4 — Two-digit plus one-digit, sums to 100. */
export const g1TwoDigitPlusOne = mcGenerator({
  key: "g1.nso.twoDigitPlusOne",
  benchmark: "MA.1.NSO.2.4",
  skillSlug: "two-digit-plus-one-digit",
  skillTitle: "Adding a one-digit number to a two-digit number",
  build(rng, ctx) {
    const crossTen = ctx.difficulty !== "easy";
    // A number ending in 0 cannot be pushed over the next ten by a single
    // digit, so when the item is meant to cross, the ones digit starts at 1.
    const a = crossTen
      ? rng.int(2, 8) * 10 + rng.int(1, 9)
      : rng.int(2, 8) * 10 + rng.int(0, 8);
    const ones = a % 10;
    const b = crossTen
      ? rng.int(10 - ones, 9)
      : rng.int(1, 9 - ones);
    const sum = a + b;

    return {
      stem: `**${a} + ${b} = ?**`,
      audioText: `${a} plus ${b} equals what?`,
      correct: String(sum),
      distractors: [
        {
          // Kept the tens digit and wrapped the ones.
          value: String(Math.floor(a / 10) * 10 + ((ones + b) % 10)),
          misconception: "no_regrouping",
        },
        { value: String(sum + 10), misconception: "place_value_confusion" },
        { value: String(a - b), misconception: "wrong_operation" },
        { value: String(sum + 1), misconception: "off_by_one" },
      ],
      explanation:
        ones + b >= 10
          ? `${a} needs ${10 - ones} more to reach ${a + (10 - ones)}. That leaves ${b - (10 - ones)} to add, giving ${sum}.`
          : `The tens stay the same and the ones grow: ${ones} + ${b} = ${ones + b}, so the answer is ${sum}.`,
      hints: [
        "Add the ones first.",
        "If the ones pass 9, you have made a new ten.",
      ],
      difficulty: ctx.difficulty === "easy" ? 920 : 1020,
      widget: { key: "base-ten-blocks", config: { a, b, operation: "add" } },
      fallback: nearbyNumbers(sum, { min: 0, max: 100 }),
    };
  },
});

/** MA.1.NSO.2.5 — Subtract a one-digit number from a two-digit number. */
export const g1TwoDigitMinusOne = mcGenerator({
  key: "g1.nso.twoDigitMinusOne",
  benchmark: "MA.1.NSO.2.5",
  skillSlug: "two-digit-minus-one-digit",
  skillTitle: "Subtracting a one-digit number from a two-digit number",
  build(rng, ctx) {
    const borrow = ctx.difficulty !== "easy";
    const a = rng.int(21, 99);
    const ones = a % 10;
    const b = borrow
      ? rng.int(Math.min(9, ones + 1), 9)
      : rng.int(1, Math.max(1, ones));
    const diff = a - b;

    return {
      stem: `**${a} − ${b} = ?**`,
      audioText: `${a} minus ${b} equals what?`,
      correct: String(diff),
      distractors: [
        {
          // Subtracted the smaller digit from the larger in the ones column.
          value: String(Math.floor(a / 10) * 10 + Math.abs(ones - b)),
          misconception: "no_regrouping",
        },
        { value: String(a + b), misconception: "wrong_operation" },
        { value: String(diff - 10), misconception: "place_value_confusion" },
        { value: String(diff + 1), misconception: "off_by_one" },
      ],
      explanation:
        ones < b
          ? `There are not enough ones, so open a ten: ${a} becomes ${Math.floor(a / 10) - 1} tens and ${ones + 10} ones. ${ones + 10} − ${b} = ${ones + 10 - b}, giving ${diff}.`
          : `Take the ones away: ${ones} − ${b} = ${ones - b}, so the answer is ${diff}.`,
      hints: [
        "Are there enough ones to take away from?",
        "If not, open one of the tens.",
      ],
      difficulty: ctx.difficulty === "easy" ? 930 : 1040,
      widget: {
        key: "base-ten-blocks",
        config: { a, b, operation: "subtract" },
      },
      fallback: nearbyNumbers(diff, { min: 0, max: 100 }),
    };
  },
});

/** MA.1.NSO.1.2 companion — expanded form, the third of the three forms. */
export const g1ExpandedForm = mcGenerator({
  key: "g1.nso.expandedForm",
  benchmark: "MA.1.NSO.1.2",
  skillSlug: "read-write-numbers-to-100",
  skillTitle: "Reading and writing numbers to 100",
  build(rng) {
    // Equal digits are excluded: for 44 the "reversed" distractor is 40 + 4,
    // which is the correct answer, and an item cannot offer it twice.
    const tens = rng.int(2, 9);
    let ones = rng.int(1, 9);
    while (ones === tens) ones = rng.int(1, 9);
    const n = tens * 10 + ones;

    return {
      stem: `Which shows **${n}** in expanded form?`,
      audioText: `Which shows ${n} in expanded form?`,
      correct: expandedForm(n),
      distractors: [
        { value: `${tens} + ${ones}`, misconception: "place_value_confusion" },
        {
          value: `${ones * 10} + ${tens}`,
          misconception: "digit_reversal",
        },
        {
          value: `${tens * 10} + ${ones * 10}`,
          misconception: "place_value_confusion",
        },
      ],
      explanation: `The ${tens} in the tens place is worth ${tens * 10}, and the ${ones} is worth ${ones}. So ${n} = ${expandedForm(n)}.`,
      hints: [
        "What is the first digit really worth?",
        "A digit in the tens place counts tens, not ones.",
      ],
      difficulty: 970,
    };
  },
});
