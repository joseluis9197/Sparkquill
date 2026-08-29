import { mcGenerator, nearbyNumbers } from "../build";
import { COINS, COUNTABLES as THINGS, NAMES, listWords } from "../story";

/**
 * Grade 1: algebraic reasoning, fractions, measurement, geometry and data.
 *
 * Word problems here use names and objects a six-year-old can picture. The
 * arithmetic is the hard part; the reading should not be.
 */

/* ------------------------------------------------------------------ *
 * Algebraic reasoning
 * ------------------------------------------------------------------ */

/** MA.1.AR.1.1 — Add three or more whole numbers. */
export const g1AddThree = mcGenerator({
  key: "g1.ar.addThree",
  benchmark: "MA.1.AR.1.1",
  skillSlug: "add-three-numbers",
  skillTitle: "Adding three numbers",
  build(rng, ctx) {
    // One pair always makes ten. That is the property the benchmark is really
    // about: you may add in any order, so look for the friendly pair first.
    const a = rng.int(2, 8);
    const b = 10 - a;
    const c = rng.int(2, ctx.difficulty === "easy" ? 5 : 9);
    const [x, y, z] = rng.shuffle([a, b, c]);
    const total = a + b + c;

    return {
      stem: `**${x} + ${y} + ${z} = ?**`,
      audioText: `${x} plus ${y} plus ${z} equals what?`,
      correct: String(total),
      distractors: [
        { value: String(a + b), misconception: "distractor_plausible" },
        { value: String(total - 1), misconception: "off_by_one" },
        { value: String(total + 1), misconception: "off_by_one" },
        { value: String(total + 10), misconception: "place_value_confusion" },
      ],
      explanation: `${a} + ${b} makes 10, and 10 + ${c} = ${total}. You may add in any order you like.`,
      hints: [
        "Look for two numbers that make ten.",
        "Adding in a different order gives the same total.",
      ],
      difficulty: ctx.difficulty === "easy" ? 900 : 1010,
      fallback: nearbyNumbers(total, { min: 0, max: 40 }),
    };
  },
});

/** MA.1.AR.1.2 — Real-world addition and subtraction problems. */
export const g1WordProblem = mcGenerator({
  key: "g1.ar.wordProblem",
  benchmark: "MA.1.AR.1.2",
  skillSlug: "add-subtract-word-problems",
  skillTitle: "Addition and subtraction story problems",
  build(rng, ctx) {
    const who = rng.pick(NAMES);
    const thing = rng.pick(THINGS);
    const max = ctx.difficulty === "easy" ? 10 : 20;
    const start = rng.int(5, max);
    const change = rng.int(2, Math.min(9, start));
    const adding = rng.bool();
    const answer = adding ? start + change : start - change;

    const stem = adding
      ? `${who} had ${start} ${thing.many}. A friend gave ${who} ${change} more. How many ${thing.many} does ${who} have now?`
      : `${who} had ${start} ${thing.many} and gave away ${change}. How many ${thing.many} are left?`;

    return {
      stem,
      audioText: stem,
      correct: String(answer),
      distractors: [
        {
          // The single most common error on story problems: the child picks
          // the operation from a keyword instead of from the situation.
          value: String(adding ? start - change : start + change),
          misconception: "wrong_operation",
        },
        { value: String(start), misconception: "distractor_plausible" },
        { value: String(answer + 1), misconception: "off_by_one" },
        { value: String(Math.max(0, answer - 1)), misconception: "off_by_one" },
      ],
      explanation: adding
        ? `${who} got more, so add: ${start} + ${change} = ${answer}.`
        : `${who} gave some away, so subtract: ${start} − ${change} = ${answer}.`,
      hints: [
        "Did the amount get bigger or smaller?",
        adding ? "More means add." : "Given away means take away.",
      ],
      difficulty: ctx.difficulty === "easy" ? 940 : 1050,
      fallback: nearbyNumbers(answer, { min: 0, max: 40 }),
    };
  },
});

