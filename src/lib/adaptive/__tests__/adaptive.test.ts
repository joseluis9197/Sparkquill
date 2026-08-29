import { describe, it, expect } from "vitest";
import {
  DEFAULT_RATING,
  TARGET_SUCCESS_RATE,
  bandForStudent,
  expectedScore,
  kFactor,
  targetDifficulty,
  updateRatings,
} from "../elo";
import {
  GRADE_LEVEL_DIFFICULTY,
  applyAttempt,
  initialSkillState,
  isDueForReview,
  masteryFraction,
  type SkillState,
} from "../mastery";
import { selectNextSkill, type SkillCandidate } from "../select";

const T0 = new Date("2026-09-01T10:00:00Z");
const day = (n: number) => new Date(T0.getTime() + n * 86_400_000);

describe("elo", () => {
  it("gives an even chance between equally matched student and item", () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5, 6);
  });

  it("gives a better chance on an easier item", () => {
    expect(expectedScore(1200, 1000)).toBeGreaterThan(0.5);
    expect(expectedScore(800, 1000)).toBeLessThan(0.5);
  });

  it("solves for the difficulty that hits the target success rate", () => {
    const target = targetDifficulty(1000);
    // Round-trip: an item at the target difficulty should produce exactly
    // the success rate we asked for.
    expect(expectedScore(1000, target)).toBeCloseTo(TARGET_SUCCESS_RATE, 6);
    // And it should sit below the student's rating, not above.
    expect(target).toBeLessThan(1000);
  });

  it("round-trips for any requested success rate", () => {
    for (const rate of [0.55, 0.65, 0.75, 0.85, 0.9]) {
      const target = targetDifficulty(1000, rate);
      expect(expectedScore(1000, target)).toBeCloseTo(rate, 6);
    }
  });

  it("rejects impossible success rates rather than returning Infinity", () => {
    expect(() => targetDifficulty(1000, 0)).toThrow();
    expect(() => targetDifficulty(1000, 1)).toThrow();
  });

  it("raises the rating on a correct answer and lowers it on a wrong one", () => {
    const up = updateRatings({
      rating: 1000,
      itemDifficulty: 1000,
      correct: true,
      attemptCount: 0,
    });
    const down = updateRatings({
      rating: 1000,
      itemDifficulty: 1000,
      correct: false,
      attemptCount: 0,
    });
    expect(up.rating).toBeGreaterThan(1000);
    expect(down.rating).toBeLessThan(1000);
    // The item moves the other way, and far less.
    expect(up.itemDifficulty).toBeLessThan(1000);
    expect(Math.abs(up.itemDifficulty - 1000)).toBeLessThan(
      Math.abs(up.rating - 1000),
    );
  });

  it("moves the rating further when little is known about the student", () => {
    const early = updateRatings({
      rating: 1000,
      itemDifficulty: 1000,
      correct: true,
      attemptCount: 0,
    });
    const late = updateRatings({
      rating: 1000,
      itemDifficulty: 1000,
      correct: true,
      attemptCount: 100,
    });
    expect(early.rating - 1000).toBeGreaterThan(late.rating - 1000);
    expect(kFactor(0)).toBeGreaterThan(kFactor(100));
  });

  it("converges towards a student's true ability", () => {
    // Simulate a student whose real skill is 1250 answering 200 items served
    // at their current target difficulty. The rating should climb to roughly
    // the true value rather than drifting.
    const TRUE = 1250;
    let rating = DEFAULT_RATING;
    let seed = 12345;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    for (let i = 0; i < 200; i++) {
      const itemDifficulty = targetDifficulty(rating);
      const pCorrect = expectedScore(TRUE, itemDifficulty);
      const correct = rand() < pCorrect;
      rating = updateRatings({
        rating,
        itemDifficulty,
        correct,
        attemptCount: i,
      }).rating;
    }
    expect(rating).toBeGreaterThan(TRUE - 150);
    expect(rating).toBeLessThan(TRUE + 150);
  });

  it("maps ratings onto the bands the generators understand", () => {
    expect(bandForStudent(900)).toBe("easy");
    expect(bandForStudent(1200)).toBe("core");
    expect(bandForStudent(1400)).toBe("stretch");
  });
});

