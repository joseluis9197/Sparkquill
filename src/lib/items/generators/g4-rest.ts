import { mcGenerator, nearbyNumbers } from "../build";
import { NAMES, SETTINGS, listWords } from "../story";
import {
  addFractions,
  decimalText,
  decimalToWords,
  factorPairs,
  fractionRaw,
  fractionToWords,
  gcd,
  isPrime,
  median,
  mode,
  range,
  round,
  simplify,
  subFractions,
} from "../numbers";

/**
 * Grade 4: fractions and decimals, algebraic reasoning, measurement,
 * geometry and data.
 *
 * The fraction work here is the hinge of the whole curriculum. A child who
 * leaves fourth grade adding denominators does not recover in fifth, so
 * "1/4 + 1/4 = 2/8" is offered as an option on every addition item — not to
 * trick anyone, but so the engine can see it and go back to what a fourth is.
 */

const COMMA = (n: number) => n.toLocaleString("en-US");

/* ------------------------------------------------------------------ *
 * Fractions and decimals
 * ------------------------------------------------------------------ */

/** MA.4.FR.1.1 — Tenths as an equivalent number of hundredths. */
export const g4TenthsToHundredths = mcGenerator({
  key: "g4.fr.tenthsToHundredths",
  benchmark: "MA.4.FR.1.1",
  skillSlug: "tenths-as-hundredths",
  skillTitle: "Tenths written as hundredths",
  build(rng) {
    const n = rng.int(1, 9);

    return {
      stem: `Which fraction is equal to **${n}/10**?`,
      audioText: `Which fraction is equal to ${fractionToWords({ n, d: 10 })}?`,
      correct: `${n * 10}/100`,
      distractors: [
        {
          // Changed only the bottom, which shrinks the value tenfold.
          value: `${n}/100`,
          misconception: "ignored_common_denominator",
        },
        { value: `${n + 90}/100`, misconception: "added_denominators" },
        { value: `${100 / 10}/${n * 10}`, misconception: "numerator_denominator_swap" },
        { value: `${n * 10}/10`, misconception: "used_numerator_only" },
      ],
      explanation: `Each tenth is 10 hundredths, so ${n} tenths is ${n} × 10 = ${n * 10} hundredths: ${n}/10 = ${n * 10}/100.`,
      hints: [
        "How many hundredths fit in one tenth?",
        "Multiply the top and the bottom by the same number.",
      ],
      difficulty: 1090,
      widget: { key: "fraction-bar", config: { compare: [{ n, d: 10 }, { n: n * 10, d: 100 }] } },
    };
  },
});

/** MA.4.FR.1.2 — Decimal notation for tenths and hundredths. */
export const g4FractionToDecimal = mcGenerator({
  key: "g4.fr.fractionToDecimal",
  benchmark: "MA.4.FR.1.2",
  skillSlug: "fraction-decimal-notation",
  skillTitle: "Writing fractions as decimals",
  build(rng, ctx) {
    const d = ctx.difficulty === "easy" ? 10 : rng.pick([10, 100] as const);
    const n = rng.int(1, d === 10 ? 9 : 99);
    const value = round(n / d, 2);
    const places = d === 10 ? 1 : 2;
    const toDecimal = rng.bool();

    if (toDecimal) {
      return {
        stem: `Write **${n}/${d}** as a decimal.`,
        audioText: `Write ${fractionToWords({ n, d })} as a decimal.`,
        correct: decimalText(value, places),
        distractors: [
          {
            // Wrote the numerator after the point regardless of the place.
            value: `0.${n}`,
            misconception: "decimal_point_misplaced",
          },
          {
            value: decimalText(round(value * 10, 2), places),
            misconception: "decimal_point_misplaced",
          },
          {
            value: decimalText(round(value / 10, 3), 3),
            misconception: "decimal_point_misplaced",
          },
          { value: `${n}.${d}`, misconception: "numerator_denominator_swap" },
        ],
        explanation: `${n}/${d} is ${n} ${d === 10 ? "tenths" : "hundredths"}, and ${d === 10 ? "tenths are the first place after the point" : "hundredths are the second place after the point"}: ${decimalText(value, places)}.`,
        hints: [
          "The bottom number tells you which place to use.",
          "Tenths first, hundredths second.",
        ],
        difficulty: 1120,
      };
    }

    return {
      stem: `Write **${decimalText(value, places)}** as a fraction.`,
      audioText: `Write ${decimalToWords(value, places)} as a fraction.`,
      correct: `${n}/${d}`,
      distractors: [
        { value: `${n}/${d === 10 ? 100 : 10}`, misconception: "decimal_point_misplaced" },
        { value: `${d}/${n}`, misconception: "numerator_denominator_swap" },
        { value: `${n}/${n + d}`, misconception: "added_denominators" },
        { value: `${n * 10}/${d}`, misconception: "used_numerator_only" },
      ],
      explanation: `${decimalText(value, places)} is read "${decimalToWords(value, places)}", and that is exactly ${n}/${d}.`,
      hints: [
        "Say the decimal out loud — the last word names the denominator.",
        "One place after the point is tenths; two is hundredths.",
      ],
      difficulty: 1130,
    };
  },
});

/** MA.4.FR.1.3 — Generate equivalent fractions. */
export const g4Equivalent = mcGenerator({
  key: "g4.fr.equivalent",
  benchmark: "MA.4.FR.1.3",
  skillSlug: "equivalent-fractions-g4",
  skillTitle: "Generating equivalent fractions",
  build(rng, ctx) {
    const d = rng.pick([3, 4, 5, 6, 8] as const);
    const n = rng.int(1, d - 1);
    const k = rng.int(2, ctx.difficulty === "easy" ? 3 : 6);
    const equal = { n: n * k, d: d * k };

    return {
      stem: `Which fraction is equal to **${n}/${d}**?`,
      audioText: `Which fraction is equal to ${fractionToWords({ n, d })}?`,
      correct: fractionRaw(equal),
      distractors: [
        { value: `${n + k}/${d + k}`, misconception: "added_denominators" },
        { value: `${n}/${d * k}`, misconception: "ignored_common_denominator" },
        { value: `${n * k}/${d}`, misconception: "used_numerator_only" },
        { value: `${equal.n + 1}/${equal.d}`, misconception: "off_by_one" },
      ],
      explanation: `Multiplying top and bottom by ${k} splits every piece into ${k} smaller ones — ${k} times as many pieces, each ${k} times smaller, so the amount is unchanged: ${n}/${d} = ${equal.n}/${equal.d}.`,
      hints: [
        "Do the same thing to the top and the bottom.",
        "Adding to both changes the value; multiplying does not.",
      ],
      difficulty: 1110,
    };
  },
});