/** MA.1.AR.2.1 — Restate subtraction as a missing addend. */
export const g1MissingAddend = mcGenerator({
  key: "g1.ar.missingAddend",
  benchmark: "MA.1.AR.2.1",
  skillSlug: "subtraction-as-missing-addend",
  skillTitle: "Seeing subtraction as a missing addend",
  build(rng) {
    const total = rng.int(8, 20);
    const known = rng.int(2, total - 2);
    const missing = total - known;

    return {
      stem: `Which addition sentence means the same as **${total} − ${known} = ?**`,
      audioText: `Which addition sentence means the same as ${total} minus ${known}?`,
      correct: `${known} + ___ = ${total}`,
      distractors: [
        {
          value: `${total} + ${known} = ___`,
          misconception: "wrong_operation",
        },
        {
          value: `___ + ${total} = ${known}`,
          misconception: "reversed_dividend_divisor",
        },
        {
          value: `${known} + ${total} = ___`,
          misconception: "wrong_operation",
        },
      ],
      explanation: `Taking ${known} from ${total} asks what goes with ${known} to make ${total}. That is ${known} + ${missing} = ${total}.`,
      hints: [
        "Subtraction asks what is missing.",
        `What do you add to ${known} to reach ${total}?`,
      ],
      difficulty: 1040,
    };
  },
});

/** MA.1.AR.2.2 — Decide whether an equation is true or false. */
export const g1TrueFalse = mcGenerator({
  key: "g1.ar.trueFalse",
  benchmark: "MA.1.AR.2.2",
  skillSlug: "true-false-equations-g1",
  skillTitle: "Deciding if an equation is true",
  build(rng, ctx) {
    // Equations with an operation on both sides, because the point of this
    // benchmark is that "=" means "the same as" and not "here comes the
    // answer".
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    const total = a + b;
    const c = rng.int(1, total - 1);
    const d = total - c;
    const makeTrue = rng.bool();
    // Nudged away from d when the item is meant to be false, but never below
    // 1: "3 + 0" is a strange thing to put in front of a first grader.
    const shownD = makeTrue ? d : Math.max(1, d + rng.pick([1, 2, d > 2 ? -1 : 3]));

    const equation = `${a} + ${b} = ${c} + ${shownD}`;
    const isTrue = a + b === c + shownD;

    return {
      stem: `Is this true or false?\n\n**${equation}**`,
      audioText: `Is this true or false? ${a} plus ${b} equals ${c} plus ${shownD}.`,
      correct: isTrue ? "True" : "False",
      distractors: [
        {
          value: isTrue ? "False" : "True",
          misconception: "distractor_plausible",
        },
        {
          value: `Only if you swap ${c} and ${shownD}`,
          misconception: "distractor_plausible",
        },
        {
          value: "You cannot have adding on both sides",
          misconception: "distractor_plausible",
        },
      ],
      explanation: `${a} + ${b} = ${total} and ${c} + ${shownD} = ${c + shownD}. ${
        isTrue
          ? "Both sides are the same, so the equation is true."
          : "The sides are different, so the equation is false."
      }`,
      hints: [
        "Work out each side on its own.",
        "The equals sign means both sides have the same value.",
      ],
      difficulty: ctx.difficulty === "easy" ? 960 : 1060,
    };
  },
});

