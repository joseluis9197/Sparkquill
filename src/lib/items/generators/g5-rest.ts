import { mcGenerator, nearbyNumbers } from "../build";
import { NAMES, SETTINGS, listWords } from "../story";
import {
  addFractions,
  decimalText,
  fractionRaw,
  fractionText,
  fractionToWords,
  lcm,
  mean,
  median,
  mode,
  mulFractions,
  range,
  round,
  simplify,
  subFractions,
} from "../numbers";

/**
 * Grade 5: fractions, algebraic reasoning, measurement, geometry and data.
 *
 * Two results here contradict what younger children were taught, and both
 * are named in the explanations rather than glossed over: multiplying by a
 * fraction makes things smaller, and dividing by one makes them bigger. A
 * child who is surprised by that is paying attention.
 */

const COMMA = (n: number) => n.toLocaleString("en-US");

/* ------------------------------------------------------------------ *
 * Fractions
 * ------------------------------------------------------------------ */

/** MA.5.FR.1.1 — Division written as a fraction. */
export const g5DivisionAsFraction = mcGenerator({
  key: "g5.fr.divisionAsFraction",
  benchmark: "MA.5.FR.1.1",
  skillSlug: "division-as-fraction",
  skillTitle: "Division written as a fraction",
  build(rng) {
    const people = rng.int(3, 9);
    const items = rng.int(2, people - 1);
    const setting = rng.pick(SETTINGS);

    return {
      stem: `${items} ${setting.units} are shared equally between ${people} people. How much does each person get?`,
      audioText: `${items} items shared equally between ${people} people. How much each?`,
      correct: `${items}/${people} of a ${setting.unit}`,
      distractors: [
        {
          value: `${people}/${items} of a ${setting.unit}`,
          misconception: "reversed_dividend_divisor",
        },
        {
          value: `${people - items} ${setting.units}`,
          misconception: "wrong_operation",
        },
        {
          value: `${items * people} ${setting.units}`,
          misconception: "multiplied_instead_of_divided",
        },
        {
          value: `1/${people} of a ${setting.unit}`,
          misconception: "used_part_not_whole",
        },
      ],
      explanation: `Sharing ${items} between ${people} is ${items} ÷ ${people}, and that division is exactly the fraction ${items}/${people}. The number being shared goes on top.`,
      hints: [
        "The amount being shared goes on top.",
        "The number of people goes on the bottom.",
      ],
      difficulty: 1200,
    };
  },
});

/** MA.5.FR.2.1 — Add and subtract fractions with unlike denominators. */
export const g5AddUnlike = mcGenerator({
  key: "g5.fr.addUnlike",
  benchmark: "MA.5.FR.2.1",
  skillSlug: "add-subtract-unlike-fractions",
  skillTitle: "Adding fractions with different denominators",
  build(rng, ctx) {
    const pool = ctx.difficulty === "easy" ? [2, 4, 8] : [2, 3, 4, 5, 6, 8, 10, 12];
    const d1 = rng.pick(pool);
    const d2 = rng.pick(pool.filter((x) => x !== d1));
    const a = { n: rng.int(1, d1 - 1), d: d1 };
    const b = { n: rng.int(1, d2 - 1), d: d2 };
    const adding = rng.bool();

    const sum = addFractions(a, b);
    const bigger = a.n / a.d >= b.n / b.d ? a : b;
    const smaller = a.n / a.d >= b.n / b.d ? b : a;
    const diff = subFractions(bigger, smaller);
    const result = adding ? sum : diff;
    const left = adding ? a : bigger;
    const right = adding ? b : smaller;
    const common = lcm(d1, d2);

    return {
      stem: `**${fractionRaw(left)} ${adding ? "+" : "−"} ${fractionRaw(right)} = ?**`,
      audioText: `${fractionToWords(left)} ${adding ? "plus" : "minus"} ${fractionToWords(right)}.`,
      correct: fractionText(result, true),
      distractors: [
        {
          // The error the whole benchmark exists to name.
          value: `${adding ? left.n + right.n : left.n - right.n}/${adding ? left.d + right.d : Math.abs(left.d - right.d) || left.d}`,
          misconception: "added_denominators",
        },
        {
          value: `${adding ? left.n + right.n : left.n - right.n}/${common}`,
          misconception: "ignored_common_denominator",
        },
        {
          value: fractionText(adding ? diff : sum, true),
          misconception: "wrong_operation",
        },
        {
          value: fractionText({ n: result.n + 1, d: result.d }, true),
          misconception: "off_by_one",
        },
      ],
      explanation: `The pieces are different sizes, so rewrite both over ${common}: ${fractionRaw(left)} = ${(left.n * common) / left.d}/${common} and ${fractionRaw(right)} = ${(right.n * common) / right.d}/${common}. Now ${adding ? "add" : "subtract"} the tops: ${fractionText(result, true)}.`,
      hints: [
        "You cannot add pieces of different sizes.",
        `Rewrite both fractions over ${common} first.`,
      ],
      difficulty: 1280,
      widget: { key: "fraction-bar", config: { compare: [a, b] } },
    };
  },
});

/** MA.5.FR.2.2 — Multiply a fraction by a fraction. */
export const g5MultiplyFractions = mcGenerator({
  key: "g5.fr.multiplyFractions",
  benchmark: "MA.5.FR.2.2",
  skillSlug: "multiply-fractions",
  skillTitle: "Multiplying two fractions",
  build(rng) {
    const d1 = rng.pick([2, 3, 4, 5, 6, 8]);
    const d2 = rng.pick([2, 3, 4, 5, 6, 8]);
    const a = { n: rng.int(1, d1 - 1), d: d1 };
    const b = { n: rng.int(1, d2 - 1), d: d2 };
    const product = mulFractions(a, b);
    const raw = { n: a.n * b.n, d: a.d * b.d };

    return {
      stem: `**${fractionRaw(a)} × ${fractionRaw(b)} = ?**`,
      audioText: `${fractionToWords(a)} times ${fractionToWords(b)}.`,
      correct: fractionRaw(raw),
      distractors: [
        {
          // Cross-multiplied, as if solving a proportion.
          value: `${a.n * b.d}/${a.d * b.n}`,
          misconception: "numerator_denominator_swap",
        },
        {
          value: fractionRaw(addFractions(a, b)),
          misconception: "added_instead_of_multiplied",
        },
        {
          value: `${a.n * b.n}/${a.d + b.d}`,
          misconception: "added_denominators",
        },
        {
          value: fractionRaw({ n: raw.n + 1, d: raw.d }),
          misconception: "off_by_one",
        },
      ],
      explanation: `Multiply the tops and multiply the bottoms: ${a.n} × ${b.n} = ${raw.n} over ${a.d} × ${b.d} = ${raw.d}, giving ${fractionRaw(raw)}${simplify(raw).d !== raw.d ? `, which simplifies to ${fractionText(product)}` : ""}. Notice the answer is smaller than both — that is what taking a fraction *of* something does.`,
      hints: [
        "Tops multiply together; bottoms multiply together.",
        `"Of" means multiply.`,
      ],
      difficulty: 1260,
    };
  },
});

