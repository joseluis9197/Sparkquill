import { mcGenerator, nearbyNumbers } from "../build";
import {
  decimalText,
  decimalToWords,
  expandedForm,
  numberToWords,
  round,
  roundTo,
  roundWrongDirection,
} from "../numbers";

/**
 * Grade 4, Number Sense and Operations.
 *
 * Decimals arrive, and with them the error that outlives school: reading 0.45
 * as larger than 0.5 because it has more digits. Every decimal comparison
 * here offers that answer, because a child who picks it has not learned to be
 * careless, they have learned a rule that worked for whole numbers.
 */

const COMMA = (n: number) => n.toLocaleString("en-US");

/** MA.4.NSO.1.1 — How a digit's value changes across places. */
export const g4PlaceValueShift = mcGenerator({
  key: "g4.nso.placeValueShift",
  benchmark: "MA.4.NSO.1.1",
  skillSlug: "place-value-relationships",
  skillTitle: "How a digit's value changes place to place",
  build(rng) {
    const digit = rng.int(2, 9);
    const place = rng.pick([10, 100, 1000, 10000] as const);
    const left = rng.bool();
    const from = digit * place;
    const to = left ? from * 10 : from / 10;

    return {
      stem: `In **${COMMA(from)}**, the ${digit} moves **one place to the ${left ? "left" : "right"}**. What is it worth now?`,
      audioText: `In ${COMMA(from)} the digit ${digit} moves one place to the ${left ? "left" : "right"}. What is it worth now?`,
      correct: COMMA(to),
      distractors: [
        {
          // Moved it the other way.
          value: COMMA(left ? from / 10 : from * 10),
          misconception: "place_value_confusion",
        },
        {
          value: COMMA(left ? from + 10 : from - 10),
          misconception: "added_instead_of_multiplied",
        },
        { value: COMMA(from), misconception: "distractor_plausible" },
        { value: COMMA(to * 10), misconception: "place_value_confusion" },
      ],
      explanation: `Moving one place to the left makes a digit worth ten times as much; to the right, one tenth as much. ${COMMA(from)} becomes ${COMMA(to)}.`,
      hints: [
        "Left is bigger, right is smaller.",
        "Each place is ten times the one on its right.",
      ],
      difficulty: 1130,
    };
  },
});

/** MA.4.NSO.1.2 — Read and write whole numbers to 1,000,000. */
export const g4WordForm = mcGenerator({
  key: "g4.nso.wordForm",
  benchmark: "MA.4.NSO.1.2",
  skillSlug: "read-write-numbers-to-million",
  skillTitle: "Reading and writing numbers to a million",
  build(rng, ctx) {
    const size = ctx.difficulty === "easy" ? 5 : 6;
    const digits = Array.from({ length: size }, (_, i) =>
      i === 0 ? rng.int(1, 9) : rng.int(0, 9),
    );
    const n = Number(digits.join(""));

    const askWords = rng.bool();
    if (askWords) {
      return {
        stem: `Which number is **${numberToWords(n)}**?`,
        audioText: `Which number is ${numberToWords(n)}?`,
        correct: COMMA(n),
        distractors: [
          { value: COMMA(n * 10), misconception: "place_value_confusion" },
          {
            value: COMMA(Math.floor(n / 10)),
            misconception: "place_value_confusion",
          },
          { value: COMMA(n + 1000), misconception: "off_by_one" },
          { value: COMMA(n + 100), misconception: "off_by_one" },
        ],
        explanation: `${numberToWords(n)} is written ${COMMA(n)}. The commas mark off groups of three digits, which is how the number is read aloud.`,
        hints: [
          "How many thousands does it name?",
          "Every group of three digits gets a comma.",
        ],
        difficulty: 1090,
      };
    }

    return {
      stem: `Which shows **${COMMA(n)}** in expanded form?`,
      audioText: `Which shows ${numberToWords(n)} in expanded form?`,
      correct: expandedForm(n),
      distractors: [
        {
          value: digits.filter((d) => d !== 0).join(" + "),
          misconception: "place_value_confusion",
        },
        {
          value: expandedForm(Math.floor(n / 10)),
          misconception: "place_value_confusion",
        },
        { value: expandedForm(n + 1000), misconception: "off_by_one" },
        { value: expandedForm(n * 10), misconception: "place_value_confusion" },
      ],
      explanation: `Each digit is worth its own place: ${expandedForm(n)}.`,
      hints: ["Start from the biggest place.", "Zero places are left out."],
      difficulty: 1110,
    };
  },
});

