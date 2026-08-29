import { mcGenerator, nearbyNumbers } from "../build";
import { NAMES, SETTINGS, listWords } from "../story";
import {
  decimalText,
  fiveNumberSummary,
  gcd,
  mean,
  median,
  mode,
  range,
  round,
} from "../numbers";

/**
 * Grade 6: algebraic reasoning, ratios, geometry and statistics.
 *
 * Ratios are the new idea, and the error worth catching is order: the ratio
 * of cats to dogs is not the ratio of dogs to cats. Every ratio item here
 * offers the reversed pair, because a student who picks it has understood
 * the quantities and missed the grammar.
 */

const COMMA = (n: number) => n.toLocaleString("en-US");

/* ------------------------------------------------------------------ *
 * Algebraic reasoning
 * ------------------------------------------------------------------ */

/** MA.6.AR.1.1 — Translate words into an algebraic expression. */
export const g6TranslateAlgebra = mcGenerator({
  key: "g6.ar.translateAlgebra",
  benchmark: "MA.6.AR.1.1",
  skillSlug: "translate-algebraic-expressions",
  skillTitle: "Turning words into algebra",
  build(rng) {
    // Kept apart: with k === c, "c − kn" and "kn − c" reversed read the same
    // way in two of the cases below and the item loses a distractor.
    const k = rng.int(2, 9);
    const c = rng.int(k + 1, 15);

    const cases = [
      {
        words: `${c} less than ${k} times a number n`,
        expr: `${k}n − ${c}`,
        wrong: [`${c} − ${k}n`, `${k}n + ${c}`, `${k}(n − ${c})`],
        why: `"${c} less than" means you take ${c} away from the other quantity, so ${c} goes second: ${k}n − ${c}. Writing ${c} − ${k}n reverses it.`,
      },
      {
        words: `the sum of a number n and ${c}, all multiplied by ${k}`,
        expr: `${k}(n + ${c})`,
        wrong: [`${k}n + ${c}`, `n + ${k}${c}`, `${k}n + ${k}`],
        why: `"All multiplied by" applies to the whole sum, so it needs brackets: ${k}(n + ${c}).`,
      },
      {
        words: `a number n divided by ${k}, then increased by ${c}`,
        expr: `n ÷ ${k} + ${c}`,
        wrong: [`n ÷ (${k} + ${c})`, `${k} ÷ n + ${c}`, `(n + ${c}) ÷ ${k}`],
        why: `The division happens first and only involves n and ${k}: n ÷ ${k} + ${c}.`,
      },
      {
        words: `the product of ${k} and a number n, decreased by ${c}`,
        expr: `${k}n − ${c}`,
        wrong: [`${k} − ${c}n`, `${k}(n − ${c})`, `${c} − ${k}n`],
        why: `"Product of ${k} and n" is ${k}n, and "decreased by ${c}" subtracts from that whole thing.`,
      },
    ] as const;
    const cse = rng.pick(cases);

    return {
      stem: `Which expression means **${cse.words}**?`,
      audioText: `Which expression means ${cse.words}?`,
      correct: cse.expr,
      distractors: cse.wrong.map((w) => ({
        value: w,
        misconception: "order_of_operations" as const,
      })),
      explanation: cse.why,
      hints: [
        `"Less than" and "subtracted from" both reverse the order.`,
        "Ask what the operation applies to — one term, or the whole thing?",
      ],
      difficulty: 1310,
    };
  },
});

/** MA.6.AR.1.2 — Translate a description into an inequality. */
export const g6Inequality = mcGenerator({
  key: "g6.ar.inequality",
  benchmark: "MA.6.AR.1.2",
  skillSlug: "write-inequalities",
  skillTitle: "Writing an inequality",
  build(rng) {
    const n = rng.int(5, 60);
    const cases = [
      { words: `you must be at least ${n} centimetres tall`, expr: `h ≥ ${n}`, wrong: [`h > ${n}`, `h ≤ ${n}`, `h < ${n}`], why: `"At least" includes ${n} itself, so the line under the sign stays: h ≥ ${n}.` },
      { words: `no more than ${n} people may enter`, expr: `p ≤ ${n}`, wrong: [`p < ${n}`, `p ≥ ${n}`, `p > ${n}`], why: `"No more than" allows exactly ${n}, so it is ≤, not <.` },
      { words: `the temperature stayed below ${n} degrees`, expr: `t < ${n}`, wrong: [`t ≤ ${n}`, `t > ${n}`, `t ≥ ${n}`], why: `"Below" does not include ${n} itself, so there is no line under the sign.` },
      { words: `more than ${n} tickets were sold`, expr: `s > ${n}`, wrong: [`s ≥ ${n}`, `s < ${n}`, `s ≤ ${n}`], why: `"More than ${n}" excludes ${n} exactly, so it is >, not ≥.` },
    ] as const;
    const c = rng.pick(cases);

    return {
      stem: `Which inequality says **${c.words}**?`,
      audioText: `Which inequality says ${c.words}?`,
      correct: c.expr,
      distractors: c.wrong.map((w) => ({
        value: w,
        misconception: "off_by_one" as const,
      })),
      explanation: c.why,
      hints: [
        "Is the boundary number itself allowed?",
        "If it is, the sign gets a line under it.",
      ],
      difficulty: 1280,
    };
  },
});

