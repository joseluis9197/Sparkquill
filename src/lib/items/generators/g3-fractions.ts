import { mcGenerator } from "../build";
import { fractionRaw, fractionToWords } from "../numbers";

/**
 * Grade 3, Fractional Reasoning.
 *
 * The single most valuable distractor in the whole platform lives here: the
 * child who says 1/8 is bigger than 1/4 because 8 is bigger than 4. It is not
 * carelessness — it is whole-number thinking applied to a new kind of number,
 * and every generator in this file offers it as an option so the engine can
 * see it and teach against it.
 */

const DENOMINATORS = {
  easy: [2, 3, 4],
  core: [2, 3, 4, 6, 8],
  stretch: [2, 3, 4, 5, 6, 8, 10, 12],
} as const;

const SHAPES = ["circle", "rectangle", "strip"] as const;

/** MA.3.FR.1.1 — Represent and interpret unit fractions. */
export const g3UnitFraction = mcGenerator({
  key: "g3.fr.unitFraction",
  benchmark: "MA.3.FR.1.1",
  skillSlug: "unit-fractions",
  skillTitle: "Understanding unit fractions",
  build(rng, ctx) {
    const d = rng.pick(DENOMINATORS[ctx.difficulty]);
    const shape = rng.pick(SHAPES);

    return {
      stem: `A ${shape} is cut into **${d} equal parts**. What fraction is **one** of those parts?`,
      audioText: `A ${shape} is cut into ${d} equal parts. What fraction is one of those parts?`,
      correct: `1/${d}`,
      distractors: [
        { value: `${d}/1`, misconception: "numerator_denominator_swap" },
        { value: `${d - 1}/${d}`, misconception: "used_part_not_whole" },
        { value: `1/${d - 1}`, misconception: "off_by_one" },
        { value: `${d}/${d}`, misconception: "used_numerator_only" },
      ],
      explanation: `The whole is split into ${d} equal parts, so the bottom number is ${d}. One part is 1/${d}, read "${fractionToWords({ n: 1, d })}".`,
      hints: [
        "The bottom number counts the equal parts in the whole.",
        "The top number counts how many you have.",
      ],
      difficulty: 990,
      widget: {
        key: "fraction-bar",
        config: { denominator: d, shaded: 1, shape },
      },
    };
  },
});

/** MA.3.FR.1.2 — A fraction as a unit fraction repeated. */
export const g3RepeatedUnit = mcGenerator({
  key: "g3.fr.repeatedUnit",
  benchmark: "MA.3.FR.1.2",
  skillSlug: "fractions-as-repeated-units",
  skillTitle: "Building a fraction from unit fractions",
  build(rng, ctx) {
    const d = rng.pick(DENOMINATORS[ctx.difficulty]);
    const n = rng.int(2, Math.max(2, d - 1));

    const askCount = rng.bool();
    if (askCount) {
      return {
        stem: `How many **1/${d}** pieces make **${n}/${d}**?`,
        audioText: `How many one ${d === 2 ? "half" : "over " + d} pieces make ${fractionToWords({ n, d })}?`,
        correct: String(n),
        distractors: [
          { value: String(d), misconception: "numerator_denominator_swap" },
          { value: String(d - n), misconception: "used_part_not_whole" },
          { value: String(n * d), misconception: "wrong_operation" },
          { value: String(n + 1), misconception: "off_by_one" },
        ],
        explanation: `${n}/${d} means ${n} pieces, each one 1/${d}. So it takes ${n} of them.`,
        hints: [
          "The top number counts the pieces.",
          `Count 1/${d} at a time until you reach ${n}/${d}.`,
        ],
        difficulty: 1010,
        widget: { key: "fraction-bar", config: { denominator: d, shaded: n } },
      };
    }

    return {
      stem: `Which fraction is the same as **${Array.from({ length: n }, () => `1/${d}`).join(" + ")}**?`,
      audioText: `Which fraction equals ${n} lots of one over ${d}?`,
      correct: `${n}/${d}`,
      distractors: [
        { value: `${n}/${d * n}`, misconception: "added_denominators" },
        { value: `${d}/${n}`, misconception: "numerator_denominator_swap" },
        { value: `${n * n}/${d}`, misconception: "wrong_operation" },
        { value: `${n + 1}/${d}`, misconception: "off_by_one" },
      ],
      explanation: `Adding ${n} pieces of size 1/${d} gives ${n} of them: ${n}/${d}. The size of each piece does not change, so the bottom number stays ${d}.`,
      hints: [
        "The pieces are all the same size.",
        "Only the count of pieces changes.",
      ],
      difficulty: 1080,
    };
  },
});

/** MA.3.FR.1.3 — Read and write fractions in word form. */
export const g3FractionWords = mcGenerator({
  key: "g3.fr.fractionWords",
  benchmark: "MA.3.FR.1.3",
  skillSlug: "fraction-word-form",
  skillTitle: "Saying and writing fractions",
  build(rng, ctx) {
    const d = rng.pick([2, 3, 4, 5, 6, 8, 10, 12].slice(0, ctx.difficulty === "easy" ? 4 : 8));
    const n = rng.int(1, d - 1);

    return {
      stem: `Which fraction is **${fractionToWords({ n, d })}**?`,
      audioText: `Which fraction is ${fractionToWords({ n, d })}?`,
      correct: `${n}/${d}`,
      distractors: [
        { value: `${d}/${n}`, misconception: "numerator_denominator_swap" },
        { value: `${n}/${n + d}`, misconception: "added_denominators" },
        { value: `${n + 1}/${d}`, misconception: "off_by_one" },
        { value: `${n}/${d + 1}`, misconception: "off_by_one" },
      ],
      explanation: `"${fractionToWords({ n, d })}" means ${n} piece${n === 1 ? "" : "s"} out of ${d}, written ${n}/${d}. The word at the end names the size of the piece.`,
      hints: [
        "The last word tells you the bottom number.",
        "The first word tells you how many.",
      ],
      difficulty: 1000,
    };
  },
});