/** MA.5.FR.2.3 — Predict the size of a product. */
export const g5ProductSize = mcGenerator({
  key: "g5.fr.productSize",
  benchmark: "MA.5.FR.2.3",
  skillSlug: "size-of-a-product",
  skillTitle: "Predicting whether a product grows or shrinks",
  build(rng) {
    const whole = rng.int(4, 40);
    const lessThanOne = rng.bool();
    const f = lessThanOne
      ? { n: rng.int(1, 4), d: rng.pick([5, 6, 8, 10]) }
      : { n: rng.pick([5, 7, 9]), d: rng.pick([2, 3, 4]) };

    return {
      stem: `Without working it out: is **${whole} × ${fractionRaw(f)}** greater than ${whole}, less than ${whole}, or equal to ${whole}?`,
      audioText: `Is ${whole} times ${fractionToWords(f)} greater than, less than, or equal to ${whole}?`,
      correct: lessThanOne ? `Less than ${whole}` : `Greater than ${whole}`,
      distractors: [
        {
          value: lessThanOne ? `Greater than ${whole}` : `Less than ${whole}`,
          misconception: "converted_wrong_direction",
        },
        { value: `Equal to ${whole}`, misconception: "distractor_plausible" },
        {
          value: "It depends on the whole number",
          misconception: "distractor_plausible",
        },
      ],
      explanation: `${fractionRaw(f)} is ${lessThanOne ? "less" : "more"} than 1, so multiplying by it makes the answer ${lessThanOne ? "smaller" : "bigger"}. Multiplying only makes things bigger when the multiplier is more than 1.`,
      hints: [
        "Compare the fraction with 1 first.",
        "Taking a part of something leaves less than you started with.",
      ],
      difficulty: 1250,
    };
  },
});

/** MA.5.FR.2.4 — Divide a unit fraction by a whole number and vice versa. */
export const g5DivideUnitFraction = mcGenerator({
  key: "g5.fr.divideUnitFraction",
  benchmark: "MA.5.FR.2.4",
  skillSlug: "divide-unit-fractions",
  skillTitle: "Dividing with unit fractions",
  build(rng) {
    const d = rng.pick([2, 3, 4, 5, 6, 8] as const);
    const k = rng.int(2, 6);
    const fractionFirst = rng.bool();

    if (fractionFirst) {
      const answer = { n: 1, d: d * k };
      return {
        stem: `**1/${d} ÷ ${k} = ?**`,
        audioText: `One over ${d} divided by ${k}.`,
        correct: fractionRaw(answer),
        distractors: [
          { value: `${k}/${d}`, misconception: "multiplied_instead_of_divided" },
          { value: `1/${d + k}`, misconception: "added_denominators" },
          { value: `${k}/${d * k}`, misconception: "reversed_dividend_divisor" },
          { value: `1/${d * k + 1}`, misconception: "off_by_one" },
        ],
        explanation: `Splitting 1/${d} into ${k} equal parts makes each part ${k} times smaller: 1/${d * k}. Dividing by a whole number makes a fraction smaller.`,
        hints: [
          `Picture cutting a ${d === 2 ? "half" : "piece"} into ${k} bits.`,
          "Smaller pieces mean a bigger bottom number.",
        ],
        difficulty: 1290,
      };
    }

    return {
      stem: `**${k} ÷ 1/${d} = ?**`,
      audioText: `${k} divided by one over ${d}.`,
      correct: String(k * d),
      distractors: [
        { value: String(round(k / d, 3)), misconception: "converted_wrong_direction" },
        { value: `${k}/${d}`, misconception: "reversed_dividend_divisor" },
        { value: String(k + d), misconception: "added_instead_of_multiplied" },
        { value: String(k * d + 1), misconception: "off_by_one" },
      ],
      explanation: `The question is how many ${d === 2 ? "halves" : `1/${d} pieces`} fit into ${k} wholes. Each whole holds ${d} of them, so ${k} wholes hold ${k} × ${d} = ${k * d}. Dividing by a fraction gives a bigger answer.`,
      hints: [
        `How many 1/${d} pieces are in one whole?`,
        `Then multiply by ${k}.`,
      ],
      difficulty: 1310,
      fallback: nearbyNumbers(k * d, { min: 1 }),
    };
  },
});

/* ------------------------------------------------------------------ *
 * Algebraic reasoning
 * ------------------------------------------------------------------ */

/** MA.5.AR.1.1 — Multi-step problems with four operations. */
export const g5MultiStep = mcGenerator({
  key: "g5.ar.multiStep",
  benchmark: "MA.5.AR.1.1",
  skillSlug: "multi-step-problems",
  skillTitle: "Multi-step story problems",
  build(rng) {
    const who = rng.pick(NAMES);
    const setting = rng.pick(SETTINGS);
    const boxes = rng.int(6, 18);
    const per = rng.int(8, 24);
    const broken = rng.int(5, 40);
    const people = rng.int(3, 9);

    const good = boxes * per - broken;
    const each = Math.floor(good / people);
    const left = good - each * people;

    return {
      stem: `${who} unpacks ${boxes} boxes of ${per} ${setting.units} each and finds ${broken} damaged. The rest are shared equally between ${people} classrooms. How many does each classroom get?`,
      audioText: `${boxes} boxes of ${per}, minus ${broken} damaged, shared between ${people} classrooms. How many each?`,
      correct: String(each),
      distractors: [
        {
          // Divided before subtracting the damaged ones.
          value: String(Math.floor((boxes * per) / people)),
          misconception: "order_of_operations",
        },
        { value: String(good), misconception: "used_part_not_whole" },
        { value: String(boxes * per), misconception: "used_part_not_whole" },
        { value: String(each + 1), misconception: "off_by_one_factor" },
      ],
      explanation: `${boxes} × ${per} = ${COMMA(boxes * per)}. Take away the ${broken} damaged: ${COMMA(good)}. Share between ${people}: ${COMMA(good)} ÷ ${people} = ${each}${left ? ` with ${left} left over` : ""}.`,
      hints: [
        "Three steps, in order: multiply, subtract, divide.",
        "Do not divide until you know how many are usable.",
      ],
      difficulty: 1300,
      fallback: nearbyNumbers(each, { min: 0 }),
    };
  },
});