/** MA.4.FR.1.4 — Compare fractions with unlike denominators. */
export const g4CompareUnlike = mcGenerator({
  key: "g4.fr.compareUnlike",
  benchmark: "MA.4.FR.1.4",
  skillSlug: "compare-unlike-fractions",
  skillTitle: "Comparing fractions with different denominators",
  build(rng) {
    const pool = [2, 3, 4, 5, 6, 8, 10, 12];
    let a = { n: 0, d: 0 };
    let b = { n: 0, d: 0 };
    for (let i = 0; i < 30; i++) {
      const d1 = rng.pick(pool);
      const d2 = rng.pick(pool.filter((x) => x !== d1));
      a = { n: rng.int(1, d1 - 1), d: d1 };
      b = { n: rng.int(1, d2 - 1), d: d2 };
      if (a.n / a.d !== b.n / b.d) break;
    }
    if (a.n / a.d === b.n / b.d) b = { n: b.n, d: b.d + 1 };

    const common = (a.d * b.d) / gcd(a.d, b.d);
    const aScaled = (a.n * common) / a.d;
    const bScaled = (b.n * common) / b.d;
    const bigger = a.n / a.d > b.n / b.d ? a : b;
    const smaller = a.n / a.d > b.n / b.d ? b : a;
    const wantLarger = rng.bool();

    return {
      stem: `Which is **${wantLarger ? "greater" : "less"}**: ${fractionRaw(a)} or ${fractionRaw(b)}?`,
      audioText: `Which is ${wantLarger ? "greater" : "less"}, ${fractionToWords(a)} or ${fractionToWords(b)}?`,
      correct: fractionRaw(wantLarger ? bigger : smaller),
      distractors: [
        {
          value: fractionRaw(wantLarger ? smaller : bigger),
          misconception: "compared_denominators_only",
        },
        { value: "They are equal", misconception: "distractor_plausible" },
        {
          value: fractionRaw({ n: bigger.d, d: bigger.n }),
          misconception: "numerator_denominator_swap",
        },
        {
          value: fractionRaw({ n: smaller.n + 1, d: smaller.d }),
          misconception: "off_by_one",
        },
      ],
      explanation: `Rewrite both over ${common}: ${fractionRaw(a)} = ${aScaled}/${common} and ${fractionRaw(b)} = ${bScaled}/${common}. Now the pieces are the same size, so ${fractionRaw(bigger)} is the greater. Comparing the bottom numbers alone would have given the wrong answer.`,
      hints: [
        "You cannot compare pieces of different sizes directly.",
        `Rewrite both with ${common} on the bottom.`,
      ],
      difficulty: 1230,
      widget: { key: "fraction-bar", config: { compare: [a, b] } },
    };
  },
});

/** MA.4.FR.2.1 — Decompose a fraction into a sum. */
export const g4Decompose = mcGenerator({
  key: "g4.fr.decompose",
  benchmark: "MA.4.FR.2.1",
  skillSlug: "decompose-fractions",
  skillTitle: "Breaking a fraction into a sum",
  build(rng) {
    const d = rng.pick([4, 5, 6, 8, 10] as const);
    const n = rng.int(3, d - 1);
    const first = rng.int(1, n - 1);
    const second = n - first;

    return {
      stem: `Which sum is equal to **${n}/${d}**?`,
      audioText: `Which sum equals ${fractionToWords({ n, d })}?`,
      correct: `${first}/${d} + ${second}/${d}`,
      distractors: [
        {
          value: `${first}/${d} + ${second}/${d * 2}`,
          misconception: "ignored_common_denominator",
        },
        {
          value: `${first}/${first + second} + ${second}/${first + second}`,
          misconception: "added_denominators",
        },
        {
          value: `${n}/${first} + ${n}/${second}`,
          misconception: "numerator_denominator_swap",
        },
        {
          value: `${first + 1}/${d} + ${second}/${d}`,
          misconception: "off_by_one",
        },
      ],
      explanation: `${n}/${d} is ${n} pieces of size 1/${d}. Split them into ${first} and ${second}: ${first}/${d} + ${second}/${d} = ${n}/${d}. The piece size never changes, so the bottom stays ${d}.`,
      hints: [
        "Only the count of pieces is being split.",
        "Every piece is still 1/" + d + ".",
      ],
      difficulty: 1140,
    };
  },
});

/** MA.4.FR.2.2 — Add and subtract fractions with like denominators. */
export const g4AddLike = mcGenerator({
  key: "g4.fr.addLike",
  benchmark: "MA.4.FR.2.2",
  skillSlug: "add-subtract-like-fractions",
  skillTitle: "Adding and subtracting fractions with the same bottom number",
  build(rng, ctx) {
    const d = rng.pick([4, 5, 6, 8, 10, 12] as const);
    const adding = rng.bool();
    const improper = ctx.difficulty === "stretch" && adding;

    const a = { n: rng.int(1, d - 2), d };
    const b = { n: rng.int(1, improper ? d - 1 : d - 1 - a.n), d };
    const sum = { n: a.n + b.n, d };
    const diff = { n: Math.max(a.n, b.n) - Math.min(a.n, b.n), d };
    const result = adding ? sum : diff;

    const left = adding ? a : { n: Math.max(a.n, b.n), d };
    const right = adding ? b : { n: Math.min(a.n, b.n), d };

    return {
      stem: `**${fractionRaw(left)} ${adding ? "+" : "−"} ${fractionRaw(right)} = ?**`,
      audioText: `${fractionToWords(left)} ${adding ? "plus" : "minus"} ${fractionToWords(right)}.`,
      correct: fractionRaw(result),
      distractors: [
        {
          // The error this whole benchmark exists to prevent.
          value: `${result.n}/${d * 2}`,
          misconception: "added_denominators",
        },
        {
          value: fractionRaw({ n: adding ? diff.n : sum.n, d }),
          misconception: "wrong_operation",
        },
        {
          value: fractionRaw({ n: result.n + 1, d }),
          misconception: "off_by_one",
        },
        {
          value: fractionRaw(simplify(result)),
          misconception: "distractor_plausible",
        },
      ],
      explanation: `The pieces are already the same size, so only the count changes: ${left.n} ${adding ? "+" : "−"} ${right.n} = ${result.n}, over ${d}. The bottom number stays ${d} — it says how big each piece is, and that has not changed.`,
      hints: [
        "The bottom number does not move.",
        "Add or subtract the top numbers only.",
      ],
      difficulty: 1120,
    };
  },
});

