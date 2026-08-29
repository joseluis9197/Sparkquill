/**
 * Reading passages and the answer key that travels with them.
 *
 * Every passage on this platform is written for it. That is not a stylistic
 * choice: the texts on a real reading test are licensed or commissioned, and
 * a study tool cannot reproduce them. Original text also lets each passage
 * carry a structured account of what is true about it — who the narrator is,
 * what the central idea is, which words are worth asking about — so questions
 * are correct by construction rather than by a generator's guess at prose it
 * cannot actually read.
 *
 * The annotations are the answer key. If one is wrong, every question built
 * from it is wrong, so they are written alongside the passage and checked by
 * the same tests that check the mathematics.
 */

export type Genre = "literary" | "informational" | "poetry";

/** A word worth asking about, with the sense it carries *in this passage*. */
export interface VocabularyNote {
  word: string;
  /** The meaning as used here. */
  meaning: string;
  /**
   * Meanings that are wrong here. For a multiple-meaning word, include the
   * other real sense — a child who picks it has read the word but not the
   * sentence, which is a different problem from not knowing the word at all.
   */
  wrongMeanings: string[];
  /** The sentence it appears in, quoted so the question can show the context. */
  context: string;
  /** Set when the wrong meaning is a genuine other sense of the same word. */
  multipleMeaning?: boolean;
}

export interface FigurativeNote {
  phrase: string;
  kind: "simile" | "metaphor" | "idiom" | "alliteration" | "personification" | "onomatopoeia" | "hyperbole";
  meaning: string;
  /** What the phrase says if you take it at face value. */
  literalReading: string;
}

export interface TextFeatureNote {
  feature:
    | "title"
    | "heading"
    | "caption"
    | "diagram"
    | "glossary"
    | "table of contents"
    | "bold word"
    | "map"
    | "sidebar"
    | "timeline"
    | "table";
  purpose: string;
  /** Purposes that belong to a different feature — used as distractors. */
  notPurpose: string[];
}

export interface StoryElements {
  characters: string[];
  setting: string;
  problem: string;
  solution: string;
  /** Told in first or third person, and by whom. */
  narrator: string;
  pointOfView: "first person" | "third person";
}

export interface Passage {
  id: string;
  grade: number;
  genre: Genre;
  title: string;
  /**
   * Paragraphs separated by a blank line. For poetry, lines separated by a
   * single newline and stanzas by a blank line.
   */
  text: string;

  /* --- Literary --- */
  elements?: StoryElements;
  /** The lesson the story teaches, stated as a sentence. */
  theme?: string;
  /** How a named character sees the events, when it differs from another's. */
  perspectives?: { character: string; view: string }[];

  /* --- Informational --- */
  centralIdea?: string;
  /** Details that support the central idea but are not it. */
  supportingDetails?: string[];
  authorPurpose?: "to inform" | "to entertain" | "to persuade";
  authorOpinion?: string;
  /**
   * Sentences from the text that give a reason to accept the opinion.
   *
   * Each entry has to be one whole sentence, copied from `text` exactly.
   * That is not tidiness. Three separate items quote these back to a student
   * as words the author wrote — one asks which statement *from the text* is
   * evidence, one says "the author writes" and asks what kind of appeal it
   * is, and the hot-text item asks the student to find the sentence in the
   * passage and tap it. When these were paraphrases, all three were lying,
   * and the hot-text item had to guess which sentence was meant by counting
   * shared words. It guessed wrong at least twice, marking the wrong sentence
   * correct in a passage a child could read for themselves.
   *
   * Enforced by a test, so the generators can look the sentence up instead of
   * searching for it.
   */
  opinionEvidence?: string[];
  textFeatures?: TextFeatureNote[];

  /* --- Poetry --- */
  stanzas?: number;
  linesPerStanza?: number;
  rhymeScheme?: string;

  /* --- Any genre --- */
  vocabulary?: VocabularyNote[];
  figurative?: FigurativeNote[];
  /** Chronological summary, for retelling and sequencing questions. */
  sequence?: string[];
  /**
   * Statements that sound like they belong to this passage but are not
   * supported by it. The most valuable distractors in reading: a plausible
   * answer that the text simply does not say.
   */
  notInText?: string[];
  /** Another passage on the same topic, for compare-and-contrast items. */
  pairedWith?: string;
  /** True of both passages in the pair; false of this one alone. */
  sharedWithPair?: string[];
  uniqueToThis?: string[];
}

/** Word count, computed rather than stored so it cannot drift from the text. */
export function wordCount(p: Passage): number {
  return p.text.trim().split(/\s+/).length;
}

/**
 * Rough band each grade's passages should sit in, from the lengths Florida
 * publishes for FAST reading sets. Enforced by a test: a 600-word passage in
 * front of a first grader is not a hard question, it is an impossible one.
 *
 * Poetry has its own floor. A poem is short by design — a twelve-line verse
 * can carry as much to think about as a page of prose — so holding it to the
 * prose minimum would only produce padded poems.
 */
export const LENGTH_BANDS: Record<number, [number, number]> = {
  1: [40, 130],
  2: [90, 260],
  3: [150, 400],
  4: [250, 550],
  5: [300, 650],
  6: [350, 800],
};

export const POETRY_BANDS: Record<number, [number, number]> = {
  1: [24, 110],
  2: [30, 150],
  3: [40, 220],
  4: [50, 300],
  5: [60, 350],
  6: [60, 400],
};

/** The band a passage is actually held to, by grade and genre. */
export function bandFor(p: Passage): [number, number] {
  return p.genre === "poetry" ? POETRY_BANDS[p.grade] : LENGTH_BANDS[p.grade];
}

/**
 * Everything a reader can see, for checking that a quoted phrase really
 * appears. The title counts: a headline carries meaning, and "Florida's
 * Gentle Giants" is a metaphor worth asking about.
 */
export function searchableText(p: Passage): string {
  return `${p.title}

${p.text}`;
}