/** MA.6.AR.1.3 — Evaluate an expression by substitution. */
export const g6Evaluate = mcGenerator({
  key: "g6.ar.evaluate",
  benchmark: "MA.6.AR.1.3",
  skillSlug: "evaluate-expressions",
  skillTitle: "Evaluating an expression",
  build(rng, ctx) {
    const x = rng.int(2, 12);
    const a = rng.int(2, 9);
    const b = rng.int(1, 15);
    const squared = ctx.difficulty === "stretch";

    const value = squared ? a * x * x + b : a * x + b;
    const expr = squared ? `${a}x² + ${b}` : `${a}x + ${b}`;

    return {
      stem: `Evaluate **${expr}** when **x = ${x}**.`,
      audioText: `Evaluate ${a} x ${squared ? "squared" : ""} plus ${b} when x is ${x}.`,
      correct: COMMA(value),
      distractors: [
        {
          // Multiplied before squaring, or added before multiplying.
          value: COMMA(squared ? (a * x) ** 2 + b : (a + x) * b),
          misconception: "order_of_operations",
        },
        ...(squared
          ? [
              {
                value: COMMA(a * 2 * x + b),
                misconception: "exponent_as_multiplication" as const,
              },
            ]
          : [
              {
                value: COMMA(a * (x + b)),
                misconception: "order_of_operations" as const,
              },
            ]),
        { value: COMMA(value + a), misconception: "off_by_one_factor" },
        { value: COMMA(a + x + b), misconception: "added_instead_of_multiplied" },
      ],
      explanation: squared
        ? `Square first: ${x}² = ${x * x}. Then multiply: ${a} × ${x * x} = ${a * x * x}. Then add: + ${b} = ${COMMA(value)}. The exponent belongs to x alone, not to ${a}x.`
        : `Multiply first: ${a} × ${x} = ${a * x}. Then add ${b}: ${COMMA(value)}.`,
      hints: [
        "Substitute the value, then follow the order of operations.",
        squared ? "The square applies only to x." : "Multiply before you add.",
      ],
      difficulty: squared ? 1330 : 1220,
      fallback: nearbyNumbers(value, { min: 0 }),
    };
  },
});

/** MA.6.AR.1.4 — Generate equivalent expressions. */
export const g6EquivalentExpressions = mcGenerator({
  key: "g6.ar.equivalentExpressions",
  benchmark: "MA.6.AR.1.4",
  skillSlug: "equivalent-expressions",
  skillTitle: "Equivalent algebraic expressions",
  build(rng) {
    const a = rng.int(2, 9);
    const b = rng.int(2, 12);
    const expand = rng.bool();

    return expand
      ? {
          stem: `Which expression is equal to **${a}(x + ${b})**?`,
          audioText: `Which expression equals ${a} times open bracket x plus ${b} close bracket?`,
          correct: `${a}x + ${a * b}`,
          distractors: [
            {
              // Multiplied only the first term inside the bracket.
              value: `${a}x + ${b}`,
              misconception: "used_part_not_whole",
            },
            { value: `${a}x + ${a + b}`, misconception: "added_instead_of_multiplied" },
            { value: `${a + b}x`, misconception: "added_instead_of_multiplied" },
            { value: `${a}x − ${a * b}`, misconception: "sign_error" },
          ],
          explanation: `Everything inside the bracket gets multiplied: ${a} × x = ${a}x and ${a} × ${b} = ${a * b}. So ${a}(x + ${b}) = ${a}x + ${a * b}.`,
          hints: [
            "The number outside multiplies every term inside.",
            "Two terms inside means two multiplications.",
          ],
          difficulty: 1290,
        }
      : {
          stem: `Which expression is equal to **${a}x + ${a * b}**?`,
          audioText: `Which expression equals ${a} x plus ${a * b}?`,
          correct: `${a}(x + ${b})`,
          distractors: [
            { value: `${a}(x + ${a * b})`, misconception: "used_part_not_whole" },
            { value: `${a * b}(x + ${a})`, misconception: "gcf_lcm_swap" },
            { value: `x(${a} + ${a * b})`, misconception: "distractor_plausible" },
            { value: `${a}x(${b})`, misconception: "wrong_operation" },
          ],
          explanation: `${a} divides both terms: ${a}x ÷ ${a} = x and ${a * b} ÷ ${a} = ${b}. So ${a}x + ${a * b} = ${a}(x + ${b}).`,
          hints: [
            "Find what divides both terms.",
            "Divide each term by it; what remains goes in the bracket.",
          ],
          difficulty: 1310,
        };
  },
});

/** MA.6.AR.2.1 — Which value makes an equation or inequality true? */
export const g6WhichValue = mcGenerator({
  key: "g6.ar.whichValue",
  benchmark: "MA.6.AR.2.1",
  skillSlug: "values-that-satisfy",
  skillTitle: "Finding which value makes a statement true",
  build(rng) {
    const a = rng.int(2, 9);
    const b = rng.int(-12, 15);
    const answer = rng.int(-8, 12);
    const target = a * answer + b;

    return {
      stem: `Which value of x makes **${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${target}** true?`,
      audioText: `Which value of x makes ${a} x ${b < 0 ? "minus" : "plus"} ${Math.abs(b)} equal ${target}?`,
      correct: String(answer),
      distractors: [
        {
          // Added where they should have subtracted when undoing.
          value: String(Math.round((target + b) / a)),
          misconception: "inverse_operation_missed",
        },
        { value: String(target - b), misconception: "multiplied_instead_of_divided" },
        { value: String(-answer), misconception: "sign_error" },
        { value: String(answer + 1), misconception: "off_by_one" },
      ],
      explanation: `Undo the operations in reverse: ${target} ${b < 0 ? "+" : "−"} ${Math.abs(b)} = ${a * answer}, then ÷ ${a} = ${answer}. Check: ${a} × ${answer} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${target}.`,
      hints: [
        "Undo the addition or subtraction first.",
        "Then undo the multiplication.",
      ],
      difficulty: 1280,
      fallback: nearbyNumbers(answer, { min: -30 }),
    };
  },
});

/** MA.6.AR.2.2 — One-step addition and subtraction equations. */
export const g6OneStepAdd = mcGenerator({
  key: "g6.ar.oneStepAdd",
  benchmark: "MA.6.AR.2.2",
  skillSlug: "one-step-add-equations",
  skillTitle: "One-step equations with adding and subtracting",
  build(rng) {
    const x = rng.int(-20, 30);
    const b = rng.int(-20, 25);
    const add = rng.bool();
    const rhs = add ? x + b : x - b;

    return {
      stem: `Solve for x:\n\n**x ${add ? "+" : "−"} ${b < 0 ? `(${b})` : b} = ${rhs}**`,
      audioText: `Solve for x. x ${add ? "plus" : "minus"} ${b} equals ${rhs}.`,
      correct: String(x),
      distractors: [
        {
          // Did the same operation to both sides instead of the inverse.
          value: String(add ? rhs + b : rhs - b),
          misconception: "inverse_operation_missed",
        },
        { value: String(-x), misconception: "sign_error" },
        { value: String(rhs), misconception: "distractor_plausible" },
        { value: String(x + 1), misconception: "off_by_one" },
      ],
      explanation: `Do the opposite to both sides: ${rhs} ${add ? "−" : "+"} ${b < 0 ? `(${b})` : b} = ${x}. Check by putting it back: ${x} ${add ? "+" : "−"} ${b < 0 ? `(${b})` : b} = ${rhs}.`,
      hints: [
        "Whatever is done to x, undo it.",
        "Adding is undone by subtracting.",
      ],
      difficulty: 1230,
      fallback: nearbyNumbers(x, { min: -60 }),
    };
  },
});

