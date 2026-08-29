import { mcGenerator, nearbyNumbers } from "../build";
import {
  decimalText,
  fractionRaw,
  fractionText,
  fractionToWords,
  gcd,
  lcm,
  primeFactors,
  round,
  simplify,
} from "../numbers";

/**
 * Grade 6, Number Sense and Operations.
 *
 * Negative numbers arrive, and with them the two errors that follow students
 * into algebra: treating −8 as smaller than −2 because 8 is bigger, and
 * treating |−5| as −5. Both are offered here every time, so the engine can
 * tell a slip apart from a belief.
 */

const COMMA = (n: number) => n.toLocaleString("en-US");

/** MA.6.NSO.1.1 — Plot, order and compare rational numbers. */
export const g6CompareRational = mcGenerator({
  key: "g6.nso.compareRational",
  benchmark: "MA.6.NSO.1.1",
  skillSlug: "compare-rational-numbers",
  skillTitle: "Comparing positive and negative numbers",
  build(rng, ctx) {
    // Two negatives, so the ordering cannot be read off the digits.
    const bothNegative = ctx.difficulty !== "easy" && rng.bool(0.6);
    const m = rng.int(2, 19);
    let n = rng.int(2, 19);
    while (n === m) n = rng.int(2, 19);

    const a = bothNegative ? -m : rng.bool() ? m : -m;
    const b = bothNegative ? -n : rng.bool() ? n : -n;
    const bigger = Math.max(a, b);
    const smaller = Math.min(a, b);
    const wantLarger = rng.bool();

    return {
      stem: `Which is **${wantLarger ? "greater" : "less"}**: ${a} or ${b}?`,
      audioText: `Which is ${wantLarger ? "greater" : "less"}, ${a < 0 ? `negative ${-a}` : a} or ${b < 0 ? `negative ${-b}` : b}?`,
      correct: String(wantLarger ? bigger : smaller),
      distractors: [
        {
          value: String(wantLarger ? smaller : bigger),
          misconception: bothNegative ? "absolute_value_kept_sign" : "compared_wrong_direction",
        },
        { value: String(Math.abs(bigger)), misconception: "absolute_value_kept_sign" },
        { value: "They are equal", misconception: "distractor_plausible" },
        { value: String(bigger + 1), misconception: "off_by_one" },
      ],
      explanation: bothNegative
        ? `On a number line, ${bigger} sits to the right of ${smaller}, so ${bigger} is the greater. With negatives the bigger digit means the smaller number: −${Math.abs(smaller)} is further from zero, and further left.`
        : `${bigger} is to the right of ${smaller} on the number line, so it is greater. Every positive number beats every negative one.`,
      hints: [
        "Picture a number line and see which is further right.",
        "For negatives, further from zero means smaller.",
      ],
      difficulty: bothNegative ? 1290 : 1140,
    };
  },
});

/** MA.6.NSO.1.2 — Quantities with opposite direction. */
export const g6Opposites = mcGenerator({
  key: "g6.nso.opposites",
  benchmark: "MA.6.NSO.1.2",
  skillSlug: "signed-quantities",
  skillTitle: "Using positive and negative for direction",
  build(rng) {
    const cases = [
      { q: "a deposit of $40 into an account", a: "+40", w: ["−40", "0", "40 below zero"] },
      { q: "a withdrawal of $25 from an account", a: "−25", w: ["+25", "0", "25 above zero"] },
      { q: "a temperature 12 degrees below zero", a: "−12", w: ["+12", "12", "0"] },
      { q: "a submarine 300 metres below sea level", a: "−300", w: ["+300", "300", "0"] },
      { q: "a plane flying 9,000 metres above sea level", a: "+9,000", w: ["−9,000", "0", "9,000 below zero"] },
      { q: "losing 15 points in a game", a: "−15", w: ["+15", "15", "0"] },
    ] as const;
    const c = rng.pick(cases);

    return {
      stem: `Which number represents **${c.q}**?`,
      audioText: `Which number represents ${c.q}?`,
      correct: c.a,
      distractors: c.w.map((w) => ({ value: w, misconception: "sign_error" as const })),
      explanation: `Zero is the reference point. ${c.q[0].toUpperCase()}${c.q.slice(1)} goes ${c.a.startsWith("−") ? "below or away from" : "above or towards"} it, so it is written ${c.a}.`,
      hints: [
        "What counts as zero here?",
        "Which direction moves away from zero?",
      ],
      difficulty: 1110,
    };
  },
});

