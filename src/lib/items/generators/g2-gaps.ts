import { mcGenerator, nearbyNumbers } from "../build";
import { COUNTABLES, NAMES, SETTINGS, listWords } from "../story";
import {
  addColumnsIndependently,
  addWithoutRegrouping,
  subtractWithoutBorrowing,
} from "../numbers";

/**
 * Grade 2 benchmarks that the first pass left without practice.
 *
 * The seven here are the ones the original set skipped because they read as
 * variations of a neighbour — three-digit addition next to two-digit, one
 * more way of partitioning a rectangle. They are not variations: a child who
 * can add 47 + 25 and has never met 347 + 225 has not met regrouping across
 * the hundreds, and the benchmark is separately reported on the test.
 */

/** MA.2.NSO.2.4 — Add and subtract whole numbers up to 1,000. */
export const g2ThreeDigit = mcGenerator({
  key: "g2.nso.threeDigit",
  benchmark: "MA.2.NSO.2.4",
  skillSlug: "add-subtract-within-1000",
  skillTitle: "Adding and subtracting within 1,000",
  build(rng, ctx) {
    const adding = rng.bool();
    // Two regroupings on stretch, one on core, none on easy: the difficulty
    // of this benchmark is entirely in how many columns overflow.
    const wantCarries = ctx.difficulty === "easy" ? 0 : ctx.difficulty === "core" ? 1 : 2;

    // a is capped so that a + b can never pass 999, which is this benchmark's
    // ceiling — the sum has to stay inside the range as well as the addends.
    let a = 0;
    let b = 0;
    for (let tries = 0; tries < 40; tries++) {
      a = rng.int(120, 650);
      b = rng.int(105, Math.min(999 - a, 340));
      const carries =
        Number((a % 10) + (b % 10) >= 10) +
        Number((Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) >= 10);
      if (carries === wantCarries) break;
    }

    if (adding) {
      const sum = a + b;
      return {
        stem: `**${a} + ${b} = ?**`,
        audioText: `${a} plus ${b} equals what?`,
        correct: String(sum),
        distractors: [
          {
            value: String(addWithoutRegrouping(a, b)),
            misconception: "no_regrouping",
          },
          {
            value: String(addColumnsIndependently(a, b)),
            misconception: "column_independent",
          },
          { value: String(a - b), misconception: "wrong_operation" },
          { value: String(sum + 100), misconception: "place_value_confusion" },
        ],
        explanation: `Add the ones, then the tens, then the hundreds, carrying whenever a column passes 9: ${a} + ${b} = ${sum}.`,
        hints: [
          "Line the numbers up by place.",
          "A column that reaches ten sends one to the next place.",
        ],
        difficulty: 1000 + wantCarries * 60,
        widget: { key: "base-ten-blocks", config: { a, b, operation: "add" } },
        fallback: nearbyNumbers(sum, { min: 0, max: 999 }),
      };
    }

    // Built from the addition pair on purpose: taking b back off a + b needs
    // exactly the borrows that adding them needed carries, so the difficulty
    // band means the same thing in both directions.
    const big = a + b;
    const small = b;
    const diff = a;
    return {
      stem: `**${big} − ${small} = ?**`,
      audioText: `${big} minus ${small} equals what?`,
      correct: String(diff),
      distractors: [
        {
          value: String(subtractWithoutBorrowing(big, small)),
          misconception: "no_regrouping",
        },
        { value: String(big + small), misconception: "wrong_operation" },
        { value: String(diff - 100), misconception: "place_value_confusion" },
        { value: String(diff + 10), misconception: "off_by_one" },
      ],
      explanation: `Work right to left, opening a ten or a hundred whenever there is not enough to take from: ${big} − ${small} = ${diff}.`,
      hints: [
        "Start with the ones column.",
        "If the top digit is smaller, borrow from the next place.",
      ],
      difficulty: 1040 + wantCarries * 60,
      fallback: nearbyNumbers(diff, { min: 0, max: 999 }),
    };
  },
});

