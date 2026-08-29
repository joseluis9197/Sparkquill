import { mcGenerator, nearbyNumbers } from "../build";
import { SETTINGS } from "../story";
import {
  addColumnsIndependently,
  addWithoutRegrouping,
  expandedForm,
  numberToWords,
  roundTo,
  roundWrongDirection,
  subtractWithoutBorrowing,
} from "../numbers";

/**
 * Grade 3, Number Sense and Operations.
 *
 * The year multiplication arrives. Nearly every distractor in this file is
 * built from a specific wrong idea about what multiplying is — adding the two
 * numbers, recalling the fact next door, dividing the wrong way round —
 * because "6 × 4 = 10" is not a slip, it is a child who has not yet seen that
 * multiplication is repeated groups.
 */

/** MA.3.NSO.1.1 — Read and write numbers 0-10,000 in three forms. */
export const g3WordForm = mcGenerator({
  key: "g3.nso.wordForm",
  benchmark: "MA.3.NSO.1.1",
  skillSlug: "read-write-numbers-to-10000",
  skillTitle: "Reading and writing numbers to 10,000",
  build(rng, ctx) {
    // Internal zeros are where this benchmark bites: 4,062 is read wrong far
    // more often than 4,362.
    const withZero = ctx.difficulty !== "easy" && rng.bool(0.5);
    const th = rng.int(1, 9);
    const h = withZero ? 0 : rng.int(1, 9);
    const t = rng.int(0, 9);
    const o = rng.int(1, 9);
    const n = th * 1000 + h * 100 + t * 10 + o;

    const askWords = rng.bool();
    if (askWords) {
      return {
        stem: `Which number is **${numberToWords(n)}**?`,
        audioText: `Which number is ${numberToWords(n)}?`,
        correct: n.toLocaleString("en-US"),
        distractors: [
          // Only offered when there is an empty place to drop. With no zero in
          // the number this "error" produces the correct answer.
          ...(h === 0
            ? [
                {
                  value: Number(`${th}${t}${o}`).toLocaleString("en-US"),
                  misconception: "place_value_confusion" as const,
                },
              ]
            : []),
          // Likewise: swapping equal digits changes nothing.
          ...(t !== o
            ? [
                {
                  value: (th * 1000 + h * 100 + o * 10 + t).toLocaleString(
                    "en-US",
                  ),
                  misconception: "digit_reversal" as const,
                },
              ]
            : []),
          {
            value: (n + 1000).toLocaleString("en-US"),
            misconception: "place_value_confusion",
          },
          {
            value: (n + 100 <= 9999 ? n + 100 : n - 100).toLocaleString("en-US"),
            misconception: "place_value_confusion",
          },
          { value: (n + 10).toLocaleString("en-US"), misconception: "off_by_one" },
          { value: (n - 1).toLocaleString("en-US"), misconception: "off_by_one" },
        ],
        explanation: `${numberToWords(n)} is ${th} thousand${h ? `, ${h} hundred` : ""}${t ? `, ${t} ten${t === 1 ? "" : "s"}` : ""}${o ? ` and ${o} one${o === 1 ? "" : "s"}` : ""} — written ${n.toLocaleString("en-US")}. ${h === 0 ? "The zero holds the hundreds place open." : ""}`,
        hints: [
          "Which places do you hear named?",
          "A place you do not hear still needs a zero.",
        ],
        difficulty: withZero ? 1100 : 1000,
        fallback: (taken) => {
          for (let d = 1; d < 500; d++) {
            for (const v of [n + d, n - d]) {
              const s = v.toLocaleString("en-US");
              if (v > 999 && v < 10000 && !taken.has(s)) return s;
            }
          }
          return null;
        },
      };
    }

    return {
      stem: `Which shows **${n.toLocaleString("en-US")}** in expanded form?`,
      audioText: `Which shows ${numberToWords(n)} in expanded form?`,
      correct: expandedForm(n),
      distractors: [
        {
          value: [th, h, t, o].filter((d) => d !== 0).join(" + "),
          misconception: "place_value_confusion",
        },
        ...(t !== o
          ? [
              {
                value: expandedForm(th * 1000 + h * 100 + o * 10 + t),
                misconception: "digit_reversal" as const,
              },
            ]
          : []),
        {
          // Every place shifted down one: thousands read as hundreds.
          value: expandedForm(th * 100 + h * 10 + t) + (o ? ` + ${o}` : ""),
          misconception: "place_value_confusion",
        },
        {
          // Digits written out as themselves in the wrong order.
          value: [o, t, h, th].filter((d) => d !== 0).join(" + "),
          misconception: "digit_reversal",
        },
        {
          value: expandedForm(n + 1000),
          misconception: "off_by_one",
        },
      ],
      explanation: `Each digit is worth its own place: ${expandedForm(n)}.`,
      hints: [
        "What is the leading digit really worth?",
        "Places with a zero are left out of expanded form.",
      ],
      difficulty: 1040,
    };
  },
});

