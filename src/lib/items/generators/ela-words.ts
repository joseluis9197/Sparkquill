import type { Rng } from "../rng";
import type { ElaBuild } from "./ela-builders";

/**
 * Word-level items: affixes and roots, conventions, and decoding.
 *
 * These need no passage. A question about what "pre-" means is about the
 * morpheme, and putting it inside a story would only add reading load to a
 * question that is not testing reading.
 */

/* ------------------------------------------------------------------ *
 * V.1.2 — Base words, affixes, Greek and Latin roots
 * ------------------------------------------------------------------ */

interface Affix {
  affix: string;
  kind: "prefix" | "suffix" | "root";
  meaning: string;
  example: string;
  exampleMeaning: string;
  /** Lowest grade this is reasonable to ask about. */
  from: number;
}

const AFFIXES: Affix[] = [
  { affix: "un-", kind: "prefix", meaning: "not, or the opposite of", example: "unhappy", exampleMeaning: "not happy", from: 1 },
  { affix: "re-", kind: "prefix", meaning: "again", example: "rebuild", exampleMeaning: "build again", from: 1 },
  { affix: "-ed", kind: "suffix", meaning: "already happened", example: "walked", exampleMeaning: "walked in the past", from: 1 },
  { affix: "-ing", kind: "suffix", meaning: "happening now", example: "running", exampleMeaning: "running right now", from: 1 },
  { affix: "-s", kind: "suffix", meaning: "more than one", example: "books", exampleMeaning: "more than one book", from: 1 },
  { affix: "-er", kind: "suffix", meaning: "a person who does something", example: "teacher", exampleMeaning: "a person who teaches", from: 2 },
  { affix: "-ful", kind: "suffix", meaning: "full of", example: "hopeful", exampleMeaning: "full of hope", from: 2 },
  { affix: "-less", kind: "suffix", meaning: "without", example: "harmless", exampleMeaning: "without harm", from: 2 },
  { affix: "pre-", kind: "prefix", meaning: "before", example: "preview", exampleMeaning: "view something before", from: 2 },
  { affix: "mis-", kind: "prefix", meaning: "wrongly", example: "misread", exampleMeaning: "read wrongly", from: 2 },
  { affix: "dis-", kind: "prefix", meaning: "not, or the opposite of", example: "disagree", exampleMeaning: "not agree", from: 3 },
  { affix: "-ly", kind: "suffix", meaning: "in that way", example: "quickly", exampleMeaning: "in a quick way", from: 3 },
  { affix: "sub-", kind: "prefix", meaning: "under or below", example: "submarine", exampleMeaning: "a craft that goes under the sea", from: 3 },
  { affix: "tele-", kind: "root", meaning: "far off", example: "telescope", exampleMeaning: "a tool for seeing far off", from: 3 },
  { affix: "-able", kind: "suffix", meaning: "able to be", example: "readable", exampleMeaning: "able to be read", from: 3 },
  { affix: "photo-", kind: "root", meaning: "light", example: "photograph", exampleMeaning: "a picture made with light", from: 4 },
  { affix: "graph", kind: "root", meaning: "write or draw", example: "autograph", exampleMeaning: "something written by oneself", from: 4 },
  { affix: "port", kind: "root", meaning: "carry", example: "transport", exampleMeaning: "carry across", from: 4 },
  { affix: "trans-", kind: "prefix", meaning: "across", example: "transatlantic", exampleMeaning: "across the Atlantic", from: 4 },
  { affix: "-tion", kind: "suffix", meaning: "the act or state of", example: "creation", exampleMeaning: "the act of creating", from: 4 },
  { affix: "aud", kind: "root", meaning: "hear", example: "audible", exampleMeaning: "able to be heard", from: 5 },
  { affix: "dict", kind: "root", meaning: "say or speak", example: "predict", exampleMeaning: "say before it happens", from: 5 },
  { affix: "spect", kind: "root", meaning: "look", example: "inspect", exampleMeaning: "look into carefully", from: 5 },
  { affix: "bene-", kind: "prefix", meaning: "good or well", example: "benefit", exampleMeaning: "something that does good", from: 5 },
  { affix: "-ist", kind: "suffix", meaning: "a person who does or studies", example: "biologist", exampleMeaning: "a person who studies life", from: 5 },
  { affix: "chrono-", kind: "root", meaning: "time", example: "chronological", exampleMeaning: "arranged in order of time", from: 6 },
  { affix: "geo-", kind: "root", meaning: "earth", example: "geology", exampleMeaning: "the study of the earth", from: 6 },
  { affix: "-ology", kind: "suffix", meaning: "the study of", example: "geology", exampleMeaning: "the study of the earth", from: 6 },
  { affix: "contra-", kind: "prefix", meaning: "against", example: "contradict", exampleMeaning: "speak against", from: 6 },
  { affix: "cred", kind: "root", meaning: "believe", example: "incredible", exampleMeaning: "not able to be believed", from: 6 },
];