/** MA.4.NSO.1.3 — Compare whole numbers to 1,000,000. */
export const g4CompareWhole = mcGenerator({
  key: "g4.nso.compareWhole",
  benchmark: "MA.4.NSO.1.3",
  skillSlug: "compare-numbers-to-million",
  skillTitle: "Comparing large numbers",
  build(rng) {
    // Same digit count, agreeing for the first two or three places, so the
    // comparison cannot be settled by length or by the leading digit.
    const size = rng.int(5, 6);
    const shared = rng.int(1, 3);
    const a = Array.from({ length: size }, (_, i) =>
      i === 0 ? rng.int(1, 9) : rng.int(0, 9),
    );
    const b = [...a];
    b[shared] = (a[shared] + rng.int(1, 5)) % 10;
    for (let i = shared + 1; i < size; i++) b[i] = rng.int(0, 9);

    const x = Number(a.join(""));
    const y = Number(b.join(""));
    const bigger = Math.max(x, y);
    const smaller = Math.min(x, y);
    const wantLarger = rng.bool();

    return {
      stem: `Which is **${wantLarger ? "greater" : "less"}**: ${COMMA(x)} or ${COMMA(y)}?`,
      audioText: `Which is ${wantLarger ? "greater" : "less"}, ${numberToWords(x)} or ${numberToWords(y)}?`,
      correct: COMMA(wantLarger ? bigger : smaller),
      distractors: [
        {
          value: COMMA(wantLarger ? smaller : bigger),
          misconception: "compared_wrong_direction",
        },
        { value: COMMA(bigger + 10000), misconception: "distractor_plausible" },
        { value: COMMA(smaller + 1), misconception: "off_by_one" },
        { value: "They are equal", misconception: "distractor_plausible" },
      ],
      explanation: `Compare from the left. They agree for the first ${shared} digit${shared === 1 ? "" : "s"}; at the next place ${COMMA(bigger)} is larger, and nothing further right can change that.`,
      hints: [
        "Line them up and compare place by place from the left.",
        "The first place where they differ decides it.",
      ],
      difficulty: 1080,
    };
  },
});

/** MA.4.NSO.1.4 — Round to the nearest 10, 100 or 1,000. */
export const g4Round = mcGenerator({
  key: "g4.nso.round",
  benchmark: "MA.4.NSO.1.4",
  skillSlug: "round-to-thousand",
  skillTitle: "Rounding to tens, hundreds and thousands",
  build(rng, ctx) {
    const place = ctx.difficulty === "easy" ? rng.pick([10, 100] as const) : rng.pick([10, 100, 1000] as const);
    const n = rng.int(1005, 9994);
    const answer = roundTo(n, place);

    return {
      stem: `Round **${COMMA(n)}** to the nearest **${COMMA(place)}**.`,
      audioText: `Round ${numberToWords(n)} to the nearest ${place}.`,
      correct: COMMA(answer),
      distractors: [
        {
          value: COMMA(roundWrongDirection(n, place)),
          misconception: "rounded_wrong_direction",
        },
        {
          value: COMMA(roundTo(n, place === 1000 ? 100 : place * 10)),
          misconception: "rounded_wrong_place",
        },
        { value: COMMA(n), misconception: "distractor_plausible" },
        { value: COMMA(answer + place), misconception: "off_by_one" },
      ],
      explanation: `The digit to the right of the ${place === 10 ? "tens" : place === 100 ? "hundreds" : "thousands"} place decides it. Here it is ${Math.floor(n / (place / 10)) % 10}, so ${COMMA(n)} rounds ${answer >= n ? "up" : "down"} to ${COMMA(answer)}.`,
      hints: [
        `Which two multiples of ${COMMA(place)} does it sit between?`,
        "Only the digit immediately to the right decides.",
      ],
      difficulty: 1060,
      widget: { key: "number-line-zoom", config: { value: n, place } },
      fallback: nearbyNumbers(answer, { min: 0, step: place }),
    };
  },
});

