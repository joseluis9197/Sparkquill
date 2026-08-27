import type { ItemGenerator, GeneratorContext, Item } from "../types";
import { Rng } from "../rng";
import { buildMultipleChoice } from "../build";

/**
 * MA.2.M.2.1 — Tell and write time to the nearest 5 minutes using a.m. and
 * p.m., including quarter past, half past and quarter to.
 *
 * Two misconceptions dominate at this age and both get their own distractor:
 * reading the hands the wrong way round (hour_minute_swap), and reading the
 * minute hand as a plain number — "the big hand is on the 4, so it's 4
 * minutes past" (minute_by_ones).
 */

function formatTime(hour: number, minute: number): string {
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

function spokenTime(hour: number, minute: number): string {
  if (minute === 0) return `${hour} o'clock`;
  if (minute === 15) return `quarter past ${hour}`;
  if (minute === 30) return `half past ${hour}`;
  if (minute === 45) return `quarter to ${hour === 12 ? 1 : hour + 1}`;
  if (minute < 30) return `${minute} minutes past ${hour}`;
  return `${60 - minute} minutes to ${hour === 12 ? 1 : hour + 1}`;
}

export const tellTimeToFiveMinutes: ItemGenerator = {
  key: "g2.time.toFiveMinutes",
  benchmark: "MA.2.M.2.1",
  skillSlug: "tell-time-five-minutes",
  itemTypes: ["multiple_choice"],

  generate(ctx: GeneratorContext): Item {
    const rng = new Rng(ctx.seed);

    // Easy sticks to the landmark times the standard names explicitly.
    const minute =
      ctx.difficulty === "easy"
        ? rng.pick([0, 15, 30, 45])
        : ctx.difficulty === "core"
          ? rng.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
          : rng.pick([5, 10, 20, 25, 35, 40, 50, 55]);

    const hour = rng.int(1, 12);
    const correct = formatTime(hour, minute);

    // The hour the minute hand is pointing at — what a swap produces.
    const minuteAsHour = minute === 0 ? 12 : minute / 5;
    const swapped = formatTime(minuteAsHour, hour === 12 ? 0 : hour * 5);
    // Reading the minute hand as a raw count.
    const rawMinute = formatTime(hour, minute === 0 ? 0 : minute / 5);

    return buildMultipleChoice({
      templateKey: this.key,
      seed: ctx.seed,
      benchmark: this.benchmark,
      skillSlug: this.skillSlug,
      stem: `What time does the clock show?`,
      audioText: "What time does the clock show?",
      correct,
      distractors: [
        { value: swapped, misconception: "hour_minute_swap" },
        { value: rawMinute, misconception: "minute_by_ones" },
        {
          value: formatTime(hour === 12 ? 1 : hour + 1, minute),
          misconception: "off_by_one",
        },
        {
          value: formatTime(hour, (minute + 5) % 60),
          misconception: "off_by_one",
        },
      ],
      explanation: `The short hand is just past the ${hour}, and the long hand is on the ${minute === 0 ? 12 : minute / 5}, which counts ${minute} minutes. That is ${correct}, or ${spokenTime(hour, minute)}.`,
      hints: [
        "The short hand tells you the hour. Which number has it passed?",
        "Count the long hand in fives, not ones.",
      ],
      difficulty:
        ctx.difficulty === "easy" ? 900 : ctx.difficulty === "core" ? 1030 : 1160,
      widget: {
        key: "interactive-clock",
        config: { hour, minute, interactive: false, showDigital: false },
      },
      fallback: (taken) => {
        for (let h = 1; h <= 12; h++) {
          for (const m of [0, 5, 15, 25, 35, 45, 55]) {
            const v = formatTime(h, m);
            if (!taken.has(v)) return v;
          }
        }
        return null;
      },
    });
  },
};