/** MA.5.AR.1.2 — Real-world problems with fractions. */
export const g5FractionProblem = mcGenerator({
  key: "g5.ar.fractionProblem",
  benchmark: "MA.5.AR.1.2",
  skillSlug: "fraction-problems-g5",
  skillTitle: "Fraction story problems",
  build(rng) {
    const who = rng.pick(NAMES);
    const d1 = rng.pick([2, 3, 4, 6]);
    const d2 = rng.pick([2, 3, 4, 6, 8].filter((x) => x !== d1));
    const a = { n: rng.int(1, d1 - 1), d: d1 };
    const b = { n: rng.int(1, d2 - 1), d: d2 };
    const total = addFractions(a, b);
    const common = lcm(d1, d2);

    return {
      stem: `${who} spent ${fractionRaw(a)} of an hour on reading and ${fractionRaw(b)} of an hour on maths. How long did ${who} work altogether?`,
      audioText: `${fractionToWords(a)} of an hour reading and ${fractionToWords(b)} of an hour on maths. How long altogether?`,
      correct: `${fractionText(total, true)} of an hour`,
      distractors: [
        {
          value: `${a.n + b.n}/${d1 + d2} of an hour`,
          misconception: "added_denominators",
        },
        {
          value: `${a.n + b.n}/${common} of an hour`,
          misconception: "ignored_common_denominator",
        },
        {
          value: `${fractionText(subFractions(a.n / a.d > b.n / b.d ? a : b, a.n / a.d > b.n / b.d ? b : a), true)} of an hour`,
          misconception: "wrong_operation",
        },
        {
          value: `${fractionText({ n: total.n + 1, d: total.d }, true)} of an hour`,
          misconception: "off_by_one",
        },
      ],
      explanation: `Rewrite both over ${common}: ${(a.n * common) / a.d}/${common} + ${(b.n * common) / b.d}/${common} = ${fractionText(total, true)} of an hour.`,
      hints: [
        "Find a common denominator first.",
        "Only then add the top numbers.",
      ],
      difficulty: 1290,
    };
  },
});

/** MA.5.AR.1.3 — Problems dividing with unit fractions. */
export const g5DivideFractionProblem = mcGenerator({
  key: "g5.ar.divideFractionProblem",
  benchmark: "MA.5.AR.1.3",
  skillSlug: "unit-fraction-division-problems",
  skillTitle: "Story problems dividing with fractions",
  build(rng) {
    const who = rng.pick(NAMES);
    const d = rng.pick([2, 3, 4, 6, 8] as const);
    const wholes = rng.int(2, 8);
    const pieces = wholes * d;

    return {
      stem: `${who} has **${wholes} metres** of ribbon and cuts it into pieces **1/${d} of a metre** long. How many pieces are there?`,
      audioText: `${wholes} metres of ribbon cut into pieces one over ${d} of a metre long. How many pieces?`,
      correct: String(pieces),
      distractors: [
        {
          value: String(round(wholes / d, 3)),
          misconception: "converted_wrong_direction",
        },
        { value: String(d), misconception: "used_part_not_whole" },
        { value: String(wholes + d), misconception: "added_instead_of_multiplied" },
        { value: String(pieces + 1), misconception: "off_by_one" },
      ],
      explanation: `Each metre gives ${d} pieces, so ${wholes} metres gives ${wholes} × ${d} = ${pieces}. Dividing by a fraction smaller than 1 gives more than you started with, which is exactly what cutting into small pieces does.`,
      hints: [
        `How many 1/${d} pieces fit in one metre?`,
        `Then multiply by ${wholes}.`,
      ],
      difficulty: 1300,
      fallback: nearbyNumbers(pieces, { min: 1 }),
    };
  },
});

/** MA.5.AR.2.1 — Translate words into a numerical expression. */
export const g5TranslateExpression = mcGenerator({
  key: "g5.ar.translateExpression",
  benchmark: "MA.5.AR.2.1",
  skillSlug: "translate-expressions",
  skillTitle: "Turning words into an expression",
  build(rng) {
    // Distinct, and a is comfortably the largest: with a === b the
    // subtraction case reads "(6 − 6) ÷ 6", and two of its distractors
    // collapse into the same string.
    const c = rng.int(2, 9);
    const b = rng.int(2, 12);
    const a = b + rng.int(2, 10);

    const cases = [
      {
        words: `add ${a} and ${b}, then multiply by ${c}`,
        expr: `(${a} + ${b}) × ${c}`,
        wrong: [`${a} + ${b} × ${c}`, `${a} × ${c} + ${b}`, `${a} + (${b} × ${c})`],
        why: `"Then" means the addition happens first, so it needs brackets: (${a} + ${b}) × ${c} = ${(a + b) * c}. Without them the multiplication would go first and give ${a + b * c}.`,
      },
      {
        words: `multiply ${a} by ${c}, then add ${b}`,
        expr: `${a} × ${c} + ${b}`,
        wrong: [`(${a} + ${b}) × ${c}`, `${a} × (${c} + ${b})`, `${a} + ${c} × ${b}`],
        why: `Multiplication already happens before addition, so no brackets are needed: ${a} × ${c} + ${b} = ${a * c + b}.`,
      },
      {
        words: `subtract ${b} from ${a}, then divide by ${c}`,
        expr: `(${a} − ${b}) ÷ ${c}`,
        wrong: [`${a} − ${b} ÷ ${c}`, `${a} ÷ ${c} − ${b}`, `${b} − ${a} ÷ ${c}`],
        why: `"Subtract ${b} from ${a}" means ${a} − ${b}, and that has to happen before the division, so it needs brackets.`,
      },
    ] as const;
    const c2 = rng.pick(cases);

    return {
      stem: `Which expression means: **${c2.words}**?`,
      audioText: `Which expression means ${c2.words}?`,
      correct: c2.expr,
      distractors: c2.wrong.map((w) => ({
        value: w,
        misconception: "order_of_operations" as const,
      })),
      explanation: c2.why,
      hints: [
        `"Then" tells you which step happens first.`,
        "Brackets force an operation to happen before the others.",
      ],
      difficulty: 1270,
    };
  },
});

