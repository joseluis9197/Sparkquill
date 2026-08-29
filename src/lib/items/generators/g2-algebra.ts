import type { ItemGenerator, GeneratorContext, Item } from "../types";
import { Rng } from "../rng";
import { buildMultipleChoice } from "../build";
import { numberToWords } from "../numbers";

/**
 * Algebraic reasoning and number facts for grade 2.
 *
 * These are the benchmarks that carry the most weight later: even and odd
 * feeds divisibility, repeated addition becomes multiplication in grade 3, and
 * the meaning of the equals sign is what makes algebra possible at all.
 */

/**
 * MA.2.AR.3.1 — Even and odd.
 *
 * Asked as "which of these is even" rather than "is 13 even or odd". A binary
 * question padded out to four options needs two throwaway choices, and
 * "Neither" is not an answer any real test offers — the padding teaches a
 * child to eliminate nonsense rather than to think about the number.
 */
export const evenOdd: ItemGenerator = {
  key: "g2.ar.evenOdd",
  benchmark: "MA.2.AR.3.1",
  skillSlug: "even-and-odd",
  skillTitle: "Even and odd numbers",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const max = ctx.difficulty === "easy" ? 20 : ctx.difficulty === "core" ? 50 : 100;
    const wantEven = rng.bool(0.5);

    // One number of the asked-for parity, three of the other, so exactly one
    // option is right and every wrong option is wrong for the same reason.
    const target = (() => {
      let n = rng.int(2, max);
      if (n % 2 !== (wantEven ? 0 : 1)) n += 1;
      return Math.min(n, max);
    })();

    const others: number[] = [];
    let guard = 0;
    while (others.length < 3 && guard++ < 200) {
      let n = rng.int(2, max);
      if (n % 2 === (wantEven ? 0 : 1)) n += 1;
      if (n > max || n < 2) continue;
      if (n === target || others.includes(n)) continue;
      others.push(n);
    }

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `Which number is **${wantEven ? "even" : "odd"}**?`,
      audioText: `Which of these numbers is ${wantEven ? "even" : "odd"}?`,
      correct: String(target),
      distractors: others.map((n) => ({
        value: String(n),
        // Every wrong option here is the opposite parity, which is the one
        // error this benchmark is about.
        misconception: "place_value_confusion" as const,
      })),
      explanation: wantEven
        ? `${target} is even: it splits into two equal groups of ${target / 2} with none left over. The others end in an odd digit.`
        : `${target} is odd: split it in two and one is always left over. The others end in an even digit.`,
      hints: [
        "Try sharing each number into two equal groups.",
        "Only the last digit decides it.",
      ],
      difficulty: ctx.difficulty === "easy" ? 870 : ctx.difficulty === "core" ? 990 : 1090,
      fallback: (taken) => {
        for (let n = 2; n <= max; n++) {
          if (n % 2 === (wantEven ? 0 : 1)) continue;
          if (!taken.has(String(n))) return String(n);
        }
        return null;
      },
    });
  },
};

/** MA.2.AR.3.2 — Repeated addition and arrays, the road into multiplication. */
export const repeatedAddition: ItemGenerator = {
  key: "g2.ar.repeatedAddition",
  benchmark: "MA.2.AR.3.2",
  skillSlug: "repeated-addition-arrays",
  skillTitle: "Equal groups and arrays",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const rows = rng.int(2, ctx.difficulty === "easy" ? 4 : 6);
    const cols = rng.int(2, ctx.difficulty === "easy" ? 5 : 8);
    const total = rows * cols;

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `There are **${rows} rows** with **${cols}** in each row. How many altogether?`,
      audioText: `There are ${numberToWords(rows)} rows with ${numberToWords(cols)} in each row. How many altogether?`,
      correct: String(total),
      distractors: [
        // Adding the two numbers instead of the repeated groups is the error
        // this benchmark exists to catch.
        { value: String(rows + cols), misconception: "wrong_operation" },
        { value: String(total - cols), misconception: "off_by_one" },
        { value: String(total + cols), misconception: "off_by_one" },
        { value: String(total - 1), misconception: "off_by_one" },
      ],
      explanation: `${cols} added ${rows} times: ${Array(rows).fill(cols).join(" + ")} = ${total}.`,
      hints: [
        "Count one row first, then add that many again for each row.",
        "This is adding the same number over and over, not adding the two numbers together.",
      ],
      difficulty: ctx.difficulty === "easy" ? 920 : ctx.difficulty === "core" ? 1050 : 1170,
      widget: { key: "array-builder", config: { rows, cols } },
      fallback: (taken) => {
        for (let d = 2; d < 30; d++) {
          for (const v of [total + d, total - d]) {
            if (v > 0 && !taken.has(String(v))) return String(v);
          }
        }
        return null;
      },
    });
  },
};

