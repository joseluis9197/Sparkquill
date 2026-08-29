import type {
  Choice,
  GeneratorContext,
  Item,
  ItemGenerator,
  ItemResponse,
  MisconceptionKey,
  MultipleChoiceItem,
  ScoreResult,
} from "./types";
import { Rng, itemId } from "./rng";

/**
 * Assembles a multiple-choice item from a correct value and a set of
 * misconception-labelled wrong values.
 *
 * Deduplicates first: a distractor that happens to equal the correct answer
 * (or another distractor) would otherwise ship a question with two right
 * answers, which is the single worst bug this system can have.
 */
export function buildMultipleChoice(opts: {
  templateKey: string;
  seed: number;
  benchmark: string;
  skillSlug: string;
  stem: string;
  audioText: string;
  correct: string;
  distractors: { value: string; misconception: MisconceptionKey }[];
  explanation: string;
  hints?: string[];
  difficulty?: number;
  widget?: { key: string; config: Record<string, unknown> };
  passage?: { id: string; title: string; text: string; genre: string };
  /** Filler used only if deduplication leaves too few options. */
  fallback?: (taken: Set<string>) => string | null;
}): MultipleChoiceItem {
  const rng = new Rng(opts.seed ^ 0x9e3779b9);

  const taken = new Set<string>([opts.correct]);
  const distractors: { value: string; misconception: MisconceptionKey }[] = [];

  for (const d of opts.distractors) {
    if (taken.has(d.value)) continue;
    taken.add(d.value);
    distractors.push(d);
    if (distractors.length === 3) break;
  }

  while (distractors.length < 3 && opts.fallback) {
    const v = opts.fallback(taken);
    if (v === null) break;
    taken.add(v);
    distractors.push({ value: v, misconception: "distractor_plausible" });
  }

  if (distractors.length < 3) {
    throw new Error(
      `${opts.templateKey}#${opts.seed}: only ${distractors.length} usable distractors for correct answer "${opts.correct}"`,
    );
  }

  const correctChoice: Choice = { id: "c", label: opts.correct };
  const wrongChoices: Choice[] = distractors.map((d, i) => ({
    id: `d${i}`,
    label: d.value,
    misconception: d.misconception,
  }));

  return {
    id: itemId(opts.templateKey, opts.seed),
    templateKey: opts.templateKey,
    seed: opts.seed,
    benchmark: opts.benchmark,
    skillSlug: opts.skillSlug,
    type: "multiple_choice",
    stem: opts.stem,
    audioText: opts.audioText,
    choices: rng.shuffle([correctChoice, ...wrongChoices]),
    correctId: "c",
    explanation: opts.explanation,
    hints: opts.hints ?? [],
    difficulty: opts.difficulty ?? 1000,
    widget: opts.widget,
    passage: opts.passage,
  };
}

/* ------------------------------------------------------------------ *
 * Scoring
 * ------------------------------------------------------------------ */

/** Loose numeric comparison so "0.50", ".5" and "0.5" all count as the same. */
function normaliseNumeric(s: string): string {
  const cleaned = s.trim().replace(/[\s,$]/g, "");
  if (cleaned === "") return "";
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return cleaned.toLowerCase();
  return String(n);
}

