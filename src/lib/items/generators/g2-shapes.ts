import type { ItemGenerator, GeneratorContext, Item } from "../types";
import { Rng } from "../rng";
import { buildMultipleChoice } from "../build";
import {
  GRADE_2_POLYGONS,
  SHAPES,
  type ShapeKey,
} from "@/lib/geometry/shapes-2d";

/**
 * Two-dimensional figures.
 *
 * Kept strictly separate from the solids: MA.2.GR.1.1 and MA.2.GR.1.2 are
 * about 2D figures, and teaching them with a rotating cube credits a standard
 * the child has not practised.
 */

/** MA.2.GR.1.2 — Categorise 2D figures by sides and vertices. */
export const shapeSides: ItemGenerator = {
  key: "g2.geo.shapeSides",
  benchmark: "MA.2.GR.1.2",
  skillSlug: "categorize-2d-figures",
  skillTitle: "Sorting flat shapes by their sides",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const pool =
      ctx.difficulty === "easy"
        ? (["triangle", "square", "rectangle", "hexagon"] as ShapeKey[])
        : GRADE_2_POLYGONS;
    const key = rng.pick(pool);
    const shape = SHAPES[key];
    const askSides = rng.bool(0.6);
    const correct = askSides ? shape.sides : shape.vertices;
    const word = askSides ? "sides" : "vertices";

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `How many **${word}** does ${shape.article} **${shape.name}** have?`,
      audioText: `How many ${word} does ${shape.article} ${shape.name} have?`,
      correct: String(correct),
      distractors: [
        // Miscounting by one is the commonest error when counting round a
        // closed figure: the starting corner gets counted twice or missed.
        { value: String(correct + 1), misconception: "off_by_one" },
        { value: String(correct - 1), misconception: "off_by_one" },
        { value: String(correct + 2), misconception: "distractor_plausible" },
        { value: String(Math.max(3, correct - 2)), misconception: "distractor_plausible" },
      ],
      explanation: `${shape.article === "a" ? "A" : "An"} ${shape.name} has ${shape.sides} sides and ${shape.vertices} vertices. In any closed figure with straight edges those two numbers match.`,
      hints: [
        "Start at one corner and go all the way round.",
        "Mark where you started so you do not count it twice.",
      ],
      difficulty: ctx.difficulty === "easy" ? 880 : ctx.difficulty === "core" ? 1010 : 1140,
      widget: { key: "shape-viewer", config: { shape: key, highlight: word } },
      fallback: (taken) => {
        for (let v = 3; v <= 12; v++) {
          if (!taken.has(String(v))) return String(v);
        }
        return null;
      },
    });
  },
};

/** MA.2.GR.1.1 — Identify a 2D figure from its defining attributes. */
export const nameTheShape: ItemGenerator = {
  key: "g2.geo.nameTheShape",
  benchmark: "MA.2.GR.1.1",
  skillSlug: "identify-2d-figures",
  skillTitle: "Naming flat shapes",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const pool =
      ctx.difficulty === "easy"
        ? (["triangle", "square", "pentagon", "hexagon", "octagon"] as ShapeKey[])
        : GRADE_2_POLYGONS;
    const key = rng.pick(pool);
    const shape = SHAPES[key];

    // Distractors with a nearby side count are the tempting ones; a shape with
    // a wildly different count is not a real choice for anybody.
    const others = GRADE_2_POLYGONS.filter((k) => k !== key).sort(
      (a, b) =>
        Math.abs(SHAPES[a].sides - shape.sides) -
        Math.abs(SHAPES[b].sides - shape.sides),
    );

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `Which shape has **${shape.sides} straight sides** and **${shape.vertices} vertices**?`,
      audioText: `Which shape has ${shape.sides} straight sides and ${shape.vertices} vertices?`,
      correct: shape.name,
      distractors: others.slice(0, 4).map((k) => ({
        value: SHAPES[k].name,
        misconception: "distractor_plausible" as const,
      })),
      explanation: `${shape.article === "a" ? "A" : "An"} ${shape.name} has ${shape.sides} sides and ${shape.vertices} vertices.`,
      hints: [
        "Count the straight edges first.",
        "Every corner where two sides meet is a vertex.",
      ],
      difficulty: ctx.difficulty === "easy" ? 900 : 1060,
      widget: { key: "shape-viewer", config: { shape: key, highlight: "sides" } },
    });
  },
};