/**
 * MA.2.AR.2.1 — Decide whether an equation is true.
 *
 * Asked as "which of these is true", with sums on both sides. Children who
 * have only ever seen `4 + 3 = ?` read the equals sign as "now write the
 * answer" rather than "these two sides are worth the same"; an equation like
 * `9 + 4 = 6 + 7` is what exposes that, and a true/false question padded with
 * "you cannot tell" does not.
 */
export const trueOrFalse: ItemGenerator = {
  key: "g2.ar.trueFalse",
  benchmark: "MA.2.AR.2.1",
  skillSlug: "true-false-equations",
  skillTitle: "Deciding if an equation is true",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const bothSides = ctx.difficulty !== "easy";
    const max = ctx.difficulty === "easy" ? 20 : 45;

    /** One equation, true or deliberately off by a little. */
    function equation(makeTrue: boolean): string {
      const a = rng.int(3, max);
      const b = rng.int(3, max);
      const sum = a + b;
      if (!bothSides) {
        return `${a} + ${b} = ${makeTrue ? sum : sum + rng.pick([1, 2, 10, -1])}`;
      }
      const c = rng.int(2, sum - 2);
      const d = makeTrue ? sum - c : sum - c + rng.pick([1, 2, -1, -2]);
      return `${a} + ${b} = ${c} + ${d}`;
    }

    const correct = equation(true);
    const wrong: string[] = [];
    let guard = 0;
    while (wrong.length < 4 && guard++ < 60) {
      const e = equation(false);
      if (e !== correct && !wrong.includes(e)) wrong.push(e);
    }

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `Which equation is **true**?`,
      audioText: "Which of these equations is true?",
      correct,
      distractors: wrong.map((e) => ({
        value: e,
        // Each wrong option is arithmetically close, so eliminating them means
        // working both sides out rather than spotting nonsense.
        misconception: "wrong_operation" as const,
      })),
      explanation: `In ${correct} both sides come to the same amount. The equals sign means "the same as", not "write the answer here".`,
      hints: [
        "Work out the left side, then the right side.",
        "They have to come to the same number.",
      ],
      difficulty: bothSides ? 1130 : 900,
    });
  },
};

/** MA.2.AR.2.2 — Find the unknown number in an equation. */
export const unknownNumber: ItemGenerator = {
  key: "g2.ar.unknown",
  benchmark: "MA.2.AR.2.2",
  skillSlug: "unknown-in-equation",
  skillTitle: "Finding the missing number",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const max = ctx.difficulty === "easy" ? 20 : ctx.difficulty === "core" ? 60 : 100;
    const total = rng.int(10, max);
    const known = rng.int(2, total - 2);
    const missing = total - known;

    // Where the blank sits changes the difficulty a lot: a missing addend is
    // much harder than a missing total, because it cannot be read off.
    const shape = ctx.difficulty === "easy" ? 0 : rng.int(0, 2);
    const stem =
      shape === 0
        ? `${known} + ${missing} = **?**`
        : shape === 1
          ? `${known} + **?** = ${total}`
          : `**?** + ${missing} = ${total}`;
    const answer = shape === 0 ? total : shape === 1 ? missing : known;

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `What number goes in the box?\n\n**${stem}**`,
      audioText: `What number is missing? ${stem.replace(/\*\*/g, "").replace("?", "what")}`,
      correct: String(answer),
      distractors: [
        // Adding when the blank calls for subtracting is the error the missing
        // addend form is built to expose.
        {
          value: String(shape === 0 ? Math.abs(known - missing) : total + known),
          misconception: "wrong_operation",
        },
        { value: String(answer + 1), misconception: "off_by_one" },
        { value: String(answer - 1), misconception: "off_by_one" },
        { value: String(answer + 10), misconception: "place_value_confusion" },
      ],
      explanation:
        shape === 0
          ? `${known} + ${missing} = ${total}.`
          : `The two sides must match. ${total} take away ${shape === 1 ? known : missing} leaves ${answer}.`,
      hints: [
        shape === 0
          ? "Add the two numbers."
          : "You know the total. Take away the part you already have.",
        "Check by putting your answer back into the equation.",
      ],
      difficulty: shape === 0 ? 900 : ctx.difficulty === "stretch" ? 1180 : 1080,
      widget: { key: "balance-scale", config: { total, known, shape } },
      fallback: (taken) => {
        for (let d = 2; d < 40; d++) {
          for (const v of [answer + d, answer - d]) {
            if (v > 0 && !taken.has(String(v))) return String(v);
          }
        }
        return null;
      },
    });
  },
};