/** MA.5.AR.2.2 — Order of operations. */
export const g5OrderOfOperations = mcGenerator({
  key: "g5.ar.orderOfOperations",
  benchmark: "MA.5.AR.2.2",
  skillSlug: "order-of-operations",
  skillTitle: "Order of operations",
  build(rng, ctx) {
    const a = rng.int(2, 12);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const d = rng.int(2, 9);
    const withBrackets = ctx.difficulty !== "easy" && rng.bool();

    const expr = withBrackets
      ? `${a} + ${b} × (${c} + ${d})`
      : `${a} + ${b} × ${c} − ${d}`;
    const answer = withBrackets ? a + b * (c + d) : a + b * c - d;
    const leftToRight = withBrackets
      ? (a + b) * (c + d)
      : ((a + b) * c) - d;

    return {
      stem: `**${expr} = ?**`,
      audioText: expr.replace(/×/g, "times").replace(/−/g, "minus"),
      correct: String(answer),
      distractors: [
        {
          // Worked strictly left to right, ignoring precedence.
          value: String(leftToRight),
          misconception: "order_of_operations",
        },
        {
          value: String(withBrackets ? a + b * c + d : a + b * (c - d)),
          misconception: "order_of_operations",
        },
        { value: String(answer + b), misconception: "off_by_one_factor" },
        { value: String(answer - 1), misconception: "off_by_one" },
      ],
      explanation: withBrackets
        ? `Brackets first: ${c} + ${d} = ${c + d}. Then multiply: ${b} × ${c + d} = ${b * (c + d)}. Then add: ${a} + ${b * (c + d)} = ${answer}.`
        : `Multiplication before addition and subtraction: ${b} × ${c} = ${b * c}. Then ${a} + ${b * c} − ${d} = ${answer}. Working left to right would have given ${leftToRight}.`,
      hints: [
        "Brackets, then multiply and divide, then add and subtract.",
        "Left to right only applies within the same level.",
      ],
      difficulty: 1250,
      fallback: nearbyNumbers(answer, { min: -50 }),
    };
  },
});

/** MA.5.AR.2.3 — True or false four-operation equations. */
export const g5TrueFalse = mcGenerator({
  key: "g5.ar.trueFalse",
  benchmark: "MA.5.AR.2.3",
  skillSlug: "true-false-g5",
  skillTitle: "Deciding if an equation is true",
  build(rng) {
    const a = rng.int(3, 12);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const left = (a + b) * c;
    const makeTrue = rng.bool();
    const rightConst = makeTrue ? a * c + b * c : a * c + b * c + rng.pick([c, -c, 1]);
    const isTrue = left === rightConst;

    return {
      stem: `Is this true or false?\n\n**(${a} + ${b}) × ${c} = ${a} × ${c} + ${rightConst - a * c}**`,
      audioText: `Is this true or false? Open bracket ${a} plus ${b} close bracket times ${c} equals ${a} times ${c} plus ${rightConst - a * c}.`,
      correct: isTrue ? "True" : "False",
      distractors: [
        { value: isTrue ? "False" : "True", misconception: "distractor_plausible" },
        {
          value: "False, because you cannot expand a bracket",
          misconception: "order_of_operations",
        },
        {
          value: `True, because ${a} appears on both sides`,
          misconception: "distractor_plausible",
        },
      ],
      explanation: `The left side is (${a} + ${b}) × ${c} = ${left}. The right side is ${a} × ${c} + ${rightConst - a * c} = ${rightConst}. ${isTrue ? "They match — this is the distributive property at work." : "They do not match."}`,
      hints: [
        "Work out both sides completely.",
        `Expanding the bracket gives ${a} × ${c} + ${b} × ${c}.`,
      ],
      difficulty: 1280,
    };
  },
});

/** MA.5.AR.2.4 — Write an equation for an unknown. */
export const g5WriteEquation = mcGenerator({
  key: "g5.ar.writeEquation",
  benchmark: "MA.5.AR.2.4",
  skillSlug: "write-equation-g5",
  skillTitle: "Writing an equation from a story",
  build(rng) {
    const who = rng.pick(NAMES);
    const start = rng.int(40, 200);
    const each = rng.int(3, 12);
    const groups = rng.int(4, 15);
    const total = start + each * groups;

    return {
      stem: `${who} starts with ${start} points and earns ${each} points for each of **n** rounds, finishing with ${total}. Which equation is right?`,
      audioText: `Starting with ${start} points, earning ${each} per round, finishing with ${total}. Which equation is right?`,
      correct: `${start} + ${each}n = ${total}`,
      distractors: [
        { value: `${start} × ${each}n = ${total}`, misconception: "wrong_operation" },
        { value: `${each}n − ${start} = ${total}`, misconception: "inverse_operation_missed" },
        { value: `${start} + ${each} + n = ${total}`, misconception: "added_instead_of_multiplied" },
        { value: `n = ${start} + ${each} + ${total}`, misconception: "wrong_operation" },
      ],
      explanation: `Each round adds ${each} points, so n rounds add ${each}n. Starting from ${start}, the finish is ${start} + ${each}n, and that equals ${total}. Here n = ${groups}.`,
      hints: [
        "The starting points are added once, not every round.",
        "Points per round × number of rounds is the amount earned.",
      ],
      difficulty: 1290,
    };
  },
});

/** MA.5.AR.3.1 — Write a rule for a pattern. */
export const g5PatternRule = mcGenerator({
  key: "g5.ar.patternRule",
  benchmark: "MA.5.AR.3.1",
  skillSlug: "pattern-rules",
  skillTitle: "Writing the rule for a pattern",
  build(rng) {
    const m = rng.int(2, 9);
    const c = rng.int(1, 12);
    const inputs = [1, 2, 3, 4];
    const outputs = inputs.map((x) => m * x + c);

    return {
      stem: `Look at the table.\n\n${listWords(inputs.map((x, i) => `${x} → ${outputs[i]}`))}\n\nWhich rule turns each input into its output?`,
      audioText: `${inputs.map((x, i) => `${x} gives ${outputs[i]}`).join("; ")}. Which rule works?`,
      correct: `multiply by ${m}, then add ${c}`,
      distractors: [
        {
          value: `add ${c}, then multiply by ${m}`,
          misconception: "order_of_operations",
        },
        { value: `add ${m + c}`, misconception: "added_instead_of_multiplied" },
        { value: `multiply by ${m + c}`, misconception: "added_instead_of_multiplied" },
        { value: `multiply by ${m}, then add ${c + 1}`, misconception: "off_by_one" },
      ],
      explanation: `Check the rule on every row, not just the first: 1 × ${m} + ${c} = ${outputs[0]}, 2 × ${m} + ${c} = ${outputs[1]}, and so on. Adding first would give ${(1 + c) * m} for the first row.`,
      hints: [
        "How much does the output grow for each step of 1?",
        "That growth is the number you multiply by.",
      ],
      difficulty: 1270,
    };
  },
});