describe("mastery", () => {
  const gradeLevel = GRADE_LEVEL_DIFFICULTY + 40;

  function run(results: boolean[], difficulty = gradeLevel): SkillState {
    let state = initialSkillState();
    results.forEach((correct, i) => {
      state = applyAttempt(state, {
        correct,
        itemDifficulty: difficulty,
        at: day(i),
      }).state;
    });
    return state;
  }

  it("masters a skill on four correct out of five", () => {
    const state = run([true, true, false, true, true]);
    expect(state.level).toBe("mastered");
    expect(state.nextReviewAt).not.toBeNull();
  });

  it("does not master on three of five", () => {
    const state = run([true, false, true, false, true]);
    expect(state.level).not.toBe("mastered");
  });

  it("refuses to count easy questions towards mastery", () => {
    // Five correct answers, all below grade level. The child has shown they
    // can do easy questions, which is not the same as mastering the
    // benchmark — this is the check that stops the platform overstating
    // what a child knows.
    const state = run([true, true, true, true, true], GRADE_LEVEL_DIFFICULTY - 100);
    expect(state.recentResults).toHaveLength(0);
    expect(state.level).not.toBe("mastered");
  });

  it("walks the review ladder outwards on each successful review", () => {
    let state = run([true, true, true, true, true]);
    expect(state.reviewStage).toBe(0);
    const firstReview = state.nextReviewAt!;

    state = applyAttempt(state, {
      correct: true,
      itemDifficulty: gradeLevel,
      at: firstReview,
    }).state;
    expect(state.reviewStage).toBe(1);
    expect(state.nextReviewAt!.getTime()).toBeGreaterThan(firstReview.getTime());
  });

  it("survives a single slip, because 4 of 5 still meets the bar", () => {
    // Children have bad days. One wrong answer after five right ones leaves
    // the window at 4/5, which is still mastery — dropping the skill here
    // would punish a slip the rule explicitly tolerates.
    const state = run([true, true, true, true, true]);
    const transition = applyAttempt(state, {
      correct: false,
      itemDifficulty: gradeLevel,
      at: day(10),
    });
    expect(transition.regressed).toBe(false);
    expect(transition.state.level).toBe("mastered");
  });

  it("steps back gently once the window really drops below the bar", () => {
    let state = run([true, true, true, true, true]);
    expect(state.level).toBe("mastered");

    // Two misses takes the window to 3/5, which is a genuine regression.
    state = applyAttempt(state, {
      correct: false,
      itemDifficulty: gradeLevel,
      at: day(10),
    }).state;
    const transition = applyAttempt(state, {
      correct: false,
      itemDifficulty: gradeLevel,
      at: day(11),
    });
    state = transition.state;

    expect(transition.regressed).toBe(true);
    expect(state.level).toBe("practicing");
    // Back one rung on the ladder, not all the way to zero.
    expect(state.reviewStage).toBe(0);
    // And the history is kept, so recovery is quick rather than starting over.
    expect(state.recentResults.length).toBeGreaterThan(0);
  });

  it("reports a skill as due only once its review date has passed", () => {
    const state = run([true, true, true, true, true]);
    expect(isDueForReview(state, day(4))).toBe(false);
    expect(isDueForReview(state, day(6))).toBe(true);
  });

  it("never reports an unmastered skill as due for review", () => {
    const state = run([false, false]);
    expect(isDueForReview(state, day(100))).toBe(false);
  });

  it("produces a monotonic progress fraction", () => {
    expect(masteryFraction(initialSkillState())).toBe(0);
    const learning = run([true]);
    const practicing = run([true, true, true]);
    const mastered = run([true, true, true, true, true]);
    expect(masteryFraction(learning)).toBeGreaterThan(0);
    expect(masteryFraction(practicing)).toBeGreaterThanOrEqual(
      masteryFraction(learning),
    );
    expect(masteryFraction(mastered)).toBe(1);
  });
});

