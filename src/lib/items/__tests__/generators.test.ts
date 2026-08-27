import { describe, it, expect } from "vitest";
import { GENERATORS } from "../registry";
import { scoreItem } from "../build";
import {
  addColumnsIndependently,
  addWithoutRegrouping,
  expandedForm,
  numberToWords,
  requiresRegrouping,
  roundTo,
  subtractWithoutBorrowing,
} from "../numbers";
import { Rng } from "../rng";
import type { MultipleChoiceItem } from "../types";



const DIFFICULTIES = ["easy", "core", "stretch"] as const;

/**
 * Upper bound each generator's numeric answers must respect, taken from the
 * benchmark itself. Generators whose answers are not plain numbers (a
 * comparison statement, a shape name) are absent and skip the check.
 *
 * MA.2.NSO.2.3 stops at 100 and MA.2.NSO.1.4 rounds only to the nearest ten
 * within 100 — generating three-digit rounding here would quietly teach
 * grade 3 content a year early.
 */
const NUMERIC_CEILING: Record<string, number | undefined> = {
  "g2.add.within100": 100,
  "g2.sub.within100": 100,
  "g2.pv.wordForm": 999,
  "g2.pv.roundToTen": 100,
  "g2.time.toFiveMinutes": undefined,
  "g2.pv.expandedForm": undefined,
  "g2.pv.compare": undefined,
  "g2.geo.solidAttributes": 14,
  "g2.geo.solidRealWorld": undefined,
};

/**
 * Generators where the options themselves are the thing being read, so every
 * option must be a number the grade actually works with.
 */
const OPTIONS_MUST_BE_IN_RANGE: Record<string, number | undefined> = {
  "g2.pv.wordForm": 999,
  "g2.pv.roundToTen": 100,
  "g2.geo.solidAttributes": 14,
};

describe("number helpers", () => {
  it("reads numbers the way Florida expects", () => {
    // No "and" — 305 is "three hundred five", not "three hundred and five".
    expect(numberToWords(305)).toBe("three hundred five");
    expect(numberToWords(0)).toBe("zero");
    expect(numberToWords(19)).toBe("nineteen");
    expect(numberToWords(40)).toBe("forty");
    expect(numberToWords(42)).toBe("forty-two");
    expect(numberToWords(100)).toBe("one hundred");
    expect(numberToWords(1000)).toBe("one thousand");
    expect(numberToWords(1024)).toBe("one thousand twenty-four");
  });

  it("omits zero places from expanded form", () => {
    expect(expandedForm(342)).toBe("300 + 40 + 2");
    expect(expandedForm(305)).toBe("300 + 5");
    expect(expandedForm(40)).toBe("40");
  });

  it("reproduces the exact answer a child gets from each error", () => {
    // The worked example from the plan: 47 + 25.
    expect(addWithoutRegrouping(47, 25)).toBe(62);
    expect(addColumnsIndependently(47, 25)).toBe(612);
    expect(subtractWithoutBorrowing(62, 47)).toBe(25);
    expect(requiresRegrouping(47, 25)).toBe(true);
    expect(requiresRegrouping(23, 41)).toBe(false);
  });

  it("rounds to the requested place", () => {
    expect(roundTo(47, 10)).toBe(50);
    expect(roundTo(44, 10)).toBe(40);
    expect(roundTo(45, 10)).toBe(50);
  });
});

describe("Rng", () => {
  it("is deterministic for a given seed", () => {
    const a = new Rng(42);
    const b = new Rng(42);
    const seqA = Array.from({ length: 20 }, () => a.int(0, 1000));
    const seqB = Array.from({ length: 20 }, () => b.int(0, 1000));
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = Array.from({ length: 20 }, () => new Rng(1).int(0, 1000));
    const b = Array.from({ length: 20 }, () => new Rng(2).int(0, 1000));
    expect(a).not.toEqual(b);
  });

  it("returns distinct values without looping forever", () => {
    const picked = new Rng(7).distinctInts(5, 1, 6);
    expect(new Set(picked).size).toBe(5);
  });
});