/** MA.3.FR.2.1 — Compare fractions with the same numerator or denominator. */
export const g3CompareFractions = mcGenerator({
  key: "g3.fr.compareFractions",
  benchmark: "MA.3.FR.2.1",
  skillSlug: "compare-fractions",
  skillTitle: "Comparing fractions",
  build(rng, ctx) {
    // Same-numerator comparisons are where the misconception lives, so they
    // are the majority once the child is past the easy band.
    const sameNumerator = ctx.difficulty === "easy" ? rng.bool() : rng.bool(0.7);
    const pool = DENOMINATORS[ctx.difficulty];

    let a: { n: number; d: number };
    let b: { n: number; d: number };

    if (sameNumerator) {
      const n = rng.int(1, 3);
      const [d1, d2] = rng.shuffle([...pool]).slice(0, 2).sort((x, y) => x - y);
      a = { n, d: Math.max(d1, n + 1) };
      b = { n, d: Math.max(d2, n + 1) };
      if (a.d === b.d) b = { n, d: a.d + 2 };
    } else {
      const d = rng.pick(pool.filter((x) => x >= 4));
      const n1 = rng.int(1, d - 2);
      a = { n: n1, d };
      b = { n: rng.int(n1 + 1, d - 1), d };
    }

    const aVal = a.n / a.d;
    const bVal = b.n / b.d;
    const bigger = aVal > bVal ? a : b;
    const smaller = aVal > bVal ? b : a;
    const wantLarger = rng.bool();
    const answer = wantLarger ? bigger : smaller;
    const other = wantLarger ? smaller : bigger;

    return {
      stem: `Which fraction is **${wantLarger ? "greater" : "less"}**: ${fractionRaw(a)} or ${fractionRaw(b)}?`,
      audioText: `Which is ${wantLarger ? "greater" : "less"}, ${fractionToWords(a)} or ${fractionToWords(b)}?`,
      correct: fractionRaw(answer),
      distractors: [
        {
          value: fractionRaw(other),
          misconception: sameNumerator
            ? "compared_denominators_only"
            : "compared_wrong_direction",
        },
        { value: "They are equal", misconception: "distractor_plausible" },
        {
          value: fractionRaw({ n: answer.d, d: answer.n }),
          misconception: "numerator_denominator_swap",
        },
        {
          value: fractionRaw({ n: answer.n + 1, d: answer.d }),
          misconception: "off_by_one",
        },
      ],
      explanation: sameNumerator
        ? `Both have ${a.n} piece${a.n === 1 ? "" : "s"}, but the pieces are not the same size. Cutting a whole into ${Math.max(a.d, b.d)} parts makes smaller pieces than cutting it into ${Math.min(a.d, b.d)}, so ${fractionRaw(bigger)} is the greater fraction. A bigger bottom number means smaller pieces.`
        : `The pieces are the same size, so the one with more of them is greater: ${fractionRaw(bigger)} > ${fractionRaw(smaller)}.`,
      hints: [
        sameNumerator
          ? "Same number of pieces — but are the pieces the same size?"
          : "Same size pieces — so just count them.",
        "More cuts make each piece smaller.",
      ],
      difficulty: sameNumerator ? 1130 : 1020,
      widget: {
        key: "fraction-bar",
        config: { compare: [a, b] },
      },
    };
  },
});

/** MA.3.FR.2.2 — Identify equivalent fractions. */
export const g3EquivalentFractions = mcGenerator({
  key: "g3.fr.equivalent",
  benchmark: "MA.3.FR.2.2",
  skillSlug: "equivalent-fractions-g3",
  skillTitle: "Equivalent fractions",
  build(rng, ctx) {
    const base = rng.pick([
      { n: 1, d: 2 },
      { n: 1, d: 3 },
      { n: 1, d: 4 },
      { n: 2, d: 3 },
      { n: 3, d: 4 },
      { n: 2, d: 5 },
    ]);
    const k = rng.int(2, ctx.difficulty === "easy" ? 2 : 4);
    const equal = { n: base.n * k, d: base.d * k };

    return {
      stem: `Which fraction is equal to **${fractionRaw(base)}**?`,
      audioText: `Which fraction is equal to ${fractionToWords(base)}?`,
      correct: fractionRaw(equal),
      distractors: [
        {
          // Multiplied only the bottom, which changes the value.
          value: `${base.n}/${base.d * k}`,
          misconception: "ignored_common_denominator",
        },
        {
          // Added the same number to both instead of multiplying.
          value: `${base.n + k}/${base.d + k}`,
          misconception: "added_denominators",
        },
        {
          value: `${base.n * k}/${base.d}`,
          misconception: "used_numerator_only",
        },
        {
          value: `${equal.n + 1}/${equal.d}`,
          misconception: "off_by_one",
        },
      ],
      explanation: `Multiplying the top and the bottom by the same number cuts every piece into ${k}, so you have ${k} times as many pieces of ${k} times the size — the same amount. ${fractionRaw(base)} = ${fractionRaw(equal)}.`,
      hints: [
        "Whatever you do to the top, do to the bottom.",
        "Adding to both does not keep the value the same; multiplying does.",
      ],
      difficulty: 1100,
      widget: {
        key: "fraction-bar",
        config: { compare: [base, equal] },
      },
    };
  },
});