/** MA.5.AR.3.2 — Use a rule to fill in a table. */
export const g5RuleTable = mcGenerator({
  key: "g5.ar.ruleTable",
  benchmark: "MA.5.AR.3.2",
  skillSlug: "input-output-tables",
  skillTitle: "Filling in an input and output table",
  build(rng) {
    const m = rng.int(2, 9);
    const c = rng.int(1, 15);
    const shown = [1, 2, 3];
    const target = rng.int(6, 20);
    const answer = m * target + c;

    return {
      stem: `The rule is **multiply by ${m}, then add ${c}**.\n\n${listWords(shown.map((x) => `${x} → ${m * x + c}`))}\n\nWhat is the output when the input is **${target}**?`,
      audioText: `Multiply by ${m} then add ${c}. What is the output for ${target}?`,
      correct: String(answer),
      distractors: [
        { value: String((target + c) * m), misconception: "order_of_operations" },
        { value: String(m * target), misconception: "used_part_not_whole" },
        { value: String(target + m + c), misconception: "added_instead_of_multiplied" },
        { value: String(answer + m), misconception: "off_by_one_factor" },
      ],
      explanation: `${target} × ${m} = ${target * m}, then + ${c} = ${answer}.`,
      hints: [
        "Apply the rule in the order given.",
        "Multiply before you add.",
      ],
      difficulty: 1200,
      fallback: nearbyNumbers(answer, { min: 0 }),
    };
  },
});

/* ------------------------------------------------------------------ *
 * Measurement
 * ------------------------------------------------------------------ */

const CONVERSIONS = [
  { big: "kilometre", small: "metre", per: 1000, bigs: "kilometres", smalls: "metres" },
  { big: "metre", small: "centimetre", per: 100, bigs: "metres", smalls: "centimetres" },
  { big: "kilogram", small: "gram", per: 1000, bigs: "kilograms", smalls: "grams" },
  { big: "litre", small: "millilitre", per: 1000, bigs: "litres", smalls: "millilitres" },
  { big: "hour", small: "minute", per: 60, bigs: "hours", smalls: "minutes" },
  { big: "foot", small: "inch", per: 12, bigs: "feet", smalls: "inches" },
] as const;

/** MA.5.M.1.1 — Multi-step unit conversion problems. */
export const g5Convert = mcGenerator({
  key: "g5.m.convert",
  benchmark: "MA.5.M.1.1",
  skillSlug: "multi-step-conversions",
  skillTitle: "Multi-step unit conversions",
  build(rng) {
    const c = rng.pick(CONVERSIONS);
    const bigs = rng.int(2, 9);
    const extraSmalls = rng.int(1, c.per - 1);
    const totalSmall = bigs * c.per + extraSmalls;
    const used = rng.int(Math.floor(totalSmall / 4), Math.floor(totalSmall / 2));
    const left = totalSmall - used;

    return {
      stem: `A container holds **${bigs} ${c.bigs} and ${extraSmalls} ${c.smalls}**. ${used} ${c.smalls} are used. How many ${c.smalls} are left?`,
      audioText: `${bigs} ${c.bigs} and ${extraSmalls} ${c.smalls}, minus ${used} ${c.smalls}. How many ${c.smalls} are left?`,
      correct: COMMA(left),
      distractors: [
        {
          // Subtracted before converting the big units.
          value: COMMA(Math.abs(extraSmalls - used)),
          misconception: "used_part_not_whole",
        },
        {
          value: COMMA(bigs + extraSmalls - used),
          misconception: "converted_wrong_direction",
        },
        { value: COMMA(totalSmall), misconception: "used_part_not_whole" },
        { value: COMMA(left + c.per), misconception: "off_by_one" },
      ],
      explanation: `First convert: ${bigs} ${c.bigs} is ${COMMA(bigs * c.per)} ${c.smalls}, plus ${extraSmalls} makes ${COMMA(totalSmall)}. Then ${COMMA(totalSmall)} − ${COMMA(used)} = ${COMMA(left)} ${c.smalls}.`,
      hints: [
        "Convert everything to the same unit before subtracting.",
        `One ${c.big} is ${COMMA(c.per)} ${c.smalls}.`,
      ],
      difficulty: 1310,
      fallback: nearbyNumbers(left, { min: 0 }),
    };
  },
});

