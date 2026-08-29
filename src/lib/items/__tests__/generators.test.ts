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
import type { ItemResponse, MultipleChoiceItem } from "../types";



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

    it("marks exactly the right number of answers as correct", () => {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          const item = generator.generate({ seed, difficulty });
          switch (item.type) {
            case "multiple_choice": {
              const correct = item.choices.filter((c) => !c.misconception);
              expect(correct).toHaveLength(1);
              expect(correct[0].id).toBe(item.correctId);
              break;
            }
            case "multiselect": {
              // The count the student is told to pick has to match the count
              // that is actually right, or the item cannot be answered.
              expect(item.correctIds.length).toBe(item.selectCount);
              const ids = new Set(item.choices.map((c) => c.id));
              for (const id of item.correctIds) expect(ids.has(id)).toBe(true);
              break;
            }
            case "hot_text": {
              expect(item.correctIds.length).toBeGreaterThan(0);
              const ids = new Set(item.tokens.map((t) => t.id));
              for (const id of item.correctIds) expect(ids.has(id)).toBe(true);
              break;
            }
            case "ebsr": {
              for (const part of [item.partA, item.partB]) {
                const correct = part.choices.filter((c) => !c.misconception);
                expect(correct).toHaveLength(1);
                expect(correct[0].id).toBe(part.correctId);
              }
              break;
            }
            case "table_match": {
              // Every row needs an answer, and it has to name a real column.
              const cols = new Set(item.columns.map((c) => c.id));
              for (const row of item.rows) {
                expect(item.answer[row.id], `row ${row.id} has no answer`).toBeDefined();
                expect(cols.has(item.answer[row.id])).toBe(true);
              }
              break;
            }
            case "equation_editor": {
              expect(item.answer.trim().length).toBeGreaterThan(0);
              break;
            }
          }
        }
      }
    });

    it("labels every distractor with a misconception", () => {
      // Only for formats where a wrong option is a discrete thing a student
      // chose. Hot text has no distractors — every token is real text, and
      // the wrong ones are wrong by position rather than by error type.
      for (const seed of SEEDS.slice(0, 50)) {
        const item = generator.generate({ seed, difficulty: "core" });
        const sets: { choices: typeof item extends never ? never : { id: string; label: string; misconception?: string }[]; correctId: string }[] =
          item.type === "multiple_choice"
            ? [{ choices: item.choices, correctId: item.correctId }]
            : item.type === "ebsr"
              ? [
                  { choices: item.partA.choices, correctId: item.partA.correctId },
                  { choices: item.partB.choices, correctId: item.partB.correctId },
                ]
              : [];

        for (const { choices, correctId } of sets) {
          for (const choice of choices) {
            if (choice.id === correctId) continue;
            expect(
              choice.misconception,
              `${generator.key} seed=${seed}: distractor "${choice.label}" has no misconception`,
            ).toBeTruthy();
          }
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

    it("scores its own correct answer as correct", () => {
      // Whatever the format, answering an item with its own answer key must
      // come out right. This is the assertion that catches a generator whose
      // stated answer does not match what the scorer will accept — which is
      // silent everywhere else and looks to a child like being marked wrong
      // for being right.
      for (const seed of SEEDS.slice(0, 50)) {
        const item = generator.generate({ seed, difficulty: "core" });

        const answer: ItemResponse =
          item.type === "multiple_choice"
            ? { type: "multiple_choice", choiceId: item.correctId }
            : item.type === "multiselect"
              ? { type: "multiselect", choiceIds: item.correctIds }
              : item.type === "hot_text"
                ? { type: "hot_text", tokenIds: item.correctIds }
                : item.type === "equation_editor"
                  ? { type: "equation_editor", value: item.answer }
                  : item.type === "table_match"
                    ? { type: "table_match", pairs: item.answer }
                    : {
                        type: "ebsr",
                        partA: item.partA.correctId,
                        partB: item.partB.correctId,
                      };

        const right = scoreItem(item, answer);
        expect(right.correct, `${generator.key} seed=${seed}`).toBe(true);
        expect(right.partialCredit).toBe(1);
      }
    });

    it("scores a wrong answer as wrong, and names the error", () => {
      for (const seed of SEEDS.slice(0, 50)) {
        const item = generator.generate({ seed, difficulty: "core" });
        if (item.type !== "multiple_choice") continue;

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

    it("accepts every alternative form its own answer allows", () => {
      // 4.5 and 4.500 are the same number. A generator that lists an accepted
      // form the scorer rejects would mark a right answer wrong.
      for (const seed of SEEDS.slice(0, 30)) {
        const item = generator.generate({ seed, difficulty: "core" });
        if (item.type !== "equation_editor") continue;
        for (const form of item.accepts) {
          const scored = scoreItem(item, { type: "equation_editor", value: form });
          expect(
            scored.correct,
            `${generator.key} seed=${seed} lists "${form}" as accepted but the scorer rejects it`,
          ).toBe(true);
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

    it("gives every option a non-empty label", () => {
      for (const seed of SEEDS.slice(0, 50)) {
        const item = generator.generate({ seed, difficulty: "core" });
        const groups: { id: string; label: string }[][] =
          item.type === "multiple_choice" || item.type === "multiselect"
            ? [item.choices]
            : item.type === "ebsr"
              ? [item.partA.choices, item.partB.choices]
              : item.type === "hot_text"
                ? [
                    item.tokens
                      .filter((t) => t.selectable)
                      .map((t) => ({ id: t.id, label: t.text })),
                  ]
                : item.type === "table_match"
                  ? [item.rows, item.columns]
                  : [];

        for (const group of groups) {
          expect(group.length).toBeGreaterThanOrEqual(2);
          for (const option of group) {
            expect(option.label.trim().length).toBeGreaterThan(0);
          }
          // Two options reading the same thing is unanswerable whatever the
          // format, so the check is not special to multiple choice.
          const labels = group.map((o) => o.label);
          expect(
            new Set(labels).size,
            `${generator.key} seed=${seed} repeated an option: ${labels.join(" | ")}`,
          ).toBe(labels.length);
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
