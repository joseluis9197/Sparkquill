import type {
  EbsrItem,
  EquationEditorItem,
  GeneratorContext,
  HotTextItem,
  ItemGenerator,
  MultiselectItem,
  TableMatchItem,
} from "../types";
import { Rng, itemId } from "../rng";
import { NAMES, SETTINGS } from "../story";
import { decimalText, factorPairs, isPrime, round } from "../numbers";
import { passagePool } from "@/lib/passages";

/**
 * Items in the formats FAST actually uses, beyond multiple choice.
 *
 * A student who has only ever chosen from four options arrives on test day
 * fluent at elimination and unpractised at the thing being tested. Typing 24
 * is a different act from recognising it among four numbers; finding the
 * sentence that proves a claim is a different act from picking it out of a
 * list where three are obviously wrong.
 *
 * These generators sit alongside the multiple-choice ones on the same
 * benchmarks. The selector does not know or care which format it gets — it
 * asks for a skill, and whichever generator is registered for it answers.
 * That is deliberate: format variety should feel like the test, which mixes
 * them without warning, rather than like a separate exercise.
 */

/* ------------------------------------------------------------------ *
 * Equation editor — typed numeric answers
 * ------------------------------------------------------------------ */

function equationGenerator(spec: {
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
    answer: string;
    accepts?: string[];
    unit?: string;
    explanation: string;
    hints?: string[];
    difficulty?: number;
  };
}): ItemGenerator {
  return {
    key: spec.key,
    benchmark: spec.benchmark,
    skillSlug: spec.skillSlug,
    skillTitle: spec.skillTitle,
    itemTypes: ["equation_editor"],
    generate(ctx: GeneratorContext): EquationEditorItem {
      const p = spec.build(new Rng(ctx.seed), ctx);
      return {
        id: itemId(spec.key, ctx.seed),
        templateKey: spec.key,
        seed: ctx.seed,
        benchmark: spec.benchmark,
        skillSlug: spec.skillSlug,
        type: "equation_editor",
        stem: p.stem,
        audioText: p.audioText,
        answer: p.answer,
        accepts: p.accepts ?? [],
        unit: p.unit,
        explanation: p.explanation,
        hints: p.hints ?? [],
        difficulty: p.difficulty ?? 1100,
      };
    },
  };
}

/** MA.2.NSO.2.3 — Adding within 100, typed rather than chosen. */
export const g2AddTyped = equationGenerator({
  key: "g2.add.typed",
  benchmark: "MA.2.NSO.2.3",
  skillSlug: "add-two-digit-within-100",
  skillTitle: "Adding within 100",
  build(rng) {
    const a = rng.int(14, 58);
    const b = rng.int(14, Math.min(41, 99 - a));
    return {
      stem: `**${a} + ${b} = ?**\n\nType your answer.`,
      audioText: `${a} plus ${b}. Type your answer.`,
      answer: String(a + b),
      explanation: `${a} + ${b} = ${a + b}. With nothing to choose between, the only way through is to work it out.`,
      hints: ["Add the ones first.", "Carry a ten if the ones pass 9."],
      difficulty: 1080,
    };
  },
});

/** MA.3.NSO.2.4 — Multiplication facts, typed. */
export const g3MultiplyTyped = equationGenerator({
  key: "g3.mul.typed",
  benchmark: "MA.3.NSO.2.4",
  skillSlug: "multiplication-division-facts",
  skillTitle: "Multiplication and division facts to 12",
  build(rng, ctx) {
    const a = rng.int(3, ctx.difficulty === "easy" ? 8 : 12);
    const b = rng.int(3, 12);
    return {
      stem: `**${a} × ${b} = ?**\n\nType your answer.`,
      audioText: `${a} times ${b}. Type your answer.`,
      answer: String(a * b),
      explanation: `${a} × ${b} = ${a * b}.`,
      hints: [`${a} × ${b} is the same as ${b} × ${a}.`],
      difficulty: 1120,
    };
  },
});

/** MA.4.NSO.2.4 — Division with a remainder, typed as "q r r". */
export const g4DivideTyped = equationGenerator({
  key: "g4.div.typed",
  benchmark: "MA.4.NSO.2.4",
  skillSlug: "divide-by-one-digit",
  skillTitle: "Dividing by a one-digit number",
  build(rng) {
    const divisor = rng.int(3, 9);
    const quotient = rng.int(14, 140);
    return {
      stem: `**${(quotient * divisor).toLocaleString("en-US")} ÷ ${divisor} = ?**\n\nType the answer. It divides exactly.`,
      audioText: `${quotient * divisor} divided by ${divisor}. Type the answer.`,
      answer: String(quotient),
      explanation: `${divisor} × ${quotient} = ${(quotient * divisor).toLocaleString("en-US")}, so the answer is ${quotient}.`,
      hints: [
        "Work left to right, one place at a time.",
        "Check by multiplying back.",
      ],
      difficulty: 1200,
    };
  },
});