/** MA.5.M.2.1 — Multi-step money problems. */
export const g5Money = mcGenerator({
  key: "g5.m.money",
  benchmark: "MA.5.M.2.1",
  skillSlug: "money-problems-g5",
  skillTitle: "Multi-step money problems",
  build(rng) {
    const who = rng.pick(NAMES);
    const price = round(rng.int(275, 1450) / 100, 2);
    const count = rng.int(3, 8);
    const discount = round(rng.int(50, 400) / 100, 2);
    const cost = round(price * count - discount, 2);

    return {
      stem: `${who} buys ${count} items at **$${decimalText(price, 2)}** each and has a **$${decimalText(discount, 2)}** voucher. What is the final cost?`,
      audioText: `${count} items at ${decimalText(price, 2)} dollars each, minus a ${decimalText(discount, 2)} dollar voucher. What is the final cost?`,
      correct: `$${decimalText(cost, 2)}`,
      distractors: [
        {
          value: `$${decimalText(round(price * count, 2), 2)}`,
          misconception: "used_part_not_whole",
        },
        {
          value: `$${decimalText(round((price - discount) * count, 2), 2)}`,
          misconception: "order_of_operations",
        },
        {
          value: `$${decimalText(round(price * count + discount, 2), 2)}`,
          misconception: "wrong_operation",
        },
        {
          value: `$${decimalText(round(cost * 10, 2), 2)}`,
          misconception: "decimal_point_misplaced",
        },
      ],
      explanation: `${count} × $${decimalText(price, 2)} = $${decimalText(round(price * count, 2), 2)}. The voucher comes off the total once, not off every item: $${decimalText(round(price * count, 2), 2)} − $${decimalText(discount, 2)} = $${decimalText(cost, 2)}.`,
      hints: [
        "Work out the full price first.",
        "The voucher is taken off once at the end.",
      ],
      difficulty: 1290,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Geometry
 * ------------------------------------------------------------------ */

/** MA.5.GR.1.1 — Classify triangles and quadrilaterals. */
export const g5Classify = mcGenerator({
  key: "g5.gr.classify",
  benchmark: "MA.5.GR.1.1",
  skillSlug: "classify-triangles-quadrilaterals",
  skillTitle: "Classifying triangles and quadrilaterals",
  build(rng) {
    const cases = [
      { clue: "three equal sides", a: "equilateral triangle", w: ["isosceles triangle", "scalene triangle", "right triangle"], why: "All three sides equal makes it equilateral — and all three angles are 60°." },
      { clue: "exactly two equal sides", a: "isosceles triangle", w: ["equilateral triangle", "scalene triangle", "square"], why: "Two equal sides, and the two angles opposite them are equal too." },
      { clue: "no equal sides", a: "scalene triangle", w: ["isosceles triangle", "equilateral triangle", "rhombus"], why: "No sides match, so no angles match either." },
      { clue: "one angle of exactly 90°", a: "right triangle", w: ["obtuse triangle", "acute triangle", "equilateral triangle"], why: "One square corner makes it a right triangle. It can be isosceles as well." },
      { clue: "four equal sides and four right angles", a: "square", w: ["rhombus", "rectangle", "parallelogram"], why: "A square is every one of the others at once — a rhombus with right angles, a rectangle with equal sides." },
      { clue: "both pairs of opposite sides parallel, but no right angles", a: "parallelogram", w: ["trapezoid", "rectangle", "square"], why: "A rectangle is a parallelogram too, but this one is specified as having no right angles." },
    ] as const;
    const c = rng.pick(cases);

    return {
      stem: `Which shape is described by **${c.clue}**?`,
      audioText: `Which shape has ${c.clue}?`,
      correct: c.a,
      distractors: c.w.map((w) => ({ value: w, misconception: "distractor_plausible" as const })),
      explanation: c.why,
      hints: [
        "Check the sides, then the angles.",
        "Some shapes belong to more than one family.",
      ],
      difficulty: 1160,
    };
  },
});

/** MA.5.GR.1.2 — Identify and classify 3D figures. */
export const g5Solids = mcGenerator({
  key: "g5.gr.solids",
  benchmark: "MA.5.GR.1.2",
  skillSlug: "classify-solids",
  skillTitle: "Naming three-dimensional figures",
  build(rng) {
    const solids = [
      { name: "triangular prism", faces: 5, edges: 9, vertices: 6, kind: "prism" },
      { name: "rectangular prism", faces: 6, edges: 12, vertices: 8, kind: "prism" },
      { name: "pentagonal prism", faces: 7, edges: 15, vertices: 10, kind: "prism" },
      { name: "square pyramid", faces: 5, edges: 8, vertices: 5, kind: "pyramid" },
      { name: "triangular pyramid", faces: 4, edges: 6, vertices: 4, kind: "pyramid" },
      { name: "cylinder", faces: 3, edges: 2, vertices: 0, kind: "curved" },
      { name: "cone", faces: 2, edges: 1, vertices: 1, kind: "curved" },
    ] as const;
    const s = rng.pick(solids);
    const others = solids.filter((x) => x.name !== s.name);

    const askName = rng.bool();
    if (askName) {
      return {
        stem: `Which solid has **${s.faces} faces, ${s.edges} edges and ${s.vertices} vertices**?`,
        audioText: `Which solid has ${s.faces} faces, ${s.edges} edges and ${s.vertices} vertices?`,
        correct: s.name,
        distractors: rng.shuffle([...others]).slice(0, 3).map((o) => ({
          value: o.name,
          misconception: "distractor_plausible" as const,
        })),
        explanation: `A ${s.name} has ${s.faces} faces, ${s.edges} edges and ${s.vertices} vertices. ${s.kind === "prism" ? "A prism has two identical ends joined by rectangles." : s.kind === "pyramid" ? "A pyramid has one base and triangular sides meeting at a point." : "Curved solids do not have flat faces all round."}`,
        hints: [
          "Faces are the flat surfaces.",
          "Vertices are the corners where edges meet.",
        ],
        difficulty: 1180,
        widget: {
          key: "solid-explorer",
          config: { solid: s.name.split(" ").join("-"), highlight: "faces" },
        },
      };
    }

    return {
      stem: `How many **faces** does a ${s.name} have?`,
      audioText: `How many faces does a ${s.name} have?`,
      correct: String(s.faces),
      distractors: [
        { value: String(s.vertices), misconception: "counted_faces_as_vertices" },
        { value: String(s.edges), misconception: "counted_faces_as_vertices" },
        { value: String(s.faces - 1), misconception: "skipped_hidden_faces" },
        { value: String(s.faces + 1), misconception: "off_by_one" },
      ],
      explanation: `A ${s.name} has ${s.faces} faces. Remember the ones you cannot see from the front.`,
      hints: [
        "Turn it over in your head.",
        "Count the hidden faces too.",
      ],
      difficulty: 1120,
      widget: {
        key: "solid-explorer",
        config: { solid: s.name.split(" ").join("-"), highlight: "faces" },
      },
      fallback: nearbyNumbers(s.faces, { min: 1, max: 20 }),
    };
  },
});

/** MA.5.GR.2.1 — Area and perimeter with fractional or decimal sides. */
export const g5FractionalArea = mcGenerator({
  key: "g5.gr.fractionalArea",
  benchmark: "MA.5.GR.2.1",
  skillSlug: "area-with-decimals",
  skillTitle: "Area with decimal side lengths",
  build(rng) {
    const w = round(rng.int(15, 95) / 10, 1);
    const h = round(rng.int(15, 95) / 10, 1);
    const area = round(w * h, 2);
    const perimeter = round(2 * (w + h), 1);

    return {
      stem: `A rectangle measures **${decimalText(w, 1)} m** by **${decimalText(h, 1)} m**. What is its area?`,
      audioText: `A rectangle is ${decimalText(w, 1)} by ${decimalText(h, 1)} metres. What is its area?`,
      correct: `${decimalText(area, 2)} m²`,
      distractors: [
        { value: `${decimalText(perimeter, 1)} m²`, misconception: "perimeter_area_confusion" },
        {
          value: `${decimalText(round(area * 10, 2), 2)} m²`,
          misconception: "decimal_point_misplaced",
        },
        { value: `${decimalText(round(w + h, 1), 1)} m²`, misconception: "added_instead_of_multiplied" },
        { value: `${decimalText(area, 2)} m`, misconception: "ignored_units" },
      ],
      explanation: `Area is still length × width, decimals or not: ${decimalText(w, 1)} × ${decimalText(h, 1)} = ${decimalText(area, 2)} m². Two decimal places in, two out.`,
      hints: [
        "Multiply as if they were whole numbers, then place the point.",
        "Count the decimal places in both factors.",
      ],
      difficulty: 1270,
    };
  },
});

/** MA.5.GR.3.1 — Volume by counting unit cubes. */
export const g5VolumeCount = mcGenerator({
  key: "g5.gr.volumeCount",
  benchmark: "MA.5.GR.3.1",
  skillSlug: "volume-by-counting",
  skillTitle: "Volume by counting cubes",
  build(rng) {
    const l = rng.int(2, 7);
    const w = rng.int(2, 6);
    const h = rng.int(2, 5);
    const volume = l * w * h;

    return {
      stem: `A box is packed with unit cubes: **${l} along, ${w} across and ${h} high**. How many cubes fit inside?`,
      audioText: `A box holds ${l} cubes along, ${w} across and ${h} high. How many cubes altogether?`,
      correct: `${volume} cubic units`,
      distractors: [
        {
          // Multiplied two dimensions and stopped — an area, not a volume.
          value: `${l * w} cubic units`,
          misconception: "volume_as_area",
        },
        { value: `${l + w + h} cubic units`, misconception: "added_instead_of_multiplied" },
        {
          value: `${2 * (l * w + l * h + w * h)} cubic units`,
          misconception: "surface_area_missing_faces",
        },
        { value: `${volume + l} cubic units`, misconception: "off_by_one_factor" },
      ],
      explanation: `One layer holds ${l} × ${w} = ${l * w} cubes, and there are ${h} layers: ${l * w} × ${h} = ${volume} cubes.`,
      hints: [
        "How many cubes in one flat layer?",
        "Then how many layers are stacked up?",
      ],
      difficulty: 1220,
      widget: { key: "volume-cubes", config: { l, w, h } },
      fallback: nearbyNumbers(volume, { min: 1 }),
    };
  },
});

/** MA.5.GR.3.2 — Volume of a rectangular prism by formula. */
export const g5VolumeFormula = mcGenerator({
  key: "g5.gr.volumeFormula",
  benchmark: "MA.5.GR.3.2",
  skillSlug: "volume-formula",
  skillTitle: "Volume of a rectangular prism",
  build(rng, ctx) {
    const l = rng.int(3, ctx.difficulty === "easy" ? 8 : 15);
    const w = rng.int(3, 12);
    const h = rng.int(2, 10);
    const volume = l * w * h;

    return {
      stem: `A tank is **${l} cm** long, **${w} cm** wide and **${h} cm** deep. What is its volume?`,
      audioText: `A tank is ${l} by ${w} by ${h} centimetres. What is its volume?`,
      correct: `${COMMA(volume)} cm³`,
      distractors: [
        { value: `${COMMA(l * w)} cm³`, misconception: "volume_as_area" },
        { value: `${COMMA(l + w + h)} cm³`, misconception: "added_instead_of_multiplied" },
        {
          value: `${COMMA(2 * (l * w + l * h + w * h))} cm³`,
          misconception: "surface_area_missing_faces",
        },
        { value: `${COMMA(volume)} cm²`, misconception: "ignored_units" },
      ],
      explanation: `Volume is length × width × height: ${l} × ${w} × ${h} = ${COMMA(volume)} cm³. Three dimensions means cubic units.`,
      hints: [
        "Volume needs all three measurements.",
        "The unit is cubic, not square.",
      ],
      difficulty: 1230,
      widget: { key: "volume-cubes", config: { l, w, h } },
      fallback: nearbyNumbers(volume, { min: 1, step: 10 }),
    };
  },
});

/** MA.5.GR.3.3 — Volume with an unknown edge. */
export const g5VolumeUnknown = mcGenerator({
  key: "g5.gr.volumeUnknown",
  benchmark: "MA.5.GR.3.3",
  skillSlug: "volume-unknown-edge",
  skillTitle: "Finding a missing edge from the volume",
  build(rng) {
    const l = rng.int(3, 12);
    const w = rng.int(3, 10);
    const h = rng.int(2, 9);
    const volume = l * w * h;

    return {
      stem: `A box has a volume of **${COMMA(volume)} cm³**. It is **${l} cm** long and **${w} cm** wide. How deep is it?`,
      audioText: `A box has volume ${volume} cubic centimetres, is ${l} long and ${w} wide. How deep is it?`,
      correct: `${h} cm`,
      distractors: [
        {
          value: `${COMMA(volume - l * w)} cm`,
          misconception: "multiplied_instead_of_divided",
        },
        { value: `${Math.round(volume / l)} cm`, misconception: "used_part_not_whole" },
        { value: `${h + 1} cm`, misconception: "off_by_one_factor" },
        { value: `${l * w} cm`, misconception: "volume_as_area" },
      ],
      explanation: `The base covers ${l} × ${w} = ${l * w} cm². Depth is volume ÷ base area: ${COMMA(volume)} ÷ ${l * w} = ${h} cm.`,
      hints: [
        "Work out the area of the base first.",
        "Then divide the volume by it.",
      ],
      difficulty: 1300,
    };
  },
});

/** MA.5.GR.4.1 — Plot points in the first quadrant. */
export const g5Coordinates = mcGenerator({
  key: "g5.gr.coordinates",
  benchmark: "MA.5.GR.4.1",
  skillSlug: "coordinates-quadrant-one",
  skillTitle: "Plotting points on a grid",
  build(rng) {
    const x = rng.int(1, 9);
    let y = rng.int(1, 9);
    // Equal coordinates make the swap distractor identical to the answer, and
    // that swap is the whole point of the item.
    while (y === x) y = rng.int(1, 9);

    return {
      stem: `Starting at the origin, move **${x} right** and then **${y} up**. What are the coordinates of that point?`,
      audioText: `From the origin, ${x} right and ${y} up. What are the coordinates?`,
      correct: `(${x}, ${y})`,
      distractors: [
        { value: `(${y}, ${x})`, misconception: "coordinates_swapped" },
        { value: `(${x + 1}, ${y})`, misconception: "off_by_one" },
        { value: `(0, ${x + y})`, misconception: "added_instead_of_multiplied" },
        { value: `(${x}, ${y + 1})`, misconception: "off_by_one" },
      ],
      explanation: `Coordinates are always written (across, up): ${x} across then ${y} up gives (${x}, ${y}). Writing them the other way round names a different point.`,
      hints: [
        "The first number is the across move.",
        `"Along the corridor, then up the stairs."`,
      ],
      difficulty: 1160,
      widget: { key: "coordinate-grid", config: { points: [{ x, y }], max: 10 } },
    };
  },
});

/** MA.5.GR.4.2 — Interpret a real-world situation on a grid. */
export const g5CoordinateProblem = mcGenerator({
  key: "g5.gr.coordinateProblem",
  benchmark: "MA.5.GR.4.2",
  skillSlug: "coordinate-problems",
  skillTitle: "Reading a graph of a real situation",
  build(rng) {
    const rate = rng.int(2, 9);
    const hours = rng.int(3, 8);
    const distance = rate * hours;

    return {
      stem: `A graph plots time in hours across and distance in kilometres up. The line passes through (1, ${rate}) and (2, ${rate * 2}). How far has the walker gone after **${hours} hours**?`,
      audioText: `A line passes through 1 comma ${rate} and 2 comma ${rate * 2}. How far after ${hours} hours?`,
      correct: `${distance} km`,
      distractors: [
        { value: `${hours + rate} km`, misconception: "added_instead_of_multiplied" },
        { value: `${hours} km`, misconception: "coordinates_swapped" },
        { value: `${rate} km`, misconception: "used_part_not_whole" },
        { value: `${distance + rate} km`, misconception: "off_by_one_factor" },
      ],
      explanation: `Each hour adds ${rate} km, so after ${hours} hours the distance is ${hours} × ${rate} = ${distance} km.`,
      hints: [
        "How far does one hour take them?",
        "The across axis is time; the up axis is distance.",
      ],
      difficulty: 1240,
      widget: {
        key: "coordinate-grid",
        config: {
          points: Array.from({ length: hours }, (_, i) => ({ x: i + 1, y: (i + 1) * rate })),
          max: Math.max(10, distance),
        },
      },
    };
  },
});

/* ------------------------------------------------------------------ *
 * Data
 * ------------------------------------------------------------------ */

/** MA.5.DP.1.1 — Represent data on a line graph or line plot. */
export const g5LineGraph = mcGenerator({
  key: "g5.dp.lineGraph",
  benchmark: "MA.5.DP.1.1",
  skillSlug: "line-graphs",
  skillTitle: "Reading a line graph",
  build(rng) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May"];
    const values = months.map(() => rng.int(10, 90));
    const rows = listWords(months.map((m, i) => `${m} ${values[i]}`));

    // Biggest rise between consecutive months, which is what a line graph is
    // for — the shape between the points, not the points themselves.
    let bestIdx = 0;
    let bestRise = values[1] - values[0];
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i + 1] - values[i] > bestRise) {
        bestRise = values[i + 1] - values[i];
        bestIdx = i;
      }
    }

    return {
      stem: `A line graph shows visitors each month: ${rows}.\n\nBetween which two months did the number **rise the most**?`,
      audioText: `${rows}. Between which two months did the number rise the most?`,
      correct: `${months[bestIdx]} to ${months[bestIdx + 1]}`,
      distractors: months
        .slice(0, -1)
        .map((m, i) => ({ m, i }))
        .filter(({ i }) => i !== bestIdx)
        .slice(0, 3)
        .map(({ m, i }) => ({
          value: `${m} to ${months[i + 1]}`,
          misconception: "used_part_not_whole" as const,
        })),
      explanation: `Look at the change between each pair, not the heights: the rise from ${months[bestIdx]} to ${months[bestIdx + 1]} is ${bestRise}, the largest of them. A steep line means fast change.`,
      hints: [
        "Work out the change between each pair of months.",
        "The steepest part of the line is the biggest change.",
      ],
      difficulty: 1240,
    };
  },
});

