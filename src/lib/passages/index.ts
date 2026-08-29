import type { Genre, Passage } from "./types";
import { G1_G2_PASSAGES } from "./g1-g2";
import { G3_G4_PASSAGES } from "./g3-g4";
import { G5_G6_PASSAGES } from "./g5-g6";
import { EXTRA_G3_G4_PASSAGES } from "./extra-g3";
import { EXTRA_PASSAGES } from "./extra-g5";
import { EXPANSION_G1_G2_PASSAGES } from "./expansion-g1-g2";
import { EXPANSION_G3_G4_PASSAGES } from "./expansion-g3-g4";
import { EXPANSION_G5_G6_PASSAGES } from "./expansion-g5-g6";

/**
 * Every passage on the platform, keyed for lookup.
 *
 * A stored attempt records only the generator key and its seed, and the
 * generator picks its passage from this list by id — so an item from two
 * years ago replays exactly, provided a passage is never quietly reworded.
 * Editing the text of a published passage changes history; add a new one
 * instead.
 */
export const PASSAGES: Passage[] = [
  ...G1_G2_PASSAGES,
  ...G3_G4_PASSAGES,
  ...G5_G6_PASSAGES,
  ...EXTRA_G3_G4_PASSAGES,
  ...EXTRA_PASSAGES,
  ...EXPANSION_G1_G2_PASSAGES,
  ...EXPANSION_G3_G4_PASSAGES,
  ...EXPANSION_G5_G6_PASSAGES,
];

const BY_ID = new Map(PASSAGES.map((p) => [p.id, p]));

export function getPassage(id: string): Passage {
  const p = BY_ID.get(id);
  if (!p) throw new Error(`Unknown passage: ${id}`);
  return p;
}

export function passagesForGrade(grade: number, genre?: Genre): Passage[] {
  return PASSAGES.filter(
    (p) => p.grade === grade && (genre === undefined || p.genre === genre),
  );
}

/**
 * Passages a grade may draw on, including earlier grades.
 *
 * A sixth grader reading a third grade passage is doing easy work, not wrong
 * work — unlike a third grader meeting a sixth grade one. The ceiling is what
 * matters, exactly as it does for the mathematics skills.
 */
export function passagePool(
  grade: number,
  opts: { genre?: Genre; requires?: (p: Passage) => boolean } = {},
): Passage[] {
  const pool = PASSAGES.filter(
    (p) =>
      p.grade <= grade &&
      p.grade >= Math.max(1, grade - 1) &&
      (opts.genre === undefined || p.genre === opts.genre) &&
      (opts.requires === undefined || opts.requires(p)),
  );
  // Nothing at this grade or the one below: widen rather than return nothing,
  // because an item that cannot be built is worse than an easy one.
  if (pool.length === 0) {
    return PASSAGES.filter(
      (p) =>
        p.grade <= grade &&
        (opts.genre === undefined || p.genre === opts.genre) &&
        (opts.requires === undefined || opts.requires(p)),
    );
  }
  return pool;
}

export type { Passage, Genre } from "./types";
export { wordCount, LENGTH_BANDS, POETRY_BANDS, bandFor, searchableText } from "./types";
