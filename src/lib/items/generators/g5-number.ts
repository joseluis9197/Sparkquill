import { mcGenerator, nearbyNumbers } from "../build";
import { decimalText, decimalToWords, round } from "../numbers";

/**
 * Grade 5, Number Sense and Operations.
 *
 * Thousandths, long division by two digits, and multiplying or dividing by
 * 0.1 — the last of which reliably breaks the rule children have relied on
 * for years, that multiplying makes things bigger. The distractors say so
 * out loud rather than letting the surprise pass unnamed.
 */

const COMMA = (n: number) => n.toLocaleString("en-US");

/** MA.5.NSO.1.1 — Digit value across places, including decimals. */
export const g5PlaceValue = mcGenerator({
  key: "g5.nso.placeValue",
  benchmark: "MA.5.NSO.1.1",
  skillSlug: "decimal-place-value",
  skillTitle: "Place value in decimals",
  build(rng) {
    const digit = rng.int(2, 9);
    const place = rng.pick([0.001, 0.01, 0.1, 1, 10] as const);
    const left = rng.bool();
    const from = round(digit * place, 4);
    const to = round(left ? from * 10 : from / 10, 4);
    const text = (v: number) => (v >= 1 ? COMMA(v) : decimalText(v, 4).replace(/0+$/, ""));

    return {
      stem: `A digit is worth **${text(from)}**. It moves **one place to the ${left ? "left" : "right"}**. What is it worth now?`,
      audioText: `A digit worth ${text(from)} moves one place to the ${left ? "left" : "right"}. What is it worth now?`,
      correct: text(to),
      distractors: [
        {
          value: text(round(left ? from / 10 : from * 10, 4)),
          misconception: "place_value_confusion",
        },
        {
          value: text(round(left ? from * 100 : from / 100, 5)),
          misconception: "decimal_point_misplaced",
        },
        { value: text(from), misconception: "distractor_plausible" },
        {
          value: text(round(left ? from + 10 : from - 0.1, 4)),
          misconception: "added_instead_of_multiplied",
        },
      ],
      explanation: `Each place to the left is ten times as much; each place to the right is one tenth as much. ${text(from)} becomes ${text(to)}.`,
      hints: [
        "Left multiplies by ten, right divides by ten.",
        "The decimal point does not move — the digit does.",
      ],
      difficulty: 1210,
    };
  },
});

/** MA.5.NSO.1.2 — Read and write decimals to thousandths. */
export const g5DecimalWords = mcGenerator({
  key: "g5.nso.decimalWords",
  benchmark: "MA.5.NSO.1.2",
  skillSlug: "read-write-decimals",
  skillTitle: "Reading and writing decimals to thousandths",
  build(rng, ctx) {
    const whole = rng.int(0, 99);
    const places = ctx.difficulty === "easy" ? 2 : 3;
    const frac = rng.int(1, 10 ** places - 1);
    const value = round(whole + frac / 10 ** places, places);

    return {
      stem: `Which number is **${decimalToWords(value, places)}**?`,
      audioText: `Which number is ${decimalToWords(value, places)}?`,
      correct: decimalText(value, places),
      distractors: [
        {
          // Read the fraction part as if it were one place further left.
          value: decimalText(round(whole + frac / 10 ** (places - 1), places), places),
          misconception: "decimal_point_misplaced",
        },
        {
          value: decimalText(round(whole + frac / 10 ** (places + 1), places + 1), places + 1),
          misconception: "decimal_point_misplaced",
        },
        // Only wrong when the fractional part has a leading zero: for
        // "seventy-three and thirty-three hundredths" writing 73.33 straight
        // out is simply correct.
        ...(String(frac).length < places
          ? [
              {
                value: `${whole}.${frac}`,
                misconception: "place_value_confusion" as const,
              },
            ]
          : [
              {
                value: decimalText(
                  round(whole + Number(String(frac).split("").reverse().join("")) / 10 ** places, places),
                  places,
                ),
                misconception: "digit_reversal" as const,
              },
            ]),
        {
          // One step in the smallest place shown — a fixed 0.001 would round
          // away to nothing when the item only goes to hundredths.
          value: decimalText(round(value + 1 / 10 ** places, places), places),
          misconception: "off_by_one",
        },
        {
          value: decimalText(round(value + 1, places), places),
          misconception: "place_value_confusion",
        },
      ],
      explanation: `"${decimalToWords(value, places)}" places the ${frac} in the ${places === 2 ? "hundredths" : "thousandths"}, which needs ${places} digits after the point: ${decimalText(value, places)}.`,
      hints: [
        "The last word names the smallest place used.",
        "Thousandths need three digits after the point.",
      ],
      difficulty: 1190,
      fallback: (taken) => {
        for (let d = 1; d < 300; d++) {
          const v = round(value + d / 10 ** places, places);
          const s = decimalText(v, places);
          if (!taken.has(s)) return s;
        }
        return null;
      },
    };
  },
});

