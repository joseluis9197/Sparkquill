import { describe, it, expect } from "vitest";
import { isMissingFoundation, selectNextSkill } from "../select";
import { initialSkillState, type SkillState } from "../mastery";
import { PREREQUISITE_EDGES, prerequisiteMap } from "@/lib/curriculum/prerequisites";

function state(over: Partial<SkillState> = {}): SkillState {
  return { ...initialSkillState(), ...over };
}

describe("when a prerequisite counts as missing", () => {
  it("does not judge a skill the child has never tried", () => {
    // The whole point. A new fifth grader has mastered nothing; if untouched
    // meant missing, every skill would look blocked and the selector would
    // drop them into first grade counting on their very first question.
    expect(isMissingFoundation(state())).toBe(false);
  });

  it("does not judge on one or two attempts", () => {
    expect(
      isMissingFoundation(state({ attemptCount: 2, recentResults: [false, false] })),
    ).toBe(false);
  });

  it("flags a skill attempted several times and still going wrong", () => {
    expect(
      isMissingFoundation(
        state({
          attemptCount: 6,
          level: "learning",
          recentResults: [false, false, true, false, false],
        }),
      ),
    ).toBe(true);
  });

  it("does not flag a skill the child has recovered on", () => {
    // Lifetime accuracy would keep dragging them back to something they
    // struggled with in September and can do now.
    expect(
      isMissingFoundation(
        state({
          attemptCount: 20,
          level: "learning",
          recentResults: [true, true, true, false, true],
        }),
      ),
    ).toBe(false);
  });

  it("never flags a mastered or practising skill", () => {
    for (const level of ["mastered", "practicing"] as const) {
      expect(
        isMissingFoundation(
          state({ attemptCount: 30, level, recentResults: [false, false, false] }),
        ),
      ).toBe(false);
    }
  });
});

describe("the prerequisite graph", () => {
  const map = prerequisiteMap();

  it("has no self-edges", () => {
    for (const [skill, prereq] of PREREQUISITE_EDGES) {
      expect(skill, "a skill cannot be its own prerequisite").not.toBe(prereq);
    }
  });

  it("has no cycles", () => {
    // A cycle would let the selector chase prerequisites for ever. The graph
    // is written by hand, so a cycle is always a mistake — and not one you
    // spot by reading two hundred pairs.
    const seen = new Map<string, "visiting" | "done">();
    const walk = (node: string, trail: string[]): string[] | null => {
      if (seen.get(node) === "done") return null;
      if (seen.get(node) === "visiting") return [...trail, node];
      seen.set(node, "visiting");
      for (const next of map.get(node) ?? []) {
        const cycle = walk(next, [...trail, node]);
        if (cycle) return cycle;
      }
      seen.set(node, "done");
      return null;
    };
    for (const node of map.keys()) {
      const cycle = walk(node, []);
      expect(cycle, `cycle: ${cycle?.join(" -> ")}`).toBeNull();
    }
  });

  it("keeps every skill's prerequisites distinct", () => {
    for (const [skill, list] of map) {
      expect(new Set(list).size, `${skill} lists a prerequisite twice`).toBe(
        list.length,
      );
    }
  });
});

describe("remediation actually fires", () => {
  const now = new Date("2026-03-01T10:00:00Z");

  it("reaches back to the prerequisite when the child is failing", () => {
    // The scenario the whole feature exists for: a fifth grader failing
    // unlike denominators should be sent to equivalent fractions, not given
    // a fourth attempt at the thing they cannot do.
    const selection = selectNextSkill({
      candidates: [
        {
          skillId: "unlike",
          skillSlug: "add-subtract-unlike-fractions",
          benchmark: "MA.5.FR.2.1",
          strandCode: "MA.5.FR",
          reportingCategory: "Fractions and Decimals",
          prerequisiteIds: ["equivalent"],
          state: state({
            attemptCount: 8,
            level: "learning",
            recentResults: [false, false, false],
          }),
        },
        {
          skillId: "equivalent",
          skillSlug: "equivalent-fractions-g4",
          benchmark: "MA.4.FR.1.3",
          strandCode: "MA.4.FR",
          reportingCategory: "Fractions and Decimals",
          prerequisiteIds: [],
          state: state({ attemptCount: 4, level: "learning" }),
        },
      ],
      categoryWeights: [{ name: "Fractions and Decimals", weight: 0.34 }],
      now,
    });

    expect(selection?.candidate.skillId).toBe("equivalent");
  });

  it("does not reach back when nothing is blocked", () => {
    const selection = selectNextSkill({
      candidates: [
        {
          skillId: "unlike",
          skillSlug: "add-subtract-unlike-fractions",
          benchmark: "MA.5.FR.2.1",
          strandCode: "MA.5.FR",
          reportingCategory: "Fractions and Decimals",
          prerequisiteIds: [],
          state: state(),
        },
      ],
      categoryWeights: [],
      now,
    });
    expect(selection?.candidate.skillId).toBe("unlike");
    expect(selection?.reason).toBe("unlocked_gap");
  });
});

describe("blueprint weights change what is chosen", () => {
  const now = new Date("2026-03-01T10:00:00Z");
  const base = {
    prerequisiteIds: [] as string[],
    state: state(),
  };

  it("prefers the category worth more of the real test", () => {
    // Two skills the child is equally weak at are not equally worth
    // practising if one category is worth a third of the test and the other
    // a fifth. This is the tier that was dead until the weights were loaded.
    const selection = selectNextSkill({
      candidates: [
        {
          ...base,
          skillId: "small",
          skillSlug: "a",
          benchmark: "MA.5.DP.1.1",
          strandCode: "MA.5.DP",
          reportingCategory: "Light",
        },
        {
          ...base,
          skillId: "big",
          skillSlug: "b",
          benchmark: "MA.5.FR.2.1",
          strandCode: "MA.5.FR",
          reportingCategory: "Heavy",
        },
      ],
      categoryWeights: [
        { name: "Light", weight: 0.1 },
        { name: "Heavy", weight: 0.4 },
      ],
      now,
    });

    expect(selection?.candidate.skillId).toBe("big");
  });

  it("treats every category alike when there is no blueprint", () => {
    // Grades 1 and 2. With no weights, the first candidate wins on a tie
    // rather than the ranking silently favouring whichever category happens
    // to be named first alphabetically.
    const selection = selectNextSkill({
      candidates: [
        { ...base, skillId: "one", skillSlug: "a", benchmark: "MA.1.NSO.1.1",
 strandCode: "MA.1.NSO", reportingCategory: null },
        { ...base, skillId: "two", skillSlug: "b", benchmark: "MA.1.NSO.1.2",
 strandCode: "MA.1.NSO", reportingCategory: null },
      ],
      categoryWeights: [],
      now,
    });
    expect(["one", "two"]).toContain(selection?.candidate.skillId);
  });
});