/** MA.4.NSO.1.5 — Compare decimals to hundredths. */
export const g4CompareDecimals = mcGenerator({
  key: "g4.nso.compareDecimals",
  benchmark: "MA.4.NSO.1.5",
  skillSlug: "compare-decimals-hundredths",
  skillTitle: "Comparing decimals",
  build(rng, ctx) {
    // The trap on purpose: a one-place decimal against a two-place one where
    // the shorter number is larger. 0.5 > 0.45, and "more digits is bigger"
    // gets it exactly backwards.
    const trap = ctx.difficulty !== "easy" && rng.bool(0.6);
    const whole = rng.int(0, 9);

    let a: number;
    let b: number;
    if (trap) {
      const tenths = rng.int(3, 8);
      a = round(whole + tenths / 10, 2);
      b = round(whole + (tenths - 1) / 10 + rng.int(1, 9) / 100, 2);
    } else {
      a = round(whole + rng.int(1, 99) / 100, 2);
      b = round(whole + rng.int(1, 99) / 100, 2);
      if (a === b) b = round(b + 0.03, 2);
    }

    const aText = trap ? decimalText(a, 1) : decimalText(a, 2);
    const bText = decimalText(b, 2);
    const bigger = a > b ? aText : bText;
    const smaller = a > b ? bText : aText;
    const wantLarger = rng.bool();

    return {
      stem: `Which is **${wantLarger ? "greater" : "less"}**: ${aText} or ${bText}?`,
      audioText: `Which is ${wantLarger ? "greater" : "less"}, ${decimalToWords(a, trap ? 1 : 2)} or ${decimalToWords(b, 2)}?`,
      correct: wantLarger ? bigger : smaller,
      distractors: [
        {
          value: wantLarger ? smaller : bigger,
          misconception: trap ? "decimal_longer_is_bigger" : "compared_wrong_direction",
        },
        { value: "They are equal", misconception: "distractor_plausible" },
        {
          value: decimalText(Math.max(a, b) + 0.1, 2),
          misconception: "distractor_plausible",
        },
        {
          value: decimalText(Math.min(a, b) - 0.01, 2),
          misconception: "off_by_one",
        },
      ],
      explanation: trap
        ? `Line up the decimal points and pad with zeros: ${decimalText(a, 2)} against ${decimalText(b, 2)}. ${bigger} is greater. A longer decimal is not automatically a bigger one — 0.5 is more than 0.45.`
        : `Compare the tenths first, then the hundredths: ${bigger} is greater.`,
      hints: [
        "Give both numbers the same number of decimal places.",
        "Compare tenths before hundredths.",
      ],
      difficulty: trap ? 1220 : 1070,
    };
  },
});

const FACTS = { easy: 9, core: 12, stretch: 12 } as const;

/** MA.4.NSO.2.1 — Multiplication facts to 12 and related division. */
export const g4Facts = mcGenerator({
  key: "g4.nso.facts",
  benchmark: "MA.4.NSO.2.1",
  skillSlug: "facts-to-twelve",
  skillTitle: "Multiplication and division facts to 12",
  build(rng, ctx) {
    const a = rng.int(3, FACTS[ctx.difficulty]);
    const b = rng.int(3, 12);
    const product = a * b;
    const divide = rng.bool();

    return divide
      ? {
          stem: `**${product} ÷ ${a} = ?**`,
          audioText: `${product} divided by ${a} equals what?`,
          correct: String(b),
          distractors: [
            { value: String(a), misconception: "reversed_dividend_divisor" },
            { value: String(product * a), misconception: "multiplied_instead_of_divided" },
            { value: String(b + 1), misconception: "off_by_one_factor" },
            { value: String(Math.max(1, b - 1)), misconception: "off_by_one_factor" },
          ],
          explanation: `${a} × ${b} = ${product}, so ${product} ÷ ${a} = ${b}.`,
          hints: ["Division asks for the missing factor."],
          difficulty: 1050,
          fallback: nearbyNumbers(b, { min: 1, max: 40 }),
        }
      : {
          stem: `**${a} × ${b} = ?**`,
          audioText: `${a} times ${b} equals what?`,
          correct: String(product),
          distractors: [
            { value: String(a + b), misconception: "added_instead_of_multiplied" },
            { value: String(product + a), misconception: "off_by_one_factor" },
            { value: String(product - a), misconception: "off_by_one_factor" },
            { value: String(product + b), misconception: "off_by_one_factor" },
          ],
          explanation: `${a} × ${b} = ${product}.`,
          hints: [`${a} × ${b} is the same as ${b} × ${a}.`],
          difficulty: 1000,
          fallback: nearbyNumbers(product, { min: 0, max: 200 }),
        };
  },
});