/** MA.6.NSO.1.3 — Absolute value as distance from zero. */
export const g6AbsoluteValue = mcGenerator({
  key: "g6.nso.absoluteValue",
  benchmark: "MA.6.NSO.1.3",
  skillSlug: "absolute-value",
  skillTitle: "Absolute value",
  build(rng) {
    const n = rng.int(2, 30);
    const negative = rng.bool();
    const value = negative ? -n : n;

    return {
      stem: `What is **|${value}|**?`,
      audioText: `What is the absolute value of ${value < 0 ? `negative ${n}` : n}?`,
      correct: String(n),
      distractors: [
        {
          // Kept the minus sign — the definitive misconception here.
          value: String(-n),
          misconception: "absolute_value_kept_sign",
        },
        { value: "0", misconception: "distractor_plausible" },
        { value: String(n * 2), misconception: "distractor_plausible" },
        { value: String(n + 1), misconception: "off_by_one" },
      ],
      explanation: `Absolute value is distance from zero, and a distance is never negative. ${value} is ${n} away from zero, so |${value}| = ${n}.`,
      hints: [
        "How far is it from zero?",
        "Distance has no direction, so it has no sign.",
      ],
      difficulty: 1130,
    };
  },
});

/** MA.6.NSO.1.4 — Problems with absolute value. */
export const g6AbsoluteProblem = mcGenerator({
  key: "g6.nso.absoluteProblem",
  benchmark: "MA.6.NSO.1.4",
  skillSlug: "absolute-value-problems",
  skillTitle: "Using absolute value to compare",
  build(rng) {
    const a = -rng.int(5, 40);
    const b = -rng.int(5, 40);
    if (a === b) return g6AbsoluteFallback(a);

    const deeper = Math.min(a, b);
    const greater = Math.max(a, b);

    return {
      stem: `Two divers are at **${a} m** and **${b} m** relative to sea level. Which diver is **deeper**?`,
      audioText: `Two divers are at ${a} and ${b} metres. Which is deeper?`,
      correct: `The one at ${deeper} m`,
      distractors: [
        {
          // Deeper means smaller, but a bigger absolute value.
          value: `The one at ${greater} m`,
          misconception: "absolute_value_kept_sign",
        },
        { value: "They are at the same depth", misconception: "distractor_plausible" },
        {
          value: `Neither — depth cannot be negative`,
          misconception: "sign_error",
        },
      ],
      explanation: `Depth is distance below the surface, which is the absolute value: |${a}| = ${Math.abs(a)} and |${b}| = ${Math.abs(b)}. The larger distance is the deeper diver, at ${deeper} m — even though ${deeper} is the *smaller* number.`,
      hints: [
        "Depth is a distance, so use absolute value.",
        "A more negative position is deeper, not higher.",
      ],
      difficulty: 1270,
    };
  },
});

/** Used when the two randomly drawn depths come out equal. */
function g6AbsoluteFallback(a: number) {
  return {
    stem: `A diver is at **${a} m** relative to sea level. How deep is the diver?`,
    audioText: `A diver is at ${a} metres relative to sea level. How deep?`,
    correct: `${Math.abs(a)} m`,
    distractors: [
      { value: `${a} m`, misconception: "absolute_value_kept_sign" as const },
      { value: "0 m", misconception: "distractor_plausible" as const },
      { value: `${Math.abs(a) * 2} m`, misconception: "distractor_plausible" as const },
      { value: `${Math.abs(a) + 1} m`, misconception: "off_by_one" as const },
    ],
    explanation: `Depth is the distance from the surface: |${a}| = ${Math.abs(a)} m.`,
    hints: ["Depth is a distance.", "Distances are never negative."],
    difficulty: 1180,
  };
}