/** MA.1.AR.2.3 — Find the unknown in an addition or subtraction equation. */
export const g1UnknownNumber = mcGenerator({
  key: "g1.ar.unknownNumber",
  benchmark: "MA.1.AR.2.3",
  skillSlug: "unknown-in-equation-g1",
  skillTitle: "Finding the missing number",
  build(rng, ctx) {
    const total = rng.int(8, 20);
    const part = rng.int(2, total - 2);
    const other = total - part;
    // The unknown moves around: at the end it is easy, in the middle it is the
    // one children actually get wrong.
    const shape = rng.pick(
      ctx.difficulty === "easy"
        ? (["sum"] as const)
        : (["start", "middle", "sum"] as const),
    );

    const stem =
      shape === "sum"
        ? `${part} + ${other} = ___`
        : shape === "middle"
          ? `${part} + ___ = ${total}`
          : `___ + ${other} = ${total}`;
    const answer = shape === "sum" ? total : shape === "middle" ? other : part;

    return {
      stem: `What number goes in the blank?\n\n**${stem}**`,
      audioText: `What number goes in the blank? ${stem.replace("___", "blank")}`,
      correct: String(answer),
      distractors: [
        {
          // Added when they needed to take away, the standard error when the
          // unknown is not at the end.
          value: String(shape === "sum" ? total - part : total + part),
          misconception: "inverse_operation_missed",
        },
        { value: String(total), misconception: "distractor_plausible" },
        { value: String(answer + 1), misconception: "off_by_one" },
        { value: String(Math.max(0, answer - 1)), misconception: "off_by_one" },
      ],
      explanation:
        shape === "sum"
          ? `${part} + ${other} = ${total}.`
          : `The two parts make ${total}. One part is ${shape === "middle" ? part : other}, so the other is ${total} − ${shape === "middle" ? part : other} = ${answer}.`,
      hints: [
        "What is the whole, and what is the part you know?",
        "To find a missing part, take the known part away from the whole.",
      ],
      difficulty: shape === "sum" ? 950 : 1080,
      fallback: nearbyNumbers(answer, { min: 0, max: 25 }),
    };
  },
});

/* ------------------------------------------------------------------ *
 * Fractions
 * ------------------------------------------------------------------ */

