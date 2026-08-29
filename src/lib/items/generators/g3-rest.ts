import { mcGenerator, nearbyNumbers } from "../build";
import { NAMES, SETTINGS, listWords } from "../story";

/**
 * Grade 3: algebraic reasoning, measurement, geometry and data.
 *
 * Two things arrive this year that the earlier grades never demanded: area,
 * which children reliably confuse with perimeter, and elapsed time, which is
 * the first place they meet a number system that is not base ten. Both get
 * distractors built from that specific confusion rather than from near misses.
 */

/* ------------------------------------------------------------------ *
 * Algebraic reasoning
 * ------------------------------------------------------------------ */

/** MA.3.AR.1.1 — Distributive property and multiplication properties. */
export const g3Distributive = mcGenerator({
  key: "g3.ar.distributive",
  benchmark: "MA.3.AR.1.1",
  skillSlug: "distributive-property",
  skillTitle: "Breaking a multiplication into easier parts",
  build(rng, ctx) {
    const a = rng.int(3, 9);
    const b = rng.int(ctx.difficulty === "easy" ? 6 : 11, 15);
    const split = rng.int(2, b - 2);
    const rest = b - split;

    return {
      stem: `Which is another way to work out **${a} × ${b}**?`,
      audioText: `Which is another way to work out ${a} times ${b}?`,
      correct: `(${a} × ${split}) + (${a} × ${rest})`,
      distractors: [
        {
          // Split only one side of the product and forgot to multiply again.
          value: `(${a} × ${split}) + ${rest}`,
          misconception: "distractor_plausible",
        },
        {
          value: `(${a} × ${split}) × (${a} × ${rest})`,
          misconception: "wrong_operation",
        },
        {
          value: `(${a} + ${split}) × (${a} + ${rest})`,
          misconception: "added_instead_of_multiplied",
        },
      ],
      explanation: `${b} is ${split} + ${rest}, so ${a} groups of ${b} is ${a} groups of ${split} plus ${a} groups of ${rest}: ${a * split} + ${a * rest} = ${a * b}.`,
      hints: [
        `Split ${b} into two smaller numbers.`,
        "Each piece still gets multiplied by the same number.",
      ],
      difficulty: 1140,
      widget: {
        key: "array-builder",
        config: { rows: a, cols: b, split },
      },
    };
  },
});

/** MA.3.AR.1.2 — One- and two-step problems with any operation. */
export const g3FourOpProblem = mcGenerator({
  key: "g3.ar.fourOpProblem",
  benchmark: "MA.3.AR.1.2",
  skillSlug: "four-operation-problems",
  skillTitle: "Story problems with all four operations",
  build(rng, ctx) {
    const who = rng.pick(NAMES);
    const setting = rng.pick(SETTINGS);
    const groups = rng.int(3, 9);
    const each = rng.int(4, 12);
    const extra = rng.int(3, 20);
    const twoStep = ctx.difficulty !== "easy";

    if (!twoStep) {
      const total = groups * each;
      const stem = `${who} packed ${groups} crates with ${each} ${setting.units} in each. How many ${setting.units} were packed?`;
      return {
        stem,
        audioText: stem,
        correct: String(total),
        distractors: [
          { value: String(groups + each), misconception: "added_instead_of_multiplied" },
          { value: String(total - each), misconception: "off_by_one_factor" },
          { value: String(Math.abs(groups - each)), misconception: "wrong_operation" },
          { value: String(total + groups), misconception: "off_by_one_factor" },
        ],
        explanation: `${groups} equal crates of ${each} is ${groups} × ${each} = ${total}.`,
        hints: ["Equal groups means multiply."],
        difficulty: 1050,
        fallback: nearbyNumbers(groups * each, { min: 0, max: 400 }),
      };
    }

    const total = groups * each + extra;
    const stem = `${who} packed ${groups} crates with ${each} ${setting.units} in each, and then found ${extra} more ${setting.units} loose on the shelf. How many ${setting.units} are there in total?`;

    return {
      stem,
      audioText: stem,
      correct: String(total),
      distractors: [
        {
          // Stopped at the multiplication and never added the loose ones.
          value: String(groups * each),
          misconception: "used_part_not_whole",
        },
        {
          // Added everything in sight.
          value: String(groups + each + extra),
          misconception: "added_instead_of_multiplied",
        },
        {
          // Multiplied the total instead of adding.
          value: String(groups * (each + extra)),
          misconception: "order_of_operations",
        },
        { value: String(total - 1), misconception: "off_by_one" },
      ],
      explanation: `First the crates: ${groups} × ${each} = ${groups * each}. Then the loose ones: ${groups * each} + ${extra} = ${total}.`,
      hints: [
        "Work out the packed ones first.",
        "The loose ones are added at the end, not multiplied.",
      ],
      difficulty: 1160,
      fallback: nearbyNumbers(total, { min: 0, max: 400 }),
    };
  },
});