/** MA.3.NSO.1.2 — Compose and decompose four-digit numbers. */
export const g3ComposeFourDigit = mcGenerator({
  key: "g3.nso.composeFourDigit",
  benchmark: "MA.3.NSO.1.2",
  skillSlug: "compose-decompose-to-10000",
  skillTitle: "Breaking numbers into thousands, hundreds, tens and ones",
  build(rng) {
    const th = rng.int(1, 9);
    const h = rng.int(0, 9);
    const t = rng.int(0, 9);
    const o = rng.int(0, 9);
    const n = th * 1000 + h * 100 + t * 10 + o;
    const parts = `${th} thousands, ${h} hundreds, ${t} tens and ${o} ones`;

    return {
      stem: `Which number is **${parts}**?`,
      audioText: `Which number is ${parts}?`,
      correct: n.toLocaleString("en-US"),
      distractors: [
        {
          value: Number(`${th}${h}${t}${o}`.split("").reverse().join("")).toLocaleString("en-US"),
          misconception: "digit_reversal",
        },
        {
          value: String(th + h + t + o),
          misconception: "place_value_confusion",
        },
        {
          value: (th * 100 + h * 10 + t).toLocaleString("en-US"),
          misconception: "place_value_confusion",
        },
        { value: (n + 100).toLocaleString("en-US"), misconception: "off_by_one" },
      ],
      explanation: `${th} × 1,000 + ${h} × 100 + ${t} × 10 + ${o} = ${n.toLocaleString("en-US")}.`,
      hints: [
        "Work out what each group is worth first.",
        "Then add the four values together.",
      ],
      difficulty: 1030,
      widget: { key: "place-value-chart", config: { value: n } },
    };
  },
});

/** MA.3.NSO.1.3 — Plot, order and compare whole numbers to 10,000. */
export const g3Compare = mcGenerator({
  key: "g3.nso.compare",
  benchmark: "MA.3.NSO.1.3",
  skillSlug: "compare-numbers-to-10000",
  skillTitle: "Comparing and ordering numbers to 10,000",
  build(rng, ctx) {
    // Numbers that agree on their leading digits, so the comparison cannot be
    // won by glancing at the front.
    const shared = ctx.difficulty === "easy" ? 1 : rng.int(2, 3);
    const digits = [rng.int(1, 9), rng.int(0, 9), rng.int(0, 9), rng.int(0, 9)];
    const other = [...digits];
    other[shared] = (digits[shared] + rng.int(1, 5)) % 10;
    for (let i = shared + 1; i < 4; i++) other[i] = rng.int(0, 9);

    if (Number(digits.join("")) === Number(other.join(""))) {
      other[3] = (other[3] + 1) % 10;
    }
    const x = Number(digits.join(""));
    const y = Number(other.join(""));
    const bigger = Math.max(x, y);
    const smaller = Math.min(x, y);
    const wantLarger = rng.bool();

    return {
      stem: `Which number is **${wantLarger ? "greater" : "less"}**: ${x.toLocaleString("en-US")} or ${y.toLocaleString("en-US")}?`,
      audioText: `Which number is ${wantLarger ? "greater" : "less"}, ${numberToWords(x)} or ${numberToWords(y)}?`,
      correct: (wantLarger ? bigger : smaller).toLocaleString("en-US"),
      distractors: [
        {
          value: (wantLarger ? smaller : bigger).toLocaleString("en-US"),
          misconception: "compared_wrong_direction",
        },
        {
          value: (bigger + 1000).toLocaleString("en-US"),
          misconception: "distractor_plausible",
        },
        {
          value: (smaller - 100 > 0 ? smaller - 100 : smaller + 100).toLocaleString("en-US"),
          misconception: "distractor_plausible",
        },
        { value: "They are equal", misconception: "distractor_plausible" },
      ],
      explanation: `Compare from the left. The first place where they differ is the ${["thousands", "hundreds", "tens", "ones"][shared]}, and ${bigger.toLocaleString("en-US")} has more there.`,
      hints: [
        "Start at the biggest place, not the end.",
        "The first digit that differs decides it.",
      ],
      difficulty: 1000 + shared * 30,
    };
  },
});

