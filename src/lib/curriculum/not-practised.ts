/**
 * Standards this platform deliberately does not practise, and why.
 *
 * Every one of these is a real Florida benchmark that a child is taught and
 * assessed on. None of them can be honestly assessed by a multiple-choice
 * question, and FAST does not try to: they are judged by a teacher watching
 * the student do the thing — writing by hand, speaking to a class, reading
 * aloud, carrying out a piece of research.
 *
 * Generating four options for "print all upper- and lowercase letters" would
 * produce a number on a progress report that means nothing. This list exists
 * so the gap is stated rather than hidden, and so the coverage report counts
 * against what the platform can actually do.
 *
 * If a future version adds handwriting capture, speech recognition or a
 * writing rubric, the matching entry moves out of this list. Removing an
 * entry without building the thing would be the dishonest move.
 */

export interface NotPractised {
  /** Benchmark suffix, without the subject and grade: "C.1.1". */
  suffix: string;
  /** What the standard asks a child to do. */
  what: string;
  /** Why a question with four options cannot show whether they can do it. */
  why: string;
}

export const NOT_PRACTISED: NotPractised[] = [
  {
    suffix: "C.1.1",
    what: "Handwriting — printing and later joining letters legibly",
    why: "Handwriting is judged from the page a child produces. There is nothing to select.",
  },
  {
    suffix: "C.1.2",
    what: "Writing narratives",
    why: "A written story has to be written. Choosing the best of four given stories is a reading task wearing a writing task's name.",
  },
  {
    suffix: "C.1.3",
    what: "Writing opinion pieces with supporting reasons",
    why: "Same reason: the skill is producing the argument, not recognising one.",
  },
  {
    suffix: "C.1.4",
    what: "Writing expository texts from a source",
    why: "Assessed from the student's own draft against a rubric, not from options.",
  },
  {
    suffix: "C.1.5",
    what: "Planning, revising and editing one's own writing",
    why: "Revision is judged by comparing a student's draft with what they did to it next.",
  },
  {
    suffix: "C.2.1",
    what: "Speaking and presenting to an audience",
    why: "Volume, pace and eye contact are observed live. No written item can stand in for them.",
  },
  {
    suffix: "C.4.1",
    what: "Carrying out research to answer a question",
    why: "The standard is about the process — choosing sources, gathering, recording — which is watched over days, not answered in a minute.",
  },
  {
    suffix: "C.5.1",
    what: "Using multimedia to support a task",
    why: "Assessed from what the student made and how it served their point.",
  },
  {
    suffix: "C.5.2",
    what: "Using digital tools to produce and publish writing",
    why: "A practical skill, demonstrated by doing it.",
  },
  {
    suffix: "F.1.1",
    what: "Locating parts of a book: title page, contents, glossary",
    why: "Demonstrated with a physical book in hand. A screenshot of a contents page tests something else.",
  },
  {
    suffix: "F.1.2",
    what: "Phonological awareness — hearing and manipulating sounds",
    why: "The student has to say the sounds aloud and be heard. Reading four options defeats the point, because the point is the ear, not the eye.",
  },
  {
    suffix: "F.1.4",
    what: "Reading aloud with accuracy, pace and expression",
    why: "Measured by listening to a child read. Nothing on a screen substitutes for that.",
  },
];

const SUFFIXES = new Set(NOT_PRACTISED.map((n) => n.suffix));

/**
 * True when a benchmark is one this platform deliberately leaves to the
 * classroom. Takes a full code such as "ELA.3.C.1.2".
 */
export function isNotPractised(code: string): boolean {
  const parts = code.split(".");
  if (parts.length < 5) return false;
  return SUFFIXES.has(parts.slice(2).join("."));
}

export function reasonFor(code: string): NotPractised | undefined {
  const suffix = code.split(".").slice(2).join(".");
  return NOT_PRACTISED.find((n) => n.suffix === suffix);
}