/** MA.4.NSO.2.2 — Multiply up to 3 digits by up to 2 digits. */
export const g4MultiplyLarge = mcGenerator({
  key: "g4.nso.multiplyLarge",
  benchmark: "MA.4.NSO.2.2",
  skillSlug: "multiply-three-by-two",
  skillTitle: "Multiplying larger numbers",
  build(rng, ctx) {
    const a = ctx.difficulty === "easy" ? rng.int(21, 99) : rng.int(112, 899);
    const b = rng.int(12, 39);
    const product = a * b;

    const tens = Math.floor(b / 10) * 10;
    const ones = b % 10;

    return {
      stem: `**${COMMA(a)} × ${b} = ?**`,
      audioText: `${a} times ${b} equals what?`,
      correct: COMMA(product),
      distractors: [
        {
          // Multiplied by the ones and forgot the tens row entirely.
          value: COMMA(a * ones),
          misconception: "used_part_not_whole",
        },
        {
          // Wrote the tens row without its trailing zero.
          value: COMMA(a * ones + a * (tens / 10)),
          misconception: "place_value_confusion",
        },
        { value: COMMA(a + b), misconception: "added_instead_of_multiplied" },
        { value: COMMA(product + a), misconception: "off_by_one_factor" },
      ],
      explanation: `Split ${b} into ${tens} + ${ones}: ${COMMA(a)} × ${ones} = ${COMMA(a * ones)} and ${COMMA(a)} × ${tens} = ${COMMA(a * tens)}. Adding gives ${COMMA(product)}.`,
      hints: [
        "Multiply by the ones, then by the tens.",
        "The tens row ends in a zero — that place is not optional.",
      ],
      difficulty: 1190,
      fallback: nearbyNumbers(product, { min: 0, step: 10 }),
    };
  },
});

/** MA.4.NSO.2.3 — Multiply two 2-digit numbers. */
export const g4MultiplyTwoByTwo = mcGenerator({
  key: "g4.nso.multiplyTwoByTwo",
  benchmark: "MA.4.NSO.2.3",
  skillSlug: "multiply-two-by-two",
  skillTitle: "Multiplying two two-digit numbers",
  build(rng) {
    const a = rng.int(13, 89);
    const b = rng.int(13, 89);
    const product = a * b;
    const aT = Math.floor(a / 10);
    const aO = a % 10;
    const bT = Math.floor(b / 10);
    const bO = b % 10;

    return {
      stem: `**${a} × ${b} = ?**`,
      audioText: `${a} times ${b} equals what?`,
      correct: COMMA(product),
      distractors: [
        {
          // Multiplied tens by tens and ones by ones, the classic partial slip.
          value: COMMA(aT * bT * 100 + aO * bO),
          misconception: "column_independent",
        },
        { value: COMMA(a * bO), misconception: "used_part_not_whole" },
        { value: COMMA(a + b), misconception: "added_instead_of_multiplied" },
        { value: COMMA(product + a), misconception: "off_by_one_factor" },
      ],
      explanation: `All four partial products are needed: ${aT * 10} × ${bT * 10} = ${aT * bT * 100}, ${aT * 10} × ${bO} = ${aT * 10 * bO}, ${aO} × ${bT * 10} = ${aO * bT * 10}, ${aO} × ${bO} = ${aO * bO}. Together they make ${COMMA(product)}.`,
      hints: [
        "Every digit of one number meets every digit of the other.",
        "Four partial products, not two.",
      ],
      difficulty: 1210,
      fallback: nearbyNumbers(product, { min: 0, step: 10 }),
    };
  },
});

