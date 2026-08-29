import { Rng } from "@/lib/items/rng";
import type { SkillRow } from "@/lib/data/progress";

/**
 * Choosing the questions for a mock test.
 *
 * Practice and a mock test want opposite things from the selector. Practice
 * is adaptive: it returns to what a child is weak at, because that is where
 * the learning is. A mock test must not do that. A test that gives a student
 * more of what they are bad at reports a score that is worse than the truth,
 * and one that gives them what they are good at reports better — either way
 * the number stops meaning anything.
 *
 * So the paper is built from the blueprint and from nothing else: how many
 * questions each reporting category is worth on the real test, and then a
 * uniform draw within each category. Mastery is not consulted at any point.
 *
 * The whole paper is fixed at the start from a stored seed, so a reload
 * returns the same questions. A test you can reroll by refreshing is not a
 * test.
 */

export interface PaperQuestion {
  skillSlug: string;
  skillId: string;
  reportingCategory: string | null;
  /** Seed for the item itself, so the same paper yields the same questions. */
  seed: number;
}

/** How many questions a mock test has, by grade. */
export function paperLength(grade: number): number {
  // Florida's own tests run 30-40 operational items. Shorter here for the
  // younger grades, where a forty-question sitting is a test of stamina
  // rather than of mathematics.
  if (grade <= 2) return 15;
  if (grade <= 4) return 24;
  return 30;
}

/** Minutes allowed. Generous: this is practice at working under a clock. */
export function paperMinutes(grade: number): number {
  return grade <= 2 ? 20 : grade <= 4 ? 35 : 45;
}

/**
 * Builds the paper.
 *
 * Categories are filled in proportion to their published weight, using
 * largest-remainder so the counts add up to the paper length exactly rather
 * than drifting by one or two after rounding.
 */
export function buildPaper(opts: {
  skills: SkillRow[];
  weights: { name: string; weight: number }[];
  grade: number;
  seed: number;
}): PaperQuestion[] {
  const { skills, weights, grade, seed } = opts;
  const rng = new Rng(seed);
  const length = paperLength(grade);

  if (skills.length === 0) return [];

  // Only the child's own grade. A mock test that reaches into earlier grades
  // is not measuring what the real one measures.
  const own = skills.filter((s) => s.grade === grade);
  const pool = own.length >= 6 ? own : skills;

  const byCategory = new Map<string, SkillRow[]>();
  for (const s of pool) {
    const key = s.reportingCategory ?? "__none__";
    byCategory.set(key, [...(byCategory.get(key) ?? []), s]);
  }

  /*
   * Grades 1 and 2 have no published blueprint, and neither does the ELA
   * category list at those grades. With nothing to weight by, the paper is a
   * uniform draw across everything — which is the honest thing to do, and is
   * what the curriculum page already tells parents.
   */
  const usable = weights.filter((w) => byCategory.has(w.name));
  if (usable.length === 0) {
    return drawFrom(pool, length, rng, skills);
  }

  const total = usable.reduce((sum, w) => sum + w.weight, 0) || 1;
  const exact = usable.map((w) => ({
    name: w.name,
    want: (w.weight / total) * length,
  }));

  const counts = exact.map((e) => ({ name: e.name, n: Math.floor(e.want) }));
  let remaining = length - counts.reduce((sum, c) => sum + c.n, 0);
  // Largest remainder: the categories that lost the most to rounding get the
  // spare questions, so the paper matches the blueprint as closely as an
  // integer count allows.
  const order = exact
    .map((e, i) => ({ i, frac: e.want - Math.floor(e.want) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; remaining > 0; k++, remaining--) {
    counts[order[k % order.length].i].n += 1;
  }

  const out: PaperQuestion[] = [];
  for (const { name, n } of counts) {
    out.push(...drawFrom(byCategory.get(name) ?? pool, n, rng, skills));
  }

  // Shuffled so the paper does not march through one category at a time,
  // which would let a student work out the structure and coast.
  return rng.shuffle(out).slice(0, length);
}

/**
 * Draws `n` questions from a set of skills, spreading across distinct skills
 * before repeating any. Ten questions all on the same skill would measure one
 * thing and report it as a category.
 */
function drawFrom(
  from: SkillRow[],
  n: number,
  rng: Rng,
  fallback: SkillRow[],
): PaperQuestion[] {
  const source = from.length > 0 ? from : fallback;
  if (source.length === 0 || n <= 0) return [];

  const out: PaperQuestion[] = [];
  let bag: SkillRow[] = [];
  for (let i = 0; i < n; i++) {
    if (bag.length === 0) bag = rng.shuffle(source);
    const skill = bag.pop()!;
    out.push({
      skillSlug: skill.slug,
      skillId: skill.id,
      reportingCategory: skill.reportingCategory,
      seed: rng.int(1, 2_000_000_000),
    });
  }
  return out;
}