/** MA.3.AR.2.1 — Restate division as a missing factor. */
export const g3MissingFactor = mcGenerator({
  key: "g3.ar.missingFactor",
  benchmark: "MA.3.AR.2.1",
  skillSlug: "division-as-missing-factor",
  skillTitle: "Seeing division as a missing factor",
  build(rng) {
    const a = rng.int(2, 12);
    const b = rng.int(2, 12);
    const product = a * b;

    return {
      stem: `Which multiplication sentence means the same as **${product} ÷ ${b} = ?**`,
      audioText: `Which multiplication sentence means the same as ${product} divided by ${b}?`,
      correct: `${b} × ___ = ${product}`,
      distractors: [
        {
          value: `${product} × ${b} = ___`,
          misconception: "multiplied_instead_of_divided",
        },
        {
          value: `___ × ${product} = ${b}`,
          misconception: "reversed_dividend_divisor",
        },
        {
          value: `${b} + ___ = ${product}`,
          misconception: "wrong_operation",
        },
      ],
      explanation: `Dividing ${product} by ${b} asks how many ${b}s fit into ${product} — that is, what times ${b} makes ${product}. Here it is ${a}.`,
      hints: [
        "Division undoes multiplication.",
        `Think: something times ${b} gives ${product}.`,
      ],
      difficulty: 1120,
    };
  },
});

/** MA.3.AR.2.2 — True or false multiplication and division equations. */
export const g3TrueFalseTimes = mcGenerator({
  key: "g3.ar.trueFalseTimes",
  benchmark: "MA.3.AR.2.2",
  skillSlug: "true-false-multiplication",
  skillTitle: "Deciding if a multiplication equation is true",
  build(rng) {
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const left = a * b;
    const makeTrue = rng.bool();
    const rightFactor = makeTrue && left % c === 0 ? left / c : rng.int(2, 12);
    const right = c * rightFactor;
    const isTrue = left === right;

    return {
      stem: `Is this true or false?\n\n**${a} × ${b} = ${c} × ${rightFactor}**`,
      audioText: `Is this true or false? ${a} times ${b} equals ${c} times ${rightFactor}.`,
      correct: isTrue ? "True" : "False",
      distractors: [
        { value: isTrue ? "False" : "True", misconception: "distractor_plausible" },
        {
          value: "True, because both sides multiply",
          misconception: "distractor_plausible",
        },
        {
          value: "You cannot compare two products",
          misconception: "distractor_plausible",
        },
      ],
      explanation: `${a} × ${b} = ${left} and ${c} × ${rightFactor} = ${right}. ${isTrue ? "They match, so it is true." : "They do not match, so it is false."}`,
      hints: [
        "Work out each side by itself.",
        "The equals sign says the two sides have the same value.",
      ],
      difficulty: 1090,
    };
  },
});

/** MA.3.AR.2.3 — Unknown in a multiplication or division equation. */
export const g3UnknownFactor = mcGenerator({
  key: "g3.ar.unknownFactor",
  benchmark: "MA.3.AR.2.3",
  skillSlug: "unknown-in-multiplication",
  skillTitle: "Finding the unknown in a multiplication",
  build(rng, ctx) {
    const a = rng.int(2, 12);
    const b = rng.int(2, ctx.difficulty === "easy" ? 6 : 12);
    const product = a * b;
    const shape = rng.pick(["factor", "product", "quotient"] as const);

    const stem =
      shape === "product"
        ? `${a} × ${b} = ___`
        : shape === "factor"
          ? `${a} × ___ = ${product}`
          : `${product} ÷ ___ = ${a}`;
    const answer = shape === "product" ? product : b;

    return {
      stem: `What number goes in the blank?\n\n**${stem}**`,
      audioText: `What number goes in the blank? ${stem.replace("___", "blank").replace("×", "times").replace("÷", "divided by")}`,
      correct: String(answer),
      distractors: [
        {
          value: String(shape === "product" ? a + b : product * a),
          misconception: shape === "product"
            ? "added_instead_of_multiplied"
            : "multiplied_instead_of_divided",
        },
        { value: String(a), misconception: "reversed_dividend_divisor" },
        { value: String(answer + 1), misconception: "off_by_one_factor" },
        { value: String(Math.max(1, answer - 1)), misconception: "off_by_one_factor" },
      ],
      explanation:
        shape === "product"
          ? `${a} × ${b} = ${product}.`
          : `${a} × ${b} = ${product}, so the missing number is ${b}.`,
      hints: [
        "Multiplication and division undo each other.",
        `What times ${a} gives ${product}?`,
      ],
      difficulty: shape === "product" ? 1020 : 1130,
      fallback: nearbyNumbers(answer, { min: 1, max: 200 }),
    };
  },
});

/** MA.3.AR.3.1 — Even or odd within 1,000. */
export const g3EvenOdd = mcGenerator({
  key: "g3.ar.evenOdd",
  benchmark: "MA.3.AR.3.1",
  skillSlug: "even-odd-to-1000",
  skillTitle: "Even and odd numbers to 1,000",
  build(rng) {
    const n = rng.int(101, 999);
    const even = n % 2 === 0;

    return {
      stem: `Is **${n}** even or odd?`,
      audioText: `Is ${n} even or odd?`,
      correct: even ? "Even" : "Odd",
      distractors: [
        { value: even ? "Odd" : "Even", misconception: "distractor_plausible" },
        {
          // Judged from the first digit rather than the last.
          value: `${Math.floor(n / 100) % 2 === 0 ? "Even" : "Odd"}, because of the hundreds digit`,
          misconception: "place_value_confusion",
        },
        { value: "Neither", misconception: "distractor_plausible" },
      ],
      explanation: `Only the ones digit matters. ${n} ends in ${n % 10}, which is ${even ? "even" : "odd"}, so ${n} is ${even ? "even" : "odd"}.`,
      hints: [
        "Look at the last digit only.",
        "0, 2, 4, 6 and 8 are even.",
      ],
      difficulty: 950,
    };
  },
});