export function affixMeaning(rng: Rng, grade: number): ElaBuild {
  const pool = AFFIXES.filter((a) => a.from <= grade);
  const a = rng.pick(pool);

  // Deduplicated by meaning, not just against the answer. Several affixes
  // legitimately share a gloss — "un-" and "dis-" both mean "not" — and two
  // options reading the same thing is an item with two right answers.
  const seenMeaning = new Set([a.meaning]);
  const seenExample = new Set([a.exampleMeaning]);
  const others: Affix[] = [];
  for (const o of rng.shuffle(pool)) {
    if (seenMeaning.has(o.meaning) || seenExample.has(o.exampleMeaning)) continue;
    seenMeaning.add(o.meaning);
    seenExample.add(o.exampleMeaning);
    others.push(o);
    if (others.length === 3) break;
  }

  const askWord = grade >= 3 && rng.bool(0.5);

  if (askWord) {
    return {
      stem: `The word **${a.example}** contains "${a.affix}". What does **${a.example}** mean?`,
      audioText: `The word ${a.example} contains ${a.affix}. What does ${a.example} mean?`,
      correct: a.exampleMeaning,
      distractors: others.map((o) => ({
        value: o.exampleMeaning,
        misconception: "affix_misread" as const,
      })),
      explanation: `"${a.affix}" means "${a.meaning}", so ${a.example} means ${a.exampleMeaning}. Breaking a long word into its parts is faster than guessing at the whole.`,
      hints: [
        `What does "${a.affix}" add to the word?`,
        "Take off the affix and see what base word is left.",
      ],
      difficulty: 1180,
    };
  }

  return {
    stem: `What does the ${a.kind} **"${a.affix}"** mean, as in *${a.example}*?`,
    audioText: `What does the ${a.kind} ${a.affix} mean, as in ${a.example}?`,
    correct: a.meaning,
    distractors: others.map((o) => ({
      value: o.meaning,
      misconception: "affix_misread" as const,
    })),
    explanation: `"${a.affix}" means "${a.meaning}". You can see it working in ${a.example}, which means ${a.exampleMeaning}.`,
    hints: [
      "Think of another word with the same part.",
      "The meaning has to work in every word that uses it.",
    ],
    difficulty: grade <= 2 ? 1050 : 1150,
  };
}

/* ------------------------------------------------------------------ *
 * C.3.1 — Grammar, punctuation, capitalisation and spelling
 *
 * Modelled on the Editing Task Choice item FAST actually uses: a sentence
 * with one error, and four ways of writing the underlined part.
 * ------------------------------------------------------------------ */

interface EditingItem {
  sentence: string;
  wrong: string;
  right: string;
  others: string[];
  rule: string;
  from: number;
}