/** MA.2.NSO.2.2 — Ten more, ten less, a hundred more, a hundred less. */
export const tenMoreLess: ItemGenerator = {
  key: "g2.nso.tenMoreLess",
  benchmark: "MA.2.NSO.2.2",
  skillSlug: "ten-hundred-more-less",
  skillTitle: "Ten and a hundred more or less",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const n = rng.int(120, 880);
    const byHundred = ctx.difficulty !== "easy" && rng.bool(0.5);
    const step = byHundred ? 100 : 10;
    const more = rng.bool(0.5);
    const answer = more ? n + step : n - step;

    const word = `${step === 10 ? "ten" : "one hundred"} ${more ? "more than" : "less than"}`;

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `What is **${word} ${n}**?`,
      audioText: `What is ${word} ${numberToWords(n)}?`,
      correct: String(answer),
      distractors: [
        // Changing the wrong column is the whole point of this benchmark.
        { value: String(more ? n + (step === 10 ? 100 : 10) : n - (step === 10 ? 100 : 10)), misconception: "place_value_confusion" },
        { value: String(more ? n - step : n + step), misconception: "wrong_operation" },
        { value: String(answer + 1), misconception: "off_by_one" },
        { value: String(n + (more ? 1 : -1)), misconception: "place_value_confusion" },
      ],
      explanation: `${word.charAt(0).toUpperCase() + word.slice(1)} ${n} changes only the ${step === 10 ? "tens" : "hundreds"} digit: ${answer}.`,
      hints: [
        `Only the ${step === 10 ? "tens" : "hundreds"} column changes.`,
        "The other digits stay exactly as they are.",
      ],
      difficulty: byHundred ? 1090 : ctx.difficulty === "easy" ? 900 : 990,
      widget: { key: "place-value-chart", config: { value: n } },
    });
  },
};

/** MA.2.NSO.2.1 — Addition facts to 20 with automaticity, and their partners. */
export const factsToTwenty: ItemGenerator = {
  key: "g2.nso.factsToTwenty",
  benchmark: "MA.2.NSO.2.1",
  skillSlug: "facts-to-twenty",
  skillTitle: "Addition and subtraction facts to 20",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const subtract = rng.bool(0.4);

    // Sums that cross ten are the ones that need recalling rather than
    // counting, so they dominate the harder bands.
    const crossesTen = ctx.difficulty !== "easy";
    let a = rng.int(crossesTen ? 5 : 1, 9);
    let b = rng.int(crossesTen ? 5 : 1, 9);
    if (crossesTen && a + b <= 10) b = Math.min(9, 11 - a);

    const sum = a + b;
    if (subtract) [a, b] = [sum, b];

    const answer = subtract ? a - b : sum;
    const stem = subtract ? `${a} − ${b} = ?` : `${a} + ${b} = ?`;

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem,
      audioText: subtract
        ? `What is ${numberToWords(a)} minus ${numberToWords(b)}?`
        : `What is ${numberToWords(a)} plus ${numberToWords(b)}?`,
      correct: String(answer),
      distractors: [
        { value: String(answer + 1), misconception: "off_by_one" },
        { value: String(answer - 1), misconception: "off_by_one" },
        {
          value: String(subtract ? a + b : Math.abs(a - b)),
          misconception: "wrong_operation",
        },
        { value: String(answer + 10), misconception: "place_value_confusion" },
      ],
      explanation: subtract
        ? `${a} − ${b} = ${answer}. It pairs with ${answer} + ${b} = ${a}.`
        : `${a} + ${b} = ${answer}. It pairs with ${answer} − ${b} = ${a}.`,
      hints: [
        crossesTen
          ? "Make ten first, then add what is left over."
          : "Count on from the larger number.",
        "Every addition fact has a subtraction fact hiding inside it.",
      ],
      difficulty: ctx.difficulty === "easy" ? 850 : crossesTen ? 1000 : 930,
      fallback: (taken) => {
        for (let d = 2; d < 20; d++) {
          for (const v of [answer + d, answer - d]) {
            if (v >= 0 && !taken.has(String(v))) return String(v);
          }
        }
        return null;
      },
    });
  },
};