describe("skill selection", () => {
  function candidate(
    id: string,
    overrides: Partial<SkillCandidate> = {},
  ): SkillCandidate {
    return {
      skillId: id,
      skillSlug: id,
      benchmark: "MA.2.NSO.1.1",
      strandCode: "MA.2.NSO",
      reportingCategory: null,
      prerequisiteIds: [],
      state: initialSkillState(),
      ...overrides,
    };
  }

  function mastered(nextReviewAt: Date | null): SkillState {
    return {
      ...initialSkillState(),
      level: "mastered",
      recentResults: [true, true, true, true, true],
      attemptCount: 5,
      correctCount: 5,
      nextReviewAt,
      lastSeenAt: T0,
    };
  }

  const weights = [
    { name: "Number Sense and Operations", weight: 0.375 },
    { name: "Algebraic Reasoning", weight: 0.305 },
  ];

  it("puts a due review ahead of everything else", () => {
    const selection = selectNextSkill({
      candidates: [
        candidate("new-skill"),
        candidate("due", { state: mastered(day(-1)) }),
      ],
      categoryWeights: weights,
      now: T0,
    });
    expect(selection?.candidate.skillId).toBe("due");
    expect(selection?.reason).toBe("review_due");
  });

  it("does not surface a review before it is due", () => {
    const selection = selectNextSkill({
      candidates: [
        candidate("new-skill"),
        candidate("not-due", { state: mastered(day(5)) }),
      ],
      categoryWeights: weights,
      now: T0,
    });
    expect(selection?.candidate.skillId).toBe("new-skill");
  });

  it("will not serve a skill whose prerequisites are unmet", () => {
    const selection = selectNextSkill({
      candidates: [
        candidate("advanced", { prerequisiteIds: ["basic"] }),
        candidate("basic"),
      ],
      categoryWeights: weights,
      now: T0,
    });
    expect(selection?.candidate.skillId).toBe("basic");
  });

  it("unlocks a skill once its prerequisite is mastered", () => {
    const selection = selectNextSkill({
      candidates: [
        candidate("advanced", { prerequisiteIds: ["basic"] }),
        candidate("basic", { state: mastered(day(30)) }),
      ],
      categoryWeights: weights,
      now: T0,
    });
    expect(selection?.candidate.skillId).toBe("advanced");
  });

  it("drops to a blocked skill rather than giving up entirely", () => {
    // Every candidate has an unmet prerequisite that is not in the pool.
    const selection = selectNextSkill({
      candidates: [
        candidate("a", { prerequisiteIds: ["missing-1", "missing-2"] }),
        candidate("b", { prerequisiteIds: ["missing-3"] }),
      ],
      categoryWeights: weights,
      now: T0,
    });
    expect(selection).not.toBeNull();
    expect(selection?.reason).toBe("prerequisite_gap");
    // The one closest to being unblocked.
    expect(selection?.candidate.skillId).toBe("b");
  });

  it("prefers the heavier reporting category when skills are otherwise equal", () => {
    const selection = selectNextSkill({
      candidates: [
        candidate("light", { reportingCategory: "Algebraic Reasoning" }),
        candidate("heavy", { reportingCategory: "Number Sense and Operations" }),
      ],
      categoryWeights: weights,
      now: T0,
    });
    expect(selection?.candidate.skillId).toBe("heavy");
  });

  it("avoids immediately repeating a skill served this session", () => {
    const selection = selectNextSkill({
      candidates: [candidate("a"), candidate("b")],
      categoryWeights: weights,
      now: T0,
      recentlyServed: ["a"],
    });
    expect(selection?.candidate.skillId).toBe("b");
  });

  it("allows a repeat rather than ending the session when nothing is left", () => {
    const selection = selectNextSkill({
      candidates: [candidate("a")],
      categoryWeights: weights,
      now: T0,
      recentlyServed: ["a"],
    });
    expect(selection?.candidate.skillId).toBe("a");
  });

  it("keeps the longest-untouched skill warm once everything is mastered", () => {
    const selection = selectNextSkill({
      candidates: [
        candidate("recent", {
          state: { ...mastered(day(30)), lastSeenAt: day(5) },
        }),
        candidate("stale", {
          state: { ...mastered(day(30)), lastSeenAt: day(1) },
        }),
      ],
      categoryWeights: weights,
      now: T0,
    });
    expect(selection?.reason).toBe("fallback");
    expect(selection?.candidate.skillId).toBe("stale");
  });

  it("returns null only when there is genuinely nothing to serve", () => {
    expect(
      selectNextSkill({ candidates: [], categoryWeights: weights, now: T0 }),
    ).toBeNull();
  });
});