/** MA.6.NSO.2.1 — Multiply and divide positive decimals. */
export const g6DecimalMulDiv = mcGenerator({
  key: "g6.nso.decimalMulDiv",
  benchmark: "MA.6.NSO.2.1",
  skillSlug: "multiply-divide-decimals",
  skillTitle: "Multiplying and dividing decimals",
  build(rng) {
    const multiply = rng.bool();
    const a = round(rng.int(120, 890) / 100, 2);
    const b = round(rng.int(15, 90) / 10, 1);

    if (multiply) {
      const product = round(a * b, 3);
      return {
        stem: `**${decimalText(a, 2)} × ${decimalText(b, 1)} = ?**`,
        audioText: `${decimalText(a, 2)} times ${decimalText(b, 1)}.`,
        correct: decimalText(product, 3),
        distractors: [
          {
            // Right digits, point in the wrong place.
            value: decimalText(round(product * 10, 3), 3),
            misconception: "decimal_point_misplaced",
          },
          {
            value: decimalText(round(product / 10, 4), 4),
            misconception: "decimal_point_misplaced",
          },
          {
            value: decimalText(round(a + b, 2), 2),
            misconception: "added_instead_of_multiplied",
          },
          {
            value: decimalText(round(product + 0.1, 3), 3),
            misconception: "off_by_one",
          },
        ],
        explanation: `Multiply as whole numbers, then count the decimal places: ${a * 100} × ${b * 10} = ${a * 100 * b * 10}, and 2 + 1 = 3 places, giving ${decimalText(product, 3)}.`,
        hints: [
          "Ignore the points, multiply, then put the point back.",
          "The answer has as many decimal places as both factors together.",
        ],
        difficulty: 1290,
      };
    }

    const divisor = round(rng.int(2, 25) / 10, 1);
    const quotient = rng.int(3, 40);
    const dividend = round(divisor * quotient, 2);

    return {
      stem: `**${decimalText(dividend, 2)} ÷ ${decimalText(divisor, 1)} = ?**`,
      audioText: `${decimalText(dividend, 2)} divided by ${decimalText(divisor, 1)}.`,
      correct: String(quotient),
      distractors: [
        {
          value: decimalText(round(quotient / 10, 2), 2),
          misconception: "decimal_point_misplaced",
        },
        { value: String(quotient * 10), misconception: "decimal_point_misplaced" },
        {
          value: decimalText(round(dividend * divisor, 2), 2),
          misconception: "multiplied_instead_of_divided",
        },
        { value: String(quotient + 1), misconception: "off_by_one_factor" },
      ],
      explanation: `Move both points the same number of places to make the divisor whole: ${decimalText(dividend, 2)} ÷ ${decimalText(divisor, 1)} becomes ${decimalText(round(dividend * 10, 1), 1)} ÷ ${divisor * 10} = ${quotient}.`,
      hints: [
        "Make the divisor a whole number first.",
        "Move the point the same way in both numbers.",
      ],
      difficulty: 1300,
      fallback: nearbyNumbers(quotient, { min: 1 }),
    };
  },
});

/** MA.6.NSO.2.2 — Multiply and divide fractions. */
export const g6FractionMulDiv = mcGenerator({
  key: "g6.nso.fractionMulDiv",
  benchmark: "MA.6.NSO.2.2",
  skillSlug: "multiply-divide-fractions",
  skillTitle: "Multiplying and dividing fractions",
  build(rng) {
    const a = { n: rng.int(1, 7), d: rng.pick([2, 3, 4, 5, 6, 8]) };
    const b = { n: rng.int(1, 7), d: rng.pick([2, 3, 4, 5, 6, 8]) };
    const multiply = rng.bool();

    const product = { n: a.n * b.n, d: a.d * b.d };
    const quotient = { n: a.n * b.d, d: a.d * b.n };
    const result = multiply ? product : quotient;

    return {
      stem: `**${fractionRaw(a)} ${multiply ? "×" : "÷"} ${fractionRaw(b)} = ?**`,
      audioText: `${fractionToWords(a)} ${multiply ? "times" : "divided by"} ${fractionToWords(b)}.`,
      correct: fractionText(simplify(result), true),
      distractors: [
        {
          // Multiplied straight across when they should have flipped, or the
          // reverse — the single defining error of this benchmark.
          value: fractionText(simplify(multiply ? quotient : product), true),
          misconception: multiply ? "numerator_denominator_swap" : "multiplied_instead_of_divided",
        },
        {
          value: `${a.n * b.n}/${a.d + b.d}`,
          misconception: "added_denominators",
        },
        {
          value: fractionText(simplify({ n: result.n + 1, d: result.d }), true),
          misconception: "off_by_one",
        },
        {
          value: `${a.n + b.n}/${a.d + b.d}`,
          misconception: "added_instead_of_multiplied",
        },
        {
          value: fractionText(simplify({ n: result.n, d: result.d + 1 }), true),
          misconception: "off_by_one",
        },
        {
          value: fractionRaw(result),
          misconception: "distractor_plausible",
        },
      ],
      explanation: multiply
        ? `Multiply tops and bottoms: ${a.n} × ${b.n} over ${a.d} × ${b.d} = ${fractionRaw(product)}${simplify(product).d !== product.d ? `, which simplifies to ${fractionText(simplify(product), true)}` : ""}.`
        : `Dividing by ${fractionRaw(b)} is multiplying by its reciprocal ${fractionRaw({ n: b.d, d: b.n })}: ${fractionRaw(a)} × ${fractionRaw({ n: b.d, d: b.n })} = ${fractionText(simplify(quotient), true)}.`,
      hints: [
        multiply ? "Straight across: tops together, bottoms together." : "Flip the second fraction, then multiply.",
        "Simplify at the end.",
      ],
      difficulty: multiply ? 1240 : 1320,
    };
  },
});