/** MA.4.NSO.2.4 — Divide up to 4 digits by 1 digit, with remainders. */
export const g4Divide = mcGenerator({
  key: "g4.nso.divide",
  benchmark: "MA.4.NSO.2.4",
  skillSlug: "divide-by-one-digit",
  skillTitle: "Dividing by a one-digit number",
  build(rng, ctx) {
    const divisor = rng.int(3, 9);
    const quotient = ctx.difficulty === "easy" ? rng.int(11, 99) : rng.int(120, 899);
    const remainder = rng.int(1, divisor - 1);
    const dividend = quotient * divisor + remainder;

    return {
      stem: `**${COMMA(dividend)} ÷ ${divisor} = ?**`,
      audioText: `${dividend} divided by ${divisor} equals what?`,
      correct: `${COMMA(quotient)} remainder ${remainder}`,
      distractors: [
        {
          // Threw the remainder away, which changes the answer.
          value: COMMA(quotient),
          misconception: "dropped_remainder",
        },
        {
          value: `${COMMA(remainder)} remainder ${quotient}`,
          misconception: "remainder_as_whole",
        },
        {
          value: `${COMMA(quotient + 1)} remainder ${remainder}`,
          misconception: "off_by_one_factor",
        },
        {
          value: COMMA(dividend * divisor),
          misconception: "multiplied_instead_of_divided",
        },
      ],
      explanation: `${divisor} × ${COMMA(quotient)} = ${COMMA(quotient * divisor)}, and ${COMMA(dividend)} − ${COMMA(quotient * divisor)} = ${remainder}. So the answer is ${COMMA(quotient)} with ${remainder} left over.`,
      hints: [
        "Work left to right, one place at a time.",
        "Whatever is left at the end is the remainder.",
      ],
      difficulty: 1200,
    };
  },
});

/** MA.4.NSO.2.5 — Estimate a product or quotient. */
export const g4Estimate = mcGenerator({
  key: "g4.nso.estimate",
  benchmark: "MA.4.NSO.2.5",
  skillSlug: "estimate-products",
  skillTitle: "Estimating products and quotients",
  build(rng) {
    const a = rng.int(180, 890);
    const b = rng.int(21, 79);
    const roundedA = roundTo(a, 100);
    const roundedB = roundTo(b, 10);
    const estimate = roundedA * roundedB;

    return {
      stem: `Estimate **${COMMA(a)} × ${b}** by rounding each number to its biggest place.`,
      audioText: `Estimate ${a} times ${b} by rounding each number.`,
      correct: COMMA(estimate),
      distractors: [
        {
          value: COMMA(roundWrongDirection(a, 100) * roundedB),
          misconception: "rounded_wrong_direction",
        },
        {
          value: COMMA(roundedA * b),
          misconception: "used_part_not_whole",
        },
        {
          value: COMMA(roundedA + roundedB),
          misconception: "added_instead_of_multiplied",
        },
        { value: COMMA(estimate * 10), misconception: "place_value_confusion" },
      ],
      explanation: `${COMMA(a)} rounds to ${COMMA(roundedA)} and ${b} rounds to ${roundedB}. ${COMMA(roundedA)} × ${roundedB} = ${COMMA(estimate)}, which is close enough to check a real answer against.`,
      hints: [
        "Round both numbers before multiplying.",
        "An estimate should be quick to do in your head.",
      ],
      difficulty: 1150,
      fallback: nearbyNumbers(estimate, { min: 0, step: 1000 }),
    };
  },
});

