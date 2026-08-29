import type { ItemGenerator, GeneratorContext, Item } from "../types";
import { Rng } from "../rng";
import { buildMultipleChoice } from "../build";
import {
  ATTRIBUTE_LABEL,
  SOLIDS,
  SOLIDS_BY_GRADE,
  type SolidAttribute,
  type SolidKey,
} from "@/lib/geometry/solids";

/**
 * MA.1.GR.1.1 / MA.2.GR.1.2 — Identify and compare three-dimensional figures
 * by their defining attributes.
 *
 * Every item ships with the Solid Explorer attached, so a child who cannot
 * answer from memory can rotate the shape and count for themselves. That is
 * the difference between this and a worksheet: the manipulative is not a
 * reward after the question, it is how the question is meant to be answered.
 */

function attributeQuestion(
  rng: Rng,
  solidKey: SolidKey,
  attribute: SolidAttribute,
  seed: number,
  templateKey: string,
  benchmark: string,
  skillSlug: string,
  difficulty: number,
): Item {
  const solid = SOLIDS[solidKey];
  const correct = solid[attribute];
  const label = ATTRIBUTE_LABEL[attribute];

  // The named errors: counting vertices when asked for faces, and counting
  // only the faces you can see from one angle (a cube looks like it has 3).
  const confusedWith =
    attribute === "faces"
      ? solid.vertices
      : attribute === "vertices"
        ? solid.faces
        : solid.vertices;
  const visibleOnly = Math.max(1, Math.ceil(solid.faces / 2));

  return buildMultipleChoice({
    templateKey,
    seed,
    benchmark,
    skillSlug,
    stem: `How many ${label.many} does ${solid.article} **${solid.name}** have?`,
    audioText: `How many ${label.many} does ${solid.article} ${solid.name} have? You can turn the shape to count them.`,
    correct: String(correct),
    distractors: [
      { value: String(confusedWith), misconception: "counted_faces_as_vertices" },
      { value: String(visibleOnly), misconception: "skipped_hidden_faces" },
      { value: String(correct + 1), misconception: "off_by_one" },
      { value: String(correct - 1), misconception: "off_by_one" },
      { value: String(solid.edges), misconception: "counted_faces_as_vertices" },
    ],
    explanation: `${solid.article === "a" ? "A" : "An"} ${solid.name} has ${correct} ${correct === 1 ? label.one : label.many}. Turn it right round — the ones facing away count too.`,
    hints: [
      "Drag the shape to spin it. The parts you cannot see still count.",
      `Tap each ${label.one} as you count it so you do not count one twice.`,
    ],
    difficulty,
    widget: {
      key: "solid-explorer",
      config: { solid: solidKey, highlight: attribute, countable: true },
    },
    fallback: (taken) => {
      for (let v = 0; v <= 14; v++) {
        if (!taken.has(String(v))) return String(v);
      }
      return null;
    },
  });
}

/**
 * Counting faces, edges and vertices on a solid the child can rotate.
 *
 * Filed under MA.1.GR.1.1, which is the benchmark that covers sorting 2D and
 * 3D figures by their defining attributes. It was previously filed under
 * MA.2.GR.1.2 — that benchmark is about categorising *2D* figures by sides and
 * vertices, so the dashboard was crediting a standard the child had not
 * practised.
 */
export const solidAttributes: ItemGenerator = {
  key: "g2.geo.solidAttributes",
  benchmark: "MA.1.GR.1.1",
  skillSlug: "identify-3d-attributes",
  skillTitle: "Faces, edges and corners of solids",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    // Grade 2 only meets the flat-faced solids for counting; curved solids
    // are for identification, not for face counting, which is why they are
    // filtered out here rather than handled with a special case downstream.
    const candidates = SOLIDS_BY_GRADE[2].filter((k) => !SOLIDS[k].curved);
    const solidKey = rng.pick(candidates);

    const attribute: SolidAttribute =
      ctx.difficulty === "easy"
        ? "faces"
        : rng.pick(["faces", "edges", "vertices"] as const);

    return attributeQuestion(
      rng,
      solidKey,
      attribute,
      ctx.seed,
      this.key,
      this.benchmark,
      this.skillSlug,
      ctx.difficulty === "easy" ? 900 : ctx.difficulty === "core" ? 1050 : 1180,
    );
  },
};

/** MA.1.GR.1.4 — Match a solid to an everyday object shaped like it. */
export const solidRealWorld: ItemGenerator = {
  key: "g2.geo.solidRealWorld",
  benchmark: "MA.1.GR.1.4",
  skillSlug: "identify-3d-real-world",
  skillTitle: "Spotting solid shapes in the world",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);
    const candidates = SOLIDS_BY_GRADE[2];
    const solidKey = rng.pick(candidates);
    const solid = SOLIDS[solidKey];
    const object = rng.pick(solid.realWorld);

    const others = candidates.filter((k) => k !== solidKey);

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `Which shape is **${object}** most like?`,
      audioText: `Which shape is ${object} most like?`,
      correct: solid.name,
      distractors: rng.shuffle(others).map((k) => ({
        value: SOLIDS[k].name,
        misconception: "distractor_plausible" as const,
      })),
      explanation: `${object.charAt(0).toUpperCase() + object.slice(1)} has the same shape as ${solid.article} ${solid.name}.`,
      hints: [
        "Does it have flat faces, or is it curved?",
        "Could it roll?",
      ],
      difficulty: 880,
      widget: {
        key: "solid-explorer",
        config: { solid: solidKey, highlight: "faces", countable: false },
      },
    });
  },
};