/** MA.3.NSO.1.4 — Round to the nearest 10 or 100. */
export const g3Round = mcGenerator({
  key: "g3.nso.round",
  benchmark: "MA.3.NSO.1.4",
  skillSlug: "round-to-ten-hundred",
  skillTitle: "Rounding to the nearest ten or hundred",
  build(rng, ctx) {
    const place = ctx.difficulty === "easy" ? 10 : rng.pick([10, 100] as const);
    const n = rng.int(place === 10 ? 12 : 105, 999);
    const answer = roundTo(n, place);

    return {
      stem: `Round **${n}** to the nearest **${place}**.`,
      audioText: `Round ${n} to the nearest ${place}.`,
      correct: String(answer),
      distractors: [
        {
          value: String(roundWrongDirection(n, place)),
          misconception: "rounded_wrong_direction",
        },
        {
          value: String(roundTo(n, place === 10 ? 100 : 10)),
          misconception: "rounded_wrong_place",
        },
        { value: String(n), misconception: "distractor_plausible" },
        { value: String(answer + place), misconception: "off_by_one" },
      ],
      explanation: `Look at the digit to the right of the ${place === 10 ? "tens" : "hundreds"} place: it is ${place === 10 ? n % 10 : Math.floor(n / 10) % 10}, so round ${answer >= n ? "up" : "down"} to ${answer}.`,
      hints: [
        `Which two multiples of ${place} is ${n} between?`,
        "Halfway or more rounds up.",
      ],
      difficulty: place === 10 ? 990 : 1070,
      widget: { key: "number-line-zoom", config: { value: n, place } },
      fallback: nearbyNumbers(answer, { min: 0, max: 1000, step: place }),
    };
  },
});

/** MA.3.NSO.2.1 — Multi-digit addition and subtraction, standard algorithm. */
export const g3MultiDigit = mcGenerator({
  key: "g3.nso.multiDigit",
  benchmark: "MA.3.NSO.2.1",
  skillSlug: "add-subtract-multi-digit",
  skillTitle: "Adding and subtracting large numbers",
  build(rng, ctx) {
    const wide = ctx.difficulty === "stretch";
    const a = wide ? rng.int(1200, 6800) : rng.int(240, 890);
    const b = wide ? rng.int(1100, 2900) : rng.int(150, 480);
    const adding = rng.bool();

    if (adding) {
      const sum = a + b;
      return {
        stem: `**${a.toLocaleString("en-US")} + ${b.toLocaleString("en-US")} = ?**`,
        audioText: `${a} plus ${b} equals what?`,
        correct: sum.toLocaleString("en-US"),
        distractors: [
          {
            value: addWithoutRegrouping(a, b).toLocaleString("en-US"),
            misconception: "no_regrouping",
          },
          {
            value: addColumnsIndependently(a, b).toLocaleString("en-US"),
            misconception: "column_independent",
          },
          { value: (a - b).toLocaleString("en-US"), misconception: "wrong_operation" },
          { value: (sum + 100).toLocaleString("en-US"), misconception: "off_by_one" },
        ],
        explanation: `Working right to left and carrying each time a column passes 9: ${a.toLocaleString("en-US")} + ${b.toLocaleString("en-US")} = ${sum.toLocaleString("en-US")}.`,
        hints: ["Line up the places.", "Carry into the next column when you pass 9."],
        difficulty: wide ? 1120 : 1030,
        fallback: nearbyNumbers(sum, { min: 0, step: 10 }),
      };
    }

    const big = a + b;
    const diff = a;
    return {
      stem: `**${big.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} = ?**`,
      audioText: `${big} minus ${b} equals what?`,
      correct: diff.toLocaleString("en-US"),
      distractors: [
        {
          value: subtractWithoutBorrowing(big, b).toLocaleString("en-US"),
          misconception: "no_regrouping",
        },
        { value: (big + b).toLocaleString("en-US"), misconception: "wrong_operation" },
        { value: (diff - 100).toLocaleString("en-US"), misconception: "off_by_one" },
        { value: (diff + 10).toLocaleString("en-US"), misconception: "off_by_one" },
      ],
      explanation: `Borrow whenever the top digit is too small: ${big.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} = ${diff.toLocaleString("en-US")}.`,
      hints: [
        "Is the top digit big enough in each column?",
        "If not, take ten from the place to its left.",
      ],
      difficulty: wide ? 1140 : 1050,
      fallback: nearbyNumbers(diff, { min: 0, step: 10 }),
    };
  },
});

const FACT_RANGE = { easy: 5, core: 9, stretch: 12 } as const;