const EDITING: EditingItem[] = [
  {
    sentence: "the dog barked at the postman.",
    wrong: "the dog",
    right: "The dog",
    others: ["the Dog", "THE DOG"],
    rule: "A sentence always begins with a capital letter.",
    from: 1,
  },
  {
    sentence: "I have two cat and one dog.",
    wrong: "two cat",
    right: "two cats",
    others: ["two cat's", "two cates"],
    rule: "A plural noun needs -s. An apostrophe shows possession, not more than one.",
    from: 1,
  },
  {
    sentence: "Where is my coat",
    wrong: "coat",
    right: "coat?",
    others: ["coat.", "coat!"],
    rule: "A question ends with a question mark.",
    from: 1,
  },
  {
    sentence: "My friend live in Miami.",
    wrong: "live",
    right: "lives",
    others: ["living", "have live"],
    rule: "A singular subject takes a singular verb: my friend lives.",
    from: 2,
  },
  {
    sentence: "We went to the store and we buyed apples.",
    wrong: "buyed",
    right: "bought",
    others: ["buys", "buying"],
    rule: "Buy is irregular: the past tense is bought, not buyed.",
    from: 2,
  },
  {
    sentence: "The cats bowl was empty.",
    wrong: "cats",
    right: "cat's",
    others: ["cats'", "cats's"],
    rule: "One cat owning the bowl takes an apostrophe before the s.",
    from: 3,
  },
  {
    sentence: "Their going to be late again.",
    wrong: "Their",
    right: "They're",
    others: ["There", "Theyre"],
    rule: "They're is short for they are. Their shows possession; there is a place.",
    from: 3,
  },
  {
    sentence: "I bought apples oranges and pears.",
    wrong: "apples oranges and pears",
    right: "apples, oranges and pears",
    others: ["apples oranges, and pears", "apples, oranges, and, pears"],
    rule: "Items in a list are separated by commas.",
    from: 3,
  },
  {
    sentence: "Its going to rain before the game starts.",
    wrong: "Its",
    right: "It's",
    others: ["Its'", "It is'"],
    rule: "It's is short for it is. Its, with no apostrophe, shows possession.",
    from: 4,
  },
  {
    sentence: "Neither of the answers were correct.",
    wrong: "were",
    right: "was",
    others: ["are", "have been"],
    rule: "Neither is singular, so it takes a singular verb.",
    from: 5,
  },
  {
    sentence: "Running down the street, the bus was missed by Ana.",
    wrong: "the bus was missed by Ana",
    right: "Ana missed the bus",
    others: ["the bus had been missed", "Ana had the bus missed"],
    rule: "The opening phrase has to describe the subject that follows, or it dangles — as written, the bus is doing the running.",
    from: 6,
  },
  {
    sentence: "She asked me who's book was on the table.",
    wrong: "who's",
    right: "whose",
    others: ["whos", "who is"],
    rule: "Whose shows possession. Who's is short for who is.",
    from: 6,
  },
];

export function editingTask(rng: Rng, grade: number): ElaBuild {
  const pool = EDITING.filter((e) => e.from <= grade);
  const e = rng.pick(pool);

  return {
    stem: `Read the sentence.\n\n"${e.sentence}"\n\nWhich is the **correct** way to write the underlined part, **${e.wrong}**?`,
    audioText: `In the sentence: ${e.sentence}. Which is the correct way to write ${e.wrong}?`,
    correct: e.right,
    distractors: [
      { value: e.wrong, misconception: "distractor_plausible" as const },
      ...e.others.map((o) => ({
        value: o,
        misconception: "distractor_plausible" as const,
      })),
    ],
    explanation: e.rule,
    hints: [
      "Read the sentence aloud with each option in place.",
      "Ask what rule the sentence is breaking as written.",
    ],
    difficulty: 1000 + grade * 45,
  };
}

/* ------------------------------------------------------------------ *
 * F.1.3 — Phonics and word analysis
 * ------------------------------------------------------------------ */

