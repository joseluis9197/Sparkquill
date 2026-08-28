import type { ItemGenerator, GeneratorContext, Item } from "../types";
import { Rng } from "../rng";
import { buildMultipleChoice } from "../build";
import { numberToWords } from "../numbers";

/**
 * Measurement, money and data for grade 2.
 *
 * Money is where place value stops being abstract: a child who can read 305
 * but writes $3.5 for three dollars and five cents has not connected the two,
 * and this is where that shows up.
 */

const COINS = [
  { name: "quarter", plural: "quarters", value: 25 },
  { name: "dime", plural: "dimes", value: 10 },
  { name: "nickel", plural: "nickels", value: 5 },
  { name: "penny", plural: "pennies", value: 1 },
] as const;

function formatMoney(cents: number): string {
  if (cents < 100) return `${cents}¢`;
  return `$${(cents / 100).toFixed(2)}`;
}

/** MA.2.M.2.2 — Solve money problems using dollar and cent notation. */
export const countMoney: ItemGenerator = {
  key: "g2.m.countMoney",
  benchmark: "MA.2.M.2.2",
  skillSlug: "count-money",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const kinds = ctx.difficulty === "easy" ? 2 : ctx.difficulty === "core" ? 3 : 4;
    const chosen = rng.shuffle(COINS).slice(0, kinds);

    const parts = chosen.map((coin) => ({
      coin,
      count: rng.int(1, coin.value >= 25 ? 3 : 4),
    }));
    const total = parts.reduce((sum, p) => sum + p.coin.value * p.count, 0);

    const listed = parts
      .map((p) => `${p.count} ${p.count === 1 ? p.coin.name : p.coin.plural}`)
      .join(", ");

    // Counting coins rather than their values is the defining error here: four
    // coins is not four cents.
    const countedCoins = parts.reduce((n, p) => n + p.count, 0);

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `How much money is **${listed}**?`,
      audioText: `How much money is ${listed}?`,
      correct: formatMoney(total),
      distractors: [
        { value: formatMoney(countedCoins), misconception: "ignored_units" },
        { value: formatMoney(total + 5), misconception: "off_by_one" },
        { value: formatMoney(total - 5), misconception: "off_by_one" },
        { value: formatMoney(total + 10), misconception: "place_value_confusion" },
      ],
      explanation: `${parts
        .map((p) => `${p.count} × ${p.coin.value}¢ = ${p.coin.value * p.count}¢`)
        .join(", ")}. Altogether ${formatMoney(total)}.`,
      hints: [
        "Start with the coins worth the most.",
        "Count the value of each coin, not how many coins there are.",
      ],
      difficulty: ctx.difficulty === "easy" ? 920 : ctx.difficulty === "core" ? 1060 : 1180,
      widget: { key: "money-counter", config: { parts: parts.map((p) => ({ value: p.coin.value, count: p.count })) } },
      fallback: (taken) => {
        for (let d = 1; d < 40; d++) {
          for (const v of [formatMoney(total + d), formatMoney(total - d)]) {
            if (!taken.has(v) && !v.includes("-")) return v;
          }
        }
        return null;
      },
    });
  },
};

/** MA.2.M.1.2 — Measure two objects and find the difference. */
export const lengthDifference: ItemGenerator = {
  key: "g2.m.lengthDifference",
  benchmark: "MA.2.M.1.2",
  skillSlug: "compare-lengths",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const unit = rng.pick(["inches", "centimetres"] as const);
    const max = ctx.difficulty === "easy" ? 20 : 60;
    const a = rng.int(4, max);
    const b = rng.int(2, a - 1);
    const difference = a - b;

    const objects = rng.shuffle([
      "the pencil",
      "the ribbon",
      "the crayon",
      "the straw",
      "the stick",
    ]);

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `${objects[0][0].toUpperCase() + objects[0].slice(1)} is **${a} ${unit}** long. ${objects[1][0].toUpperCase() + objects[1].slice(1)} is **${b} ${unit}**. How much longer is ${objects[0]}?`,
      audioText: `${objects[0]} is ${numberToWords(a)} ${unit} long. ${objects[1]} is ${numberToWords(b)} ${unit}. How much longer is ${objects[0]}?`,
      correct: `${difference} ${unit}`,
      distractors: [
        // Adding when the question asks for a difference is the error that
        // separates "how much longer" from "how long altogether".
        { value: `${a + b} ${unit}`, misconception: "wrong_operation" },
        { value: `${a} ${unit}`, misconception: "ignored_units" },
        { value: `${difference + 1} ${unit}`, misconception: "off_by_one" },
        { value: `${difference - 1} ${unit}`, misconception: "off_by_one" },
      ],
      explanation: `${a} − ${b} = ${difference}, so ${objects[0]} is ${difference} ${unit} longer.`,
      hints: [
        "'How much longer' asks for the gap between them.",
        "Line them up at one end and look at what sticks out.",
      ],
      difficulty: ctx.difficulty === "easy" ? 930 : 1070,
      fallback: (taken) => {
        for (let d = 2; d < 30; d++) {
          const v = `${difference + d} ${unit}`;
          if (!taken.has(v)) return v;
        }
        return null;
      },
    });
  },
};