/** MA.3.AR.3.2 — Is a number a multiple of a given one-digit number? */
export const g3Multiples = mcGenerator({
  key: "g3.ar.multiples",
  benchmark: "MA.3.AR.3.2",
  skillSlug: "multiples-of-one-digit",
  skillTitle: "Recognising multiples",
  build(rng) {
    const factor = rng.int(2, 9);
    const isMultiple = rng.bool();
    const n = isMultiple
      ? factor * rng.int(3, Math.floor(144 / factor))
      : factor * rng.int(3, Math.floor(140 / factor)) + rng.int(1, factor - 1);

    return {
      stem: `Is **${n}** a multiple of **${factor}**?`,
      audioText: `Is ${n} a multiple of ${factor}?`,
      correct: n % factor === 0 ? "Yes" : "No",
      distractors: [
        { value: n % factor === 0 ? "No" : "Yes", misconception: "distractor_plausible" },
        {
          value: `Only if you count ${factor} itself`,
          misconception: "distractor_plausible",
        },
        {
          value: `Yes, because ${n} is bigger than ${factor}`,
          misconception: "distractor_plausible",
        },
      ],
      explanation:
        n % factor === 0
          ? `${factor} × ${n / factor} = ${n}, so ${n} is a multiple of ${factor}.`
          : `${factor} × ${Math.floor(n / factor)} = ${factor * Math.floor(n / factor)} and ${factor} × ${Math.floor(n / factor) + 1} = ${factor * (Math.floor(n / factor) + 1)}. ${n} falls between them, so it is not a multiple of ${factor}.`,
      hints: [
        `Count up by ${factor} and see if you land on ${n}.`,
        "A multiple divides with nothing left over.",
      ],
      difficulty: 1100,
    };
  },
});

/** MA.3.AR.3.3 — Identify, create and extend numerical patterns. */
export const g3Patterns = mcGenerator({
  key: "g3.ar.patterns",
  benchmark: "MA.3.AR.3.3",
  skillSlug: "number-patterns",
  skillTitle: "Number patterns",
  build(rng, ctx) {
    const multiply = ctx.difficulty === "stretch" && rng.bool(0.5);
    const start = rng.int(2, 12);
    const step = multiply ? rng.pick([2, 3]) : rng.int(3, 12);

    const seq = [start];
    for (let i = 0; i < 3; i++) {
      seq.push(multiply ? seq[i] * step : seq[i] + step);
    }
    const answer = multiply ? seq[3] * step : seq[3] + step;

    return {
      stem: `What comes next?\n\n**${seq.join(", ")}, ___**`,
      audioText: `What comes next? ${seq.join(", ")}, blank.`,
      correct: String(answer),
      distractors: [
        {
          // Applied the other rule: added when the pattern multiplies, or vice versa.
          value: String(multiply ? seq[3] + step : seq[3] * step),
          misconception: multiply
            ? "added_instead_of_multiplied"
            : "multiplied_instead_of_divided",
        },
        { value: String(seq[3] + 1), misconception: "skip_count_wrong_step" },
        { value: String(answer + step), misconception: "off_by_one" },
        { value: String(seq[3]), misconception: "distractor_plausible" },
      ],
      explanation: multiply
        ? `Each number is ${step} times the one before: ${seq[3]} × ${step} = ${answer}.`
        : `Each number is ${step} more than the one before: ${seq[3]} + ${step} = ${answer}.`,
      hints: [
        "How do you get from one number to the next?",
        "Check your rule works between every pair, not just the first.",
      ],
      difficulty: multiply ? 1170 : 1040,
      fallback: nearbyNumbers(answer, { min: 0 }),
    };
  },
});

/* ------------------------------------------------------------------ *
 * Measurement
 * ------------------------------------------------------------------ */

/** MA.3.M.1.1 — Choose the right tool and unit. */
export const g3ChooseTool = mcGenerator({
  key: "g3.m.chooseTool",
  benchmark: "MA.3.M.1.1",
  skillSlug: "choose-measuring-tool",
  skillTitle: "Choosing the right measuring tool",
  build(rng) {
    const cases = [
      {
        q: "how much water a jug holds",
        a: "a measuring cup, in litres",
        w: ["a ruler, in centimetres", "a thermometer, in degrees", "a scale, in grams"],
      },
      {
        q: "how hot the classroom is",
        a: "a thermometer, in degrees",
        w: ["a measuring cup, in litres", "a ruler, in inches", "a scale, in kilograms"],
      },
      {
        q: "how long the whiteboard is",
        a: "a metre stick, in metres",
        w: ["a measuring cup, in millilitres", "a thermometer, in degrees", "a scale, in grams"],
      },
      {
        q: "how heavy a backpack is",
        a: "a scale, in kilograms",
        w: ["a ruler, in centimetres", "a measuring cup, in litres", "a thermometer, in degrees"],
      },
    ] as const;
    const c = rng.pick(cases);

    return {
      stem: `Which tool and unit would you use to find **${c.q}**?`,
      audioText: `Which tool and unit would you use to find ${c.q}?`,
      correct: c.a,
      distractors: c.w.map((w) => ({
        value: w,
        misconception: "ignored_units" as const,
      })),
      explanation: `${c.q[0].toUpperCase()}${c.q.slice(1)} is measured with ${c.a}. The tool has to match the kind of thing you are measuring.`,
      hints: [
        "What kind of quantity is it — length, weight, volume or temperature?",
        "Each kind has its own tool.",
      ],
      difficulty: 970,
    };
  },
});