/** MA.2.GR.1.3 — Identify lines of symmetry. */
export const linesOfSymmetry: ItemGenerator = {
  key: "g2.geo.symmetry",
  benchmark: "MA.2.GR.1.3",
  skillSlug: "lines-of-symmetry",
  skillTitle: "Lines of symmetry",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    // A circle has infinitely many, which is not a countable answer at this
    // age, so it never appears in this question.
    const pool: ShapeKey[] =
      ctx.difficulty === "easy"
        ? ["square", "rectangle", "triangle"]
        : ["square", "rectangle", "triangle", "rhombus", "trapezoid", "pentagon", "hexagon"];
    const key = rng.pick(pool);
    const shape = SHAPES[key];
    const correct = shape.linesOfSymmetry;

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `How many **lines of symmetry** does ${shape.article} **${shape.name}** have?`,
      audioText: `How many lines of symmetry does ${shape.article} ${shape.name} have? A line of symmetry folds the shape onto itself exactly.`,
      correct: String(correct),
      distractors: [
        // Assuming a shape has as many lines of symmetry as sides is the
        // classic over-generalisation from squares and triangles: it is true
        // for regular figures and false for a rectangle or a trapezoid.
        {
          value: String(shape.sides),
          misconception: "distractor_plausible",
        },
        { value: String(correct + 1), misconception: "off_by_one" },
        { value: String(Math.max(0, correct - 1)), misconception: "off_by_one" },
        { value: "0", misconception: "distractor_plausible" },
      ],
      explanation:
        correct === shape.sides
          ? `${shape.article === "a" ? "A" : "An"} ${shape.name} is regular, so every line through opposite corners or side middles works: ${correct} in all.`
          : `${shape.article === "a" ? "A" : "An"} ${shape.name} has ${correct}. It is not regular, so having ${shape.sides} sides does not mean ${shape.sides} lines of symmetry.`,
      hints: [
        "A line of symmetry folds the shape exactly onto itself.",
        "Try folding it top to bottom, side to side, and corner to corner.",
      ],
      difficulty: ctx.difficulty === "easy" ? 950 : 1120,
      widget: { key: "shape-viewer", config: { shape: key, highlight: "symmetry" } },
      fallback: (taken) => {
        for (let v = 0; v <= 9; v++) {
          if (!taken.has(String(v))) return String(v);
        }
        return null;
      },
    });
  },
};

/** MA.2.GR.2.2 — Perimeter of a polygon with whole-number sides. */
export const perimeter: ItemGenerator = {
  key: "g2.geo.perimeter",
  benchmark: "MA.2.GR.2.2",
  skillSlug: "perimeter-of-polygon",
  skillTitle: "Perimeter of a shape",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const isRectangle = ctx.difficulty === "easy" || rng.bool(0.6);

    let sides: number[];
    let label: string;
    if (isRectangle) {
      const w = rng.int(2, ctx.difficulty === "easy" ? 8 : 14);
      const h = rng.int(2, ctx.difficulty === "easy" ? 8 : 14);
      sides = [w, h, w, h];
      label = `a rectangle ${w} cm by ${h} cm`;
    } else {
      const n = rng.int(3, 5);
      sides = Array.from({ length: n }, () => rng.int(2, 12));
      label = `a ${n}-sided shape with sides ${sides.join(" cm, ")} cm`;
    }

    const total = sides.reduce((a, b) => a + b, 0);
    // The error that defines this benchmark: adding only the two labelled
    // sides of a rectangle and forgetting the opposite pair.
    const halfOnly = isRectangle ? sides[0] + sides[1] : total - sides[sides.length - 1];
    const area = isRectangle ? sides[0] * sides[1] : 0;

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `What is the **perimeter** of ${label}?`,
      audioText: `What is the perimeter of ${label}? The perimeter is the distance all the way round.`,
      correct: `${total} cm`,
      distractors: [
        { value: `${halfOnly} cm`, misconception: "counted_endpoints" },
        ...(area > 0 && area !== total
          ? [{ value: `${area} cm`, misconception: "perimeter_area_confusion" as const }]
          : []),
        { value: `${total - 1} cm`, misconception: "off_by_one" },
        { value: `${total + 2} cm`, misconception: "off_by_one" },
      ],
      explanation: isRectangle
        ? `A rectangle has two sides of ${sides[0]} cm and two of ${sides[1]} cm. All four add to ${total} cm.`
        : `Add every side: ${sides.join(" + ")} = ${total} cm.`,
      hints: [
        "Perimeter is the distance all the way round the outside.",
        isRectangle
          ? "A rectangle has four sides, not two — the opposite ones are the same length."
          : "Add every side, including the one you might skip.",
      ],
      difficulty: ctx.difficulty === "easy" ? 930 : ctx.difficulty === "core" ? 1060 : 1180,
      fallback: (taken) => {
        for (let d = 3; d < 40; d++) {
          for (const v of [`${total + d} cm`, `${total - d} cm`]) {
            if (!taken.has(v) && !v.startsWith("-")) return v;
          }
        }
        return null;
      },
    });
  },
};
