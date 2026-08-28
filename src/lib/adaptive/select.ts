import { isDueForReview, type SkillState } from "./mastery";

/**
 * Choosing what to practise next.
 *
 * Three tiers, in strict priority order:
 *   1. Reviews that have come due. Spaced repetition only works if the
 *      reviews actually happen.
 *   2. Unmastered skills whose prerequisites are already mastered. This is
 *      the cross-grade remediation path: a struggling second grader gets the
 *      first grade skill underneath, not the same failed question again.
 *   3. Everything else, ordered by how much the weakest reporting category
 *      is worth on the real test.
 *
 * Tier 3 is where the blueprint weights earn their keep. Two skills a child
 * is equally weak at are not equally worth practising if one sits in a
 * category worth 42% of the test and the other in one worth 25%.
 */

export interface SkillCandidate {
  skillId: string;
  skillSlug: string;
  benchmark: string;
  /** Null for grades 1-2, which have no published blueprint. */
  reportingCategory: string | null;
  prerequisiteIds: string[];
  state: SkillState;
}

export interface CategoryWeight {
  name: string;
  /** Midpoint of the published range, as a fraction of the test. */
  weight: number;
}

export type SelectionReason =
  | "review_due"
  | "unlocked_gap"
  | "weak_category"
  | "prerequisite_gap"
  | "fallback";

export interface Selection {
  candidate: SkillCandidate;
  reason: SelectionReason;
  /** Human-readable, surfaced in the parent dashboard. */
  explanation: string;
}

function isMastered(c: SkillCandidate): boolean {
  return c.state.level === "mastered";
}

/** Mean mastery per reporting category, weighted for tie-breaking. */
function categoryStrength(
  candidates: SkillCandidate[],
): Map<string, number> {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const c of candidates) {
    if (!c.reportingCategory) continue;
    const entry = totals.get(c.reportingCategory) ?? { sum: 0, count: 0 };
    entry.sum += isMastered(c) ? 1 : c.state.level === "practicing" ? 0.5 : 0;
    entry.count += 1;
    totals.set(c.reportingCategory, entry);
  }
  const out = new Map<string, number>();
  for (const [name, { sum, count }] of totals) {
    out.set(name, count === 0 ? 0 : sum / count);
  }
  return out;
}

export function selectNextSkill(opts: {
  candidates: SkillCandidate[];
  categoryWeights: CategoryWeight[];
  now: Date;
  /** Skills already served this session, to avoid repeating one immediately. */
  recentlyServed?: string[];
}): Selection | null {
  const recent = new Set(opts.recentlyServed ?? []);
  const pool = opts.candidates.filter((c) => !recent.has(c.skillId));
  // If everything has been served this session, allow repeats rather than
  // ending the session early.
  const working = pool.length > 0 ? pool : opts.candidates;
  if (working.length === 0) return null;

  /* ---- 1. Reviews that are due, oldest first ---- */
  const due = working
    .filter((c) => isDueForReview(c.state, opts.now))
    .sort(
      (a, b) =>
        (a.state.nextReviewAt?.getTime() ?? 0) -
        (b.state.nextReviewAt?.getTime() ?? 0),
    );
  if (due.length > 0) {
    return {
      candidate: due[0],
      reason: "review_due",
      explanation: "Time to check this one is still solid.",
    };
  }

  /* ---- 2. Unmastered, with prerequisites already met ---- */
  const masteredIds = new Set(
    opts.candidates.filter(isMastered).map((c) => c.skillId),
  );
  const unlocked = working.filter(
    (c) =>
      !isMastered(c) &&
      c.prerequisiteIds.every((id) => masteredIds.has(id)),
  );

  const weightByCategory = new Map(
    opts.categoryWeights.map((w) => [w.name, w.weight]),
  );
  const strength = categoryStrength(opts.candidates);

  /**
   * Score = how much this skill is worth × how weak its category is ×
   * how far the skill itself is from mastery.
   */
  function score(c: SkillCandidate): number {
    const weight = c.reportingCategory
      ? (weightByCategory.get(c.reportingCategory) ?? 0.25)
      : // Grades 1-2 have no blueprint, so every skill counts the same.
        0.25;
    const categoryGap = c.reportingCategory
      ? 1 - (strength.get(c.reportingCategory) ?? 0)
      : 1;
    const skillGap =
      c.state.level === "not_started"
        ? 1
        : c.state.level === "learning"
          ? 0.8
          : 0.5;
    return weight * (0.5 + categoryGap) * skillGap;
  }

  if (unlocked.length > 0) {
    const best = [...unlocked].sort((a, b) => score(b) - score(a))[0];
    const weakest = best.reportingCategory
      ? `Building up ${best.reportingCategory.toLowerCase()}.`
      : "Next skill in the sequence.";
    return {
      candidate: best,
      reason: best.state.level === "not_started" ? "unlocked_gap" : "weak_category",
      explanation: weakest,
    };
  }

  /* ---- 3. Everything is blocked: drop to the prerequisites themselves ---- */
  const blocked = working.filter((c) => !isMastered(c));
  if (blocked.length > 0) {
    // Prefer the skill with the fewest unmet prerequisites — the closest
    // thing to a foundation the child can actually stand on.
    const best = [...blocked].sort((a, b) => {
      const unmetA = a.prerequisiteIds.filter((id) => !masteredIds.has(id)).length;
      const unmetB = b.prerequisiteIds.filter((id) => !masteredIds.has(id)).length;
      if (unmetA !== unmetB) return unmetA - unmetB;
      return score(b) - score(a);
    })[0];
    return {
      candidate: best,
      reason: "prerequisite_gap",
      explanation: "Going back a step to fill in what this builds on.",
    };
  }

  /* ---- Everything mastered: keep the strongest skills warm ---- */
  const oldest = [...working].sort(
    (a, b) =>
      (a.state.lastSeenAt?.getTime() ?? 0) - (b.state.lastSeenAt?.getTime() ?? 0),
  )[0];
  return {
    candidate: oldest,
    reason: "fallback",
    explanation: "All caught up — keeping this one fresh.",
  };
}