/** MA.3.M.1.2 — Real-world measurement problems. */
export const g3MeasureProblem = mcGenerator({
  key: "g3.m.measureProblem",
  benchmark: "MA.3.M.1.2",
  skillSlug: "measurement-problems",
  skillTitle: "Measurement story problems",
  build(rng, ctx) {
    const who = rng.pick(NAMES);
    const kind = rng.pick([
      { what: "juice", unit: "millilitres", each: rng.int(150, 350) },
      { what: "flour", unit: "grams", each: rng.int(120, 400) },
      { what: "ribbon", unit: "centimetres", each: rng.int(20, 90) },
    ] as const);
    const count = rng.int(3, ctx.difficulty === "easy" ? 5 : 9);
    const total = kind.each * count;

    return {
      stem: `${who} needs ${kind.each} ${kind.unit} of ${kind.what} for one batch. How much ${kind.what} is needed for **${count} batches**?`,
      audioText: `${who} needs ${kind.each} ${kind.unit} for one batch. How much for ${count} batches?`,
      correct: `${total.toLocaleString("en-US")} ${kind.unit}`,
      distractors: [
        {
          value: `${(kind.each + count).toLocaleString("en-US")} ${kind.unit}`,
          misconception: "added_instead_of_multiplied",
        },
        {
          value: `${(total - kind.each).toLocaleString("en-US")} ${kind.unit}`,
          misconception: "off_by_one_factor",
        },
        {
          value: `${kind.each.toLocaleString("en-US")} ${kind.unit}`,
          misconception: "used_part_not_whole",
        },
        {
          value: `${total.toLocaleString("en-US")} ${kind.unit === "grams" ? "millilitres" : "grams"}`,
          misconception: "ignored_units",
        },
      ],
      explanation: `${count} batches each needing ${kind.each} ${kind.unit} is ${count} × ${kind.each} = ${total.toLocaleString("en-US")} ${kind.unit}.`,
      hints: [
        "Same amount, several times over.",
        "Keep the unit in your answer.",
      ],
      difficulty: 1100,
    };
  },
});

/** MA.3.M.2.1 — Tell time to the nearest minute. */
export const g3TellTimeMinute = mcGenerator({
  key: "g3.m.tellTimeMinute",
  benchmark: "MA.3.M.2.1",
  skillSlug: "tell-time-to-minute",
  skillTitle: "Telling time to the minute",
  build(rng, ctx) {
    const hour = rng.int(1, 12);
    // Minutes that are not multiples of five, because that is what "to the
    // nearest minute" adds over the grade 2 benchmark.
    const minute = ctx.difficulty === "easy" ? rng.int(1, 11) * 5 : rng.int(1, 59);
    const pad = (m: number) => String(m).padStart(2, "0");
    const nextHour = hour === 12 ? 1 : hour + 1;

    return {
      stem: "What time does the clock show?",
      audioText: "What time does the clock show?",
      correct: `${hour}:${pad(minute)}`,
      distractors: [
        {
          value: `${nextHour}:${pad(minute)}`,
          misconception: "hour_minute_swap",
        },
        {
          // Read the minute hand as the number it points near.
          value: `${hour}:${pad(Math.round(minute / 5))}`,
          misconception: "minute_by_ones",
        },
        {
          value: `${hour}:${pad(60 - minute)}`,
          misconception: "counted_endpoints",
        },
        { value: `${hour}:${pad((minute + 5) % 60)}`, misconception: "off_by_one" },
      ],
      explanation: `The short hand is just past ${hour}, and the long hand is ${minute} minute${minute === 1 ? "" : "s"} round from the top: ${hour}:${pad(minute)}.`,
      hints: [
        "Each small mark is one minute.",
        "Count on in fives from the top, then add the extra marks.",
      ],
      difficulty: minute % 5 === 0 ? 1010 : 1140,
      widget: {
        key: "interactive-clock",
        config: { hour, minute, interactive: false, showDigital: false },
      },
    };
  },
});