/** MA.5.NSO.1.3 — Compose and decompose decimals. */
export const g5DecomposeDecimal = mcGenerator({
  key: "g5.nso.decomposeDecimal",
  benchmark: "MA.5.NSO.1.3",
  skillSlug: "decompose-decimals",
  skillTitle: "Breaking a decimal into its places",
  build(rng) {
    const whole = rng.int(1, 9);
    const t = rng.int(1, 9);
    const h = rng.int(1, 9);
    const th = rng.int(1, 9);
    const value = round(whole + t / 10 + h / 100 + th / 1000, 3);

    return {
      stem: `Which sum is equal to **${decimalText(value, 3)}**?`,
      audioText: `Which sum equals ${decimalToWords(value, 3)}?`,
      correct: `${whole} + 0.${t} + 0.0${h} + 0.00${th}`,
      distractors: [
        {
          value: `${whole} + ${t} + ${h} + ${th}`,
          misconception: "place_value_confusion",
        },
        {
          value: `${whole} + 0.00${t} + 0.0${h} + 0.${th}`,
          misconception: "digit_reversal",
        },
        {
          value: `${whole} + 0.${t} + 0.${h} + 0.${th}`,
          misconception: "decimal_point_misplaced",
        },
      ],
      explanation: `${t} is in the tenths (0.${t}), ${h} in the hundredths (0.0${h}) and ${th} in the thousandths (0.00${th}). Adding those to ${whole} gives ${decimalText(value, 3)}.`,
      hints: [
        "Name the place of each digit after the point.",
        "Tenths, then hundredths, then thousandths.",
      ],
      difficulty: 1200,
    };
  },
});

/** MA.5.NSO.1.4 — Compare decimals to thousandths. */
export const g5CompareDecimals = mcGenerator({
  key: "g5.nso.compareDecimals",
  benchmark: "MA.5.NSO.1.4",
  skillSlug: "compare-decimals-thousandths",
  skillTitle: "Comparing decimals to thousandths",
  build(rng, ctx) {
    // The trap: the shorter decimal is the larger one.
    const trap = ctx.difficulty !== "easy" && rng.bool(0.6);
    const whole = rng.int(0, 12);
    const a = trap
      ? round(whole + rng.int(3, 9) / 10, 3)
      : round(whole + rng.int(100, 999) / 1000, 3);
    let b = trap
      ? round(a - 0.1 + rng.int(1, 99) / 1000, 3)
      : round(whole + rng.int(100, 999) / 1000, 3);
    if (b === a) b = round(b + 0.003, 3);

    const aText = trap ? decimalText(a, 1) : decimalText(a, 3);
    const bText = decimalText(b, 3);
    const bigger = a > b ? aText : bText;
    const smaller = a > b ? bText : aText;
    const wantLarger = rng.bool();

    return {
      stem: `Which is **${wantLarger ? "greater" : "less"}**: ${aText} or ${bText}?`,
      audioText: `Which is ${wantLarger ? "greater" : "less"}, ${aText} or ${bText}?`,
      correct: wantLarger ? bigger : smaller,
      distractors: [
        {
          value: wantLarger ? smaller : bigger,
          misconception: trap ? "decimal_longer_is_bigger" : "compared_wrong_direction",
        },
        { value: "They are equal", misconception: "distractor_plausible" },
        { value: decimalText(round(Math.max(a, b) + 0.01, 3), 3), misconception: "off_by_one" },
        { value: decimalText(round(Math.min(a, b) - 0.001, 3), 3), misconception: "off_by_one" },
      ],
      explanation: trap
        ? `Pad the shorter one with zeros so both reach thousandths: ${decimalText(a, 3)} against ${decimalText(b, 3)}. ${bigger} is greater. Extra digits do not make a decimal bigger.`
        : `Compare tenths, then hundredths, then thousandths: ${bigger} is greater.`,
      hints: [
        "Give both the same number of decimal places.",
        "Zeros on the end change nothing.",
      ],
      difficulty: trap ? 1280 : 1140,
    };
  },
});