/** MA.6.NSO.2.3 — Multi-step problems with decimals or fractions. */
export const g6MixedProblem = mcGenerator({
  key: "g6.nso.mixedProblem",
  benchmark: "MA.6.NSO.2.3",
  skillSlug: "multi-step-rational-problems",
  skillTitle: "Multi-step problems with decimals and fractions",
  build(rng) {
    const price = round(rng.int(250, 1850) / 100, 2);
    const count = rng.int(3, 9);
    const fraction = { n: 1, d: rng.pick([2, 3, 4]) };
    const subtotal = round(price * count, 2);
    const discount = round(subtotal * (fraction.n / fraction.d), 2);
    const total = round(subtotal - discount, 2);

    return {
      stem: `${count} tickets cost **$${decimalText(price, 2)}** each. A group booking takes **${fractionRaw(fraction)} off** the total. What is the final price?`,
      audioText: `${count} tickets at ${decimalText(price, 2)} dollars each, with ${fractionToWords(fraction)} off the total. What is the final price?`,
      correct: `$${decimalText(total, 2)}`,
      distractors: [
        { value: `$${decimalText(subtotal, 2)}`, misconception: "used_part_not_whole" },
        { value: `$${decimalText(discount, 2)}`, misconception: "used_part_not_whole" },
        {
          value: `$${decimalText(round(subtotal + discount, 2), 2)}`,
          misconception: "wrong_operation",
        },
        {
          value: `$${decimalText(round(price - price * (fraction.n / fraction.d), 2), 2)}`,
          misconception: "order_of_operations",
        },
      ],
      explanation: `${count} × $${decimalText(price, 2)} = $${decimalText(subtotal, 2)}. The discount is ${fractionRaw(fraction)} of that: $${decimalText(discount, 2)}. Taking it off leaves $${decimalText(total, 2)}.`,
      hints: [
        "Find the full total before the discount.",
        `"Off" means subtract what you worked out.`,
      ],
      difficulty: 1330,
    };
  },
});

/** MA.6.NSO.3.1 — Greatest common factor and least common multiple. */
export const g6GcfLcm = mcGenerator({
  key: "g6.nso.gcfLcm",
  benchmark: "MA.6.NSO.3.1",
  skillSlug: "gcf-and-lcm",
  skillTitle: "Greatest common factor and least common multiple",
  build(rng, ctx) {
    const a = rng.int(6, ctx.difficulty === "easy" ? 24 : 48);
    let b = rng.int(6, 48);
    while (b === a) b = rng.int(6, 48);
    const wantGcf = rng.bool();
    const g = gcd(a, b);
    const l = lcm(a, b);

    return {
      stem: `What is the **${wantGcf ? "greatest common factor" : "least common multiple"}** of ${a} and ${b}?`,
      audioText: `What is the ${wantGcf ? "greatest common factor" : "least common multiple"} of ${a} and ${b}?`,
      correct: String(wantGcf ? g : l),
      distractors: [
        { value: String(wantGcf ? l : g), misconception: "gcf_lcm_swap" },
        { value: String(a * b), misconception: "multiplied_instead_of_divided" },
        { value: String(a + b), misconception: "added_instead_of_multiplied" },
        { value: String(Math.min(a, b)), misconception: "used_part_not_whole" },
      ],
      explanation: wantGcf
        ? `${a} = ${primeFactors(a).join(" × ")} and ${b} = ${primeFactors(b).join(" × ")}. The factors they share multiply to ${g}, so the GCF is ${g} — the biggest number that divides both.`
        : `The LCM is the first number both divide into: ${a} × ${b} ÷ ${g} = ${l}. It is always at least as big as the larger number.`,
      hints: [
        wantGcf ? "The GCF is never bigger than either number." : "The LCM is never smaller than either number.",
        "Break both numbers into primes.",
      ],
      difficulty: 1250,
      fallback: nearbyNumbers(wantGcf ? g : l, { min: 1 }),
    };
  },
});