/** MA.3.M.2.2 — Elapsed time. */
export const g3ElapsedTime = mcGenerator({
  key: "g3.m.elapsedTime",
  benchmark: "MA.3.M.2.2",
  skillSlug: "elapsed-time",
  skillTitle: "Working out how much time has passed",
  build(rng, ctx) {
    const startHour = rng.int(1, 10);
    const startMin = rng.pick([0, 10, 15, 20, 30, 40, 45, 50]);
    // Crossing the hour is the whole difficulty: 60 minutes, not 100.
    const elapsed = ctx.difficulty === "easy" ? rng.pick([15, 20, 30]) : rng.int(35, 95);

    const totalStart = startHour * 60 + startMin;
    const totalEnd = totalStart + elapsed;
    const endHour = Math.floor(totalEnd / 60);
    const endMin = totalEnd % 60;
    const pad = (m: number) => String(m).padStart(2, "0");

    // Hours past noon are wrapped for display; the arithmetic stays in
    // minutes-since-midnight so nothing is lost.
    const show = (h: number) => (h > 12 ? h - 12 : h);

    const askEnd = rng.bool();
    if (askEnd) {
      return {
        stem: `A film starts at **${startHour}:${pad(startMin)}** and lasts **${elapsed} minutes**. What time does it finish?`,
        audioText: `A film starts at ${startHour} ${pad(startMin)} and lasts ${elapsed} minutes. What time does it finish?`,
        correct: `${show(endHour)}:${pad(endMin)}`,
        distractors: [
          {
            // Added the minutes as if an hour had 100 of them.
            value: `${startHour}:${pad((startMin + elapsed) % 100)}`,
            misconception: "place_value_confusion",
          },
          {
            value: `${show(endHour)}:${pad((endMin + 10) % 60)}`,
            misconception: "off_by_one",
          },
          {
            value: `${startHour}:${pad(startMin)}`,
            misconception: "used_part_not_whole",
          },
          {
            // Kept the whole hours and threw away the leftover minutes.
            value: `${show(startHour + Math.floor(elapsed / 60))}:${pad(startMin)}`,
            misconception: "dropped_remainder",
          },
          {
            value: `${show(endHour)}:${pad((endMin + 30) % 60)}`,
            misconception: "distractor_plausible",
          },
          {
            value: `${show(endHour + 1)}:${pad(endMin)}`,
            misconception: "hour_minute_swap",
          },
        ],
        explanation: `${elapsed} minutes is ${Math.floor(elapsed / 60)} hour${Math.floor(elapsed / 60) === 1 ? "" : "s"} and ${elapsed % 60} minutes. From ${startHour}:${pad(startMin)} that reaches ${show(endHour)}:${pad(endMin)}. Remember an hour has 60 minutes, not 100.`,
        hints: [
          "Count on to the next whole hour first.",
          "Then add whatever minutes are left.",
        ],
        difficulty: elapsed > 60 ? 1200 : 1090,
      };
    }

    return {
      stem: `A club starts at **${startHour}:${pad(startMin)}** and ends at **${show(endHour)}:${pad(endMin)}**. How long does it last?`,
      audioText: `A club runs from ${startHour} ${pad(startMin)} to ${show(endHour)} ${pad(endMin)}. How long is that?`,
      correct: `${elapsed} minutes`,
      distractors: [
        // Both of these reproduce the same wrong answer when the interval
        // stays inside one hour, so they are only offered when it crosses one.
        ...(endHour !== startHour
          ? [
              {
                value: `${Math.abs(endHour * 100 + endMin - (startHour * 100 + startMin))} minutes`,
                misconception: "place_value_confusion" as const,
              },
              {
                value: `${Math.abs(endMin - startMin)} minutes`,
                misconception: "used_part_not_whole" as const,
              },
            ]
          : []),
        { value: `${elapsed + 10} minutes`, misconception: "off_by_one" },
        { value: `${elapsed - 5} minutes`, misconception: "off_by_one" },
        { value: `${elapsed + 60} minutes`, misconception: "dropped_remainder" },
        { value: `${Math.max(1, elapsed - 15)} minutes`, misconception: "off_by_one" },
      ],
      explanation: `From ${startHour}:${pad(startMin)} to the next hour is ${(60 - startMin) % 60} minutes, and then ${endMin} more — ${elapsed} minutes in all.`,
      hints: [
        "Jump to the next whole hour first.",
        "An hour is 60 minutes, so you cannot just subtract the digits.",
      ],
      difficulty: 1180,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Geometry
 * ------------------------------------------------------------------ */

/** MA.3.GR.1.1 — Points, lines, segments, rays and relationships. */
export const g3LinesAndRays = mcGenerator({
  key: "g3.gr.linesAndRays",
  benchmark: "MA.3.GR.1.1",
  skillSlug: "points-lines-rays",
  skillTitle: "Points, lines, rays and angles",
  build(rng) {
    const cases = [
      {
        q: "goes on for ever in **both** directions",
        a: "a line",
        w: ["a ray", "a line segment", "a point"],
        why: "A line has no ends at all. A ray has one, and a segment has two.",
      },
      {
        q: "starts at one point and goes on for ever in **one** direction",
        a: "a ray",
        w: ["a line", "a line segment", "an angle"],
        why: "A ray has exactly one endpoint, like a beam of light leaving a torch.",
      },
      {
        q: "has **two** endpoints",
        a: "a line segment",
        w: ["a line", "a ray", "a point"],
        why: "A segment is the piece of a line between two endpoints.",
      },
      {
        q: "describes two lines that **never** meet, however far you extend them",
        a: "parallel lines",
        w: ["perpendicular lines", "intersecting lines", "a line segment"],
        why: "Parallel lines stay the same distance apart for ever.",
      },
      {
        q: "describes two lines that cross and make a **square corner**",
        a: "perpendicular lines",
        w: ["parallel lines", "intersecting lines", "a ray"],
        why: "Perpendicular lines meet at a right angle. All perpendicular lines intersect, but not all intersecting lines are perpendicular.",
      },
    ] as const;
    const c = rng.pick(cases);

    return {
      stem: `Which one **${c.q}**?`,
      audioText: `Which one ${c.q.replace(/\*\*/g, "")}?`,
      correct: c.a,
      distractors: c.w.map((w) => ({
        value: w,
        misconception: "distractor_plausible" as const,
      })),
      explanation: c.why,
      hints: [
        "How many ends does it have?",
        "An arrow on the end means it keeps going.",
      ],
      difficulty: 1060,
    };
  },
});

/** MA.3.GR.1.2 — Identify quadrilaterals by their attributes. */
export const g3Quadrilaterals = mcGenerator({
  key: "g3.gr.quadrilaterals",
  benchmark: "MA.3.GR.1.2",
  skillSlug: "quadrilaterals",
  skillTitle: "Naming quadrilaterals",
  build(rng) {
    const cases = [
      {
        clue: "4 equal sides and 4 right angles",
        a: "square",
        w: ["rectangle", "rhombus", "trapezoid"],
        why: "A square is a rectangle with all four sides equal — and it is a rhombus too.",
      },
      {
        clue: "4 right angles, with opposite sides equal",
        a: "rectangle",
        w: ["rhombus", "trapezoid", "parallelogram"],
        why: "A rectangle needs four right angles. Its sides come in equal pairs, but not all four need match.",
      },
      {
        clue: "4 equal sides, but no right angles needed",
        a: "rhombus",
        w: ["rectangle", "trapezoid", "square"],
        why: "A rhombus is a pushed-over square: all four sides equal, corners not necessarily square.",
      },
      {
        clue: "exactly one pair of parallel sides",
        a: "trapezoid",
        w: ["parallelogram", "rhombus", "rectangle"],
        why: "A trapezoid has one pair of parallel sides. If both pairs were parallel it would be a parallelogram.",
      },
      {
        clue: "two pairs of parallel sides",
        a: "parallelogram",
        w: ["trapezoid", "triangle", "pentagon"],
        why: "Opposite sides are parallel and equal. Rectangles, rhombuses and squares are all parallelograms.",
      },
    ] as const;
    const c = rng.pick(cases);

    return {
      stem: `Which shape must have **${c.clue}**?`,
      audioText: `Which shape must have ${c.clue}?`,
      correct: c.a,
      distractors: c.w.map((w) => ({
        value: w,
        misconception: "distractor_plausible" as const,
      })),
      explanation: c.why,
      hints: [
        "Check the sides first, then the corners.",
        "A shape can have more than one correct name.",
      ],
      difficulty: 1110,
      widget: { key: "shape-viewer", config: { shape: c.a, highlight: "sides" } },
    };
  },
});

/** MA.3.GR.1.3 — Lines of symmetry. */
export const g3Symmetry = mcGenerator({
  key: "g3.gr.symmetry",
  benchmark: "MA.3.GR.1.3",
  skillSlug: "lines-of-symmetry-g3",
  skillTitle: "Lines of symmetry",
  build(rng) {
    const shapes = [
      { name: "square", lines: 4 },
      { name: "rectangle", lines: 2 },
      { name: "equilateral triangle", lines: 3 },
      { name: "regular hexagon", lines: 6 },
      { name: "regular pentagon", lines: 5 },
      { name: "circle", lines: Infinity },
    ] as const;
    const s = rng.pick(shapes.filter((x) => Number.isFinite(x.lines)));

    return {
      stem: `How many **lines of symmetry** does a ${s.name} have?`,
      audioText: `How many lines of symmetry does a ${s.name} have?`,
      correct: String(s.lines),
      distractors: [
        {
          // Counted only the up-down and left-right folds.
          value: "2",
          misconception: "used_part_not_whole",
        },
        { value: String(s.lines + 1), misconception: "off_by_one" },
        { value: String(Math.max(1, s.lines - 1)), misconception: "off_by_one" },
        { value: "0", misconception: "distractor_plausible" },
      ],
      explanation: `A ${s.name} folds onto itself exactly ${s.lines} ways: ${s.name === "rectangle" ? "one fold across and one down — the diagonals do not work" : `one through each ${s.name === "square" ? "pair of opposite sides and each diagonal" : "corner"}`}.`,
      hints: [
        "Imagine folding it so both halves match exactly.",
        "Count every different fold that works.",
      ],
      difficulty: 1120,
      widget: { key: "shape-viewer", config: { shape: s.name.split(" ").pop(), highlight: "symmetry" } },
      fallback: nearbyNumbers(s.lines, { min: 0, max: 12 }),
    };
  },
});

/** MA.3.GR.2.1 — Area by counting unit squares. */
export const g3AreaByCounting = mcGenerator({
  key: "g3.gr.areaByCounting",
  benchmark: "MA.3.GR.2.1",
  skillSlug: "area-by-counting",
  skillTitle: "Finding area by counting squares",
  build(rng) {
    const w = rng.int(2, 9);
    const h = rng.int(2, 9);
    const area = w * h;

    return {
      stem: `A rectangle is covered with unit squares: **${h} rows of ${w}**. What is its area?`,
      audioText: `A rectangle is covered with ${h} rows of ${w} unit squares. What is its area?`,
      correct: `${area} square units`,
      distractors: [
        {
          value: `${2 * (w + h)} square units`,
          misconception: "perimeter_area_confusion",
        },
        { value: `${w + h} square units`, misconception: "added_instead_of_multiplied" },
        {
          value: `${w} square units`,
          misconception: "counted_unit_lengths_not_squares",
        },
        { value: `${area + w} square units`, misconception: "off_by_one_factor" },
      ],
      explanation: `Each of the ${h} rows holds ${w} squares, so there are ${h} × ${w} = ${area} squares. Area counts the squares inside; perimeter measures the edge.`,
      hints: [
        "Count the squares in one row.",
        "Then count how many rows there are.",
      ],
      difficulty: 1050,
      widget: { key: "array-builder", config: { rows: h, cols: w, mode: "area" } },
    };
  },
});

/** MA.3.GR.2.2 — Area of a rectangle by formula. */
export const g3AreaFormula = mcGenerator({
  key: "g3.gr.areaFormula",
  benchmark: "MA.3.GR.2.2",
  skillSlug: "area-of-rectangle",
  skillTitle: "Area of a rectangle",
  build(rng, ctx) {
    const w = rng.int(3, ctx.difficulty === "easy" ? 9 : 14);
    const h = rng.int(3, ctx.difficulty === "easy" ? 9 : 12);
    const area = w * h;

    return {
      stem: `A rectangle is **${w} cm** wide and **${h} cm** tall. What is its area?`,
      audioText: `A rectangle is ${w} centimetres wide and ${h} centimetres tall. What is its area?`,
      correct: `${area} cm²`,
      distractors: [
        { value: `${2 * (w + h)} cm²`, misconception: "perimeter_area_confusion" },
        { value: `${w + h} cm²`, misconception: "added_instead_of_multiplied" },
        { value: `${area} cm`, misconception: "ignored_units" },
        { value: `${area + h} cm²`, misconception: "off_by_one_factor" },
      ],
      explanation: `Area of a rectangle is length × width: ${w} × ${h} = ${area} cm². Area is measured in square units.`,
      hints: [
        "Area means the space covered.",
        "Multiply the two side lengths.",
      ],
      difficulty: 1070,
    };
  },
});

/** MA.3.GR.2.3 — Perimeter and area problems. */
export const g3PerimeterArea = mcGenerator({
  key: "g3.gr.perimeterArea",
  benchmark: "MA.3.GR.2.3",
  skillSlug: "perimeter-and-area",
  skillTitle: "Telling perimeter and area apart",
  build(rng) {
    const w = rng.int(3, 12);
    const h = rng.int(3, 12);
    const area = w * h;
    const perimeter = 2 * (w + h);
    const askArea = rng.bool();

    const context = rng.pick([
      { thing: "a garden bed", around: "fence", inside: "soil" },
      { thing: "a rug", around: "trim", inside: "fabric" },
      { thing: "a poster", around: "ribbon", inside: "paper" },
    ] as const);

    return {
      stem: askArea
        ? `${context.thing[0].toUpperCase()}${context.thing.slice(1)} is ${w} m by ${h} m. How much **${context.inside}** covers the whole surface?`
        : `${context.thing[0].toUpperCase()}${context.thing.slice(1)} is ${w} m by ${h} m. How much **${context.around}** goes all the way around the edge?`,
      audioText: askArea
        ? `A rectangle is ${w} by ${h} metres. What is the area?`
        : `A rectangle is ${w} by ${h} metres. What is the perimeter?`,
      correct: askArea ? `${area} m²` : `${perimeter} m`,
      distractors: [
        {
          value: askArea ? `${perimeter} m²` : `${area} m`,
          misconception: "perimeter_area_confusion",
        },
        {
          value: askArea ? `${w + h} m²` : `${w + h} m`,
          misconception: "used_part_not_whole",
        },
        {
          value: askArea ? `${area} m` : `${perimeter} m²`,
          misconception: "ignored_units",
        },
        {
          value: askArea ? `${area + w} m²` : `${perimeter + 2} m`,
          misconception: "off_by_one",
        },
      ],
      explanation: askArea
        ? `Covering the surface is area: ${w} × ${h} = ${area} m², measured in square metres.`
        : `Going around the edge is perimeter: ${w} + ${h} + ${w} + ${h} = ${perimeter} m, measured in metres.`,
      hints: [
        askArea ? "Covering the inside means area." : "Going around the edge means perimeter.",
        "Area uses square units; perimeter does not.",
      ],
      difficulty: 1150,
    };
  },
});

/** MA.3.GR.2.4 — Area of a composite figure. */
export const g3CompositeArea = mcGenerator({
  key: "g3.gr.compositeArea",
  benchmark: "MA.3.GR.2.4",
  skillSlug: "composite-area",
  skillTitle: "Area of an L-shaped figure",
  build(rng) {
    const w1 = rng.int(3, 9);
    const h1 = rng.int(3, 8);
    const w2 = rng.int(2, 7);
    const h2 = rng.int(2, 6);
    const area = w1 * h1 + w2 * h2;

    return {
      stem: `An L-shaped room is made of two rectangles that do not overlap: one **${w1} m by ${h1} m**, the other **${w2} m by ${h2} m**. What is the total area?`,
      audioText: `An L-shaped room is two rectangles, ${w1} by ${h1} and ${w2} by ${h2} metres. What is the total area?`,
      correct: `${area} m²`,
      distractors: [
        {
          // Found only the bigger piece.
          value: `${Math.max(w1 * h1, w2 * h2)} m²`,
          misconception: "used_part_not_whole",
        },
        {
          value: `${(w1 + w2) * (h1 + h2)} m²`,
          misconception: "order_of_operations",
        },
        {
          value: `${w1 * h1 - w2 * h2} m²`,
          misconception: "wrong_operation",
        },
        {
          value: `${2 * (w1 + h1) + 2 * (w2 + h2)} m²`,
          misconception: "perimeter_area_confusion",
        },
      ],
      explanation: `Find each rectangle and add: ${w1} × ${h1} = ${w1 * h1} and ${w2} × ${h2} = ${w2 * h2}, so ${w1 * h1} + ${w2 * h2} = ${area} m².`,
      hints: [
        "Split the shape into two rectangles.",
        "Work out each area, then add them.",
      ],
      difficulty: 1220,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Data
 * ------------------------------------------------------------------ */

/** MA.3.DP.1.1 — Scaled pictographs and bar graphs. */
export const g3ScaledGraph = mcGenerator({
  key: "g3.dp.scaledGraph",
  benchmark: "MA.3.DP.1.1",
  skillSlug: "scaled-graphs",
  skillTitle: "Reading a graph with a scale",
  build(rng) {
    const scale = rng.pick([2, 5, 10] as const);
    const cats = rng.shuffle(["Ash", "Birch", "Cedar", "Maple"]).slice(0, 3);
    const symbols = cats.map(() => rng.int(2, 7));
    const target = rng.int(0, cats.length - 1);
    const value = symbols[target] * scale;

    const rows = listWords(
      cats.map((c, i) => `${c} has ${symbols[i]} symbols`),
    );

    return {
      stem: `On this picture graph each symbol stands for **${scale} trees**. ${rows[0].toUpperCase()}${rows.slice(1)}.\n\nHow many **${cats[target]}** trees are there?`,
      audioText: `Each symbol stands for ${scale} trees. ${rows}. How many ${cats[target]} trees are there?`,
      correct: String(value),
      distractors: [
        {
          // Ignored the key and read the symbol count as the answer.
          value: String(symbols[target]),
          misconception: "read_scale_by_ones",
        },
        { value: String(symbols[target] + scale), misconception: "added_instead_of_multiplied" },
        { value: String(value + scale), misconception: "off_by_one_factor" },
        { value: String(scale), misconception: "distractor_plausible" },
      ],
      explanation: `${symbols[target]} symbols × ${scale} trees each = ${value} trees. The key changes what each symbol is worth.`,
      hints: [
        "Read the key first.",
        `Each symbol is worth ${scale}, not 1.`,
      ],
      difficulty: 1120,
      widget: {
        key: "graph-builder",
        config: { kind: "pictograph", categories: cats, counts: symbols.map((s) => s * scale), scale },
      },
      fallback: nearbyNumbers(value, { min: 0, step: scale }),
    };
  },
});

/** MA.3.DP.1.2 — Two-step problems from data. */
export const g3DataProblem = mcGenerator({
  key: "g3.dp.dataProblem",
  benchmark: "MA.3.DP.1.2",
  skillSlug: "data-problems",
  skillTitle: "Solving problems from a graph",
  build(rng) {
    const cats = rng.shuffle(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]).slice(0, 4);
    const counts = cats.map(() => rng.int(6, 28));
    const total = counts.reduce((a, b) => a + b, 0);
    const maxIdx = counts.indexOf(Math.max(...counts));
    const minIdx = counts.indexOf(Math.min(...counts));
    const gap = counts[maxIdx] - counts[minIdx];
    const askGap = rng.bool();

    const rows = listWords(cats.map((c, i) => `${c}: ${counts[i]}`));

    return {
      stem: `The table shows how many books were borrowed.\n\n${rows}.\n\n${askGap ? `How many **more** books were borrowed on ${cats[maxIdx]} than on ${cats[minIdx]}?` : "How many books were borrowed **in total**?"}`,
      audioText: `${rows}. ${askGap ? `How many more on ${cats[maxIdx]} than ${cats[minIdx]}?` : "How many in total?"}`,
      correct: String(askGap ? gap : total),
      distractors: askGap
        ? [
            { value: String(counts[maxIdx]), misconception: "used_part_not_whole" },
            { value: String(counts[maxIdx] + counts[minIdx]), misconception: "wrong_operation" },
            { value: String(total), misconception: "used_part_not_whole" },
            { value: String(gap + 1), misconception: "off_by_one" },
          ]
        : [
            { value: String(total - counts[minIdx]), misconception: "used_part_not_whole" },
            { value: String(counts[maxIdx]), misconception: "used_part_not_whole" },
            { value: String(gap), misconception: "wrong_operation" },
            { value: String(total + 10), misconception: "off_by_one" },
          ],
      explanation: askGap
        ? `${counts[maxIdx]} − ${counts[minIdx]} = ${gap}.`
        : `${counts.join(" + ")} = ${total}.`,
      hints: [
        askGap ? `"How many more" means subtract.` : "Add every row.",
        "Check you have used the right rows.",
      ],
      difficulty: 1090,
      fallback: nearbyNumbers(askGap ? gap : total, { min: 0 }),
    };
  },
});
