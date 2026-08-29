import type { GeneratorContext, ItemGenerator, MisconceptionKey } from "../types";
import { Rng } from "../rng";
import { buildMultipleChoice } from "../build";
import { PASSAGES, passagePool } from "@/lib/passages";
import type { Passage } from "@/lib/passages";

/**
 * Reading and vocabulary items, built from the passage library.
 *
 * Every question here is answered by an annotation the passage carries, not
 * by a generator trying to read prose. That is the only way a machine-built
 * reading item can be trusted: the passage and its answer key were written
 * together, so a question is correct by construction.
 *
 * The distractors matter as much as they do in mathematics, and the most
 * valuable one in reading is `plausible_but_absent` — a statement that fits
 * the topic and sounds sensible but that the text does not actually support.
 * A student who picks it is answering from what they expect rather than from
 * what they read, and that is the single most common way to lose marks on a
 * reading test.
 */

export interface ElaBuild {
  stem: string;
  audioText: string;
  correct: string;
  distractors: { value: string; misconception: MisconceptionKey }[];
  explanation: string;
  hints?: string[];
  difficulty?: number;
  /** Set when the item is unbuildable for this passage; the caller retries. */
  skip?: boolean;
}

/**
 * Builds a reading generator for one benchmark at one grade.
 *
 * Tries several passages before giving up: a builder that needs a poem with a
 * rhyme scheme cannot use an informational text, and rather than fail it asks
 * for the next candidate.
 */
export function readingGenerator(spec: {
  key: string;
  benchmark: string;
  grade: number;
  skillSlug: string;
  skillTitle: string;
  genre?: Passage["genre"];
  requires?: (p: Passage) => boolean;
  build: (p: Passage, rng: Rng, ctx: GeneratorContext) => ElaBuild;
  difficulty?: number;
}): ItemGenerator {
  return {
    key: spec.key,
    benchmark: spec.benchmark,
    skillSlug: spec.skillSlug,
    skillTitle: spec.skillTitle,
    itemTypes: ["multiple_choice"],
    generate(ctx: GeneratorContext) {
      const rng = new Rng(ctx.seed);
      const pool = passagePool(spec.grade, {
        genre: spec.genre,
        requires: spec.requires,
      });
      if (pool.length === 0) {
        throw new Error(
          `${spec.key}: no passage in grade ${spec.grade} satisfies this item's requirements`,
        );
      }

      // Deterministic order, then take the first that builds. Shuffling with
      // the item's own seed keeps replay exact while still varying which
      // passage a student meets.
      const candidates = rng.shuffle(pool);
      for (const passage of candidates) {
        const parts = spec.build(passage, rng, ctx);
        if (parts.skip) continue;
        return buildMultipleChoice({
          templateKey: spec.key,
          seed: ctx.seed,
          benchmark: spec.benchmark,
          skillSlug: spec.skillSlug,
          stem: parts.stem,
          audioText: parts.audioText,
          correct: parts.correct,
          distractors: parts.distractors,
          explanation: parts.explanation,
          hints: parts.hints,
          difficulty: parts.difficulty ?? spec.difficulty ?? 1100,
          passage: {
            id: passage.id,
            title: passage.title,
            text: passage.text,
            genre: passage.genre,
          },
        });
      }
      throw new Error(
        `${spec.key}#${ctx.seed}: no passage in grade ${spec.grade} could build this item`,
      );
    },
  };
}

/** A generator with no passage — vocabulary in isolation, spelling, phonics. */
export function plainGenerator(spec: {
  key: string;
  benchmark: string;
  skillSlug: string;
  skillTitle: string;
  build: (rng: Rng, ctx: GeneratorContext) => ElaBuild;
  difficulty?: number;
}): ItemGenerator {
  return {
    key: spec.key,
    benchmark: spec.benchmark,
    skillSlug: spec.skillSlug,
    skillTitle: spec.skillTitle,
    itemTypes: ["multiple_choice"],
    generate(ctx: GeneratorContext) {
      const rng = new Rng(ctx.seed);
      const parts = spec.build(rng, ctx);
      return buildMultipleChoice({
        templateKey: spec.key,
        seed: ctx.seed,
        benchmark: spec.benchmark,
        skillSlug: spec.skillSlug,
        stem: parts.stem,
        audioText: parts.audioText,
        correct: parts.correct,
        distractors: parts.distractors,
        explanation: parts.explanation,
        hints: parts.hints,
        difficulty: parts.difficulty ?? spec.difficulty ?? 1100,
      });
    },
  };
}

const UNBUILDABLE: ElaBuild = {
  skip: true,
  stem: "",
  audioText: "",
  correct: "",
  distractors: [],
  explanation: "",
};

export const skip = UNBUILDABLE;

/**
 * Wrong answers drawn from a passage's `notInText` list.
 *
 * These are the good ones. Each is a statement that fits the topic, uses the
 * passage's own vocabulary, and is not supported by a single line of it.
 */
export function absentOptions(
  p: Passage,
  rng: Rng,
  count = 3,
): { value: string; misconception: MisconceptionKey }[] {
  return rng
    .shuffle(p.notInText ?? [])
    .slice(0, count)
    .map((value) => ({ value, misconception: "plausible_but_absent" as const }));
}

/**
 * Options borrowed from other passages: true somewhere, wrong here.
 *
 * Drawn from the same grade as the passage in front of the student, and from
 * the grade below it. A second grader offered "a school debate tournament" as
 * a possible setting for a story about a tortoise can eliminate it without
 * reading anything — the option is from a different world, and a distractor
 * that can be dismissed on sight measures nothing.
 */
export function foreignOptions(
  p: Passage,
  pick: (other: Passage) => string | undefined,
  rng: Rng,
  count = 2,
): { value: string; misconception: MisconceptionKey }[] {
  const nearby = (grade: number) =>
    PASSAGES.filter(
      (o) => o.id !== p.id && o.grade <= grade && o.grade >= Math.max(1, grade - 1),
    );

  // Widen by one grade at a time rather than jumping to the whole library,
  // so the nearest usable options are always preferred.
  let candidates = nearby(p.grade)
    .map(pick)
    .filter((v): v is string => Boolean(v));
  if (candidates.length < count) {
    candidates = PASSAGES.filter((o) => o.id !== p.id && o.grade <= p.grade + 1)
      .map(pick)
      .filter((v): v is string => Boolean(v));
  }

  return rng
    .shuffle(candidates)
    .slice(0, count)
    .map((value) => ({ value, misconception: "wrong_text" as const }));
}