/** MA.4.NSO.2.6 — One tenth or one hundredth more or less. */
export const g4TenthMoreLess = mcGenerator({
  key: "g4.nso.tenthMoreLess",
  benchmark: "MA.4.NSO.2.6",
  skillSlug: "tenth-hundredth-more-less",
  skillTitle: "One tenth and one hundredth more or less",
  build(rng) {
    const base = round(rng.int(10, 89) / 10 + rng.int(1, 9) / 100, 2);
    const byTenth = rng.bool();
    const more = rng.bool();
    const step = byTenth ? 0.1 : 0.01;
    const answer = round(more ? base + step : base - step, 2);

    return {
      stem: `What is **one ${byTenth ? "tenth" : "hundredth"} ${more ? "more than" : "less than"}** ${decimalText(base, 2)}?`,
      audioText: `What is one ${byTenth ? "tenth" : "hundredth"} ${more ? "more than" : "less than"} ${decimalToWords(base, 2)}?`,
      correct: decimalText(answer, 2),
      distractors: [
        {
          // Changed the wrong column.
          value: decimalText(round(more ? base + (byTenth ? 0.01 : 0.1) : base - (byTenth ? 0.01 : 0.1), 2), 2),
          misconception: "place_value_confusion",
        },
        {
          value: decimalText(round(more ? base - step : base + step, 2), 2),
          misconception: "wrong_operation",
        },
        {
          value: decimalText(round(more ? base + 1 : base - 1, 2), 2),
          misconception: "place_value_confusion",
        },
        { value: decimalText(base, 2), misconception: "distractor_plausible" },
      ],
      explanation: `One ${byTenth ? "tenth is 0.1, which changes the first digit after the point" : "hundredth is 0.01, which changes the second digit after the point"}: ${decimalText(base, 2)} ${more ? "+" : "−"} ${decimalText(step, 2)} = ${decimalText(answer, 2)}.`,
      hints: [
        "Which column does a tenth live in? Which one a hundredth?",
        "Only that column should change.",
      ],
      difficulty: 1160,
    };
  },
});

/** MA.4.NSO.2.7 — Add and subtract decimals to hundredths. */
export const g4DecimalAddSub = mcGenerator({
  key: "g4.nso.decimalAddSub",
  benchmark: "MA.4.NSO.2.7",
  skillSlug: "add-subtract-decimals-hundredths",
  skillTitle: "Adding and subtracting decimals",
  build(rng, ctx) {
    const a = round(rng.int(120, 890) / 100, 2);
    const b = round(rng.int(80, 450) / 100, 2);
    const adding = ctx.difficulty === "easy" ? true : rng.bool();
    const sum = round(a + b, 2);
    // Subtraction is posed as the inverse of the same pair, so both directions
    // exercise the same regrouping across the decimal point.
    const result = adding ? sum : a;

    return {
      stem: adding
        ? `**${decimalText(a, 2)} + ${decimalText(b, 2)} = ?**`
        : `**${decimalText(sum, 2)} − ${decimalText(b, 2)} = ?**`,
      audioText: adding
        ? `${decimalToWords(a, 2)} plus ${decimalToWords(b, 2)}.`
        : `${decimalToWords(sum, 2)} minus ${decimalToWords(b, 2)}.`,
      correct: decimalText(result, 2),
      distractors: [
        {
          // Lined the numbers up by their last digit instead of by the point.
          value: decimalText(
            round(adding ? a + b * 10 : a - b * 9, 2),
            2,
          ),
          misconception: "decimal_point_misplaced",
        },
        {
          value: decimalText(round(adding ? a - b : sum + b, 2), 2),
          misconception: "wrong_operation",
        },
        {
          value: decimalText(round(result + 0.1, 2), 2),
          misconception: "off_by_one",
        },
        {
          value: decimalText(round(result * 10, 2), 2),
          misconception: "decimal_point_misplaced",
        },
      ],
      explanation: `Line up the decimal points, not the ends of the numbers, and then work exactly as with whole numbers: the answer is ${decimalText(result, 2)}.`,
      hints: [
        "Line up the decimal points.",
        "Fill any short number with a zero so both have two places.",
      ],
      difficulty: 1170,
      fallback: (taken) => {
        for (let d = 1; d < 200; d++) {
          for (const v of [result + d / 100, result - d / 100]) {
            const s = decimalText(round(v, 2), 2);
            if (v > 0 && !taken.has(s)) return s;
          }
        }
        return null;
      },
    };
  },
});