/** MA.3.NSO.2.2 — Explore multiplication and related division facts. */
export const g3MultiplicationMeaning = mcGenerator({
  key: "g3.nso.multiplicationMeaning",
  benchmark: "MA.3.NSO.2.2",
  skillSlug: "multiplication-as-groups",
  skillTitle: "Multiplication as equal groups",
  build(rng, ctx) {
    const groups = rng.int(2, FACT_RANGE[ctx.difficulty]);
    const each = rng.int(2, FACT_RANGE[ctx.difficulty]);
    const product = groups * each;
    const setting = rng.pick(SETTINGS);

    return {
      stem: `There are **${groups} boxes** at ${setting.place}, and each box holds **${each} ${setting.units}**. How many ${setting.units} is that altogether?`,
      audioText: `There are ${groups} boxes and each holds ${each} ${setting.units}. How many altogether?`,
      correct: String(product),
      distractors: [
        {
          value: String(groups + each),
          misconception: "added_instead_of_multiplied",
        },
        { value: String(product - each), misconception: "off_by_one_factor" },
        { value: String(product + each), misconception: "off_by_one_factor" },
        {
          value: String(Math.abs(groups - each)),
          misconception: "wrong_operation",
        },
      ],
      explanation: `${groups} groups of ${each} is ${groups} × ${each} = ${product}. You could also add ${each} to itself ${groups} times.`,
      hints: [
        "Equal groups means multiply.",
        `Try counting on by ${each}, ${groups} times.`,
      ],
      difficulty: 1000,
      widget: {
        key: "array-builder",
        config: { rows: groups, cols: each, revealTotal: false },
      },
      fallback: nearbyNumbers(product, { min: 0, max: 200 }),
    };
  },
});

/** MA.3.NSO.2.3 — Multiply a one-digit number by a multiple of 10 or 100. */
export const g3MultiplyByTens = mcGenerator({
  key: "g3.nso.multiplyByTens",
  benchmark: "MA.3.NSO.2.3",
  skillSlug: "multiply-by-multiples-of-ten",
  skillTitle: "Multiplying by tens and hundreds",
  build(rng, ctx) {
    const a = rng.int(2, 9);
    const scale = ctx.difficulty === "easy" ? 10 : rng.pick([10, 100] as const);
    const b = rng.int(2, 9) * scale;
    const product = a * b;

    return {
      stem: `**${a} × ${b} = ?**`,
      audioText: `${a} times ${b} equals what?`,
      correct: product.toLocaleString("en-US"),
      distractors: [
        {
          // Multiplied the leading digits and forgot to put the zeros back.
          value: String(a * (b / scale)),
          misconception: "place_value_confusion",
        },
        {
          value: (product * 10).toLocaleString("en-US"),
          misconception: "place_value_confusion",
        },
        { value: String(a + b), misconception: "added_instead_of_multiplied" },
        {
          value: (product - b).toLocaleString("en-US"),
          misconception: "off_by_one_factor",
        },
      ],
      explanation: `${a} × ${b / scale} = ${a * (b / scale)}, and there ${scale === 10 ? "is one zero" : "are two zeros"} to put back: ${product.toLocaleString("en-US")}.`,
      hints: [
        "Multiply the front digits first.",
        "Then put back every zero you set aside.",
      ],
      difficulty: scale === 10 ? 1040 : 1110,
      fallback: nearbyNumbers(product, { min: 0, step: scale }),
    };
  },
});

/** MA.3.NSO.2.4 — Multiply 0-12 and divide using related facts. */
export const g3FactsAndDivision = mcGenerator({
  key: "g3.nso.factsAndDivision",
  benchmark: "MA.3.NSO.2.4",
  skillSlug: "multiplication-division-facts",
  skillTitle: "Multiplication and division facts to 12",
  build(rng, ctx) {
    const a = rng.int(2, FACT_RANGE[ctx.difficulty]);
    const b = rng.int(2, 12);
    const product = a * b;
    const divide = rng.bool();

    if (divide) {
      return {
        stem: `**${product} ÷ ${b} = ?**`,
        audioText: `${product} divided by ${b} equals what?`,
        correct: String(a),
        distractors: [
          {
            value: String(product * b),
            misconception: "multiplied_instead_of_divided",
          },
          { value: String(b), misconception: "reversed_dividend_divisor" },
          { value: String(a + 1), misconception: "off_by_one_factor" },
          { value: String(product - b), misconception: "wrong_operation" },
        ],
        explanation: `Ask what times ${b} makes ${product}. Since ${a} × ${b} = ${product}, the answer is ${a}.`,
        hints: [
          "Division asks for the missing factor.",
          `What number times ${b} gives ${product}?`,
        ],
        difficulty: 1080,
        fallback: nearbyNumbers(a, { min: 1, max: 40 }),
      };
    }

    return {
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
      hints: [
        `${a} × ${b} is the same as ${b} × ${a}.`,
        `Start from a fact you know and step by ${a}.`,
      ],
      difficulty: 1010,
      fallback: nearbyNumbers(product, { min: 0, max: 200 }),
    };
  },
});