/** MA.2.FR.1.2 — Partition a rectangle into equal parts two different ways. */
export const g2PartitionTwoWays = mcGenerator({
  key: "g2.fr.partitionTwoWays",
  benchmark: "MA.2.FR.1.2",
  skillSlug: "partition-two-ways",
  skillTitle: "Splitting a rectangle in more than one way",
  build(rng) {
    const rows = rng.pick([2, 3, 4] as const);
    const cols = rng.pick([2, 3, 4] as const);
    const parts = rows * cols;

    const askEquivalent = rng.bool();
    if (askEquivalent) {
      // Same number of parts from a different cut: this is the point of the
      // benchmark, that "fourths" is about size, not about where the lines go.
      return {
        stem: `A rectangle is cut into **${parts} equal parts** using ${rows} rows and ${cols} columns. Which other cut also makes ${parts} equal parts?`,
        audioText: `A rectangle is cut into ${parts} equal parts using ${rows} rows and ${cols} columns. Which other cut also makes ${parts} equal parts?`,
        correct: `${cols} rows and ${rows} columns`,
        distractors: [
          {
            value: `${rows} rows and ${cols + 1} columns`,
            misconception: "off_by_one",
          },
          {
            value: `${rows + cols} rows and 1 column`,
            misconception: "wrong_operation",
          },
          {
            value: `${parts} rows and ${parts} columns`,
            misconception: "wrong_operation",
          },
        ],
        explanation: `${rows} × ${cols} and ${cols} × ${rows} both make ${parts} parts. Turning the cut sideways changes the shape of each piece but not how many there are.`,
        hints: [
          "How many parts do rows times columns give?",
          "The same total can come from a different arrangement.",
        ],
        difficulty: 1080,
      };
    }

    return {
      stem: `A rectangle is cut into **${rows} equal rows** and **${cols} equal columns**. How many equal parts are there?`,
      audioText: `A rectangle is cut into ${rows} equal rows and ${cols} equal columns. How many equal parts are there?`,
      correct: String(parts),
      distractors: [
        {
          value: String(rows + cols),
          misconception: "added_instead_of_multiplied",
        },
        { value: String(parts + 1), misconception: "off_by_one" },
        { value: String(Math.max(rows, cols)), misconception: "used_part_not_whole" },
        { value: String(parts * 2), misconception: "distractor_plausible" },
      ],
      explanation: `Each of the ${rows} rows is cut into ${cols} pieces, so there are ${rows} × ${cols} = ${parts} equal parts.`,
      hints: ["Count the pieces in one row.", "Then count how many rows."],
      difficulty: 1010,
      fallback: nearbyNumbers(parts, { min: 1, max: 30 }),
    };
  },
});

/** MA.2.AR.1.1 — One- and two-step real-world addition and subtraction. */
export const g2TwoStepProblem = mcGenerator({
  key: "g2.ar.twoStepProblem",
  benchmark: "MA.2.AR.1.1",
  skillSlug: "two-step-word-problems",
  skillTitle: "Two-step story problems",
  build(rng, ctx) {
    const who = rng.pick(NAMES);
    const thing = rng.pick(COUNTABLES);
    const twoStep = ctx.difficulty !== "easy";

    const start = rng.int(30, 90);
    const first = rng.int(8, 25);
    const second = rng.int(5, 20);

    if (!twoStep) {
      const answer = start + first;
      const stem = `${who} counted ${start} ${thing.many} and then found ${first} more. How many ${thing.many} are there now?`;
      return {
        stem,
        audioText: stem,
        correct: String(answer),
        distractors: [
          { value: String(start - first), misconception: "wrong_operation" },
          { value: String(answer + 10), misconception: "no_regrouping" },
          { value: String(answer - 1), misconception: "off_by_one" },
          { value: String(first), misconception: "used_part_not_whole" },
        ],
        explanation: `${start} + ${first} = ${answer}.`,
        hints: ["Finding more means adding."],
        difficulty: 980,
        fallback: nearbyNumbers(answer, { min: 0, max: 200 }),
      };
    }

    const afterFirst = start + first;
    const answer = afterFirst - second;
    const stem = `${who} had ${start} ${thing.many}. ${who} was given ${first} more, then gave ${second} to a friend. How many ${thing.many} does ${who} have now?`;

    return {
      stem,
      audioText: stem,
      correct: String(answer),
      distractors: [
        {
          // Stopped after the first step, the defining error of a two-step item.
          value: String(afterFirst),
          misconception: "used_part_not_whole",
        },
        {
          value: String(start + first + second),
          misconception: "wrong_operation",
        },
        {
          value: String(start - first + second),
          misconception: "inverse_operation_missed",
        },
        { value: String(answer + 1), misconception: "off_by_one" },
      ],
      explanation: `First: ${start} + ${first} = ${afterFirst}. Then: ${afterFirst} − ${second} = ${answer}. The question asks about the end, not the middle.`,
      hints: [
        "There are two things happening. Do the first one.",
        "Now use that answer for the second step.",
      ],
      difficulty: 1120,
      fallback: nearbyNumbers(answer, { min: 0, max: 200 }),
    };
  },
});