describe.each(GENERATORS.map((g) => [g.key, g] as const))(
  "generator %s",
  (_key, generator) => {
    // 200 seeds per difficulty is enough to surface a collision that only
    // happens for particular number pairs.
    const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1);

    it("never produces an item with two correct answers", () => {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          const item = generator.generate({ seed, difficulty });
          if (item.type !== "multiple_choice") continue;
          const labels = item.choices.map((c) => c.label);
          expect(
            new Set(labels).size,
            `${generator.key} seed=${seed} ${difficulty} produced duplicate options: ${labels.join(", ")}`,
          ).toBe(labels.length);
        }
      }
    });

    it("always has exactly one choice flagged as correct", () => {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          const item = generator.generate({
            seed,
            difficulty,
          }) as MultipleChoiceItem;
          const correct = item.choices.filter((c) => !c.misconception);
          expect(correct).toHaveLength(1);
          expect(correct[0].id).toBe(item.correctId);
        }
      }
    });

    it("labels every distractor with a misconception", () => {
      for (const seed of SEEDS.slice(0, 50)) {
        const item = generator.generate({
          seed,
          difficulty: "core",
        }) as MultipleChoiceItem;
        for (const choice of item.choices) {
          if (choice.id === item.correctId) continue;
          expect(
            choice.misconception,
            `${generator.key} seed=${seed}: distractor "${choice.label}" has no misconception`,
          ).toBeTruthy();
        }
      }
    });

    it("is deterministic: same seed, identical item", () => {
      for (const seed of SEEDS.slice(0, 30)) {
        const a = generator.generate({ seed, difficulty: "core" });
        const b = generator.generate({ seed, difficulty: "core" });
        expect(a).toEqual(b);
      }
    });

    it("scores the correct choice as correct and others as wrong", () => {
      for (const seed of SEEDS.slice(0, 50)) {
        const item = generator.generate({
          seed,
          difficulty: "core",
        }) as MultipleChoiceItem;

        const right = scoreItem(item, {
          type: "multiple_choice",
          choiceId: item.correctId,
        });
        expect(right.correct).toBe(true);
        expect(right.partialCredit).toBe(1);

        for (const choice of item.choices) {
          if (choice.id === item.correctId) continue;
          const wrong = scoreItem(item, {
            type: "multiple_choice",
            choiceId: choice.id,
          });
          expect(wrong.correct).toBe(false);
          expect(wrong.misconception).toBe(choice.misconception);
        }
      }
    });

    it("keeps the correct answer inside the benchmark's range", () => {
      const max = NUMERIC_CEILING[generator.key];
      if (max === undefined) return; // non-numeric answers
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          const item = generator.generate({
            seed,
            difficulty,
          }) as MultipleChoiceItem;
          const value = Number(
            item.choices.find((c) => c.id === item.correctId)!.label,
          );
          expect(Number.isFinite(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(
            value,
            `${generator.key} seed=${seed} has correct answer ${value}, outside the benchmark's range of 0-${max}`,
          ).toBeLessThanOrEqual(max);
        }
      }
    });

    it("keeps every option in range where the options are the subject", () => {
      // On a computation item, a distractor may legitimately exceed the
      // benchmark's range: 612 is the whole point of the column-independent
      // error on 47 + 25. On an item that asks a child to *identify* a
      // number, every option has to be a number the grade actually uses.
      const max = OPTIONS_MUST_BE_IN_RANGE[generator.key];
      if (max === undefined) return;
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          const item = generator.generate({
            seed,
            difficulty,
          }) as MultipleChoiceItem;
          for (const choice of item.choices) {
            const value = Number(choice.label);
            expect(
              value,
              `${generator.key} seed=${seed} offered ${value} as an option, outside 0-${max}`,
            ).toBeLessThanOrEqual(max);
            expect(value).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });

    it("gives every choice a non-empty label", () => {
      for (const seed of SEEDS.slice(0, 50)) {
        const item = generator.generate({
          seed,
          difficulty: "core",
        }) as MultipleChoiceItem;
        expect(item.choices.length).toBeGreaterThanOrEqual(3);
        for (const choice of item.choices) {
          expect(choice.label.trim().length).toBeGreaterThan(0);
        }
      }
    });

    it("carries the benchmark and skill through to the item", () => {
      const item = generator.generate({ seed: 1, difficulty: "core" });
      expect(item.benchmark).toBe(generator.benchmark);
      expect(item.skillSlug).toBe(generator.skillSlug);
      expect(item.audioText.length).toBeGreaterThan(0);
      expect(item.explanation.length).toBeGreaterThan(0);
    });
  },
);
