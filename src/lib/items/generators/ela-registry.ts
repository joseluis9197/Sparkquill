import type { ItemGenerator } from "../types";
import { getPassage } from "@/lib/passages";
import { plainGenerator, readingGenerator } from "./ela-builders";
import {
  academicVocabulary,
  authorClaim,
  authorPurpose,
  centralIdea,
  compareTexts,
  contextClues,
  figurative,
  narratorOrPerspective,
  poetryStructure,
  rhetoricalAppeals,
  storyElements,
  summarise,
  textFeatures,
  theme,
} from "./ela-reading";
import { affixMeaning, editingTask, phonics } from "./ela-words";

/**
 * Every English Language Arts generator, built from a table rather than by
 * hand.
 *
 * The R and V strands ask structurally the same questions at each grade —
 * what is this mostly about, who is telling it, what does this word mean
 * here — and the difference between grade 2 and grade 6 lies in the passage
 * and the wording, not in the question. Writing ninety-six near-identical
 * files would guarantee that a fix applied to one of them never reached the
 * other five.
 */

interface Row {
  /** Benchmark suffix; the grade is filled in. `ELA.{g}.R.1.1` */
  code: string;
  slug: string;
  title: string;
  grades: number[];
  make: (grade: number, key: string, benchmark: string, slug: string, title: string) => ItemGenerator;
}

const ALL = [1, 2, 3, 4, 5, 6];

const ROWS: Row[] = [
  /* ---- Reading prose and poetry ---- */
  {
    code: "R.1.1",
    slug: "story-elements",
    title: "Characters, setting and plot",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        skillSlug: slug,
        skillTitle: title,
        genre: "literary",
        requires: (p) => Boolean(p.elements),
        build: (p, rng) => storyElements(p, rng, grade),
      }),
  },
  {
    code: "R.1.2",
    slug: "theme",
    title: "Theme and the lesson of a story",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => Boolean(p.theme),
        build: (p, rng) => theme(p, rng, grade),
      }),
  },
  {
    code: "R.1.3",
    slug: "narrator-perspective",
    title: "Narrator and character perspective",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        skillSlug: slug,
        skillTitle: title,
        genre: "literary",
        requires: (p) => Boolean(p.elements),
        build: (p, rng) => narratorOrPerspective(p, rng, grade),
      }),
  },
  {
    code: "R.1.4",
    slug: "poetry-structure",
    title: "How a poem is built",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        skillSlug: slug,
        skillTitle: title,
        genre: "poetry",
        requires: (p) => Boolean(p.stanzas),
        build: (p, rng) => poetryStructure(p, rng, grade),
      }),
  },

  /* ---- Reading informational text ---- */
  {
    code: "R.2.1",
    slug: "text-features",
    title: "Text features and how they help",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        genre: "informational",
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => Boolean(p.textFeatures?.length),
        build: (p, rng) => textFeatures(p, rng, grade),
      }),
  },
  {
    code: "R.2.2",
    slug: "central-idea",
    title: "Central idea and supporting details",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        genre: "informational",
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => Boolean(p.centralIdea),
        build: (p, rng) => centralIdea(p, rng, grade),
      }),
  },
  {
    code: "R.2.3",
    slug: "author-purpose",
    title: "The author's purpose",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        genre: "informational",
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => Boolean(p.authorPurpose),
        build: (p, rng) => authorPurpose(p, rng, grade),
      }),
  },
  {
    code: "R.2.4",
    slug: "author-claim",
    title: "The author's claim and evidence",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        genre: "informational",
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => Boolean(p.authorOpinion && p.opinionEvidence?.length),
        build: (p, rng) => authorClaim(p, rng, grade),
      }),
  },

  /* ---- Reading across genres ---- */
  {
    code: "R.3.1",
    slug: "figurative-language",
    title: "Figurative and descriptive language",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => Boolean(p.figurative?.length),
        build: (p, rng) => figurative(p, rng, grade),
      }),
  },
  {
    code: "R.3.2",
    slug: "retell-summarise",
    title: "Retelling and summarising",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => (p.sequence?.length ?? 0) >= 3,
        build: (p, rng) => summarise(p, rng, grade),
      }),
  },
  {
    code: "R.3.3",
    slug: "compare-two-texts",
    title: "Comparing two texts",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => Boolean(p.pairedWith && p.sharedWithPair?.length),
        build: (p, rng) => compareTexts(p, rng, grade, getPassage),
      }),
  },
  {
    code: "R.3.4",
    slug: "rhetorical-appeals",
    title: "Rhetorical appeals",
    grades: [6],
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        genre: "informational",
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => Boolean(p.authorOpinion && p.opinionEvidence?.length),
        build: (p, rng) => rhetoricalAppeals(p, rng),
      }),
  },

  /* ---- Vocabulary ---- */
  {
    code: "V.1.1",
    slug: "academic-vocabulary",
    title: "Using academic vocabulary",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => Boolean(p.vocabulary?.length),
        build: (p, rng) => academicVocabulary(p, rng, grade),
      }),
  },
  {
    code: "V.1.2",
    slug: "affixes-and-roots",
    title: "Prefixes, suffixes and roots",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      plainGenerator({
        key,
        benchmark,
        skillSlug: slug,
        skillTitle: title,
        build: (rng) => affixMeaning(rng, grade),
      }),
  },
  {
    code: "V.1.3",
    slug: "context-clues",
    title: "Working out a word from its context",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      readingGenerator({
        key,
        benchmark,
        grade,
        skillSlug: slug,
        skillTitle: title,
        requires: (p) => Boolean(p.vocabulary?.length),
        build: (p, rng) => contextClues(p, rng, grade),
      }),
  },

  /* ---- Conventions and decoding ---- */
  {
    code: "C.3.1",
    slug: "conventions",
    title: "Grammar, punctuation and spelling",
    grades: ALL,
    make: (grade, key, benchmark, slug, title) =>
      plainGenerator({
        key,
        benchmark,
        skillSlug: slug,
        skillTitle: title,
        build: (rng) => editingTask(rng, grade),
      }),
  },
  {
    code: "F.1.3",
    slug: "phonics",
    title: "Sounds, syllables and spelling patterns",
    grades: [1, 2, 3, 4, 5],
    make: (grade, key, benchmark, slug, title) =>
      plainGenerator({
        key,
        benchmark,
        skillSlug: slug,
        skillTitle: title,
        build: (rng) => phonics(rng, grade),
      }),
  },
];

export const ELA_GENERATORS: ItemGenerator[] = ROWS.flatMap((row) =>
  row.grades.map((grade) => {
    const benchmark = `ELA.${grade}.${row.code}`;
    const slug = `${row.slug}-g${grade}`;
    const key = `ela.g${grade}.${row.slug}`;
    return row.make(grade, key, benchmark, slug, row.title);
  }),
);