/** MA.2.M.1.1 — Choose a sensible unit and estimate a length. */
export const g2ChooseUnit = mcGenerator({
  key: "g2.m.chooseUnit",
  benchmark: "MA.2.M.1.1",
  skillSlug: "choose-length-unit",
  skillTitle: "Choosing the right unit of length",
  build(rng) {
    const cases = [
      { thing: "a new pencil", unit: "inches", wrong: ["yards", "feet", "metres"] },
      { thing: "the classroom door", unit: "feet", wrong: ["inches", "miles", "centimetres"] },
      { thing: "a football field", unit: "yards", wrong: ["inches", "centimetres", "feet"] },
      { thing: "a paperclip", unit: "centimetres", wrong: ["metres", "yards", "feet"] },
      { thing: "the school hallway", unit: "metres", wrong: ["centimetres", "inches", "millimetres"] },
      { thing: "a shoe", unit: "inches", wrong: ["yards", "metres", "miles"] },
    ] as const;
    const c = rng.pick(cases);

    return {
      stem: `Which unit makes the most sense for measuring **${c.thing}**?`,
      audioText: `Which unit makes the most sense for measuring ${c.thing}?`,
      correct: c.unit,
      distractors: c.wrong.map((w) => ({
        value: w,
        misconception: "ignored_units" as const,
      })),
      explanation: `${c.thing[0].toUpperCase()}${c.thing.slice(1)} is best measured in ${c.unit}. A unit that is far too big or too small gives a number that is hard to picture.`,
      hints: [
        "Would the number be enormous, or less than one?",
        "Pick the unit that gives a sensible, easy number.",
      ],
      difficulty: 960,
    };
  },
});

/** MA.2.M.1.3 — Real-world length problems. */
export const g2LengthProblem = mcGenerator({
  key: "g2.m.lengthProblem",
  benchmark: "MA.2.M.1.3",
  skillSlug: "length-word-problems",
  skillTitle: "Length story problems",
  build(rng, ctx) {
    const who = rng.pick(NAMES);
    const unit = rng.pick(["inches", "centimetres"] as const);
    const a = rng.int(14, 60);
    const b = rng.int(8, 40);
    const twoStep = ctx.difficulty === "stretch";
    const c = rng.int(5, 20);

    if (twoStep) {
      const answer = a + b - c;
      const stem = `${who} taped two ribbons together. One is ${a} ${unit} long and the other is ${b} ${unit} long. Then ${who} cut ${c} ${unit} off the end. How long is the ribbon now?`;
      return {
        stem,
        audioText: stem,
        correct: `${answer} ${unit}`,
        distractors: [
          { value: `${a + b} ${unit}`, misconception: "used_part_not_whole" },
          { value: `${a + b + c} ${unit}`, misconception: "wrong_operation" },
          { value: `${Math.abs(a - b)} ${unit}`, misconception: "wrong_operation" },
          { value: `${answer + 10} ${unit}`, misconception: "no_regrouping" },
        ],
        explanation: `Joined: ${a} + ${b} = ${a + b} ${unit}. Cut: ${a + b} − ${c} = ${answer} ${unit}.`,
        hints: ["Join them first.", "Then take off the piece that was cut."],
        difficulty: 1130,
      };
    }

    const longer = Math.max(a, b);
    const shorter = Math.min(a, b);
    const gap = longer - shorter;
    const stem = `${who} has a ribbon ${longer} ${unit} long and a string ${shorter} ${unit} long. How much **longer** is the ribbon?`;
    return {
      stem,
      audioText: stem,
      correct: `${gap} ${unit}`,
      distractors: [
        { value: `${longer + shorter} ${unit}`, misconception: "wrong_operation" },
        { value: `${longer} ${unit}`, misconception: "used_part_not_whole" },
        {
          value: `${subtractWithoutBorrowing(longer, shorter)} ${unit}`,
          misconception: "no_regrouping",
        },
        { value: `${gap + 1} ${unit}`, misconception: "off_by_one" },
      ],
      explanation: `"How much longer" is a difference: ${longer} − ${shorter} = ${gap} ${unit}.`,
      hints: [
        `"How much longer" means subtract.`,
        "Take the shorter length away from the longer one.",
      ],
      difficulty: 1030,
    };
  },
});