/** MA.6.NSO.3.2 — Rewrite a sum using a common factor. */
export const g6FactorSum = mcGenerator({
  key: "g6.nso.factorSum",
  benchmark: "MA.6.NSO.3.2",
  skillSlug: "factor-out-common-factor",
  skillTitle: "Taking a common factor out of a sum",
  build(rng) {
    const g = rng.pick([2, 3, 4, 5, 6] as const);
    const p = rng.int(2, 12);
    const q = rng.int(2, 12);
    const a = g * p;
    const b = g * q;

    return {
      stem: `Rewrite **${a} + ${b}** as a common factor times a sum.`,
      audioText: `Rewrite ${a} plus ${b} as a common factor times a sum.`,
      correct: `${g} × (${p} + ${q})`,
      distractors: [
        { value: `${g} × (${a} + ${b})`, misconception: "used_part_not_whole" },
        { value: `${g} + (${p} × ${q})`, misconception: "wrong_operation" },
        { value: `${p} × (${g} + ${q})`, misconception: "distractor_plausible" },
        { value: `${g * g} × (${p} + ${q})`, misconception: "off_by_one_factor" },
      ],
      explanation: `${g} divides both: ${a} = ${g} × ${p} and ${b} = ${g} × ${q}. So ${a} + ${b} = ${g} × (${p} + ${q}) = ${g} × ${p + q} = ${a + b}.`,
      hints: [
        "Find a number that divides both.",
        "Divide each term by it; what is left goes inside the bracket.",
      ],
      difficulty: 1280,
    };
  },
});

/** MA.6.NSO.3.3 — Evaluate exponents. */
export const g6Exponents = mcGenerator({
  key: "g6.nso.exponents",
  benchmark: "MA.6.NSO.3.3",
  skillSlug: "exponents",
  skillTitle: "Working out powers",
  build(rng, ctx) {
    const base = rng.int(2, ctx.difficulty === "easy" ? 5 : 9);
    const exp = rng.int(2, base <= 3 ? 5 : 3);
    const value = base ** exp;

    return {
      stem: `What is **${base}${["⁰", "¹", "²", "³", "⁴", "⁵"][exp]}**?`,
      audioText: `What is ${base} to the power of ${exp}?`,
      correct: COMMA(value),
      distractors: [
        {
          // The classic: 2^4 read as 2 × 4.
          value: String(base * exp),
          misconception: "exponent_as_multiplication",
        },
        { value: COMMA(base ** (exp - 1)), misconception: "off_by_one_factor" },
        { value: COMMA(base ** (exp + 1)), misconception: "off_by_one_factor" },
        { value: String(base + exp), misconception: "added_instead_of_multiplied" },
      ],
      explanation: `The exponent counts how many times the base is used as a factor: ${Array.from({ length: exp }, () => base).join(" × ")} = ${COMMA(value)}. It is not ${base} × ${exp}.`,
      hints: [
        "The small number says how many copies to multiply.",
        "It is repeated multiplication, not multiplication by the exponent.",
      ],
      difficulty: 1200,
      fallback: nearbyNumbers(value, { min: 1 }),
    };
  },
});

