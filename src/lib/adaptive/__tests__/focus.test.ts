import { describe, expect, it } from "vitest";
import { selectNextSkill, type SkillCandidate } from "../select";
import { initialSkillState, type SkillState } from "../mastery";

/**
 * What a parent's focus may and may not do.
 *
 * The feature is one line of filtering, and the whole risk is in where that
 * line sits. Put it above the review tier and spaced repetition quietly stops
 * working: intervals that can be postponed are not intervals. Put it nowhere
 * and a family with a fractions test on Thursday has no way to say so.
 *
 * These are the boundaries, written as tests because a later refactor that
 * moves the filter up by ten lines would otherwise look harmless.
 */

function state(over: Partial<SkillState> = {}): SkillState {
  return { ...initialSkillState(), ...over };
}

function candidate(
  id: string,
  strandCode: string,
  over: Partial<SkillCandidate> = {},
): SkillCandidate {
  return {
    skillId: id,
    skillSlug: id,
    benchmark: `${strandCode}.1.1`,
    strandCode,
    reportingCategory: null,
    prerequisiteIds: [],
    state: state(),
    ...over,
  };
}

const FRACTIONS = { strandCode: "MA.4.FR", label: "Fractions" };
const NOW = new Date("2026-03-10T09:00:00Z");

describe("a parent's focus", () => {
  it("chooses within the strand it names", () => {
    const selection = selectNextSkill({
      candidates: [
        candidate("geometry", "MA.4.GR"),
        candidate("fractions", "MA.4.FR"),
      ],
      categoryWeights: [],
      now: NOW,
      focus: FRACTIONS,
    });
    expect(selection?.candidate.skillId).toBe("fractions");
  });

  it("tells the child why they are getting it", () => {
    const selection = selectNextSkill({
      candidates: [candidate("fractions", "MA.4.FR")],
      categoryWeights: [],
      now: NOW,
      focus: FRACTIONS,
    });
    expect(selection?.explanation).toContain("Fractions");
  });

  it("never postpones a review that has come due", () => {
    /*
     * The load-bearing test. A review outside the focused strand still wins,
     * because the schedule is the whole mechanism: a review served three days
     * late is not the same review.
     */
    const selection = selectNextSkill({
      candidates: [
        candidate("geometry", "MA.4.GR", {
          // Mastered, because that is what makes a review due — a skill still
          // being learned is never "owed", it is just unfinished.
          state: state({
            level: "mastered",
            attemptCount: 6,
            nextReviewAt: new Date("2026-03-09T09:00:00Z"),
          }),
        }),
        candidate("fractions", "MA.4.FR"),
      ],
      categoryWeights: [],
      now: NOW,
      focus: FRACTIONS,
    });
    expect(selection?.candidate.skillId).toBe("geometry");
    expect(selection?.reason).toBe("review_due");
  });

  it("falls back to everything when the strand has nothing left", () => {
    // Every fraction skill mastered, or the child practising the other
    // subject. An off-topic question beats no question.
    const selection = selectNextSkill({
      candidates: [candidate("geometry", "MA.4.GR")],
      categoryWeights: [],
      now: NOW,
      focus: FRACTIONS,
    });
    expect(selection?.candidate.skillId).toBe("geometry");
    expect(selection?.explanation).not.toContain("Fractions");
  });

  it("still reaches back for a missing prerequisite inside the focus", () => {
    // Focusing on fractions must not disable remediation within fractions:
    // the point of the week is to fix fractions, and the reason this child
    // cannot do them may sit a grade below.
    const selection = selectNextSkill({
      candidates: [
        candidate("unlike", "MA.4.FR", {
          prerequisiteIds: ["equivalent"],
          state: state({ level: "learning", attemptCount: 8 }),
        }),
        candidate("equivalent", "MA.4.FR", {
          state: state({ level: "learning", attemptCount: 4 }),
        }),
      ],
      categoryWeights: [],
      now: NOW,
      focus: FRACTIONS,
    });
    expect(selection?.candidate.skillId).toBe("equivalent");
  });

  it("changes nothing when no focus is set", () => {
    const candidates = [
      candidate("geometry", "MA.4.GR"),
      candidate("fractions", "MA.4.FR"),
    ];
    const withNull = selectNextSkill({
      candidates,
      categoryWeights: [],
      now: NOW,
      focus: null,
    });
    const without = selectNextSkill({
      candidates,
      categoryWeights: [],
      now: NOW,
    });
    expect(withNull?.candidate.skillId).toBe(without?.candidate.skillId);
    expect(withNull?.explanation).toBe(without?.explanation);
  });
});