/** MA.2.GR.2.1 — Explore perimeter by counting unit segments. */
export const g2PerimeterUnits = mcGenerator({
  key: "g2.gr.perimeterUnits",
  benchmark: "MA.2.GR.2.1",
  skillSlug: "perimeter-by-counting",
  skillTitle: "Measuring around a shape with unit lengths",
  build(rng) {
    const w = rng.int(2, 8);
    const h = rng.int(2, 8);
    const perimeter = 2 * (w + h);
    const area = w * h;

    return {
      stem: `A rectangle is **${w} units wide** and **${h} units tall**. Unit sticks are laid all the way around its edge. How many sticks are needed?`,
      audioText: `A rectangle is ${w} units wide and ${h} units tall. How many unit sticks go all the way around it?`,
      correct: String(perimeter),
      distractors: [
        { value: String(area), misconception: "perimeter_area_confusion" },
        {
          // Counted only one of each pair of sides.
          value: String(w + h),
          misconception: "used_part_not_whole",
        },
        { value: String(perimeter + 4), misconception: "counted_endpoints" },
        { value: String(perimeter - 2), misconception: "off_by_one" },
      ],
      explanation: `Going around means every side: ${w} + ${h} + ${w} + ${h} = ${perimeter} sticks. That is the distance around, not the space inside.`,
      hints: [
        "Walk around the edge in your head.",
        "There are two long sides and two short sides.",
      ],
      difficulty: 1050,
      fallback: nearbyNumbers(perimeter, { min: 1, max: 80 }),
    };
  },
});

/** MA.2.DP.1.1 — Represent data in a table, pictograph or bar graph. */
export const g2BuildGraph = mcGenerator({
  key: "g2.dp.buildGraph",
  benchmark: "MA.2.DP.1.1",
  skillSlug: "represent-data",
  skillTitle: "Putting data into a graph",
  build(rng) {
    const setting = rng.pick(SETTINGS);
    const cats = rng
      .shuffle(["Monday", "Tuesday", "Wednesday", "Thursday"])
      .slice(0, 3);
    const scale = rng.pick([1, 2, 5] as const);
    // Every count is a whole number of symbols. Half a symbol is a real thing
    // on real graphs, but it is a grade 3 idea and it would give this item two
    // defensible answers.
    const counts = cats.map(() => rng.int(2, 8) * scale);
    const rows = listWords(cats.map((c, i) => `${c}: ${counts[i]}`));

    const target = rng.int(0, cats.length - 1);
    const value = counts[target];
    const symbols = value / scale;

    return {
      stem: `At ${setting.place} the ${setting.units} were counted: ${rows}.\n\nOn a picture graph, each ● stands for **${scale} ${setting.units}**. How many ● should ${cats[target]} have?`,
      audioText: `The counts were ${rows}. Each symbol stands for ${scale}. How many symbols should ${cats[target]} have?`,
      correct: String(symbols),
      distractors: [
        {
          // Drew one symbol per item, ignoring the key.
          value: String(counts[target]),
          misconception: "read_scale_by_ones",
        },
        { value: String(counts[target] * scale), misconception: "wrong_operation" },
        { value: String(symbols + 1), misconception: "off_by_one" },
        { value: String(scale), misconception: "distractor_plausible" },
      ],
      explanation: `Each ● is worth ${scale}, so ${value} ${setting.units} needs ${value} ÷ ${scale} = ${symbols} symbols. The key changes how many you draw.`,
      hints: [
        "Read the key before you count.",
        `One symbol is not one ${setting.unit} here.`,
      ],
      difficulty: scale === 1 ? 960 : 1100,
      widget: {
        key: "graph-builder",
        config: { kind: "pictograph", categories: cats, counts, scale },
      },
      fallback: nearbyNumbers(symbols, { min: 1, max: 30 }),
    };
  },
});