/** MA.6.AR.2.3 — One-step multiplication and division equations. */
export const g6OneStepMul = mcGenerator({
  key: "g6.ar.oneStepMul",
  benchmark: "MA.6.AR.2.3",
  skillSlug: "one-step-multiply-equations",
  skillTitle: "One-step equations with multiplying and dividing",
  build(rng) {
    const x = rng.int(-12, 15) || 3;
    const a = rng.int(2, 9) * (rng.bool() ? 1 : -1);
    const multiply = rng.bool();
    const rhs = multiply ? a * x : x;
    const shown = multiply ? `${a < 0 ? `(${a})` : a}x = ${rhs}` : `x ÷ ${a < 0 ? `(${a})` : a} = ${x}`;
    const answer = multiply ? x : a * x;

    return {
      stem: `Solve for x:\n\n**${shown}**`,
      audioText: `Solve for x. ${shown.replace("÷", "divided by")}`,
      correct: String(answer),
      distractors: [
        {
          value: String(multiply ? rhs * a : x),
          misconception: "inverse_operation_missed",
        },
        { value: String(-answer), misconception: "sign_error" },
        { value: String(answer + 1), misconception: "off_by_one_factor" },
        { value: String(a), misconception: "distractor_plausible" },
      ],
      explanation: multiply
        ? `Divide both sides by ${a}: ${rhs} ÷ ${a} = ${answer}.`
        : `Multiply both sides by ${a}: ${x} × ${a} = ${answer}.`,
      hints: [
        "Multiplying is undone by dividing.",
        "Do the same thing to both sides.",
      ],
      difficulty: 1250,
      fallback: nearbyNumbers(answer, { min: -120 }),
    };
  },
});

