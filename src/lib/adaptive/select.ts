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
 *
 * A parent can set a focus on top of this, which narrows tiers 2 and 3 to one
 * strand for a few days. It cannot reach tier 1: see the comment where it is
 * applied.
 */

export interface SkillCandidate {
  skillId: string;
  skillSlug: string;
  benchmark: string;
  /** "MA.4.FR" — the strand this skill belongs to. Present for every grade. */
  strandCode: string;
  /** Null for grades 1-2, which have no published blueprint. */
  reportingCategory: string | null;
  prerequisiteIds: string[];
  state: SkillState;
}

/**
 * Whether a prerequisite should be treated as missing.
 *
 * Not "has the child mastered it" — that would gate every new student out of
 * their own grade. A fresh fifth grader has mastered nothing, and a graph
 * read that way would send them to first grade counting on their first
 * question, which is both wrong and insulting.
 *
 * A prerequisite is missing only when there is *evidence* it is missing: the
 * child has attempted it enough times to say something, and is still not
 * getting it right. Until then, an untouched prerequisite is simply unknown,
 * and unknown is not the same as absent.
 */
export function isMissingFoundation(state: SkillState): boolean {
  const ATTEMPTS_BEFORE_JUDGING = 3;
  if (state.attemptCount < ATTEMPTS_BEFORE_JUDGING) return false;
  if (state.level === "mastered" || state.level === "practicing") return false;
  // Recent performance rather than lifetime accuracy: a child who struggled
  // in September and has it now should not be dragged back by their own
  // history.
  const recent = state.recentResults.slice(-5);
  if (recent.length === 0) return true;
  const correct = recent.filter(Boolean).length;
  return correct / recent.length < 0.6;
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

/**
 * A strand the parent has asked practice to lean towards.
 *
 * `label` is what the child is told, so it is the strand's readable name
 * rather than its code.
 */
export interface Focus {
  strandCode: string;
  label: string;
}

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
  /** Set by the parent, for a few days. See how it is applied below. */
  focus?: Focus | null;
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

  /*
   * The parent's focus applies from here down, and no higher.
   *
   * It is placed after the review tier on purpose. A review is due on the day
   * the schedule says, and a topic filter that skipped due reviews would turn
   * spaced repetition into a worksheet generator — the 1/3/7/21 day intervals
   * stop meaning anything the moment they can be postponed. So a focus can
   * decide *which new work* a child gets, and never defers work already owed.
   *
   * It narrows rather than replaces: if the focus has nothing left to offer —
   * every skill in it mastered, or the child practising the other subject —
   * selection carries on across everything as though no focus were set. An
   * empty session would be a worse answer than an off-topic question.
   */
  const focused = opts.focus
    ? working.filter((c) => c.strandCode === opts.focus!.strandCode)
    : [];
  const inFocus = focused.length > 0;
  const choosing = inFocus ? focused : working;

  /* ---- 2. Unmastered, with prerequisites already met ---- */
  const masteredIds = new Set(
    opts.candidates.filter(isMastered).map((c) => c.skillId),
  );
  const unlocked = choosing.filter(
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
      // Said plainly rather than hidden. A child who has been handed four
      // fraction questions in a row should be told why, and "because you
      // asked for it" is not an answer they can be given.
      explanation: inFocus ? `${opts.focus!.label}, as asked for at home.` : weakest,
    };
  }

  /* ---- 3. Everything is blocked: drop to the prerequisites themselves ---- */
  const blocked = choosing.filter((c) => !isMastered(c));
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
  const oldest = [...choosing].sort(
    (a, b) =>
      (a.state.lastSeenAt?.getTime() ?? 0) - (b.state.lastSeenAt?.getTime() ?? 0),
  )[0];
  return {
    candidate: oldest,
    reason: "fallback",
    explanation: "All caught up — keeping this one fresh.",
  };
}