/** MA.4.FR.2.3 — Add a tenth to a hundredth. */
export const g4AddTenthHundredth = mcGenerator({
  key: "g4.fr.addTenthHundredth",
  benchmark: "MA.4.FR.2.3",
  skillSlug: "add-tenths-and-hundredths",
  skillTitle: "Adding tenths to hundredths",
  build(rng) {
    const a = { n: rng.int(1, 8), d: 10 };
    const b = { n: rng.int(1, 40), d: 100 };
    const result = { n: a.n * 10 + b.n, d: 100 };

    return {
      stem: `**${fractionRaw(a)} + ${fractionRaw(b)} = ?**`,
      audioText: `${fractionToWords(a)} plus ${fractionToWords(b)}.`,
      correct: fractionRaw(result),
      distractors: [
        {
          value: `${a.n + b.n}/110`,
          misconception: "added_denominators",
        },
        {
          // Added the numerators without rewriting the tenths first.
          value: `${a.n + b.n}/100`,
          misconception: "ignored_common_denominator",
        },
        { value: `${result.n}/10`, misconception: "decimal_point_misplaced" },
        { value: `${result.n + 1}/100`, misconception: "off_by_one" },
      ],
      explanation: `Rewrite the tenths as hundredths first: ${fractionRaw(a)} = ${a.n * 10}/100. Then ${a.n * 10}/100 + ${b.n}/100 = ${result.n}/100.`,
      hints: [
        "The pieces are different sizes — make them match first.",
        "One tenth is ten hundredths.",
      ],
      difficulty: 1200,
    };
  },
});