/** MA.6.AR.2.4 — Unknown decimal or fraction in an equation. */
export const g6UnknownDecimal = mcGenerator({
  key: "g6.ar.unknownDecimal",
  benchmark: "MA.6.AR.2.4",
  skillSlug: "unknown-decimal-fraction",
  skillTitle: "Solving equations with decimals",
  build(rng) {
    const x = round(rng.int(15, 120) / 10, 1);
    const b = round(rng.int(15, 90) / 10, 1);
    const add = rng.bool();
    const rhs = round(add ? x + b : x - b, 1);

    return {
      stem: `Solve for x:\n\n**x ${add ? "+" : "−"} ${decimalText(b, 1)} = ${decimalText(rhs, 1)}**`,
      audioText: `x ${add ? "plus" : "minus"} ${decimalText(b, 1)} equals ${decimalText(rhs, 1)}. Solve for x.`,
      correct: decimalText(x, 1),
      distractors: [
        {
          value: decimalText(round(add ? rhs + b : rhs - b, 1), 1),
          misconception: "inverse_operation_missed",
        },
        {
          value: decimalText(round(x * 10, 1), 1),
          misconception: "decimal_point_misplaced",
        },
        { value: decimalText(round(x + 1, 1), 1), misconception: "off_by_one" },
        { value: decimalText(rhs, 1), misconception: "distractor_plausible" },
      ],
      explanation: `Undo the ${add ? "addition" : "subtraction"}: ${decimalText(rhs, 1)} ${add ? "−" : "+"} ${decimalText(b, 1)} = ${decimalText(x, 1)}.`,
      hints: [
        "Decimals do not change how you solve it.",
        "Line up the points when you calculate.",
      ],
      difficulty: 1270,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Ratios and rates
 * ------------------------------------------------------------------ */

/** MA.6.AR.3.1 — Write and interpret a ratio. */
export const g6Ratio = mcGenerator({
  key: "g6.ar.ratio",
  benchmark: "MA.6.AR.3.1",
  skillSlug: "write-ratios",
  skillTitle: "Writing ratios",
  build(rng) {
    const a = rng.int(3, 24);
    let b = rng.int(3, 24);
    // Equal counts make the reversed ratio identical to the answer, and that
    // reversal is the error the item exists to catch.
    while (b === a) b = rng.int(3, 24);
    const g = gcd(a, b);
    const pair = rng.pick([
      { first: "cats", second: "dogs" },
      { first: "red beads", second: "blue beads" },
      { first: "cyclists", second: "walkers" },
      { first: "apples", second: "oranges" },
    ] as const);

    return {
      stem: `There are ${a} ${pair.first} and ${b} ${pair.second}. What is the ratio of **${pair.first} to ${pair.second}**, in simplest form?`,
      audioText: `${a} ${pair.first} and ${b} ${pair.second}. What is the ratio of ${pair.first} to ${pair.second}?`,
      correct: `${a / g}:${b / g}`,
      distractors: [
        {
          // The whole point: order carries meaning.
          value: `${b / g}:${a / g}`,
          misconception: "ratio_order_swap",
        },
        { value: `${a}:${b}`, misconception: "distractor_plausible" },
        { value: `${a / g}:${a / g + b / g}`, misconception: "used_part_not_whole" },
        { value: `${a + b}:${g}`, misconception: "added_instead_of_multiplied" },
      ],
      explanation: `${a} to ${b}, divided through by ${g}, is ${a / g}:${b / g}. Order matters: ${b / g}:${a / g} would be the ratio of ${pair.second} to ${pair.first}, a different statement.`,
      hints: [
        "Write the quantities in the order the question names them.",
        "Divide both by their greatest common factor.",
      ],
      difficulty: 1240,
    };
  },
});

/** MA.6.AR.3.2 — Unit rate. */
export const g6UnitRate = mcGenerator({
  key: "g6.ar.unitRate",
  benchmark: "MA.6.AR.3.2",
  skillSlug: "unit-rate",
  skillTitle: "Working out a unit rate",
  build(rng) {
    const units = rng.int(3, 12);
    const perUnit = rng.int(2, 25);
    const total = units * perUnit;
    const setting = rng.pick(SETTINGS);

    return {
      stem: `${COMMA(total)} ${setting.units} are packed into ${units} identical boxes. What is the **unit rate** in ${setting.units} per box?`,
      audioText: `${total} items in ${units} identical boxes. What is the rate per box?`,
      correct: `${perUnit} per box`,
      distractors: [
        {
          value: `${COMMA(total * units)} per box`,
          misconception: "multiplied_instead_of_divided",
        },
        {
          value: `${round(units / total, 3)} per box`,
          misconception: "reversed_dividend_divisor",
        },
        { value: `${COMMA(total)} per box`, misconception: "used_part_not_whole" },
        { value: `${perUnit + 1} per box`, misconception: "off_by_one_factor" },
      ],
      explanation: `A unit rate is the amount for exactly one: ${COMMA(total)} ÷ ${units} = ${perUnit} ${setting.units} per box.`,
      hints: [
        `"Per box" means divide by the number of boxes.`,
        "A unit rate always has 1 in the second quantity.",
      ],
      difficulty: 1230,
    };
  },
});

/** MA.6.AR.3.3 — Complete a table of equivalent ratios. */
export const g6RatioTable = mcGenerator({
  key: "g6.ar.ratioTable",
  benchmark: "MA.6.AR.3.3",
  skillSlug: "equivalent-ratios",
  skillTitle: "Tables of equivalent ratios",
  build(rng) {
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    const k = rng.int(3, 8);
    const shown = [1, 2].map((m) => `${a * m}:${b * m}`);

    return {
      stem: `These ratios are equivalent: ${listWords(shown)}. If the first number is **${a * k}**, what is the second?`,
      audioText: `Equivalent ratios ${shown.join(" and ")}. If the first number is ${a * k}, what is the second?`,
      correct: String(b * k),
      distractors: [
        {
          // Added the same amount to both instead of scaling.
          value: String(b + (a * k - a)),
          misconception: "added_instead_of_multiplied",
        },
        { value: String(a * k), misconception: "ratio_order_swap" },
        { value: String(b * (k + 1)), misconception: "off_by_one_factor" },
        { value: String(Math.round((a * k) / b)), misconception: "reversed_dividend_divisor" },
      ],
      explanation: `${a * k} ÷ ${a} = ${k}, so the whole ratio has been scaled by ${k}. The second number scales the same way: ${b} × ${k} = ${b * k}. Adding to both would change the ratio.`,
      hints: [
        "What was the first number multiplied by?",
        "Multiply the second by the same amount.",
      ],
      difficulty: 1260,
      fallback: nearbyNumbers(b * k, { min: 1 }),
    };
  },
});

/** MA.6.AR.3.4 — Percentages via ratio reasoning. */
export const g6Percent = mcGenerator({
  key: "g6.ar.percent",
  benchmark: "MA.6.AR.3.4",
  skillSlug: "percent-problems",
  skillTitle: "Percentage problems",
  build(rng, ctx) {
    const pct = rng.pick([10, 20, 25, 30, 40, 50, 60, 75, 80] as const);
    const whole = rng.int(4, 40) * 5;
    const part = round((pct / 100) * whole, 2);
    const findWhole = ctx.difficulty === "stretch" && rng.bool();

    if (findWhole) {
      return {
        stem: `**${pct}%** of a number is **${decimalText(part, 2).replace(/\.00$/, "")}**. What is the number?`,
        audioText: `${pct} percent of a number is ${part}. What is the number?`,
        correct: COMMA(whole),
        distractors: [
          {
            value: COMMA(round((pct / 100) * part, 2)),
            misconception: "converted_wrong_direction",
          },
          { value: COMMA(round(part * 100, 2)), misconception: "percent_shift_wrong_way" },
          { value: COMMA(round(part + pct, 2)), misconception: "added_instead_of_multiplied" },
          { value: COMMA(whole + 10), misconception: "off_by_one" },
        ],
        explanation: `${pct}% is ${pct}/100 of the number, so the number is ${decimalText(part, 2).replace(/\.00$/, "")} ÷ ${pct / 100} = ${COMMA(whole)}. Going backwards from a percentage means dividing, not multiplying.`,
        hints: [
          "The part is smaller than the whole, so the whole is bigger.",
          "Divide by the percentage written as a decimal.",
        ],
        difficulty: 1330,
      };
    }

    return {
      stem: `What is **${pct}%** of ${COMMA(whole)}?`,
      audioText: `What is ${pct} percent of ${whole}?`,
      correct: decimalText(part, 2).replace(/\.00$/, ""),
      distractors: [
        {
          value: COMMA(round(whole / pct, 2)),
          misconception: "converted_wrong_direction",
        },
        { value: COMMA(round(whole * pct, 2)), misconception: "percent_shift_wrong_way" },
        { value: COMMA(whole - pct), misconception: "wrong_operation" },
        { value: COMMA(round(part * 10, 2)), misconception: "decimal_point_misplaced" },
      ],
      explanation: `${pct}% means ${pct} out of every 100, so multiply by ${pct / 100}: ${COMMA(whole)} × ${pct / 100} = ${decimalText(part, 2).replace(/\.00$/, "")}.`,
      hints: [
        "Turn the percentage into a decimal first.",
        `"Of" means multiply.`,
      ],
      difficulty: 1250,
    };
  },
});

/** MA.6.AR.3.5 — Problems with rates and unit rates. */
export const g6RateProblem = mcGenerator({
  key: "g6.ar.rateProblem",
  benchmark: "MA.6.AR.3.5",
  skillSlug: "rate-problems",
  skillTitle: "Rate story problems",
  build(rng) {
    const who = rng.pick(NAMES);
    const rate = rng.int(3, 18);
    const known = rng.int(3, 9);
    const target = rng.int(10, 30);
    const total = rate * known;
    const answer = rate * target;

    return {
      stem: `${who} reads ${COMMA(total)} pages in ${known} hours at a steady rate. How many pages in **${target} hours**?`,
      audioText: `${total} pages in ${known} hours at a steady rate. How many pages in ${target} hours?`,
      correct: COMMA(answer),
      distractors: [
        {
          // Never found the unit rate; scaled the total by the new time.
          value: COMMA(total * target),
          misconception: "used_part_not_whole",
        },
        { value: COMMA(total + target), misconception: "added_instead_of_multiplied" },
        { value: COMMA(rate), misconception: "used_part_not_whole" },
        { value: COMMA(answer + rate), misconception: "off_by_one_factor" },
      ],
      explanation: `First the unit rate: ${COMMA(total)} ÷ ${known} = ${rate} pages per hour. Then ${rate} × ${target} = ${COMMA(answer)} pages.`,
      hints: [
        "Find how much happens in one hour first.",
        "Then multiply by the new number of hours.",
      ],
      difficulty: 1290,
      fallback: nearbyNumbers(answer, { min: 1 }),
    };
  },
});

/* ------------------------------------------------------------------ *
 * Geometry
 * ------------------------------------------------------------------ */

/** MA.6.GR.1.1 — Plot in all four quadrants. */
export const g6Quadrants = mcGenerator({
  key: "g6.gr.quadrants",
  benchmark: "MA.6.GR.1.1",
  skillSlug: "four-quadrants",
  skillTitle: "Points in all four quadrants",
  build(rng) {
    const x = rng.int(1, 9) * (rng.bool() ? 1 : -1);
    const y = rng.int(1, 9) * (rng.bool() ? 1 : -1);
    const quadrant = x > 0 ? (y > 0 ? "I" : "IV") : y > 0 ? "II" : "III";

    return {
      stem: `In which **quadrant** does the point (${x}, ${y}) lie?`,
      audioText: `In which quadrant is the point ${x} comma ${y}?`,
      correct: `Quadrant ${quadrant}`,
      distractors: (["I", "II", "III", "IV"] as const)
        .filter((q) => q !== quadrant)
        .map((q) => ({
          value: `Quadrant ${q}`,
          misconception: "quadrant_sign_swap" as const,
        })),
      explanation: `x is ${x > 0 ? "positive" : "negative"} and y is ${y > 0 ? "positive" : "negative"}, which places it in Quadrant ${quadrant}. The quadrants are numbered anticlockwise from the top right.`,
      hints: [
        "Check the sign of each coordinate.",
        "Quadrant I is top right; the numbering goes anticlockwise.",
      ],
      difficulty: 1220,
      widget: { key: "coordinate-grid", config: { points: [{ x, y }], min: -10, max: 10 } },
    };
  },
});

/** MA.6.GR.1.2 — Distance between points sharing a coordinate. */
export const g6Distance = mcGenerator({
  key: "g6.gr.distance",
  benchmark: "MA.6.GR.1.2",
  skillSlug: "distance-on-a-grid",
  skillTitle: "Distance between two points",
  build(rng) {
    const horizontal = rng.bool();
    const shared = rng.int(-8, 8);
    const p1 = rng.int(-9, 9);
    let p2 = rng.int(-9, 9);
    while (p2 === p1) p2 = rng.int(-9, 9);
    const distance = Math.abs(p2 - p1);

    const a = horizontal ? { x: p1, y: shared } : { x: shared, y: p1 };
    const b = horizontal ? { x: p2, y: shared } : { x: shared, y: p2 };

    return {
      stem: `How far apart are **(${a.x}, ${a.y})** and **(${b.x}, ${b.y})**?`,
      audioText: `How far apart are the points ${a.x} comma ${a.y} and ${b.x} comma ${b.y}?`,
      correct: `${distance} units`,
      distractors: [
        // Only wrong when the subtraction actually comes out negative; the
        // other way round it is simply the right answer.
        ...(p2 < p1
          ? [
              {
                value: `${p2 - p1} units`,
                misconception: "absolute_value_kept_sign" as const,
              },
            ]
          : [
              {
                value: `${p1 - p2} units`,
                misconception: "absolute_value_kept_sign" as const,
              },
            ]),
        { value: `${Math.abs(p1 + p2)} units`, misconception: "range_as_sum" },
        { value: `${distance + 1} units`, misconception: "counted_endpoints" },
        { value: `${Math.abs(shared)} units`, misconception: "coordinates_swapped" },
        { value: `${distance + 2} units`, misconception: "off_by_one" },
        { value: `${Math.max(1, distance - 1)} units`, misconception: "off_by_one" },
      ],
      explanation: `They share the same ${horizontal ? "y" : "x"}-coordinate, so the distance is the difference in the other one: |${p2} − ${p1}| = ${distance}. A distance is never negative.`,
      hints: [
        "Which coordinate is the same in both points?",
        "Subtract the other pair and take the absolute value.",
      ],
      difficulty: 1260,
      widget: { key: "coordinate-grid", config: { points: [a, b], min: -10, max: 10 } },
    };
  },
});

/** MA.6.GR.1.3 — Perimeter and area from plotted points. */
export const g6PlottedRectangle = mcGenerator({
  key: "g6.gr.plottedRectangle",
  benchmark: "MA.6.GR.1.3",
  skillSlug: "rectangle-from-points",
  skillTitle: "Area and perimeter from coordinates",
  build(rng) {
    const x1 = rng.int(-8, 2);
    const y1 = rng.int(-8, 2);
    const w = rng.int(2, 9);
    const h = rng.int(2, 9);
    const x2 = x1 + w;
    const y2 = y1 + h;
    const area = w * h;
    const perimeter = 2 * (w + h);
    const askArea = rng.bool();

    return {
      stem: `A rectangle has corners at (${x1}, ${y1}), (${x2}, ${y1}), (${x2}, ${y2}) and (${x1}, ${y2}). What is its **${askArea ? "area" : "perimeter"}**?`,
      audioText: `A rectangle with corners at those points. What is its ${askArea ? "area" : "perimeter"}?`,
      correct: askArea ? `${area} square units` : `${perimeter} units`,
      distractors: [
        {
          value: askArea ? `${perimeter} square units` : `${area} units`,
          misconception: "perimeter_area_confusion",
        },
        {
          value: askArea ? `${w + h} square units` : `${w + h} units`,
          misconception: "used_part_not_whole",
        },
        {
          value: askArea ? `${area} units` : `${perimeter} square units`,
          misconception: "ignored_units",
        },
        {
          value: askArea ? `${area + w} square units` : `${perimeter + 2} units`,
          misconception: "off_by_one",
        },
      ],
      explanation: `The width is |${x2} − ${x1}| = ${w} and the height is |${y2} − ${y1}| = ${h}. ${askArea ? `Area = ${w} × ${h} = ${area} square units.` : `Perimeter = 2 × (${w} + ${h}) = ${perimeter} units.`}`,
      hints: [
        "Find the side lengths from the coordinates first.",
        "Negative coordinates do not make negative lengths.",
      ],
      difficulty: 1290,
      widget: {
        key: "coordinate-grid",
        config: {
          points: [
            { x: x1, y: y1 },
            { x: x2, y: y1 },
            { x: x2, y: y2 },
            { x: x1, y: y2 },
          ],
          min: -10,
          max: 12,
          connect: true,
        },
      },
    };
  },
});

/** MA.6.GR.2.1 — Area of a right triangle. */
export const g6TriangleArea = mcGenerator({
  key: "g6.gr.triangleArea",
  benchmark: "MA.6.GR.2.1",
  skillSlug: "triangle-area",
  skillTitle: "Area of a triangle",
  build(rng) {
    const base = rng.int(3, 20) * 2;
    const height = rng.int(3, 18);
    const area = (base * height) / 2;

    return {
      stem: `A right triangle has a base of **${base} cm** and a height of **${height} cm**. What is its area?`,
      audioText: `A right triangle with base ${base} and height ${height} centimetres. What is its area?`,
      correct: `${area} cm²`,
      distractors: [
        {
          // Forgot to halve — the definitive error for this formula.
          value: `${base * height} cm²`,
          misconception: "used_part_not_whole",
        },
        { value: `${base + height} cm²`, misconception: "added_instead_of_multiplied" },
        { value: `${2 * (base + height)} cm²`, misconception: "perimeter_area_confusion" },
        { value: `${area} cm`, misconception: "ignored_units" },
        { value: `${Math.round(area / 2)} cm²`, misconception: "off_by_one_factor" },
        { value: `${area + base} cm²`, misconception: "off_by_one_factor" },
      ],
      explanation: `A triangle is half a rectangle with the same base and height: ${base} × ${height} ÷ 2 = ${area} cm².`,
      hints: [
        "Picture the rectangle the triangle fits inside.",
        "The triangle is exactly half of it.",
      ],
      difficulty: 1240,
    };
  },
});

/** MA.6.GR.2.2 — Area of a composite figure. */
export const g6CompositeArea = mcGenerator({
  key: "g6.gr.compositeArea",
  benchmark: "MA.6.GR.2.2",
  skillSlug: "composite-area-g6",
  skillTitle: "Area by decomposing a figure",
  build(rng) {
    const w = rng.int(6, 16);
    const h = rng.int(4, 12);
    const triBase = rng.int(2, w - 2);
    const triHeight = rng.int(2, 10);
    const area = w * h + (triBase * triHeight) / 2;

    return {
      stem: `A shape is made of a **${w} m by ${h} m rectangle** with a **triangle** on top whose base is ${triBase} m and height is ${triHeight} m. What is the total area?`,
      audioText: `A ${w} by ${h} rectangle with a triangle on top, base ${triBase} and height ${triHeight}. What is the total area?`,
      correct: `${area} m²`,
      distractors: [
        {
          value: `${w * h + triBase * triHeight} m²`,
          misconception: "used_part_not_whole",
        },
        { value: `${w * h} m²`, misconception: "used_part_not_whole" },
        {
          value: `${(w + triBase) * (h + triHeight)} m²`,
          misconception: "order_of_operations",
        },
        { value: `${area + w} m²`, misconception: "off_by_one_factor" },
      ],
      explanation: `Rectangle: ${w} × ${h} = ${w * h} m². Triangle: ${triBase} × ${triHeight} ÷ 2 = ${(triBase * triHeight) / 2} m². Total ${area} m². The triangle still needs halving even when it is part of a bigger shape.`,
      hints: [
        "Split the shape into pieces you know formulas for.",
        "Do not forget the ÷ 2 on the triangle.",
      ],
      difficulty: 1320,
    };
  },
});

/** MA.6.GR.2.3 — Volume with rational edge lengths. */
export const g6Volume = mcGenerator({
  key: "g6.gr.volume",
  benchmark: "MA.6.GR.2.3",
  skillSlug: "volume-rational-edges",
  skillTitle: "Volume with decimal edge lengths",
  build(rng) {
    const l = round(rng.int(20, 80) / 10, 1);
    const w = round(rng.int(20, 60) / 10, 1);
    const h = rng.int(2, 9);
    const volume = round(l * w * h, 2);

    return {
      stem: `A box measures **${decimalText(l, 1)} m** by **${decimalText(w, 1)} m** by **${h} m**. What is its volume?`,
      audioText: `A box ${decimalText(l, 1)} by ${decimalText(w, 1)} by ${h} metres. What is its volume?`,
      correct: `${decimalText(volume, 2)} m³`,
      distractors: [
        { value: `${decimalText(round(l * w, 2), 2)} m³`, misconception: "volume_as_area" },
        {
          value: `${decimalText(round(volume * 10, 2), 2)} m³`,
          misconception: "decimal_point_misplaced",
        },
        {
          value: `${decimalText(round(l + w + h, 1), 1)} m³`,
          misconception: "added_instead_of_multiplied",
        },
        { value: `${decimalText(volume, 2)} m²`, misconception: "ignored_units" },
      ],
      explanation: `Volume is length × width × height, decimals and all: ${decimalText(l, 1)} × ${decimalText(w, 1)} × ${h} = ${decimalText(volume, 2)} m³.`,
      hints: [
        "All three dimensions multiply together.",
        "Count the decimal places as you go.",
      ],
      difficulty: 1290,
    };
  },
});

/** MA.6.GR.2.4 — Surface area from a net. */
export const g6SurfaceArea = mcGenerator({
  key: "g6.gr.surfaceArea",
  benchmark: "MA.6.GR.2.4",
  skillSlug: "surface-area",
  skillTitle: "Surface area of a prism",
  build(rng) {
    const l = rng.int(2, 12);
    const w = rng.int(2, 10);
    const h = rng.int(2, 9);
    const surface = 2 * (l * w + l * h + w * h);

    return {
      stem: `A rectangular prism is **${l} cm** by **${w} cm** by **${h} cm**. What is its **surface area**?`,
      audioText: `A rectangular prism ${l} by ${w} by ${h} centimetres. What is its surface area?`,
      correct: `${COMMA(surface)} cm²`,
      distractors: [
        {
          // Counted each pair of faces only once.
          value: `${COMMA(l * w + l * h + w * h)} cm²`,
          misconception: "surface_area_missing_faces",
        },
        { value: `${COMMA(l * w * h)} cm²`, misconception: "volume_as_area" },
        // Treating every face as if it matched the first one. On a cube that
        // happens to be right, so it is only offered when it is wrong.
        ...(l * w * 6 !== surface
          ? [
              {
                value: `${COMMA(l * w * 6)} cm²`,
                misconception: "surface_area_missing_faces" as const,
              },
            ]
          : []),
        { value: `${COMMA(surface)} cm³`, misconception: "ignored_units" },
        { value: `${COMMA(4 * (l * w + l * h))} cm²`, misconception: "surface_area_missing_faces" },
        { value: `${COMMA(surface + l * w)} cm²`, misconception: "off_by_one_factor" },
      ],
      explanation: `The six faces come in three matching pairs: ${l}×${w} = ${l * w}, ${l}×${h} = ${l * h} and ${w}×${h} = ${w * h}. Two of each: 2 × (${l * w} + ${l * h} + ${w * h}) = ${COMMA(surface)} cm².`,
      hints: [
        "Unfold the box into its net and count the rectangles.",
        "Opposite faces are identical, so there are three pairs.",
      ],
      difficulty: 1340,
      widget: { key: "solid-explorer", config: { solid: "rectangular-prism", highlight: "faces" } },
    };
  },
});

/* ------------------------------------------------------------------ *
 * Data and probability
 * ------------------------------------------------------------------ */

/** MA.6.DP.1.1 — Recognise a statistical question. */
export const g6StatisticalQuestion = mcGenerator({
  key: "g6.dp.statisticalQuestion",
  benchmark: "MA.6.DP.1.1",
  skillSlug: "statistical-questions",
  skillTitle: "Recognising a statistical question",
  build(rng) {
    const good = [
      "How many minutes do students in this class sleep each night?",
      "How tall are the trees in the school grounds?",
      "How many books does each pupil read in a month?",
      "How long does it take each student to walk to school?",
    ];
    const bad = [
      "How old is our teacher?",
      "How many days are there in March?",
      "What time does this school open?",
      "How many legs does a spider have?",
    ];
    const answer = rng.pick(good);

    return {
      stem: `Which of these is a **statistical question**?`,
      audioText: "Which of these is a statistical question?",
      correct: answer,
      distractors: rng.shuffle(bad).slice(0, 3).map((b) => ({
        value: b,
        misconception: "distractor_plausible" as const,
      })),
      explanation: `A statistical question expects **variability** — different answers from different members of a group. "${answer}" does; the others have one fixed answer, so there is nothing to summarise.`,
      hints: [
        "Would different people give different answers?",
        "A question with one right answer is not statistical.",
      ],
      difficulty: 1200,
    };
  },
});

/** MA.6.DP.1.2 — Mean, median, mode and range. */
export const g6Averages = mcGenerator({
  key: "g6.dp.averages",
  benchmark: "MA.6.DP.1.2",
  skillSlug: "averages-g6",
  skillTitle: "Mean, median, mode and range",
  build(rng, ctx) {
    const size = rng.pick([5, 7] as const);
    const target = rng.int(10, 40);
    const values: number[] = [];
    let sum = 0;
    for (let i = 0; i < size - 1; i++) {
      const v = rng.int(Math.max(1, target - 10), target + 10);
      values.push(v);
      sum += v;
    }
    values.push(Math.max(1, target * size - sum));
    const sorted = [...values].sort((a, b) => a - b);

    const want = rng.pick(
      ctx.difficulty === "easy" ? (["mean", "range"] as const) : (["mean", "median", "range"] as const),
    );
    const answer =
      want === "mean" ? Math.round(mean(values)) : want === "median" ? median(values) : range(values);

    return {
      stem: `Find the **${want}**:\n\n**${sorted.join(", ")}**`,
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
          ? `Total ${values.reduce((a, b) => a + b, 0)} ÷ ${size} values = ${Math.round(mean(values))}.`
          : want === "median"
            ? `Sorted, the middle value is ${median(values)}.`
            : `${Math.max(...values)} − ${Math.min(...values)} = ${range(values)}.`,
      hints: [
        "Sort the numbers before you start.",
        "Mean is a total shared out; median is the middle; range is a spread.",
      ],
      difficulty: 1230,
      fallback: nearbyNumbers(answer, { min: 0 }),
    };
  },
});

/** MA.6.DP.1.3 — Read a box plot. */
export const g6BoxPlot = mcGenerator({
  key: "g6.dp.boxPlot",
  benchmark: "MA.6.DP.1.3",
  skillSlug: "box-plots",
  skillTitle: "Reading a box plot",
  build(rng, ctx) {
    const values = Array.from({ length: 9 }, () => rng.int(5, 80)).sort((a, b) => a - b);
    const s = fiveNumberSummary(values);
    const want = rng.pick(
      ctx.difficulty === "easy"
        ? (["minimum", "maximum", "median"] as const)
        : (["minimum", "maximum", "median", "lower quartile", "upper quartile"] as const),
    );
    const answer =
      want === "minimum" ? s.min : want === "maximum" ? s.max : want === "median" ? s.median : want === "lower quartile" ? s.q1 : s.q3;

    return {
      stem: `A box plot is drawn from this data:\n\n**${values.join(", ")}**\n\nWhat is the **${want}**?`,
      audioText: `From the data ${values.join(", ")}, what is the ${want}?`,
      correct: String(answer),
      distractors: [
        { value: String(s.median), misconception: "mean_median_confusion" },
        { value: String(s.max), misconception: "used_part_not_whole" },
        { value: String(s.min), misconception: "used_part_not_whole" },
        { value: String(range(values)), misconception: "range_as_sum" },
        { value: String(answer + 1), misconception: "off_by_one" },
      ],
      explanation: `In order, the five-number summary is minimum ${s.min}, lower quartile ${s.q1}, median ${s.median}, upper quartile ${s.q3}, maximum ${s.max}. The box spans the quartiles and the line inside it is the median.`,
      hints: [
        "The whiskers reach the smallest and largest values.",
        "The box holds the middle half of the data.",
      ],
      difficulty: 1310,
      widget: { key: "box-plot", config: { values } },
      fallback: nearbyNumbers(answer, { min: 0, max: 100 }),
    };
  },
});

/** MA.6.DP.1.4 — Describe a distribution. */
export const g6Distribution = mcGenerator({
  key: "g6.dp.distribution",
  benchmark: "MA.6.DP.1.4",
  skillSlug: "describe-distribution",
  skillTitle: "Describing the shape of data",
  build(rng) {
    const shape = rng.pick(["clustered", "spread out", "with an outlier"] as const);
    const centre = rng.int(20, 60);
    const values =
      shape === "clustered"
        ? Array.from({ length: 8 }, () => centre + rng.int(-3, 3))
        : shape === "spread out"
          ? Array.from({ length: 8 }, () => centre + rng.int(-25, 25))
          : [...Array.from({ length: 7 }, () => centre + rng.int(-3, 3)), centre + 60];
    const sorted = [...values].sort((a, b) => a - b);

    const answers = {
      clustered: "The values are tightly grouped, with a small range",
      "spread out": "The values are widely spread, with a large range",
      "with an outlier": "Most values are grouped together, but one is far from the rest",
    } as const;

    return {
      stem: `Describe this data set:\n\n**${sorted.join(", ")}**`,
      audioText: `Describe the data ${sorted.join(", ")}.`,
      correct: answers[shape],
      distractors: [
        ...(Object.keys(answers) as (keyof typeof answers)[])
          .filter((k) => k !== shape)
          .map((k) => ({
            value: answers[k] as string,
            misconception: "distractor_plausible" as const,
          })),
        {
          value: "The values increase steadily from smallest to largest",
          misconception: "distractor_plausible" as const,
        },
      ],
      explanation: `The range is ${range(values)} and the values sit ${shape === "clustered" ? `close to ${Math.round(mean(values))}` : shape === "spread out" ? "far apart across the whole range" : `close together except for ${Math.max(...values)}, which is well away from the rest`}. ${shape === "with an outlier" ? "A single distant value pulls the mean but barely moves the median — which is why the median is often the fairer summary." : ""}`,
      hints: [
        "Look at how far apart the values are.",
        "Is there one value that does not fit with the others?",
      ],
      difficulty: 1280,
    };
  },
});

/** MA.6.DP.1.5 — Build a histogram. */
export const g6Histogram = mcGenerator({
  key: "g6.dp.histogram",
  benchmark: "MA.6.DP.1.5",
  skillSlug: "histograms",
  skillTitle: "Building a histogram",
  build(rng) {
    const width = rng.pick([5, 10] as const);
    const values = Array.from({ length: rng.int(10, 16) }, () => rng.int(0, 4 * width - 1));
    const binStart = rng.int(0, 3) * width;
    const count = values.filter((v) => v >= binStart && v < binStart + width).length;

    return {
      stem: `These values are grouped into intervals of width **${width}**:\n\n**${[...values].sort((a, b) => a - b).join(", ")}**\n\nHow many fall in the interval **${binStart}–${binStart + width - 1}**?`,
      audioText: `How many of those values fall between ${binStart} and ${binStart + width - 1}?`,
      correct: String(count),
      distractors: [
        {
          // Included the upper bound, which belongs to the next bar.
          value: String(values.filter((v) => v >= binStart && v <= binStart + width).length),
          misconception: "counted_endpoints",
        },
        { value: String(values.length), misconception: "used_part_not_whole" },
        { value: String(width), misconception: "read_scale_by_ones" },
        { value: String(count + 1), misconception: "off_by_one" },
      ],
      explanation: `Count only the values from ${binStart} up to but not including ${binStart + width}: there ${count === 1 ? "is 1" : `are ${count}`}. Each value belongs to exactly one bar, so the intervals must not overlap.`,
      hints: [
        "Each interval includes its lower end but not its upper one.",
        "Every value goes in exactly one bar.",
      ],
      difficulty: 1290,
      fallback: nearbyNumbers(count, { min: 0, max: 20 }),
    };
  },
});

/** MA.6.DP.1.6 — Effect of changing a data value. */
export const g6ChangeEffect = mcGenerator({
  key: "g6.dp.changeEffect",
  benchmark: "MA.6.DP.1.6",
  skillSlug: "effect-on-averages",
  skillTitle: "How changing a value affects the averages",
  build(rng) {
    const base = Array.from({ length: 7 }, () => rng.int(18, 32)).sort((a, b) => a - b);
    const outlier = Math.max(...base) + rng.int(40, 90);
    const withOutlier = [...base, outlier];

    const oldMean = round(mean(base), 1);
    const newMean = round(mean(withOutlier), 1);
    const oldMedian = median(base);
    const newMedian = median(withOutlier);

    return {
      stem: `A data set is **${base.join(", ")}**. A new value of **${outlier}** is added. What happens?`,
      audioText: `Adding ${outlier} to that data set. What happens to the mean and the median?`,
      correct: "The mean rises a lot; the median barely changes",
      distractors: [
        {
          value: "Both the mean and the median rise a lot",
          misconception: "mean_median_confusion",
        },
        {
          value: "The median rises a lot; the mean barely changes",
          misconception: "mean_median_confusion",
        },
        {
          value: "Neither changes, because it is only one value",
          misconception: "distractor_plausible",
        },
      ],
      explanation: `The mean goes from ${oldMean} to ${newMean}, because every value is added in and one large number drags the total up. The median moves only from ${oldMedian} to ${newMedian}, because it depends on position, not size. That is why the median is the fairer summary when there is an outlier.`,
      hints: [
        "The mean uses every value's size; the median uses only its position.",
        "Which one can one extreme value move?",
      ],
      difficulty: 1350,
    };
  },
});