/** MA.2.DP.1.2 — Interpret data from a table or graph. */
export const readData: ItemGenerator = {
  key: "g2.dp.readData",
  benchmark: "MA.2.DP.1.2",
  skillSlug: "interpret-data",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    // Always four categories: "which has the most" needs three distractors,
    // and three categories only leaves two.
    const categories = rng
      .shuffle(["Cats", "Dogs", "Fish", "Birds", "Rabbits"])
      .slice(0, 4);

    // Distinct counts, so "the most" has exactly one answer. A tie would make
    // two options correct, which is the worst defect an item can have.
    const counts = rng.shuffle(
      rng.distinctInts(categories.length, 2, 14),
    );

    const rows = categories
      .map((c, i) => `${c}: ${counts[i]}`)
      .join("  ·  ");

    const kind =
      ctx.difficulty === "easy"
        ? "most"
        : rng.pick(["most", "total", "difference"] as const);

    let stem: string;
    let answer: number;
    let correctLabel: string;

    if (kind === "most") {
      const maxIdx = counts.indexOf(Math.max(...counts));
      stem = `Which one has the **most**?`;
      correctLabel = categories[maxIdx];
      answer = counts[maxIdx];
      return buildMultipleChoice({
        templateKey: this.key,
        seed: ctx.seed,
        benchmark: this.benchmark,
        skillSlug: this.skillSlug,
        stem: `${rows}\n\n${stem}`,
        audioText: `${categories.map((c, i) => `${c}, ${counts[i]}`).join(". ")}. Which one has the most?`,
        correct: correctLabel,
        distractors: categories
          .filter((c) => c !== correctLabel)
          .map((c) => ({ value: c, misconception: "distractor_plausible" as const })),
        explanation: `${correctLabel} has ${answer}, more than any of the others.`,
        hints: ["Look for the biggest number.", "Compare them two at a time."],
        difficulty: 880,
        widget: { key: "graph-builder", config: { categories, counts } },
      });
    }

    if (kind === "total") {
      answer = counts.reduce((a, b) => a + b, 0);
      stem = `How many are there **altogether**?`;
    } else {
      const sorted = [...counts].sort((a, b) => b - a);
      answer = sorted[0] - sorted[1];
      stem = `How many **more** does the biggest group have than the next biggest?`;
    }

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `${rows}\n\n${stem}`,
      audioText: `${categories.map((c, i) => `${c}, ${counts[i]}`).join(". ")}. ${stem.replace(/\*\*/g, "")}`,
      correct: String(answer),
      distractors: [
        // Reading off the biggest bar instead of doing the arithmetic.
        { value: String(Math.max(...counts)), misconception: "wrong_operation" },
        { value: String(answer + 1), misconception: "off_by_one" },
        { value: String(answer - 1), misconception: "off_by_one" },
        { value: String(categories.length), misconception: "ignored_units" },
        { value: String(Math.min(...counts)), misconception: "wrong_operation" },
      ],
      explanation:
        kind === "total"
          ? `Add every group: ${counts.join(" + ")} = ${answer}.`
          : `The two biggest groups differ by ${answer}.`,
      hints: [
        kind === "total"
          ? "Add every row, not just the biggest."
          : "Find the two biggest, then take one from the other.",
        "Read the numbers off the table carefully.",
      ],
      difficulty: ctx.difficulty === "core" ? 1040 : 1150,
      widget: { key: "graph-builder", config: { categories, counts } },
      fallback: (taken) => {
        for (let d = 2; d < 30; d++) {
          for (const v of [answer + d, answer - d]) {
            if (v > 0 && !taken.has(String(v))) return String(v);
          }
        }
        return null;
      },
    });
  },
};

/** MA.2.FR.1.1 — Partition a whole into halves, thirds and fourths. */
export const partitionShapes: ItemGenerator = {
  key: "g2.fr.partition",
  benchmark: "MA.2.FR.1.1",
  skillSlug: "partition-into-equal-parts",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const parts = rng.pick([2, 3, 4] as const);
    const names: Record<number, [string, string]> = {
      2: ["half", "halves"],
      3: ["third", "thirds"],
      4: ["fourth", "fourths"],
    };
    const [singular, plural] = names[parts];
    const askName = ctx.difficulty !== "easy" && rng.bool(0.5);

    if (askName) {
      return buildMultipleChoice({
        templateKey: this.key,
        seed: ctx.seed,
        benchmark: this.benchmark,
        skillSlug: this.skillSlug,
        stem: `A shape is split into **${parts} equal parts**. What is one part called?`,
        audioText: `A shape is split into ${numberToWords(parts)} equal parts. What is one part called?`,
        correct: `one ${singular}`,
        distractors: [
          { value: "one half", misconception: "distractor_plausible" },
          { value: "one third", misconception: "distractor_plausible" },
          { value: "one fourth", misconception: "distractor_plausible" },
          { value: `${parts} wholes`, misconception: "ignored_units" },
        ],
        explanation: `${parts} equal parts means each one is one ${singular}. All ${parts} ${plural} together make the whole.`,
        hints: [
          "The number of equal parts gives the name.",
          "Two parts are halves, three are thirds, four are fourths.",
        ],
        difficulty: 1040,
        widget: { key: "fraction-bar", config: { parts, shaded: 1 } },
      });
    }

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `How many **${plural}** make a whole?`,
      audioText: `How many ${plural} make one whole?`,
      correct: String(parts),
      distractors: [
        { value: String(parts + 1), misconception: "off_by_one" },
        { value: String(parts - 1), misconception: "off_by_one" },
        { value: "1", misconception: "ignored_units" },
        { value: String(parts * 2), misconception: "distractor_plausible" },
      ],
      explanation: `It takes ${parts} ${plural} to make one whole. The parts have to be equal.`,
      hints: [
        "The name tells you the number.",
        "The parts must be the same size, or they are not really thirds.",
      ],
      difficulty: ctx.difficulty === "easy" ? 890 : 960,
      widget: { key: "fraction-bar", config: { parts, shaded: parts } },
    });
  },
};