/** MA.5.DP.1.2 — Mean, mode, median and range. */
export const g5Averages = mcGenerator({
  key: "g5.dp.averages",
  benchmark: "MA.5.DP.1.2",
  skillSlug: "mean-median-mode-range",
  skillTitle: "Mean, median, mode and range",
  build(rng, ctx) {
    // Values chosen so the mean is a whole number: a mean of 7.4 tests
    // division, not the idea of an average.
    const size = rng.pick([5, 6] as const);
    const target = rng.int(8, 30);
    const values: number[] = [];
    let sum = 0;
    for (let i = 0; i < size - 1; i++) {
      const v = rng.int(Math.max(1, target - 8), target + 8);
      values.push(v);
      sum += v;
    }
    const last = target * size - sum;
    values.push(last > 0 ? last : target);
    const sorted = [...values].sort((a, b) => a - b);

    const want = rng.pick(
      ctx.difficulty === "easy"
        ? (["mean", "range"] as const)
        : (["mean", "median", "range"] as const),
    );
    const answer =
      want === "mean"
        ? Math.round(mean(values))
        : want === "median"
          ? median(values)
          : range(values);

    return {
      stem: `Find the **${want}** of:\n\n**${sorted.join(", ")}**`,
      audioText: `Find the ${want} of ${sorted.join(", ")}.`,
      correct: String(answer),
      distractors: [
        {
          value: String(want === "mean" ? median(values) : Math.round(mean(values))),
          misconception: "mean_median_confusion",
        },
        {
          value: String(Math.max(...values) + Math.min(...values)),
          misconception: "range_as_sum",
        },
        { value: String(mode(values) ?? Math.max(...values)), misconception: "mean_median_confusion" },
        { value: String(answer + 1), misconception: "off_by_one" },
      ],
      explanation:
        want === "mean"
          ? `Add them all: ${values.reduce((a, b) => a + b, 0)}. Divide by how many there are: ${values.reduce((a, b) => a + b, 0)} ÷ ${size} = ${Math.round(mean(values))}.`
          : want === "median"
            ? `In order, the middle ${size % 2 === 0 ? "two values are averaged" : "value"} gives ${median(values)}.`
            : `Range is largest minus smallest: ${Math.max(...values)} − ${Math.min(...values)} = ${range(values)}.`,
      hints: [
        want === "mean"
          ? "Add everything, then divide by how many."
          : want === "median"
            ? "Sort first, then find the middle."
            : "Range is a difference, not a total.",
        "Check which one the question asked for.",
      ],
      difficulty: want === "mean" ? 1230 : 1170,
      fallback: nearbyNumbers(answer, { min: 0 }),
    };
  },
});