/** MA.4.FR.2.4 — Multiply a fraction by a whole number. */
export const g4FractionTimesWhole = mcGenerator({
  key: "g4.fr.fractionTimesWhole",
  benchmark: "MA.4.FR.2.4",
  skillSlug: "fraction-times-whole",
  skillTitle: "Multiplying a fraction by a whole number",
  build(rng, ctx) {
    const d = rng.pick([3, 4, 5, 6, 8] as const);
    const n = rng.int(1, d - 1);
    const k = rng.int(2, ctx.difficulty === "easy" ? 4 : 7);
    const result = { n: n * k, d };

    return {
      stem: `**${k} × ${fractionRaw({ n, d })} = ?**`,
      audioText: `${k} times ${fractionToWords({ n, d })}.`,
      correct: fractionRaw(result),
      distractors: [
        {
          // Multiplied the bottom instead of the top.
          value: `${n}/${d * k}`,
          misconception: "ignored_common_denominator",
        },
        {
          value: `${n * k}/${d * k}`,
          misconception: "added_denominators",
        },
        { value: `${n + k}/${d}`, misconception: "added_instead_of_multiplied" },
        { value: fractionRaw({ n: result.n + 1, d }), misconception: "off_by_one" },
      ],
      explanation: `${k} lots of ${n}/${d} is ${k} × ${n} = ${n * k} pieces, each still 1/${d}: ${result.n}/${d}. Only the count of pieces multiplies.`,
      hints: [
        `Think of it as ${n}/${d} added ${k} times.`,
        "The size of each piece does not change.",
      ],
      difficulty: 1160,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Algebraic reasoning
 * ------------------------------------------------------------------ */

/** MA.4.AR.1.1 — Multiplication and division problems with remainders. */
export const g4RemainderProblem = mcGenerator({
  key: "g4.ar.remainderProblem",
  benchmark: "MA.4.AR.1.1",
  skillSlug: "interpret-remainders",
  skillTitle: "Making sense of a remainder",
  build(rng) {
    const perGroup = rng.int(4, 9);
    const groups = rng.int(6, 24);
    const remainder = rng.int(1, perGroup - 1);
    const total = groups * perGroup + remainder;

    // The same division, two questions, two different right answers. This is
    // the benchmark: the remainder means something different depending on
    // what is being asked.
    const needAll = rng.bool();

    return {
      stem: needAll
        ? `${total} children are going on a trip. Each minibus holds ${perGroup}. How many minibuses are needed so **everyone** gets a seat?`
        : `${total} pencils are shared equally into packs of ${perGroup}. How many **full packs** are there?`,
      audioText: needAll
        ? `${total} children, ${perGroup} to a minibus. How many minibuses are needed so everyone travels?`
        : `${total} pencils in packs of ${perGroup}. How many full packs?`,
      correct: String(needAll ? groups + 1 : groups),
      distractors: [
        {
          value: String(needAll ? groups : groups + 1),
          misconception: needAll ? "dropped_remainder" : "off_by_one",
        },
        { value: String(remainder), misconception: "remainder_as_whole" },
        { value: String(total), misconception: "used_part_not_whole" },
        { value: String(total * perGroup), misconception: "multiplied_instead_of_divided" },
      ],
      explanation: `${total} ÷ ${perGroup} = ${groups} remainder ${remainder}. ${
        needAll
          ? `Those ${remainder} left over still need a seat, so an extra minibus is required: ${groups + 1}.`
          : `The ${remainder} left over do not fill a pack, so there are ${groups} full packs.`
      }`,
      hints: [
        "Do the division first.",
        "Now ask what the leftover means for this particular question.",
      ],
      difficulty: 1250,
      fallback: nearbyNumbers(needAll ? groups + 1 : groups, { min: 1 }),
    };
  },
});

/** MA.4.AR.1.2 — Real-world problems with like-denominator fractions. */
export const g4FractionProblem = mcGenerator({
  key: "g4.ar.fractionProblem",
  benchmark: "MA.4.AR.1.2",
  skillSlug: "fraction-word-problems",
  skillTitle: "Fraction story problems",
  build(rng) {
    const who = rng.pick(NAMES);
    const d = rng.pick([4, 5, 6, 8] as const);
    const a = { n: rng.int(1, d - 2), d };
    const b = { n: rng.int(1, d - 1 - a.n), d };
    const total = addFractions(a, b);
    const leftOver = subFractions({ n: d, d }, total);

    const askLeft = rng.bool();

    return {
      stem: askLeft
        ? `${who} ate ${fractionRaw(a)} of a pizza and their friend ate ${fractionRaw(b)}. How much of the pizza is **left**?`
        : `${who} ran ${fractionRaw(a)} of a mile in the morning and ${fractionRaw(b)} of a mile in the evening. How far did ${who} run **in total**?`,
      audioText: askLeft
        ? `One person ate ${fractionToWords(a)} of a pizza and another ate ${fractionToWords(b)}. How much is left?`
        : `Someone ran ${fractionToWords(a)} of a mile and then ${fractionToWords(b)} of a mile. How far in total?`,
      correct: askLeft ? fractionRaw(leftOver) : fractionRaw({ n: a.n + b.n, d }),
      distractors: [
        {
          value: `${a.n + b.n}/${d * 2}`,
          misconception: "added_denominators",
        },
        {
          value: askLeft
            ? fractionRaw({ n: a.n + b.n, d })
            : fractionRaw(leftOver),
          misconception: "wrong_operation",
        },
        {
          value: fractionRaw({ n: Math.abs(a.n - b.n), d }),
          misconception: "wrong_operation",
        },
        {
          value: fractionRaw({ n: a.n + b.n + 1, d }),
          misconception: "off_by_one",
        },
      ],
      explanation: askLeft
        ? `Together they ate ${a.n}/${d} + ${b.n}/${d} = ${a.n + b.n}/${d}. A whole pizza is ${d}/${d}, so what is left is ${d}/${d} − ${a.n + b.n}/${d} = ${fractionRaw({ n: d - a.n - b.n, d })}.`
        : `The pieces are the same size, so add the counts: ${a.n}/${d} + ${b.n}/${d} = ${a.n + b.n}/${d} of a mile.`,
      hints: [
        askLeft ? "A whole is " + d + "/" + d + "." : "Same bottom number — just add the tops.",
        "The bottom number stays the same.",
      ],
      difficulty: 1210,
    };
  },
});

/** MA.4.AR.1.3 — Real-world problems multiplying a fraction by a whole. */
export const g4FractionTimesProblem = mcGenerator({
  key: "g4.ar.fractionTimesProblem",
  benchmark: "MA.4.AR.1.3",
  skillSlug: "fraction-multiplication-problems",
  skillTitle: "Story problems multiplying fractions",
  build(rng) {
    const who = rng.pick(NAMES);
    const d = rng.pick([2, 3, 4, 5] as const);
    const n = rng.int(1, d - 1);
    const k = rng.int(3, 9);
    const product = { n: n * k, d };
    const whole = Math.floor((n * k) / d);
    const rest = n * k - whole * d;

    return {
      stem: `A recipe needs **${fractionRaw({ n, d })} of a cup** of flour. ${who} is making **${k} batches**. How much flour is needed?`,
      audioText: `A recipe needs ${fractionToWords({ n, d })} of a cup of flour for one batch. How much for ${k} batches?`,
      correct: rest === 0 ? `${whole} cups` : `${whole > 0 ? `${whole} ` : ""}${rest}/${d} cups`,
      distractors: [
        {
          value: `${n}/${d * k} cups`,
          misconception: "ignored_common_denominator",
        },
        { value: `${n + k}/${d} cups`, misconception: "added_instead_of_multiplied" },
        { value: `${k} cups`, misconception: "used_part_not_whole" },
        {
          value: `${product.n}/${d * k} cups`,
          misconception: "added_denominators",
        },
      ],
      explanation: `${k} batches of ${n}/${d} cup is ${k} × ${n} = ${n * k} quarter-sized pieces over ${d}: ${product.n}/${d} cups${rest === 0 ? `, which is exactly ${whole} cups` : `, or ${whole > 0 ? `${whole} and ` : ""}${rest}/${d} cups`}.`,
      hints: [
        "Multiply the top number by the number of batches.",
        "The bottom number stays the same.",
      ],
      difficulty: 1230,
    };
  },
});

/** MA.4.AR.2.1 — True or false four-operation equations. */
export const g4TrueFalse = mcGenerator({
  key: "g4.ar.trueFalse",
  benchmark: "MA.4.AR.2.1",
  skillSlug: "true-false-four-operations",
  skillTitle: "Deciding if an equation is true",
  build(rng) {
    const a = rng.int(3, 12);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    // Both sides use different operations, so the child has to evaluate rather
    // than pattern-match.
    const left = a * b + c;
    const makeTrue = rng.bool();
    const rightA = makeTrue ? left - c : left - c + rng.pick([1, 2, -2]);
    const right = rightA + c;
    const isTrue = left === right;

    return {
      stem: `Is this true or false?\n\n**${a} × ${b} + ${c} = ${rightA} + ${c}**`,
      audioText: `Is this true or false? ${a} times ${b} plus ${c} equals ${rightA} plus ${c}.`,
      correct: isTrue ? "True" : "False",
      distractors: [
        { value: isTrue ? "False" : "True", misconception: "distractor_plausible" },
        {
          value: "True, because both sides add " + c,
          misconception: "order_of_operations",
        },
        {
          value: "You must do the addition before the multiplication",
          misconception: "order_of_operations",
        },
      ],
      explanation: `Multiply before you add: ${a} × ${b} = ${a * b}, so the left side is ${a * b} + ${c} = ${left}. The right side is ${rightA} + ${c} = ${right}. ${isTrue ? "They match." : "They do not match."}`,
      hints: [
        "Multiplication happens before addition.",
        "Work out each side completely before comparing.",
      ],
      difficulty: 1180,
    };
  },
});

/** MA.4.AR.2.2 — Write an equation for an unknown. */
export const g4WriteEquation = mcGenerator({
  key: "g4.ar.writeEquation",
  benchmark: "MA.4.AR.2.2",
  skillSlug: "write-equation-for-unknown",
  skillTitle: "Writing an equation for a story",
  build(rng) {
    const who = rng.pick(NAMES);
    const setting = rng.pick(SETTINGS);
    const total = rng.int(4, 12) * rng.int(4, 12);
    const perBox = rng.pick(factorPairs(total).map((p) => p[1]).filter((x) => x > 1 && x < total));
    const boxes = total / perBox;

    return {
      stem: `${who} packs ${total} ${setting.units} into boxes of ${perBox}. Which equation finds the number of boxes, **b**?`,
      audioText: `${total} items packed into boxes of ${perBox}. Which equation finds the number of boxes?`,
      correct: `${perBox} × b = ${total}`,
      distractors: [
        { value: `${total} × ${perBox} = b`, misconception: "multiplied_instead_of_divided" },
        { value: `b × ${total} = ${perBox}`, misconception: "reversed_dividend_divisor" },
        { value: `b + ${perBox} = ${total}`, misconception: "wrong_operation" },
        { value: `${total} − ${perBox} = b`, misconception: "wrong_operation" },
      ],
      explanation: `Each box holds ${perBox}, and there are b boxes, so ${perBox} × b must equal the ${total} altogether. That gives b = ${boxes}.`,
      hints: [
        "What does the number of boxes get multiplied by?",
        "The total is the answer to the multiplication, not part of it.",
      ],
      difficulty: 1200,
    };
  },
});

/** MA.4.AR.3.1 — Factor pairs; prime and composite. */
export const g4PrimeComposite = mcGenerator({
  key: "g4.ar.primeComposite",
  benchmark: "MA.4.AR.3.1",
  skillSlug: "prime-composite-factors",
  skillTitle: "Factors, prime and composite numbers",
  build(rng, ctx) {
    const askPrime = rng.bool();
    if (askPrime) {
      const n = rng.int(2, ctx.difficulty === "easy" ? 40 : 100);
      const prime = isPrime(n);
      const pairs = factorPairs(n);

      return {
        stem: `Is **${n}** prime, composite, or neither?`,
        audioText: `Is ${n} prime, composite, or neither?`,
        correct: n === 1 ? "Neither" : prime ? "Prime" : "Composite",
        distractors: [
          {
            value: prime ? "Composite" : "Prime",
            misconception: "distractor_plausible",
          },
          { value: n === 1 ? "Prime" : "Neither", misconception: "distractor_plausible" },
          {
            value: n % 2 === 0 ? "Prime, because it is even" : "Composite, because it is odd",
            misconception: "distractor_plausible",
          },
        ],
        explanation:
          n === 1
            ? "1 has only one factor, itself, so it is neither prime nor composite."
            : prime
              ? `The only factors of ${n} are 1 and ${n}, so it is prime.`
              : `${n} = ${pairs[1][0]} × ${pairs[1][1]}, so it has factors besides 1 and itself: it is composite.`,
        hints: [
          "Try dividing by 2, 3, 5 and 7.",
          "A prime has exactly two factors.",
        ],
        difficulty: 1170,
      };
    }

    const n = rng.pick([12, 16, 18, 20, 24, 28, 30, 36, 40, 48, 60, 72]);
    const pairs = factorPairs(n);
    const good = pairs[rng.int(1, pairs.length - 1)];

    return {
      stem: `Which pair of numbers multiplies to make **${n}**?`,
      audioText: `Which pair multiplies to make ${n}?`,
      correct: `${good[0]} and ${good[1]}`,
      distractors: [
        {
          value: `${good[0]} and ${good[1] + 1}`,
          misconception: "off_by_one_factor",
        },
        {
          value: `${good[0] + 1} and ${good[1]}`,
          misconception: "off_by_one_factor",
        },
        {
          value: `${good[0]} and ${n - good[0]}`,
          misconception: "added_instead_of_multiplied",
        },
      ],
      explanation: `${good[0]} × ${good[1]} = ${n}. All the factor pairs of ${n} are ${listWords(pairs.map((p) => `${p[0]} × ${p[1]}`))}.`,
      hints: [
        "Try each small number in turn.",
        "If it divides with nothing left over, it is a factor.",
      ],
      difficulty: 1150,
    };
  },
});

/** MA.4.AR.3.2 — Extend a pattern from a rule. */
export const g4Pattern = mcGenerator({
  key: "g4.ar.pattern",
  benchmark: "MA.4.AR.3.2",
  skillSlug: "patterns-from-a-rule",
  skillTitle: "Patterns that follow a rule",
  build(rng, ctx) {
    const start = rng.int(2, 12);
    const mult = rng.int(2, 4);
    const add = rng.int(1, 9);
    const twoPart = ctx.difficulty !== "easy";

    const step = (x: number) => (twoPart ? x * mult + add : x + add);
    const seq = [start];
    for (let i = 0; i < 3; i++) seq.push(step(seq[i]));
    const answer = step(seq[3]);

    return {
      stem: `The rule is **${twoPart ? `multiply by ${mult}, then add ${add}` : `add ${add}`}**. What comes after ${seq[3]}?\n\n**${seq.join(", ")}, ___**`,
      audioText: `The rule is ${twoPart ? `multiply by ${mult} then add ${add}` : `add ${add}`}. What comes after ${seq[3]}?`,
      correct: COMMA(answer),
      distractors: [
        {
          // Applied the steps in the wrong order.
          value: COMMA(twoPart ? (seq[3] + add) * mult : seq[3] * add),
          misconception: "order_of_operations",
        },
        {
          value: COMMA(twoPart ? seq[3] * mult : seq[3] + add + 1),
          misconception: "used_part_not_whole",
        },
        { value: COMMA(answer + add), misconception: "off_by_one" },
        { value: COMMA(seq[3]), misconception: "distractor_plausible" },
      ],
      explanation: twoPart
        ? `${seq[3]} × ${mult} = ${seq[3] * mult}, then + ${add} = ${answer}. The order matters: adding first would give ${(seq[3] + add) * mult}.`
        : `${seq[3]} + ${add} = ${answer}.`,
      hints: [
        "Apply the rule in the order it is written.",
        "Check the rule works between every pair you were given.",
      ],
      difficulty: twoPart ? 1240 : 1080,
      fallback: nearbyNumbers(answer, { min: 0 }),
    };
  },
});

/* ------------------------------------------------------------------ *
 * Measurement
 * ------------------------------------------------------------------ */

/** MA.4.M.1.1 — Choose the appropriate tool and unit. */
export const g4ChooseTool = mcGenerator({
  key: "g4.m.chooseTool",
  benchmark: "MA.4.M.1.1",
  skillSlug: "choose-tool-g4",
  skillTitle: "Picking the right tool and unit",
  build(rng) {
    const cases = [
      { q: "the weight of an apple", a: "a scale, in grams", w: ["a scale, in kilograms", "a ruler, in centimetres", "a measuring jug, in litres"] },
      { q: "the length of a swimming pool", a: "a tape measure, in metres", w: ["a ruler, in millimetres", "a scale, in kilograms", "a thermometer, in degrees"] },
      { q: "how much medicine is in a spoon", a: "a syringe, in millilitres", w: ["a jug, in litres", "a scale, in kilograms", "a ruler, in centimetres"] },
      { q: "the mass of a school bag", a: "a scale, in kilograms", w: ["a scale, in grams", "a jug, in millilitres", "a tape measure, in metres"] },
      { q: "the thickness of a coin", a: "a ruler, in millimetres", w: ["a tape measure, in metres", "a scale, in grams", "a jug, in litres"] },
    ] as const;
    const c = rng.pick(cases);

    return {
      stem: `Which tool and unit best measures **${c.q}**?`,
      audioText: `Which tool and unit best measures ${c.q}?`,
      correct: c.a,
      distractors: c.w.map((w) => ({ value: w, misconception: "ignored_units" as const })),
      explanation: `${c.q[0].toUpperCase()}${c.q.slice(1)} is measured with ${c.a}. Choosing a unit that is far too large or too small makes the number useless even when the tool is right.`,
      hints: [
        "First decide what kind of quantity it is.",
        "Then pick the unit that gives a number you can picture.",
      ],
      difficulty: 1030,
    };
  },
});

const CONVERSIONS = [
  { big: "kilometre", small: "metre", per: 1000, bigs: "kilometres", smalls: "metres" },
  { big: "metre", small: "centimetre", per: 100, bigs: "metres", smalls: "centimetres" },
  { big: "kilogram", small: "gram", per: 1000, bigs: "kilograms", smalls: "grams" },
  { big: "litre", small: "millilitre", per: 1000, bigs: "litres", smalls: "millilitres" },
  { big: "foot", small: "inch", per: 12, bigs: "feet", smalls: "inches" },
  { big: "yard", small: "foot", per: 3, bigs: "yards", smalls: "feet" },
  { big: "hour", small: "minute", per: 60, bigs: "hours", smalls: "minutes" },
] as const;

/** MA.4.M.1.2 — Convert within one measurement system. */
export const g4Convert = mcGenerator({
  key: "g4.m.convert",
  benchmark: "MA.4.M.1.2",
  skillSlug: "convert-units",
  skillTitle: "Converting between units",
  build(rng) {
    const c = rng.pick(CONVERSIONS);
    const count = rng.int(2, 9);
    const answer = count * c.per;

    return {
      stem: `How many **${c.smalls}** are in **${count} ${c.bigs}**?`,
      audioText: `How many ${c.smalls} are in ${count} ${c.bigs}?`,
      correct: COMMA(answer),
      distractors: [
        {
          // Divided when they needed to multiply — the direction error.
          value: String(round(count / c.per, 4)),
          misconception: "converted_wrong_direction",
        },
        { value: COMMA(count + c.per), misconception: "added_instead_of_multiplied" },
        { value: COMMA(answer * 10), misconception: "place_value_confusion" },
        { value: COMMA(c.per), misconception: "used_part_not_whole" },
      ],
      explanation: `One ${c.big} is ${COMMA(c.per)} ${c.smalls}, so ${count} ${c.bigs} is ${count} × ${COMMA(c.per)} = ${COMMA(answer)} ${c.smalls}. Going to a smaller unit always gives a bigger number.`,
      hints: [
        "Are you moving to a bigger unit or a smaller one?",
        "Smaller unit means more of them, so multiply.",
      ],
      difficulty: 1160,
      fallback: nearbyNumbers(answer, { min: 1, step: c.per }),
    };
  },
});

/** MA.4.M.2.1 — Two-step distance and time problems. */
export const g4DistanceTime = mcGenerator({
  key: "g4.m.distanceTime",
  benchmark: "MA.4.M.2.1",
  skillSlug: "distance-time-problems",
  skillTitle: "Distance and time problems",
  build(rng) {
    const who = rng.pick(NAMES);
    const perDay = rng.int(3, 12);
    const days = rng.int(4, 9);
    const extra = rng.int(2, 15);
    const total = perDay * days + extra;

    return {
      stem: `${who} cycles ${perDay} km each day for ${days} days, and then rides a further ${extra} km at the weekend. How far has ${who} cycled altogether?`,
      audioText: `${who} cycles ${perDay} kilometres a day for ${days} days, then ${extra} more at the weekend. How far altogether?`,
      correct: `${total} km`,
      distractors: [
        { value: `${perDay * days} km`, misconception: "used_part_not_whole" },
        { value: `${perDay + days + extra} km`, misconception: "added_instead_of_multiplied" },
        { value: `${perDay * (days + extra)} km`, misconception: "order_of_operations" },
        { value: `${total} m`, misconception: "ignored_units" },
      ],
      explanation: `${perDay} × ${days} = ${perDay * days} km during the week, then + ${extra} = ${total} km.`,
      hints: [
        "Work out the weekday total first.",
        "The weekend ride is added, not multiplied.",
      ],
      difficulty: 1190,
    };
  },
});

/** MA.4.M.2.2 — Money problems in decimal notation. */
export const g4Money = mcGenerator({
  key: "g4.m.money",
  benchmark: "MA.4.M.2.2",
  skillSlug: "money-problems-decimal",
  skillTitle: "Money problems with decimals",
  build(rng) {
    const who = rng.pick(NAMES);
    const price = round(rng.int(125, 899) / 100, 2);
    const count = rng.int(2, 5);
    const paid = Math.ceil(price * count) + rng.int(1, 5);
    const cost = round(price * count, 2);
    const change = round(paid - cost, 2);

    return {
      stem: `${who} buys ${count} notebooks at **$${decimalText(price, 2)}** each and pays with **$${paid}**. How much change is there?`,
      audioText: `${count} notebooks at ${decimalToWords(price, 2)} dollars each, paid with ${paid} dollars. How much change?`,
      correct: `$${decimalText(change, 2)}`,
      distractors: [
        { value: `$${decimalText(cost, 2)}`, misconception: "used_part_not_whole" },
        {
          value: `$${decimalText(round(paid - price, 2), 2)}`,
          misconception: "used_part_not_whole",
        },
        {
          value: `$${decimalText(round(change * 10, 2), 2)}`,
          misconception: "decimal_point_misplaced",
        },
        {
          value: `$${decimalText(round(paid + cost, 2), 2)}`,
          misconception: "wrong_operation",
        },
      ],
      explanation: `${count} × $${decimalText(price, 2)} = $${decimalText(cost, 2)}. Change is $${paid} − $${decimalText(cost, 2)} = $${decimalText(change, 2)}.`,
      hints: [
        "Find the total cost first.",
        "Change is what is paid minus what it costs.",
      ],
      difficulty: 1220,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Geometry
 * ------------------------------------------------------------------ */

/** MA.4.GR.1.1 — Classify angles. */
export const g4ClassifyAngle = mcGenerator({
  key: "g4.gr.classifyAngle",
  benchmark: "MA.4.GR.1.1",
  skillSlug: "classify-angles",
  skillTitle: "Naming angles",
  build(rng) {
    const kind = rng.pick(["acute", "right", "obtuse", "straight", "reflex"] as const);
    const degrees =
      kind === "right"
        ? 90
        : kind === "straight"
          ? 180
          : kind === "acute"
            ? rng.int(10, 85)
            : kind === "obtuse"
              ? rng.int(95, 175)
              : rng.int(185, 350);

    return {
      stem: `An angle measures **${degrees}°**. What kind of angle is it?`,
      audioText: `An angle measures ${degrees} degrees. What kind of angle is it?`,
      correct: kind,
      distractors: (["acute", "right", "obtuse", "straight", "reflex"] as const)
        .filter((k) => k !== kind)
        .map((k) => ({ value: k, misconception: "distractor_plausible" as const })),
      explanation: `Acute is under 90°, right is exactly 90°, obtuse is between 90° and 180°, straight is exactly 180°, and reflex is over 180°. ${degrees}° is ${kind}.`,
      hints: [
        "Compare it with a square corner, which is 90°.",
        "A straight line is 180°.",
      ],
      difficulty: 1050,
      widget: { key: "angle-viewer", config: { degrees } },
    };
  },
});

/** MA.4.GR.1.2 — Angle measure is additive. */
export const g4AddAngles = mcGenerator({
  key: "g4.gr.addAngles",
  benchmark: "MA.4.GR.1.2",
  skillSlug: "angles-are-additive",
  skillTitle: "Adding angles together",
  build(rng) {
    const a = rng.int(20, 80);
    const b = rng.int(20, 80);
    const total = a + b;

    return {
      stem: `A ray splits a **${total}°** angle into two parts. One part measures **${a}°**. What does the other part measure?`,
      audioText: `A ${total} degree angle is split in two. One part is ${a} degrees. What is the other?`,
      correct: `${b}°`,
      distractors: [
        { value: `${total + a}°`, misconception: "wrong_operation" },
        { value: `${90 - a}°`, misconception: "distractor_plausible" },
        { value: `${180 - total}°`, misconception: "distractor_plausible" },
        { value: `${b + 10}°`, misconception: "off_by_one" },
      ],
      explanation: `The two parts add to the whole angle: ${a}° + ? = ${total}°, so the other part is ${total}° − ${a}° = ${b}°.`,
      hints: [
        "The parts add up to the whole.",
        "This is a subtraction, not a right-angle rule.",
      ],
      difficulty: 1160,
      widget: { key: "angle-viewer", config: { degrees: total, split: a } },
    };
  },
});

/** MA.4.GR.1.3 — Unknown angle measures. */
export const g4UnknownAngle = mcGenerator({
  key: "g4.gr.unknownAngle",
  benchmark: "MA.4.GR.1.3",
  skillSlug: "unknown-angles",
  skillTitle: "Finding a missing angle",
  build(rng) {
    const onLine = rng.bool();
    const whole = onLine ? 180 : 90;
    const known = rng.int(20, whole - 20);
    const answer = whole - known;

    return {
      stem: onLine
        ? `Two angles sit on a **straight line**. One is **${known}°**. What is the other?`
        : `Two angles make a **right angle**. One is **${known}°**. What is the other?`,
      audioText: onLine
        ? `Two angles on a straight line, one is ${known} degrees. What is the other?`
        : `Two angles make a right angle, one is ${known} degrees. What is the other?`,
      correct: `${answer}°`,
      distractors: [
        {
          // Used the other rule: 90 where 180 was needed, or the reverse.
          value: `${Math.abs((onLine ? 90 : 180) - known)}°`,
          misconception: "distractor_plausible",
        },
        // Only offered when it is actually wrong. A 45° angle on a right angle
        // leaves 45°, so "the angle you were given" would be the answer.
        ...(known !== answer
          ? [
              {
                value: `${known}°`,
                misconception: "distractor_plausible" as const,
              },
            ]
          : []),
        { value: `${whole + known}°`, misconception: "wrong_operation" },
        { value: `${answer + 10}°`, misconception: "off_by_one" },
        { value: `${Math.max(1, answer - 10)}°`, misconception: "off_by_one" },
        { value: `${whole}°`, misconception: "used_part_not_whole" },
      ],
      explanation: `${onLine ? "Angles on a straight line add to 180°" : "A right angle is 90°"}, so the missing angle is ${whole} − ${known} = ${answer}°.`,
      hints: [
        onLine ? "A straight line is 180°." : "A square corner is 90°.",
        "Subtract the angle you know from the whole.",
      ],
      difficulty: 1140,
      widget: { key: "angle-viewer", config: { degrees: whole, split: known } },
    };
  },
});

/** MA.4.GR.2.1 — Perimeter and area with an unknown side. */
export const g4UnknownSide = mcGenerator({
  key: "g4.gr.unknownSide",
  benchmark: "MA.4.GR.2.1",
  skillSlug: "rectangle-unknown-side",
  skillTitle: "Finding a missing side of a rectangle",
  build(rng, ctx) {
    const w = rng.int(3, 15);
    const h = rng.int(3, 15);
    const fromArea = ctx.difficulty !== "easy" && rng.bool();
    const area = w * h;
    const perimeter = 2 * (w + h);

    return {
      stem: fromArea
        ? `A rectangle has an area of **${area} cm²** and a width of **${w} cm**. How tall is it?`
        : `A rectangle has a perimeter of **${perimeter} cm** and a width of **${w} cm**. How tall is it?`,
      audioText: fromArea
        ? `A rectangle has area ${area} square centimetres and width ${w}. How tall is it?`
        : `A rectangle has perimeter ${perimeter} centimetres and width ${w}. How tall is it?`,
      correct: `${h} cm`,
      distractors: [
        {
          value: fromArea ? `${area - w} cm` : `${perimeter - w} cm`,
          misconception: fromArea
            ? "multiplied_instead_of_divided"
            : "used_part_not_whole",
        },
        {
          // Applied the wrong formula's inverse: halving an area, or dividing
          // a perimeter. Both are wrong; neither accidentally lands on h.
          value: fromArea
            ? `${Math.round(area / 2 - w)} cm`
            : `${Math.round(perimeter / w)} cm`,
          misconception: "perimeter_area_confusion",
        },
        { value: `${h + 2} cm`, misconception: "off_by_one" },
        { value: `${Math.max(1, h - 1)} cm`, misconception: "off_by_one" },
        { value: `${h + 5} cm`, misconception: "distractor_plausible" },
      ],
      explanation: fromArea
        ? `Area is width × height, so height = ${area} ÷ ${w} = ${h} cm.`
        : `Perimeter is 2 × (width + height), so width + height = ${perimeter} ÷ 2 = ${perimeter / 2}, and height = ${perimeter / 2} − ${w} = ${h} cm.`,
      hints: [
        fromArea ? "Area = width × height." : "Perimeter = 2 × (width + height).",
        "Undo the formula to find the side you want.",
      ],
      difficulty: fromArea ? 1200 : 1230,
    };
  },
});

/** MA.4.GR.2.2 — Same perimeter, different area. */
export const g4SamePerimeter = mcGenerator({
  key: "g4.gr.samePerimeter",
  benchmark: "MA.4.GR.2.2",
  skillSlug: "same-perimeter-different-area",
  skillTitle: "Rectangles with the same perimeter",
  build(rng) {
    const half = rng.int(8, 16);
    const w1 = rng.int(1, Math.floor(half / 2) - 1);
    const h1 = half - w1;
    let w2 = rng.int(1, Math.floor(half / 2));
    while (w2 === w1) w2 = rng.int(1, Math.floor(half / 2));
    const h2 = half - w2;

    const a1 = w1 * h1;
    const a2 = w2 * h2;
    const bigger = a1 > a2 ? `${w1} by ${h1}` : `${w2} by ${h2}`;

    return {
      stem: `Both rectangles have a perimeter of **${half * 2} cm**: one is **${w1} by ${h1}**, the other **${w2} by ${h2}**. Which has the **greater area**?`,
      audioText: `Two rectangles both have perimeter ${half * 2}. One is ${w1} by ${h1}, the other ${w2} by ${h2}. Which has the greater area?`,
      correct: bigger,
      distractors: [
        {
          value: a1 > a2 ? `${w2} by ${h2}` : `${w1} by ${h1}`,
          misconception: "compared_wrong_direction",
        },
        {
          value: "They have the same area, because the perimeters match",
          misconception: "perimeter_area_confusion",
        },
        {
          value: "There is not enough information",
          misconception: "distractor_plausible",
        },
      ],
      explanation: `${w1} × ${h1} = ${a1} cm² and ${w2} × ${h2} = ${a2} cm². Equal perimeters do not mean equal areas — the closer a rectangle is to a square, the more area it encloses.`,
      hints: [
        "Work out both areas.",
        "Perimeter measures the edge; area measures the inside.",
      ],
      difficulty: 1250,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Data
 * ------------------------------------------------------------------ */

/** MA.4.DP.1.1 — Represent data in a line plot or stem-and-leaf plot. */
export const g4LinePlot = mcGenerator({
  key: "g4.dp.linePlot",
  benchmark: "MA.4.DP.1.1",
  skillSlug: "line-plots",
  skillTitle: "Reading a line plot",
  build(rng) {
    const values = Array.from({ length: rng.int(8, 12) }, () => rng.int(1, 8));
    const target = rng.int(1, 8);
    const count = values.filter((v) => v === target).length;
    const rows = listWords(
      [...new Set(values)]
        .sort((a, b) => a - b)
        .map((v) => `${v}: ${"×".repeat(values.filter((x) => x === v).length)}`),
    );

    return {
      stem: `A line plot records how many books each child read.\n\n${rows}\n\nHow many children read exactly **${target}** books?`,
      audioText: `${rows}. How many children read exactly ${target} books?`,
      correct: String(count),
      distractors: [
        { value: String(target), misconception: "read_scale_by_ones" },
        { value: String(values.length), misconception: "used_part_not_whole" },
        { value: String(count + 1), misconception: "off_by_one" },
        { value: String(Math.max(0, count - 1)), misconception: "off_by_one" },
      ],
      explanation: `Count the marks above ${target}: there ${count === 1 ? "is 1" : `are ${count}`}. The number on the line is the value, and the marks above it are how many children.`,
      hints: [
        "Find the value on the line first.",
        "The marks above it are the count.",
      ],
      difficulty: 1080,
      fallback: nearbyNumbers(count, { min: 0, max: 15 }),
    };
  },
});

/** MA.4.DP.1.2 — Mode, median and range. */
export const g4ModeMedianRange = mcGenerator({
  key: "g4.dp.modeMedianRange",
  benchmark: "MA.4.DP.1.2",
  skillSlug: "mode-median-range",
  skillTitle: "Mode, median and range",
  build(rng, ctx) {
    // An odd count and one clear repeat, so median and mode are both defined.
    const size = rng.pick([5, 7, 9] as const);
    const base = Array.from({ length: size - 1 }, () => rng.int(2, 30));
    const repeated = rng.pick(base);
    const values = [...base, repeated];
    const sorted = [...values].sort((a, b) => a - b);

    const want = rng.pick(
      ctx.difficulty === "easy"
        ? (["range", "mode"] as const)
        : (["range", "mode", "median"] as const),
    );
    const m = mode(values);
    if (want === "mode" && m === null) {
      // Fall back to range rather than ask for a mode that does not exist.
      return rangeItem(sorted, values);
    }

    const answer =
      want === "range" ? range(values) : want === "mode" ? m! : median(values);

    return {
      stem: `Find the **${want}** of this data set:\n\n**${sorted.join(", ")}**`,
      audioText: `Find the ${want} of ${sorted.join(", ")}.`,
      correct: String(answer),
      distractors: [
        {
          value: String(want === "median" ? m ?? sorted[0] : median(values)),
          misconception: "mean_median_confusion",
        },
        {
          value: String(Math.max(...values) + Math.min(...values)),
          misconception: "range_as_sum",
        },
        { value: String(Math.max(...values)), misconception: "used_part_not_whole" },
        { value: String(answer + 1), misconception: "off_by_one" },
      ],
      explanation:
        want === "range"
          ? `Range is the largest minus the smallest: ${Math.max(...values)} − ${Math.min(...values)} = ${range(values)}.`
          : want === "mode"
            ? `The mode is the value that appears most often. ${m} appears ${values.filter((v) => v === m).length} times.`
            : `The median is the middle value once the data is in order. With ${size} values, that is the ${(size + 1) / 2}th: ${median(values)}.`,
      hints: [
        "Put the numbers in order first.",
        want === "range"
          ? "Range is a distance, not a total."
          : want === "mode"
            ? "Mode is the most common value."
            : "Median is the one in the middle.",
      ],
      difficulty: want === "median" ? 1170 : 1090,
      fallback: nearbyNumbers(answer, { min: 0, max: 60 }),
    };
  },
});

/** Used when a randomly drawn data set turns out to have no single mode. */
function rangeItem(sorted: number[], values: number[]) {
  return {
    stem: `Find the **range** of this data set:\n\n**${sorted.join(", ")}**`,
    audioText: `Find the range of ${sorted.join(", ")}.`,
    correct: String(range(values)),
    distractors: [
      {
        value: String(Math.max(...values) + Math.min(...values)),
        misconception: "range_as_sum" as const,
      },
      { value: String(Math.max(...values)), misconception: "used_part_not_whole" as const },
      { value: String(median(values)), misconception: "mean_median_confusion" as const },
      { value: String(range(values) + 1), misconception: "off_by_one" as const },
    ],
    explanation: `Range is the largest minus the smallest: ${Math.max(...values)} − ${Math.min(...values)} = ${range(values)}.`,
    hints: ["Find the biggest and the smallest.", "Range is a difference."],
    difficulty: 1090,
    fallback: nearbyNumbers(range(values), { min: 0, max: 60 }),
  };
}

/** MA.4.DP.1.3 — Real-world problems from numerical data. */
export const g4DataProblem = mcGenerator({
  key: "g4.dp.dataProblem",
  benchmark: "MA.4.DP.1.3",
  skillSlug: "data-problems-g4",
  skillTitle: "Solving problems from data",
  build(rng) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const values = days.map(() => rng.int(12, 68));
    const total = values.reduce((a, b) => a + b, 0);
    const maxIdx = values.indexOf(Math.max(...values));
    const rows = listWords(days.map((d, i) => `${d} ${values[i]}`));

    const askAverage = rng.bool();
    const avg = Math.round(total / days.length);

    return {
      stem: `Rainfall in millimetres was recorded each day: ${rows}.\n\n${askAverage ? "What was the **total** rainfall for the week?" : `How much **more** rain fell on ${days[maxIdx]} than on the driest day?`}`,
      audioText: `${rows}. ${askAverage ? "What was the total for the week?" : `How much more fell on ${days[maxIdx]} than on the driest day?`}`,
      correct: String(askAverage ? total : Math.max(...values) - Math.min(...values)),
      distractors: askAverage
        ? [
            { value: String(avg), misconception: "mean_median_confusion" },
            { value: String(Math.max(...values)), misconception: "used_part_not_whole" },
            { value: String(total - Math.min(...values)), misconception: "used_part_not_whole" },
            { value: String(total + 10), misconception: "off_by_one" },
          ]
        : [
            { value: String(Math.max(...values)), misconception: "used_part_not_whole" },
            {
              value: String(Math.max(...values) + Math.min(...values)),
              misconception: "range_as_sum",
            },
            { value: String(total), misconception: "used_part_not_whole" },
            {
              value: String(Math.max(...values) - Math.min(...values) + 1),
              misconception: "off_by_one",
            },
          ],
      explanation: askAverage
        ? `${values.join(" + ")} = ${total} mm.`
        : `${Math.max(...values)} − ${Math.min(...values)} = ${Math.max(...values) - Math.min(...values)} mm.`,
      hints: [
        askAverage ? "Add every day." : `"How much more" means subtract.`,
        "Check you used the right two values.",
      ],
      difficulty: 1120,
      fallback: nearbyNumbers(
        askAverage ? total : Math.max(...values) - Math.min(...values),
        { min: 0 },
      ),
    };
  },
});