/** MA.1.FR.1.1 — Halves and fourths of circles and rectangles. */
export const g1HalvesFourths = mcGenerator({
  key: "g1.fr.halvesFourths",
  benchmark: "MA.1.FR.1.1",
  skillSlug: "halves-and-fourths",
  skillTitle: "Halves and fourths",
  build(rng) {
    const parts = rng.pick([2, 4] as const);
    const shape = rng.pick(["circle", "rectangle"] as const);
    const askName = rng.bool();

    if (askName) {
      const correct = parts === 2 ? "halves" : "fourths";
      return {
        stem: `A ${shape} is split into **${parts} equal parts**. What is each part called?`,
        audioText: `A ${shape} is split into ${parts} equal parts. What is each part called?`,
        correct,
        distractors: [
          {
            value: parts === 2 ? "fourths" : "halves",
            misconception: "distractor_plausible",
          },
          { value: "thirds", misconception: "distractor_plausible" },
          { value: "wholes", misconception: "distractor_plausible" },
        ],
        explanation: `${parts} equal parts are called ${correct}. Each one is one ${parts === 2 ? "half" : "fourth"} of the ${shape}.`,
        hints: [
          "How many equal parts are there?",
          "Two equal parts are halves; four are fourths.",
        ],
        difficulty: 900,
      };
    }

    return {
      stem: `How many **${parts === 2 ? "halves" : "fourths"}** make one whole ${shape}?`,
      audioText: `How many ${parts === 2 ? "halves" : "fourths"} make one whole ${shape}?`,
      correct: String(parts),
      distractors: [
        { value: String(parts === 2 ? 4 : 2), misconception: "distractor_plausible" },
        { value: "1", misconception: "used_part_not_whole" },
        { value: "3", misconception: "distractor_plausible" },
      ],
      explanation: `It takes ${parts} ${parts === 2 ? "halves" : "fourths"} to build one whole ${shape} again.`,
      hints: [
        "Picture putting the pieces back together.",
        "The name tells you the number of parts.",
      ],
      difficulty: 940,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Measurement
 * ------------------------------------------------------------------ */

/** MA.1.M.1.1 — Measure length to the nearest inch or centimetre. */
export const g1MeasureLength = mcGenerator({
  key: "g1.m.measureLength",
  benchmark: "MA.1.M.1.1",
  skillSlug: "measure-length-g1",
  skillTitle: "Measuring length with a ruler",
  build(rng) {
    const unit = rng.pick(["inches", "centimetres"] as const);
    const start = rng.int(0, 3);
    const length = rng.int(3, 9);
    const end = start + length;
    const thing = rng.pick(["ribbon", "pencil", "leaf", "straw", "twig"]);

    return {
      stem: `A ${thing} is lined up on a ruler. It starts at **${start}** and ends at **${end}**. How long is it?`,
      audioText: `A ${thing} starts at ${start} on the ruler and ends at ${end}. How long is it?`,
      correct: `${length} ${unit}`,
      distractors: [
        {
          // Read the number at the end instead of measuring the distance.
          value: `${end} ${unit}`,
          misconception: "counted_endpoints",
        },
        { value: `${length + 1} ${unit}`, misconception: "counted_endpoints" },
        { value: `${start} ${unit}`, misconception: "distractor_plausible" },
        {
          value: `${length} ${unit === "inches" ? "centimetres" : "inches"}`,
          misconception: "ignored_units",
        },
      ],
      explanation: `Length is the distance travelled along the ruler: ${end} − ${start} = ${length} ${unit}. Where it starts matters as much as where it ends.`,
      hints: [
        "The object does not start at zero.",
        "Count the spaces between the marks, not the marks.",
      ],
      difficulty: start === 0 ? 900 : 1060,
    };
  },
});

/** MA.1.M.1.2 — Compare and order the lengths of up to three objects. */
export const g1OrderLengths = mcGenerator({
  key: "g1.m.orderLengths",
  benchmark: "MA.1.M.1.2",
  skillSlug: "order-lengths",
  skillTitle: "Putting lengths in order",
  build(rng) {
    const items = rng.shuffle([
      "the rope",
      "the ribbon",
      "the string",
      "the yarn",
    ]).slice(0, 3);
    const lengths = rng
      .shuffle([rng.int(3, 6), rng.int(7, 10), rng.int(11, 15)])
      .slice(0, 3);
    const pairs = items.map((name, i) => ({ name, len: lengths[i] }));
    const longest = [...pairs].sort((a, b) => b.len - a.len)[0];
    const shortest = [...pairs].sort((a, b) => a.len - b.len)[0];
    const wantLongest = rng.bool();

    const listing = listWords(pairs.map((p) => `${p.name} is ${p.len} cm`));

    return {
      stem: `${listing[0].toUpperCase()}${listing.slice(1)}. Which is **${wantLongest ? "longest" : "shortest"}**?`,
      audioText: `${listing}. Which is ${wantLongest ? "longest" : "shortest"}?`,
      correct: wantLongest ? longest.name : shortest.name,
      distractors: [
        {
          value: wantLongest ? shortest.name : longest.name,
          misconception: "compared_wrong_direction",
        },
        ...pairs
          .filter((p) => p !== longest && p !== shortest)
          .map((p) => ({
            value: p.name,
            misconception: "distractor_plausible" as const,
          })),
        { value: "They are all the same", misconception: "distractor_plausible" },
      ],
      explanation: `${wantLongest ? longest.name : shortest.name} measures ${wantLongest ? longest.len : shortest.len} cm, which is the ${wantLongest ? "most" : "least"} of the three.`,
      hints: [
        "Compare the numbers, not the names.",
        wantLongest ? "Longest means the biggest number." : "Shortest means the smallest number.",
      ],
      difficulty: 920,
    };
  },
});

/** MA.1.M.2.1 — Tell time to the hour and half hour. */
export const g1TellTime = mcGenerator({
  key: "g1.m.tellTime",
  benchmark: "MA.1.M.2.1",
  skillSlug: "tell-time-hour-half-hour",
  skillTitle: "Telling time to the hour and half hour",
  build(rng) {
    const hour = rng.int(1, 12);
    const half = rng.bool();
    const minute = half ? 30 : 0;
    const text = `${hour}:${minute === 0 ? "00" : "30"}`;
    const nextHour = hour === 12 ? 1 : hour + 1;

    return {
      stem: "What time does the clock show?",
      audioText: "What time does the clock show?",
      correct: text,
      distractors: [
        {
          // At half past, the hour hand sits between two numbers and children
          // read the one it is heading towards.
          value: `${nextHour}:${minute === 0 ? "00" : "30"}`,
          misconception: half ? "hour_minute_swap" : "off_by_one",
        },
        {
          value: `${hour}:${minute === 0 ? "30" : "00"}`,
          misconception: "minute_by_ones",
        },
        {
          value: `${minute === 0 ? 12 : 6}:${hour < 10 ? "0" : ""}${hour}`,
          misconception: "hour_minute_swap",
        },
      ],
      explanation: half
        ? `The long hand points to 6, which is half past. The short hand is between ${hour} and ${nextHour}, so it is still ${hour}: the time is ${text}.`
        : `The long hand points to 12, so it is exactly ${hour} o'clock: ${text}.`,
      hints: [
        "The short hand tells the hour.",
        half
          ? "When the long hand is on 6, half an hour has passed."
          : "When the long hand is on 12, the hour has just started.",
      ],
      difficulty: half ? 1050 : 900,
      widget: {
        key: "interactive-clock",
        config: { hour, minute, interactive: false, showDigital: false },
      },
    };
  },
});

/** MA.1.M.2.2 — Identify coins and write their value with the cent symbol. */
export const g1CoinValue = mcGenerator({
  key: "g1.m.coinValue",
  benchmark: "MA.1.M.2.2",
  skillSlug: "identify-coins",
  skillTitle: "Naming coins and their values",
  build(rng) {
    const coin = rng.pick(COINS);
    const others = COINS.filter((c) => c.value !== coin.value);

    return {
      stem: `How much is one **${coin.name}** worth?`,
      audioText: `How much is one ${coin.name} worth?`,
      correct: `${coin.value}¢`,
      distractors: others.map((c) => ({
        value: `${c.value}¢`,
        misconception: "distractor_plausible" as const,
      })),
      explanation: `A ${coin.name} is worth ${coin.value} cent${coin.value === 1 ? "" : "s"}, written ${coin.value}¢.`,
      hints: [
        "The biggest coin is not always worth the most.",
        "A dime is small but worth 10¢.",
      ],
      difficulty: 880,
    };
  },
});

/** MA.1.M.2.3 — Find the value of a group of coins. */
export const g1CountCoins = mcGenerator({
  key: "g1.m.countCoins",
  benchmark: "MA.1.M.2.3",
  skillSlug: "count-coin-combinations",
  skillTitle: "Adding up a handful of coins",
  build(rng, ctx) {
    const kinds = ctx.difficulty === "easy" ? 2 : 3;
    const chosen = rng.shuffle([...COINS]).slice(0, kinds);
    const counts = chosen.map(() => rng.int(1, 3));
    const total = chosen.reduce((sum, c, i) => sum + c.value * counts[i], 0);
    const coinCount = counts.reduce((a, b) => a + b, 0);

    const listing = listWords(
      chosen.map((c, i) => `${counts[i]} ${counts[i] === 1 ? c.name : c.plural}`),
    );

    return {
      stem: `${rng.pick(NAMES)} has ${listing}. How much money is that?`,
      audioText: `Someone has ${listing}. How much money is that?`,
      correct: `${total}¢`,
      distractors: [
        {
          // Counted the coins rather than adding their values.
          value: `${coinCount}¢`,
          misconception: "place_value_confusion",
        },
        { value: `${total + 5}¢`, misconception: "distractor_plausible" },
        { value: `${Math.max(1, total - 10)}¢`, misconception: "off_by_one" },
        {
          value: `${chosen.reduce((s, c) => s + c.value, 0)}¢`,
          misconception: "distractor_plausible",
        },
      ],
      explanation: `${chosen
        .map((c, i) => `${counts[i]} × ${c.value}¢ = ${counts[i] * c.value}¢`)
        .join(", ")}. Altogether that is ${total}¢.`,
      hints: [
        "Start with the coins worth the most.",
        "Count on from the biggest coin.",
      ],
      difficulty: ctx.difficulty === "easy" ? 990 : 1090,
      widget: {
        key: "money-counter",
        config: {
          coins: chosen.map((c, i) => ({ value: c.value, count: counts[i] })),
        },
      },
    };
  },
});

/* ------------------------------------------------------------------ *
 * Geometry
 * ------------------------------------------------------------------ */

const FLAT_SHAPES = [
  { name: "triangle", sides: 3, corners: 3 },
  { name: "rectangle", sides: 4, corners: 4 },
  { name: "square", sides: 4, corners: 4 },
  { name: "hexagon", sides: 6, corners: 6 },
  { name: "trapezoid", sides: 4, corners: 4 },
] as const;

/** MA.1.GR.1.2 — Name a 2D figure from its defining attributes. */
export const g1ShapeFromAttributes = mcGenerator({
  key: "g1.gr.shapeFromAttributes",
  benchmark: "MA.1.GR.1.2",
  skillSlug: "shape-from-attributes",
  skillTitle: "Naming a shape from its sides and corners",
  build(rng) {
    // Squares and rectangles both have four sides, so a four-sided question
    // has to say something more to have one answer.
    const shape = rng.pick([
      FLAT_SHAPES[0],
      FLAT_SHAPES[3],
      FLAT_SHAPES[2],
    ] as const);
    const clue =
      shape.name === "square"
        ? "4 straight sides that are all the same length"
        : `${shape.sides} straight sides and ${shape.corners} corners`;

    return {
      stem: `Which shape has **${clue}**?`,
      audioText: `Which shape has ${clue}?`,
      correct: shape.name,
      distractors: FLAT_SHAPES.filter((s) => s.name !== shape.name).map((s) => ({
        value: s.name,
        misconception: "distractor_plausible" as const,
      })),
      explanation: `A ${shape.name} has ${clue}.`,
      hints: ["Count the straight sides.", "Then count the corners."],
      difficulty: 930,
      widget: { key: "shape-viewer", config: { shape: shape.name, highlight: "sides" } },
    };
  },
});

/** MA.1.GR.1.3 — Compose and decompose figures. */
export const g1ComposeShapes = mcGenerator({
  key: "g1.gr.composeShapes",
  benchmark: "MA.1.GR.1.3",
  skillSlug: "compose-decompose-shapes",
  skillTitle: "Building shapes from smaller shapes",
  build(rng) {
    const cases = [
      {
        q: "How many **triangles** does it take to make one square, if you cut the square corner to corner?",
        a: "2",
        wrong: ["4", "3", "1"],
        why: "One straight cut from corner to corner splits a square into 2 triangles.",
      },
      {
        q: "How many **squares** does it take to make a rectangle that is 2 squares tall and 3 squares wide?",
        a: "6",
        wrong: ["5", "9", "4"],
        why: "2 rows of 3 squares is 2 × 3 = 6 squares.",
      },
      {
        q: "How many **triangles** fit inside one hexagon, cutting from the middle to every corner?",
        a: "6",
        wrong: ["4", "3", "8"],
        why: "A hexagon has 6 corners, so cutting to each one makes 6 triangles.",
      },
      {
        q: "You put two squares side by side. What new shape have you made?",
        a: "a rectangle",
        wrong: ["a square", "a triangle", "a hexagon"],
        why: "Two squares side by side are longer than they are tall, which makes a rectangle.",
      },
    ] as const;
    const c = rng.pick(cases);

    return {
      stem: c.q,
      audioText: c.q.replace(/\*\*/g, ""),
      correct: c.a,
      distractors: c.wrong.map((w) => ({
        value: w,
        misconception: "distractor_plausible" as const,
      })),
      explanation: c.why,
      hints: [
        "Draw it, or picture the pieces.",
        "Small shapes fit together to make bigger ones.",
      ],
      difficulty: 1020,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Data
 * ------------------------------------------------------------------ */

const CATEGORIES = [
  ["cats", "dogs", "birds"],
  ["apples", "bananas", "pears"],
  ["red", "blue", "green"],
  ["soccer", "swimming", "running"],
] as const;

/** MA.1.DP.1.1 — Represent data with tally marks. */
export const g1Tallies = mcGenerator({
  key: "g1.dp.tallies",
  benchmark: "MA.1.DP.1.1",
  skillSlug: "tally-marks",
  skillTitle: "Reading tally marks",
  build(rng) {
    const n = rng.int(6, 19);
    const groups = Math.floor(n / 5);
    const singles = n % 5;
    const tally =
      Array.from({ length: groups }, () => "||||̸").join(" ") +
      (singles ? ` ${"|".repeat(singles)}` : "");

    return {
      stem: `These tally marks were counted.\n\n**${tally}**\n\nHow many is that?`,
      audioText: `There are ${groups} groups of five tally marks and ${singles} more. How many is that?`,
      correct: String(n),
      distractors: [
        {
          // Counted each bundle as one mark.
          value: String(groups + singles),
          misconception: "read_scale_by_ones",
        },
        { value: String(groups * 5), misconception: "distractor_plausible" },
        { value: String(n + 1), misconception: "off_by_one" },
        { value: String(n - 1), misconception: "off_by_one" },
      ],
      explanation: `${groups} bundle${groups === 1 ? "" : "s"} of 5 is ${groups * 5}${singles ? `, plus ${singles} more, which is ${n}` : ""}.`,
      hints: [
        "A crossed bundle stands for five, not one.",
        "Count the bundles by fives, then add the leftovers.",
      ],
      difficulty: 970,
      fallback: nearbyNumbers(n, { min: 1, max: 30 }),
    };
  },
});

/** MA.1.DP.1.2 — Interpret a pictograph. */
export const g1Pictograph = mcGenerator({
  key: "g1.dp.pictograph",
  benchmark: "MA.1.DP.1.2",
  skillSlug: "interpret-pictograph",
  skillTitle: "Reading a picture graph",
  build(rng, ctx) {
    const cats = rng.pick(CATEGORIES);
    const counts = cats.map(() => rng.int(2, 9));
    const rows = cats
      .map((c, i) => `${c}: ${"●".repeat(counts[i])}  (${counts[i]})`)
      .join("\n");

    const askTotal = ctx.difficulty !== "easy" && rng.bool();
    const maxIdx = counts.indexOf(Math.max(...counts));
    const minIdx = counts.indexOf(Math.min(...counts));
    const total = counts.reduce((a, b) => a + b, 0);
    const gap = counts[maxIdx] - counts[minIdx];

    if (askTotal) {
      return {
        stem: `The graph shows what the class chose.\n\n${rows}\n\nHow many children chose something altogether?`,
        audioText: `${cats.map((c, i) => `${c}, ${counts[i]}`).join("; ")}. How many altogether?`,
        correct: String(total),
        distractors: [
          { value: String(counts[maxIdx]), misconception: "used_part_not_whole" },
          { value: String(total - counts[minIdx]), misconception: "distractor_plausible" },
          { value: String(cats.length), misconception: "read_scale_by_ones" },
          { value: String(total + 1), misconception: "off_by_one" },
        ],
        explanation: `Add every row: ${counts.join(" + ")} = ${total}.`,
        hints: ["Altogether means add them all.", "Do not miss a row."],
        difficulty: 1030,
        widget: {
          key: "graph-builder",
          config: { kind: "pictograph", categories: cats, counts },
        },
        fallback: nearbyNumbers(total, { min: 1, max: 40 }),
      };
    }

    return {
      stem: `The graph shows what the class chose.\n\n${rows}\n\nHow many **more** children chose ${cats[maxIdx]} than ${cats[minIdx]}?`,
      audioText: `${cats.map((c, i) => `${c}, ${counts[i]}`).join("; ")}. How many more chose ${cats[maxIdx]} than ${cats[minIdx]}?`,
      correct: String(gap),
      distractors: [
        {
          // Answered with the bigger row instead of the difference.
          value: String(counts[maxIdx]),
          misconception: "used_part_not_whole",
        },
        {
          value: String(counts[maxIdx] + counts[minIdx]),
          misconception: "wrong_operation",
        },
        { value: String(counts[minIdx]), misconception: "distractor_plausible" },
        { value: String(gap + 1), misconception: "off_by_one" },
      ],
      explanation: `${cats[maxIdx]} has ${counts[maxIdx]} and ${cats[minIdx]} has ${counts[minIdx]}. ${counts[maxIdx]} − ${counts[minIdx]} = ${gap}.`,
      hints: [
        `"How many more" means find the difference.`,
        "Subtract the smaller row from the bigger one.",
      ],
      difficulty: 1060,
      widget: {
        key: "graph-builder",
        config: { kind: "pictograph", categories: cats, counts },
      },
      fallback: nearbyNumbers(gap, { min: 0, max: 20 }),
    };
  },
});