interface PhonicsItem {
  question: string;
  right: string;
  wrong: string[];
  why: string;
  from: number;
}

const PHONICS: PhonicsItem[] = [
  {
    question: "Which word has the same **vowel sound** as *cake*?",
    right: "rain",
    wrong: ["cat", "clock", "cup"],
    why: "Cake and rain both have the long a sound, spelled a-e in one and ai in the other. The same sound can be spelled more than one way.",
    from: 1,
  },
  {
    question: "Which word begins with the same **sound** as *ship*?",
    right: "chef",
    wrong: ["sip", "skip", "spin"],
    why: "Ship and chef both begin with the sh sound, even though chef is spelled with ch. Listen to the sound, not the letters.",
    from: 2,
  },
  {
    question: "How many **syllables** are in *butterfly*?",
    right: "3",
    wrong: ["2", "4", "1"],
    why: "But-ter-fly. Each syllable has one vowel sound, and clapping the word out gives three.",
    from: 1,
  },
  {
    question: "Which word has a **silent letter**?",
    right: "knee",
    wrong: ["need", "keen", "kite"],
    why: "The k in knee is not pronounced. English keeps silent letters from older spellings.",
    from: 2,
  },
  {
    question: "Which two words are a **compound word** put together?",
    right: "sun + flower",
    wrong: ["sun + ny", "flow + er", "un + happy"],
    why: "A compound word is made of two whole words. Sunny is a base word plus a suffix, not two words.",
    from: 2,
  },
  {
    question: "In *photograph*, which letters make the **f** sound?",
    right: "ph",
    wrong: ["gh", "th", "ch"],
    why: "The letters ph make an f sound in words that came into English from Greek, like photograph and phone.",
    from: 3,
  },
  {
    question: "Which word follows the rule that **-y changes to -i** before a suffix?",
    right: "happiness",
    wrong: ["playing", "joyful", "obeyed"],
    why: "Happy ends in a consonant plus y, so the y becomes i: happiness. When a vowel comes before the y, as in play, the y stays.",
    from: 3,
  },
  {
    question: "Which word doubles its final consonant before **-ing**?",
    right: "run → running",
    wrong: ["read → reading", "jump → jumping", "look → looking"],
    why: "A short vowel and a single final consonant means the consonant doubles: run becomes running. Read has a long vowel sound and jump ends in two consonants.",
    from: 3,
  },
  {
    question: "How is the **c** in *circle* pronounced?",
    right: "like s",
    wrong: ["like k", "like ch", "it is silent"],
    why: "C makes an s sound before e, i and y, and a k sound before a, o and u. Circle has both: a soft c then a hard c.",
    from: 4,
  },
  {
    question: "Which word divides correctly into syllables?",
    right: "nap-kin",
    wrong: ["na-pkin", "napk-in", "n-apkin"],
    why: "A word with two consonants between vowels usually splits between them: nap-kin.",
    from: 4,
  },
  {
    question: "Which word has the **schwa** sound in its unstressed syllable?",
    right: "banana",
    wrong: ["bandit", "pancake", "handstand"],
    why: "The first and last a in banana are reduced to a lazy uh sound. That reduced vowel is called a schwa, and it is why so many unstressed vowels are hard to spell.",
    from: 5,
  },
];

export function phonics(rng: Rng, grade: number): ElaBuild {
  const pool = PHONICS.filter((p) => p.from <= grade);
  const p = rng.pick(pool);

  return {
    stem: p.question,
    audioText: p.question.replace(/\*\*/g, "").replace(/\*/g, ""),
    correct: p.right,
    distractors: p.wrong.map((w) => ({
      value: w,
      misconception: "distractor_plausible" as const,
    })),
    explanation: p.why,
    hints: [
      "Say each word out loud before you choose.",
      "Listen to the sound rather than looking at the spelling.",
    ],
    difficulty: 900 + grade * 40,
  };
}