/** MA.6.NSO.3.4 — Prime factorisation. */
export const g6PrimeFactors = mcGenerator({
  key: "g6.nso.primeFactors",
  benchmark: "MA.6.NSO.3.4",
  skillSlug: "prime-factorisation",
  skillTitle: "Prime factorisation",
  build(rng) {
    const n = rng.pick([12, 18, 20, 24, 28, 30, 36, 40, 45, 48, 50, 54, 60, 72, 80, 84, 90, 96, 100]);
    const factors = primeFactors(n);
    const text = factors.join(" × ");

    return {
      stem: `Which is the **prime factorisation** of ${n}?`,
      audioText: `What is the prime factorisation of ${n}?`,
      correct: text,
      distractors: [
        {
          // Stopped before every factor was prime.
          value: `${factors[0]} × ${n / factors[0]}`,
          misconception: "used_part_not_whole",
        },
        {
          value: `1 × ${text}`,
          misconception: "distractor_plausible",
        },
        {
          value: [...factors.slice(0, -1), factors[factors.length - 1] + 1].join(" × "),
          misconception: "off_by_one_factor",
        },
        { value: factors.join(" + "), misconception: "added_instead_of_multiplied" },
      ],
      explanation: `Keep splitting until every factor is prime: ${n} = ${text}. 1 is never included — it is not a prime.`,
      hints: [
        "Divide by the smallest prime that fits, and repeat.",
        "Stop only when nothing left can be split.",
      ],
      difficulty: 1260,
    };
  },
});

/** MA.6.NSO.3.5 — Fraction, decimal and percent. */
export const g6FractionDecimalPercent = mcGenerator({
  key: "g6.nso.fractionDecimalPercent",
  benchmark: "MA.6.NSO.3.5",
  skillSlug: "fraction-decimal-percent",
  skillTitle: "Fractions, decimals and percentages",
  build(rng) {
    const pairs = [
      { f: { n: 1, d: 2 }, dec: 0.5, pct: 50 },
      { f: { n: 1, d: 4 }, dec: 0.25, pct: 25 },
      { f: { n: 3, d: 4 }, dec: 0.75, pct: 75 },
      { f: { n: 1, d: 5 }, dec: 0.2, pct: 20 },
      { f: { n: 2, d: 5 }, dec: 0.4, pct: 40 },
      { f: { n: 3, d: 5 }, dec: 0.6, pct: 60 },
      { f: { n: 1, d: 10 }, dec: 0.1, pct: 10 },
      { f: { n: 7, d: 10 }, dec: 0.7, pct: 70 },
      { f: { n: 1, d: 20 }, dec: 0.05, pct: 5 },
      { f: { n: 3, d: 8 }, dec: 0.375, pct: 37.5 },
    ] as const;
    const p = rng.pick(pairs);
    const wantPercent = rng.bool();

    return wantPercent
      ? {
          stem: `Write **${fractionRaw(p.f)}** as a percentage.`,
          audioText: `Write ${fractionToWords(p.f)} as a percentage.`,
          correct: `${p.pct}%`,
          distractors: [
            {
              // Shifted the point the wrong way.
              value: `${round(p.dec, 3)}%`,
              misconception: "percent_shift_wrong_way",
            },
            { value: `${p.f.n}%`, misconception: "used_numerator_only" },
            { value: `${p.f.d}%`, misconception: "numerator_denominator_swap" },
            { value: `${round(p.pct * 10, 1)}%`, misconception: "decimal_point_misplaced" },
          ],
          explanation: `${fractionRaw(p.f)} = ${p.dec} as a decimal. Percent means "out of a hundred", so multiply by 100: ${p.pct}%.`,
          hints: [
            "Turn it into a decimal first.",
            "Then move the point two places right.",
          ],
          difficulty: 1210,
        }
      : {
          stem: `Write **${p.pct}%** as a decimal.`,
          audioText: `Write ${p.pct} percent as a decimal.`,
          correct: String(p.dec),
          distractors: [
            { value: String(p.pct), misconception: "percent_shift_wrong_way" },
            { value: String(round(p.dec / 10, 4)), misconception: "decimal_point_misplaced" },
            { value: String(round(p.pct / 10, 3)), misconception: "decimal_point_misplaced" },
            { value: fractionRaw(p.f), misconception: "distractor_plausible" },
          ],
          explanation: `Percent means out of a hundred, so divide by 100: ${p.pct} ÷ 100 = ${p.dec}. That is two places to the left.`,
          hints: [
            "Per cent means per hundred.",
            "Dividing by 100 moves the point two places left.",
          ],
          difficulty: 1200,
        };
  },
});