/** MA.5.NSO.1.5 — Round decimals. */
export const g5RoundDecimal = mcGenerator({
  key: "g5.nso.roundDecimal",
  benchmark: "MA.5.NSO.1.5",
  skillSlug: "round-decimals",
  skillTitle: "Rounding decimals",
  build(rng, ctx) {
    const to = ctx.difficulty === "easy" ? 1 : rng.pick([0, 1, 2] as const);
    const value = round(rng.int(1000, 9999) / 1000, 3);
    const answer = round(value, to);
    const names = { 0: "whole number", 1: "tenth", 2: "hundredth" } as const;

    return {
      stem: `Round **${decimalText(value, 3)}** to the nearest **${names[to]}**.`,
      audioText: `Round ${decimalToWords(value, 3)} to the nearest ${names[to]}.`,
      correct: decimalText(answer, to),
      distractors: [
        {
          // Rounded the wrong way.
          value: decimalText(
            round(answer === round(Math.floor(value * 10 ** to) / 10 ** to, to)
              ? answer + 1 / 10 ** to
              : answer - 1 / 10 ** to, to),
            to,
          ),
          misconception: "rounded_wrong_direction",
        },
        {
          value: decimalText(round(value, to === 0 ? 1 : to - 1), to === 0 ? 1 : to - 1),
          misconception: "rounded_wrong_place",
        },
        {
          // Truncated instead of rounding.
          value: decimalText(Math.floor(value * 10 ** to) / 10 ** to, to),
          misconception: "dropped_remainder",
        },
        { value: decimalText(value, 3), misconception: "distractor_plausible" },
      ],
      explanation: `Look one place to the right of the ${names[to]}: it is ${Math.floor(value * 10 ** (to + 1)) % 10}, so ${decimalText(value, 3)} rounds to ${decimalText(answer, to)}.`,
      hints: [
        "Only the next digit to the right decides.",
        "5 or more rounds up.",
      ],
      difficulty: 1180,
    };
  },
});

/** MA.5.NSO.2.1 — Multiply multi-digit whole numbers. */
export const g5MultiplyLarge = mcGenerator({
  key: "g5.nso.multiplyLarge",
  benchmark: "MA.5.NSO.2.1",
  skillSlug: "multiply-multi-digit",
  skillTitle: "Multiplying multi-digit numbers",
  build(rng, ctx) {
    const a = ctx.difficulty === "easy" ? rng.int(112, 499) : rng.int(1120, 4999);
    const b = rng.int(23, 89);
    const product = a * b;
    const ones = b % 10;
    const tens = Math.floor(b / 10) * 10;

    return {
      stem: `**${COMMA(a)} × ${b} = ?**`,
      audioText: `${a} times ${b}.`,
      correct: COMMA(product),
      distractors: [
        { value: COMMA(a * ones), misconception: "used_part_not_whole" },
        {
          value: COMMA(a * ones + a * (tens / 10)),
          misconception: "place_value_confusion",
        },
        { value: COMMA(product + a), misconception: "off_by_one_factor" },
        { value: COMMA(a + b), misconception: "added_instead_of_multiplied" },
      ],
      explanation: `${COMMA(a)} × ${ones} = ${COMMA(a * ones)} and ${COMMA(a)} × ${tens} = ${COMMA(a * tens)}. Adding the two partial products gives ${COMMA(product)}.`,
      hints: [
        "Multiply by the ones, then by the tens.",
        "The tens row is shifted one place left.",
      ],
      difficulty: 1240,
      fallback: nearbyNumbers(product, { min: 0, step: 100 }),
    };
  },
});