export function scoreItem(item: Item, response: ItemResponse): ScoreResult {
  if (item.type !== response.type) {
    throw new Error(
      `Response type "${response.type}" does not match item type "${item.type}"`,
    );
  }

  switch (item.type) {
    case "multiple_choice": {
      const r = response as Extract<ItemResponse, { type: "multiple_choice" }>;
      const chosen = item.choices.find((c) => c.id === r.choiceId);
      const correct = r.choiceId === item.correctId;
      return {
        correct,
        misconception: correct ? undefined : chosen?.misconception,
        partialCredit: correct ? 1 : 0,
      };
    }

    case "multiselect": {
      const r = response as Extract<ItemResponse, { type: "multiselect" }>;
      const picked = new Set(r.choiceIds);
      const expected = new Set(item.correctIds);
      const hits = [...expected].filter((id) => picked.has(id)).length;
      const falsePositives = [...picked].filter((id) => !expected.has(id));
      const correct =
        hits === expected.size && falsePositives.length === 0;
      // Credit hits, penalise wrong picks, floor at zero.
      const raw = (hits - falsePositives.length) / expected.size;
      const firstWrong = item.choices.find((c) =>
        falsePositives.includes(c.id),
      );
      return {
        correct,
        misconception: correct ? undefined : firstWrong?.misconception,
        partialCredit: Math.max(0, Math.min(1, raw)),
      };
    }

    case "equation_editor": {
      const r = response as Extract<ItemResponse, { type: "equation_editor" }>;
      const given = normaliseNumeric(r.value);
      const accepted = [item.answer, ...item.accepts].map(normaliseNumeric);
      const correct = accepted.includes(given);
      return { correct, partialCredit: correct ? 1 : 0 };
    }

    case "table_match": {
      const r = response as Extract<ItemResponse, { type: "table_match" }>;
      const keys = Object.keys(item.answer);
      const hits = keys.filter((k) => r.pairs[k] === item.answer[k]).length;
      return {
        correct: hits === keys.length,
        partialCredit: keys.length === 0 ? 0 : hits / keys.length,
      };
    }

    case "hot_text": {
      const r = response as Extract<ItemResponse, { type: "hot_text" }>;
      const picked = new Set(r.tokenIds);
      const expected = new Set(item.correctIds);
      const hits = [...expected].filter((id) => picked.has(id)).length;
      const extra = [...picked].filter((id) => !expected.has(id)).length;
      const correct = hits === expected.size && extra === 0;
      return {
        correct,
        partialCredit: Math.max(
          0,
          Math.min(1, (hits - extra) / Math.max(1, expected.size)),
        ),
      };
    }

    case "ebsr": {
      const r = response as Extract<ItemResponse, { type: "ebsr" }>;
      const aOk = r.partA === item.partA.correctId;
      const bOk = r.partB === item.partB.correctId;
      // Florida scores EBSR as a single item: evidence without the claim is
      // not credit, so both parts must be right.
      const wrong = !aOk
        ? item.partA.choices.find((c) => c.id === r.partA)
        : item.partB.choices.find((c) => c.id === r.partB);
      return {
        correct: aOk && bOk,
        misconception: aOk && bOk ? undefined : wrong?.misconception,
        partialCredit: (Number(aOk) + Number(bOk)) / 2,
      };
    }
  }
}

/* ------------------------------------------------------------------ *
 * Generator factory
 * ------------------------------------------------------------------ */

/**
 * Wraps the boilerplate every multiple-choice generator repeats.
 *
 * Across two hundred benchmarks the plumbing — seeding the RNG, echoing the
 * key and benchmark into the item, wiring the fallback — is identical every
 * time, and copying it is how a generator ends up quietly filed under the
 * wrong benchmark. What differs is the mathematics and the distractors, so
 * those are all a `build` function has to supply.
 *
 * Note it takes a plain function rather than a method: `this` inside an object
 * literal typed as ItemGenerator is a known source of silent breakage when a
 * generator is later passed around detached from its object.
 */
export function mcGenerator(spec: {
  key: string;
  benchmark: string;
  skillSlug: string;
  skillTitle: string;
  build: (
    rng: Rng,
    ctx: GeneratorContext,
  ) => {
    stem: string;
    audioText: string;
    correct: string;
    distractors: { value: string; misconception: MisconceptionKey }[];
    explanation: string;
    hints?: string[];
    difficulty?: number;
    widget?: { key: string; config: Record<string, unknown> };
    passage?: { id: string; title: string; text: string; genre: string };
    fallback?: (taken: Set<string>) => string | null;
  };
}): ItemGenerator {
  return {
    key: spec.key,
    benchmark: spec.benchmark,
    skillSlug: spec.skillSlug,
    skillTitle: spec.skillTitle,
    itemTypes: ["multiple_choice"],
    generate(ctx: GeneratorContext): Item {
      const parts = spec.build(new Rng(ctx.seed), ctx);
      return buildMultipleChoice({
        templateKey: spec.key,
        seed: ctx.seed,
        benchmark: spec.benchmark,
        skillSlug: spec.skillSlug,
        ...parts,
      });
    },
  };
}

/**
 * A generic last-resort distractor source: numbers near the answer.
 *
 * Used when a generator's named misconceptions collapse into each other for
 * particular values. Better a plausible near miss than an item that throws.
 */
export function nearbyNumbers(
  correct: number,
  opts: { min?: number; max?: number; step?: number } = {},
) {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, step = 1 } = opts;
  return (taken: Set<string>): string | null => {
    for (let d = step; d <= step * 40; d += step) {
      for (const v of [correct + d, correct - d]) {
        const s = String(Math.round(v * 1000) / 1000);
        if (v >= min && v <= max && !taken.has(s)) return s;
      }
    }
    return null;
  };
}