/** MA.6.NSO.4.1 — Add and subtract integers. */
export const g6AddIntegers = mcGenerator({
  key: "g6.nso.addIntegers",
  benchmark: "MA.6.NSO.4.1",
  skillSlug: "add-subtract-integers",
  skillTitle: "Adding and subtracting negative numbers",
  build(rng, ctx) {
    const a = rng.int(-30, 30);
    const b = rng.int(-30, 30);
    // Subtracting a negative is the case that breaks people, so it appears
    // more often than chance would give it.
    const subtract = ctx.difficulty === "easy" ? false : rng.bool(0.6);
    const answer = subtract ? a - b : a + b;
    const shown = b < 0 ? `(${b})` : String(b);

    return {
      stem: `**${a} ${subtract ? "−" : "+"} ${shown} = ?**`,
      audioText: `${a < 0 ? `negative ${-a}` : a} ${subtract ? "minus" : "plus"} ${b < 0 ? `negative ${-b}` : b}.`,
      correct: String(answer),
      distractors: [
        {
          // Ignored the sign of the second number entirely.
          value: String(subtract ? a - Math.abs(b) : a + Math.abs(b)),
          misconception: "sign_error",
        },
        { value: String(subtract ? a + b : a - b), misconception: "wrong_operation" },
        { value: String(Math.abs(answer)), misconception: "absolute_value_kept_sign" },
        { value: String(answer + 1), misconception: "off_by_one" },
      ],
      explanation:
        subtract && b < 0
          ? `Subtracting a negative is the same as adding: ${a} − (${b}) = ${a} + ${-b} = ${answer}. Two minus signs together turn into a plus.`
          : `Think of moving on a number line: start at ${a} and move ${subtract ? "left" : "right"} by ${Math.abs(b)}${(subtract ? b < 0 : b < 0) ? ", but the negative flips the direction" : ""}, landing on ${answer}.`,
      hints: [
        "Picture the number line and which way you move.",
        "Two minus signs in a row make a plus.",
      ],
      difficulty: subtract ? 1300 : 1180,
      fallback: nearbyNumbers(answer, { min: -100 }),
    };
  },
});

/** MA.6.NSO.4.2 — Multiply and divide integers. */
export const g6MulIntegers = mcGenerator({
  key: "g6.nso.mulIntegers",
  benchmark: "MA.6.NSO.4.2",
  skillSlug: "multiply-divide-integers",
  skillTitle: "Multiplying and dividing negative numbers",
  build(rng) {
    const magA = rng.int(2, 12);
    const magB = rng.int(2, 12);
    const signA = rng.bool() ? 1 : -1;
    const signB = rng.bool() ? 1 : -1;
    const a = magA * signA;
    const b = magB * signB;
    const multiply = rng.bool();

    const product = a * b;
    const dividend = product;
    const answer = multiply ? product : a;

    return multiply
      ? {
          stem: `**${a < 0 ? `(${a})` : a} × ${b < 0 ? `(${b})` : b} = ?**`,
          audioText: `${a} times ${b}.`,
          correct: String(product),
          distractors: [
            { value: String(-product), misconception: "sign_error" },
            { value: String(Math.abs(product)), misconception: "absolute_value_kept_sign" },
            { value: String(a + b), misconception: "added_instead_of_multiplied" },
            { value: String(product + magA), misconception: "off_by_one_factor" },
          ],
          explanation: `${magA} × ${magB} = ${magA * magB}. The signs ${signA === signB ? "match, so the answer is positive" : "differ, so the answer is negative"}: ${product}.`,
          hints: [
            "Multiply the digits first, then decide the sign.",
            "Same signs give a positive; different signs give a negative.",
          ],
          difficulty: 1240,
          fallback: nearbyNumbers(product, { min: -200 }),
        }
      : {
          stem: `**${dividend < 0 ? `(${dividend})` : dividend} ÷ ${b < 0 ? `(${b})` : b} = ?**`,
          audioText: `${dividend} divided by ${b}.`,
          correct: String(answer),
          distractors: [
            { value: String(-answer), misconception: "sign_error" },
            { value: String(Math.abs(answer)), misconception: "absolute_value_kept_sign" },
            { value: String(b), misconception: "reversed_dividend_divisor" },
            { value: String(answer + 1), misconception: "off_by_one_factor" },
          ],
          explanation: `${Math.abs(dividend)} ÷ ${Math.abs(b)} = ${Math.abs(answer)}. The signs ${(dividend < 0) === (b < 0) ? "match, so the answer is positive" : "differ, so the answer is negative"}: ${answer}.`,
          hints: [
            "Divide the digits, then work out the sign.",
            "The sign rule is the same as for multiplying.",
          ],
          difficulty: 1250,
          fallback: nearbyNumbers(answer, { min: -200 }),
        };
  },
});