/** MA.5.NSO.2.2 — Divide by a two-digit number. */
export const g5DivideTwoDigit = mcGenerator({
  key: "g5.nso.divideTwoDigit",
  benchmark: "MA.5.NSO.2.2",
  skillSlug: "divide-by-two-digit",
  skillTitle: "Dividing by a two-digit number",
  build(rng, ctx) {
    const divisor = rng.int(12, 45);
    const quotient = ctx.difficulty === "easy" ? rng.int(11, 60) : rng.int(60, 480);
    const remainder = rng.int(1, divisor - 1);
    const dividend = quotient * divisor + remainder;

    return {
      stem: `**${COMMA(dividend)} ÷ ${divisor} = ?** Give the answer with its remainder.`,
      audioText: `${dividend} divided by ${divisor}, with the remainder.`,
      correct: `${COMMA(quotient)} r ${remainder}`,
      distractors: [
        { value: COMMA(quotient), misconception: "dropped_remainder" },
        { value: `${COMMA(remainder)} r ${quotient}`, misconception: "remainder_as_whole" },
        { value: `${COMMA(quotient + 1)} r ${remainder}`, misconception: "off_by_one_factor" },
        {
          value: `${COMMA(quotient)} r ${(remainder % Math.max(1, divisor - 1)) + 1}`,
          misconception: "off_by_one",
        },
      ],
      explanation: `${divisor} × ${COMMA(quotient)} = ${COMMA(divisor * quotient)}, and ${COMMA(dividend)} − ${COMMA(divisor * quotient)} = ${remainder}. The remainder is always smaller than the divisor.`,
      hints: [
        "Estimate how many times the divisor fits, then adjust.",
        "The remainder must be less than the number you divided by.",
      ],
      difficulty: 1290,
    };
  },
});

/** MA.5.NSO.2.3 — Add and subtract decimals to thousandths. */
export const g5DecimalAddSub = mcGenerator({
  key: "g5.nso.decimalAddSub",
  benchmark: "MA.5.NSO.2.3",
  skillSlug: "add-subtract-decimals-thousandths",
  skillTitle: "Adding and subtracting decimals to thousandths",
  build(rng, ctx) {
    const a = round(rng.int(1200, 8900) / 1000, 3);
    const b = round(rng.int(400, 3900) / 1000, 3);
    const adding = ctx.difficulty === "easy" ? true : rng.bool();
    const sum = round(a + b, 3);
    const result = adding ? sum : a;

    return {
      stem: adding
        ? `**${decimalText(a, 3)} + ${decimalText(b, 3)} = ?**`
        : `**${decimalText(sum, 3)} − ${decimalText(b, 3)} = ?**`,
      audioText: adding
        ? `${decimalToWords(a, 3)} plus ${decimalToWords(b, 3)}.`
        : `${decimalToWords(sum, 3)} minus ${decimalToWords(b, 3)}.`,
      correct: decimalText(result, 3),
      distractors: [
        {
          value: decimalText(round(result * 10, 3), 3),
          misconception: "decimal_point_misplaced",
        },
        {
          value: decimalText(round(adding ? a - b : sum + b, 3), 3),
          misconception: "wrong_operation",
        },
        {
          value: decimalText(round(result + 0.01, 3), 3),
          misconception: "off_by_one",
        },
        {
          value: decimalText(round(result + 0.1, 3), 3),
          misconception: "place_value_confusion",
        },
      ],
      explanation: `Line up the decimal points and pad with zeros so both numbers reach thousandths, then work as with whole numbers: ${decimalText(result, 3)}.`,
      hints: [
        "Line up the points, not the last digits.",
        "Pad the shorter number with zeros.",
      ],
      difficulty: 1200,
    };
  },
});