/** MA.5.NSO.2.3 — Decimal addition, typed, where the format matters. */
export const g5DecimalTyped = equationGenerator({
  key: "g5.dec.typed",
  benchmark: "MA.5.NSO.2.3",
  skillSlug: "add-subtract-decimals-thousandths",
  skillTitle: "Adding and subtracting decimals to thousandths",
  build(rng) {
    const a = round(rng.int(1200, 8900) / 1000, 3);
    const b = round(rng.int(400, 3900) / 1000, 3);
    const sum = round(a + b, 3);
    return {
      stem: `**${decimalText(a, 3)} + ${decimalText(b, 3)} = ?**\n\nType your answer.`,
      audioText: `${decimalText(a, 3)} plus ${decimalText(b, 3)}. Type your answer.`,
      answer: decimalText(sum, 3),
      // Trailing zeros are the same number, and a student who writes 4.5
      // rather than 4.500 has not made a mistake.
      accepts: [String(sum), decimalText(sum, 2), decimalText(sum, 4)],
      explanation: `Line up the decimal points: ${decimalText(a, 3)} + ${decimalText(b, 3)} = ${decimalText(sum, 3)}.`,
      hints: ["Line up the points, not the last digits."],
      difficulty: 1230,
    };
  },
});

/** MA.6.AR.2.2 — Solve for x, typed, including negatives. */
export const g6SolveTyped = equationGenerator({
  key: "g6.solve.typed",
  benchmark: "MA.6.AR.2.2",
  skillSlug: "one-step-add-equations",
  skillTitle: "One-step equations with adding and subtracting",
  build(rng) {
    const x = rng.int(-18, 28);
    const b = rng.int(-15, 22);
    const add = rng.bool();
    const rhs = add ? x + b : x - b;
    return {
      stem: `Solve for x. Type the value.\n\n**x ${add ? "+" : "−"} ${b < 0 ? `(${b})` : b} = ${rhs}**`,
      audioText: `Solve for x. x ${add ? "plus" : "minus"} ${b} equals ${rhs}.`,
      answer: String(x),
      explanation: `Do the opposite to both sides: ${rhs} ${add ? "−" : "+"} ${b < 0 ? `(${b})` : b} = ${x}.`,
      hints: ["Undo whatever was done to x.", "A negative answer is still an answer."],
      difficulty: 1280,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Multiselect — "choose the two that…"
 * ------------------------------------------------------------------ */

function multiselectGenerator(spec: {
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
    correct: string[];
    wrong: string[];
    explanation: string;
    hints?: string[];
    difficulty?: number;
  };
}): ItemGenerator {
  return {
    key: spec.key,
    benchmark: spec.benchmark,
    skillSlug: spec.skillSlug,
    skillTitle: spec.skillTitle,
    itemTypes: ["multiselect"],
    generate(ctx: GeneratorContext): MultiselectItem {
      const rng = new Rng(ctx.seed);
      const p = spec.build(rng, ctx);

      // Deduplicated across both lists: an option that is both right and
      // wrong is the multiselect version of two correct answers.
      const seen = new Set<string>();
      const right = p.correct.filter((v) => !seen.has(v) && seen.add(v));
      const wrong = p.wrong.filter((v) => !seen.has(v) && seen.add(v));

      const choices = rng.shuffle([
        ...right.map((label, i) => ({ id: `c${i}`, label })),
        ...wrong.map((label, i) => ({
          id: `d${i}`,
          label,
          misconception: "distractor_plausible" as const,
        })),
      ]);

      return {
        id: itemId(spec.key, ctx.seed),
        templateKey: spec.key,
        seed: ctx.seed,
        benchmark: spec.benchmark,
        skillSlug: spec.skillSlug,
        type: "multiselect",
        stem: p.stem,
        audioText: p.audioText,
        choices,
        correctIds: right.map((_, i) => `c${i}`),
        selectCount: right.length,
        explanation: p.explanation,
        hints: p.hints ?? [],
        difficulty: p.difficulty ?? 1150,
      };
    },
  };
}

/** MA.4.AR.3.1 — Pick the factors. Several are right, which is the point. */
export const g4FactorsMulti = multiselectGenerator({
  key: "g4.factors.multi",
  benchmark: "MA.4.AR.3.1",
  skillSlug: "prime-composite-factors",
  skillTitle: "Factors, prime and composite numbers",
  build(rng) {
    const n = rng.pick([24, 36, 48, 60, 72, 84, 96, 100]);
    const factors = factorPairs(n)
      .flat()
      .filter((f) => f > 1 && f < n);
    const right = rng.shuffle([...new Set(factors)]).slice(0, 2);
    const wrong = rng
      .shuffle(
        Array.from({ length: 30 }, (_, i) => i + 2).filter((c) => n % c !== 0),
      )
      .slice(0, 3);

    return {
      stem: `Select the **two** numbers that are factors of **${n}**.`,
      audioText: `Select the two numbers that are factors of ${n}.`,
      correct: right.map(String),
      wrong: wrong.map(String),
      explanation: `${right[0]} and ${right[1]} both divide ${n} exactly (${n} ÷ ${right[0]} = ${n / right[0]}, ${n} ÷ ${right[1]} = ${n / right[1]}). The others leave a remainder.`,
      hints: [
        "A factor divides with nothing left over.",
        "Try each one and see if it goes exactly.",
      ],
      difficulty: 1210,
    };
  },
});

/** MA.6.NSO.3.4 — Pick the primes. */
export const g6PrimesMulti = multiselectGenerator({
  key: "g6.primes.multi",
  benchmark: "MA.6.NSO.3.4",
  skillSlug: "prime-factorisation",
  skillTitle: "Prime factorisation",
  build(rng) {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    const composites = [4, 6, 8, 9, 12, 15, 21, 25, 27, 33, 35, 39, 49, 51];
    return {
      stem: "Select the **two** numbers that are **prime**.",
      audioText: "Select the two numbers that are prime.",
      correct: rng.shuffle(primes).slice(0, 2).map(String),
      wrong: rng.shuffle(composites).slice(0, 3).map(String),
      explanation:
        "A prime has exactly two factors: 1 and itself. The others can be split into a product of smaller numbers.",
      hints: ["Try dividing by 2, 3, 5 and 7.", "1 is not prime."],
      difficulty: 1240,
    };
  },
});

/** MA.3.AR.3.2 — Pick the multiples. */
export const g3MultiplesMulti = multiselectGenerator({
  key: "g3.multiples.multi",
  benchmark: "MA.3.AR.3.2",
  skillSlug: "multiples-of-one-digit",
  skillTitle: "Recognising multiples",
  build(rng) {
    const factor = rng.int(3, 9);
    const right = rng
      .shuffle(Array.from({ length: 12 }, (_, i) => factor * (i + 2)))
      .slice(0, 2);
    const wrong = rng
      .shuffle(
        Array.from({ length: 90 }, (_, i) => i + 10).filter(
          (n) => n % factor !== 0,
        ),
      )
      .slice(0, 3);

    return {
      stem: `Select the **two** numbers that are multiples of **${factor}**.`,
      audioText: `Select the two multiples of ${factor}.`,
      correct: right.map(String),
      wrong: wrong.map(String),
      explanation: `${right[0]} = ${factor} × ${right[0] / factor} and ${right[1]} = ${factor} × ${right[1] / factor}. A multiple is what you land on counting up by ${factor}.`,
      hints: [`Count up by ${factor}.`, "A multiple divides exactly."],
      difficulty: 1170,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Table item — several small judgements sharing one context
 * ------------------------------------------------------------------ */

/** MA.4.AR.3.1 — Sort numbers as prime or composite in one grid. */
export const g4PrimeTable: ItemGenerator = {
  key: "g4.prime.table",
  benchmark: "MA.4.AR.3.1",
  skillSlug: "prime-composite-factors",
  skillTitle: "Factors, prime and composite numbers",
  itemTypes: ["table_match"],
  generate(ctx: GeneratorContext): TableMatchItem {
    const rng = new Rng(ctx.seed);
    const pool = rng.shuffle(
      Array.from({ length: 48 }, (_, i) => i + 2).filter((n) => n !== 1),
    );
    const numbers = pool.slice(0, 4);

    return {
      id: itemId("g4.prime.table", ctx.seed),
      templateKey: "g4.prime.table",
      seed: ctx.seed,
      benchmark: "MA.4.AR.3.1",
      skillSlug: "prime-composite-factors",
      type: "table_match",
      stem: "Mark each number as prime or composite.",
      audioText: "Mark each number as prime or composite.",
      rows: numbers.map((n) => ({ id: `n${n}`, label: String(n) })),
      columns: [
        { id: "prime", label: "Prime" },
        { id: "composite", label: "Composite" },
      ],
      answer: Object.fromEntries(
        numbers.map((n) => [`n${n}`, isPrime(n) ? "prime" : "composite"]),
      ),
      explanation: numbers
        .map((n) =>
          isPrime(n)
            ? `${n} is prime — only 1 and ${n} divide it.`
            : `${n} is composite: ${factorPairs(n)[1][0]} × ${factorPairs(n)[1][1]}.`,
        )
        .join(" "),
      hints: [
        "Try dividing each one by 2, 3, 5 and 7.",
        "A prime has exactly two factors.",
      ],
      difficulty: 1250,
    };
  },
};

/* ------------------------------------------------------------------ *
 * Hot text — find the evidence in the passage
 * ------------------------------------------------------------------ */

/** Splits a passage into sentences that can be selected individually. */
function sentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?"])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function hotTextGenerator(spec: {
  key: string;
  benchmark: string;
  grade: number;
  skillSlug: string;
  skillTitle: string;
}): ItemGenerator {
  return {
    key: spec.key,
    benchmark: spec.benchmark,
    skillSlug: spec.skillSlug,
    skillTitle: spec.skillTitle,
    itemTypes: ["hot_text"],
    generate(ctx: GeneratorContext): HotTextItem {
      const rng = new Rng(ctx.seed);
      const pool = passagePool(spec.grade, {
        genre: "informational",
        requires: (p) =>
          Boolean(p.authorOpinion) && (p.opinionEvidence?.length ?? 0) > 0,
      });
      const passage = rng.pick(pool);

      const all = sentences(passage.text);
      const evidence = passage.opinionEvidence!;

      /*
       * Which sentence counts as the evidence is decided by matching the
       * annotation against the passage's own sentences on their content
       * words. The annotation is a paraphrase, so an exact match would find
       * nothing — but a sentence sharing most of its distinctive words with
       * the stated evidence is the sentence that evidence came from.
       */
      const words = (s: string) =>
        new Set(
          s
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/)
            .filter((w) => w.length > 3),
        );

      const target = rng.pick(evidence);
      const targetWords = words(target);
      let best = 0;
      let bestScore = -1;
      all.forEach((s, i) => {
        const overlap = [...words(s)].filter((w) => targetWords.has(w)).length;
        if (overlap > bestScore) {
          bestScore = overlap;
          best = i;
        }
      });

      const tokens = all.map((text, i) => ({
        id: `s${i}`,
        text,
        selectable: true,
      }));

      return {
        id: itemId(spec.key, ctx.seed),
        templateKey: spec.key,
        seed: ctx.seed,
        benchmark: spec.benchmark,
        skillSlug: spec.skillSlug,
        type: "hot_text",
        stem: `The author argues: "${passage.authorOpinion}"\n\nTap the **one sentence** that best supports that.`,
        audioText: `The author argues: ${passage.authorOpinion}. Tap the sentence that best supports it.`,
        tokens,
        correctIds: [`s${best}`],
        passage: {
          id: passage.id,
          title: passage.title,
          text: passage.text,
          genre: passage.genre,
        },
        explanation: `"${all[best]}" is the sentence doing the work. Evidence has to be in the text and has to give a reason for the claim — a sentence that is merely nearby does neither.`,
        hints: [
          "Look for a sentence that gives a reason, not just a fact.",
          "Ask whether it would convince someone who disagreed.",
        ],
        difficulty: 1280,
      };
    },
  };
}

export const HOT_TEXT_GENERATORS: ItemGenerator[] = [3, 4, 5, 6].map((grade) =>
  hotTextGenerator({
    key: `ela.g${grade}.evidence-hot-text`,
    benchmark: `ELA.${grade}.R.2.4`,
    grade,
    skillSlug: `author-claim-g${grade}`,
    skillTitle: "The author's claim and evidence",
  }),
);

/* ------------------------------------------------------------------ *
 * EBSR — claim, then the evidence for it
 * ------------------------------------------------------------------ */

function ebsrGenerator(spec: {
  key: string;
  benchmark: string;
  grade: number;
  skillSlug: string;
  skillTitle: string;
}): ItemGenerator {
  return {
    key: spec.key,
    benchmark: spec.benchmark,
    skillSlug: spec.skillSlug,
    skillTitle: spec.skillTitle,
    itemTypes: ["ebsr"],
    generate(ctx: GeneratorContext): EbsrItem {
      const rng = new Rng(ctx.seed);
      const pool = passagePool(spec.grade, {
        genre: "informational",
        requires: (p) =>
          Boolean(p.centralIdea) &&
          (p.supportingDetails?.length ?? 0) >= 2 &&
          (p.notInText?.length ?? 0) >= 3,
      });
      const passage = rng.pick(pool);

      const otherIdeas = passagePool(spec.grade, { genre: "informational" })
        .filter((p) => p.id !== passage.id)
        .map((p) => p.centralIdea)
        .filter((v): v is string => Boolean(v));

      const partAWrong = rng.shuffle([
        ...passage.supportingDetails!.slice(0, 1),
        ...otherIdeas.slice(0, 1),
        ...(passage.notInText ?? []).slice(0, 1),
      ]);

      const detail = rng.pick(passage.supportingDetails!);
      const partBWrong = rng.shuffle((passage.notInText ?? []).slice(0, 3));

      return {
        id: itemId(spec.key, ctx.seed),
        templateKey: spec.key,
        seed: ctx.seed,
        benchmark: spec.benchmark,
        skillSlug: spec.skillSlug,
        type: "ebsr",
        stem: "",
        audioText: "Part A: what is the central idea? Part B: which detail supports it?",
        partA: {
          stem: "What is the central idea of this text?",
          choices: rng.shuffle([
            { id: "a", label: passage.centralIdea! },
            ...partAWrong.map((label, i) => ({
              id: `aw${i}`,
              label,
              misconception: "detail_not_central_idea" as const,
            })),
          ]),
          correctId: "a",
        },
        partB: {
          stem: "Which detail from the text best supports your answer to Part A?",
          choices: rng.shuffle([
            { id: "b", label: detail },
            ...partBWrong.map((label, i) => ({
              id: `bw${i}`,
              label,
              misconception: "plausible_but_absent" as const,
            })),
          ]),
          correctId: "b",
        },
        passage: {
          id: passage.id,
          title: passage.title,
          text: passage.text,
          genre: passage.genre,
        },
        explanation: `The central idea is "${passage.centralIdea}" — it covers the whole text rather than one part of it. "${detail}" is stated in the text and backs it up. A detail the text never gives cannot support anything, however true it sounds.`,
        hints: [
          "The central idea should still hold if you deleted a paragraph.",
          "The evidence has to be in the text, not merely reasonable.",
        ],
        difficulty: 1300,
      };
    },
  };
}

export const EBSR_GENERATORS: ItemGenerator[] = [3, 4, 5, 6].map((grade) =>
  ebsrGenerator({
    key: `ela.g${grade}.central-idea-ebsr`,
    benchmark: `ELA.${grade}.R.2.2`,
    grade,
    skillSlug: `central-idea-g${grade}`,
    skillTitle: "Central idea and supporting details",
  }),
);

/** Word problems typed rather than chosen, where the story is the difficulty. */
export const g5WordTyped = equationGenerator({
  key: "g5.word.typed",
  benchmark: "MA.5.AR.1.1",
  skillSlug: "multi-step-problems",
  skillTitle: "Multi-step story problems",
  build(rng) {
    const who = rng.pick(NAMES);
    const setting = rng.pick(SETTINGS);
    const boxes = rng.int(6, 18);
    const per = rng.int(8, 24);
    const broken = rng.int(5, 30);
    const total = boxes * per - broken;

    const stem = `${who} unpacks ${boxes} boxes of ${per} ${setting.units} each and finds ${broken} damaged. How many usable ${setting.units} are there? Type your answer.`;
    return {
      stem,
      audioText: stem,
      answer: String(total),
      explanation: `${boxes} × ${per} = ${boxes * per}, then − ${broken} = ${total}.`,
      hints: [
        "Two steps: multiply, then subtract.",
        "The damaged ones come off at the end.",
      ],
      difficulty: 1260,
    };
  },
});

export const FAST_FORMAT_GENERATORS: ItemGenerator[] = [
  g2AddTyped,
  g3MultiplyTyped,
  g4DivideTyped,
  g5DecimalTyped,
  g5WordTyped,
  g6SolveTyped,
  g3MultiplesMulti,
  g4FactorsMulti,
  g6PrimesMulti,
  g4PrimeTable,
  ...HOT_TEXT_GENERATORS,
  ...EBSR_GENERATORS,
];