/** MA.5.NSO.2.4 — Estimate products and quotients of decimals. */
export const g5EstimateDecimal = mcGenerator({
  key: "g5.nso.estimateDecimal",
  benchmark: "MA.5.NSO.2.4",
  skillSlug: "estimate-decimals",
  skillTitle: "Estimating with decimals",
  build(rng) {
    const a = round(rng.int(180, 890) / 100, 2);
    const b = round(rng.int(180, 690) / 100, 2);
    const ra = Math.round(a);
    const rb = Math.round(b);
    const estimate = ra * rb;

    return {
      stem: `Estimate **${decimalText(a, 2)} × ${decimalText(b, 2)}** by rounding each number to the nearest whole number.`,
      audioText: `Estimate ${decimalToWords(a, 2)} times ${decimalToWords(b, 2)} by rounding both to whole numbers.`,
      correct: String(estimate),
      distractors: [
        { value: String(ra + rb), misconception: "added_instead_of_multiplied" },
        { value: String(estimate * 10), misconception: "decimal_point_misplaced" },
        {
          value: String(Math.floor(a) * Math.floor(b)),
          misconception: "rounded_wrong_direction",
        },
        { value: decimalText(round(a * b, 2), 2), misconception: "distractor_plausible" },
      ],
      explanation: `${decimalText(a, 2)} rounds to ${ra} and ${decimalText(b, 2)} rounds to ${rb}, so the estimate is ${ra} × ${rb} = ${estimate}. The exact answer is ${decimalText(round(a * b, 4), 2)}, which is close.`,
      hints: [
        "Round both numbers first.",
        "An estimate should be quick, not exact.",
      ],
      difficulty: 1170,
      fallback: nearbyNumbers(estimate, { min: 0 }),
    };
  },
});

/** MA.5.NSO.2.5 — Multiply and divide a decimal by 0.1 and 0.01. */
export const g5TimesPointOne = mcGenerator({
  key: "g5.nso.timesPointOne",
  benchmark: "MA.5.NSO.2.5",
  skillSlug: "multiply-divide-by-tenths",
  skillTitle: "Multiplying and dividing by 0.1 and 0.01",
  build(rng) {
    const value = round(rng.int(120, 9800) / 100, 2);
    const by = rng.pick([0.1, 0.01] as const);
    const multiply = rng.bool();
    const answer = round(multiply ? value * by : value / by, 4);
    const text = (v: number) => {
      const s = decimalText(v, 4).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
      return s;
    };

    return {
      stem: `**${decimalText(value, 2)} ${multiply ? "×" : "÷"} ${by} = ?**`,
      audioText: `${decimalToWords(value, 2)} ${multiply ? "times" : "divided by"} ${by === 0.1 ? "nought point one" : "nought point nought one"}.`,
      correct: text(answer),
      distractors: [
        {
          // Assumed multiplying always makes a number bigger.
          value: text(round(multiply ? value / by : value * by, 4)),
          misconception: "converted_wrong_direction",
        },
        {
          value: text(round(multiply ? value * by * 10 : (value / by) / 10, 4)),
          misconception: "decimal_point_misplaced",
        },
        { value: decimalText(value, 2), misconception: "distractor_plausible" },
        {
          value: text(round(value - by, 4)),
          misconception: "wrong_operation",
        },
      ],
      explanation: `${by} is ${by === 0.1 ? "one tenth" : "one hundredth"}. Multiplying by it makes the number ${by === 0.1 ? "ten" : "a hundred"} times smaller; dividing by it makes it ${by === 0.1 ? "ten" : "a hundred"} times bigger. So the answer is ${text(answer)}. Multiplying does not always make things bigger.`,
      hints: [
        "Is 0.1 bigger or smaller than 1?",
        "Multiplying by something less than 1 makes a smaller answer.",
      ],
      difficulty: 1300,
    };
  },
});
