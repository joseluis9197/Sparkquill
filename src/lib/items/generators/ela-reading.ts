import type { Rng } from "../rng";
import type { Passage } from "@/lib/passages";
import { absentOptions, foreignOptions, skip, type ElaBuild } from "./ela-builders";

/**
 * The question builders behind every reading benchmark.
 *
 * One builder per kind of question the R and V strands ask, parameterised by
 * grade rather than duplicated six times. The wording of a stem shifts with
 * the grade — a first grader is asked "what is this mostly about", a fifth
 * grader "which sentence best states the central idea" — but the underlying
 * question and the passage annotation behind it are the same.
 */

/* ------------------------------------------------------------------ *
 * R.1.1 — Story elements and plot
 * ------------------------------------------------------------------ */

export function storyElements(p: Passage, rng: Rng, grade: number): ElaBuild {
  const e = p.elements;
  if (!e) return skip;

  const aspect = rng.pick(
    grade <= 2
      ? (["setting", "problem", "character"] as const)
      : (["setting", "problem", "solution", "development"] as const),
  );

  if (aspect === "character") {
    return {
      stem: `Who are the **main characters** in this story?`,
      audioText: "Who are the main characters in this story?",
      correct: e.characters.join(" and "),
      distractors: [
        ...foreignOptions(p, (o) => o.elements?.characters.join(" and "), rng, 2),
        ...absentOptions(p, rng, 1),
        {
          value: `${e.characters[0]} only`,
          misconception: "used_part_not_whole",
        },
      ],
      explanation: `The story follows ${e.characters.join(" and ")}. They are the people the events happen to.`,
      hints: ["Who does the story keep coming back to?"],
      difficulty: 950,
    };
  }

  if (aspect === "setting") {
    return {
      stem: `**Where and when** does this story take place?`,
      audioText: "Where and when does this story take place?",
      correct: e.setting,
      distractors: [
        ...foreignOptions(p, (o) => o.elements?.setting, rng, 2),
        ...absentOptions(p, rng, 2),
      ],
      explanation: `The story is set ${e.setting}. The setting is where and when the events happen.`,
      hints: ["Look for words that tell you the place and the time."],
      difficulty: grade <= 2 ? 980 : 1060,
    };
  }

  if (aspect === "problem") {
    return {
      stem: `What **problem** does the main character face?`,
      audioText: "What problem does the main character face?",
      correct: e.problem,
      distractors: [
        ...foreignOptions(p, (o) => o.elements?.problem, rng, 2),
        ...absentOptions(p, rng, 2),
        { value: e.solution, misconception: "sequence_out_of_order" },
      ],
      explanation: `The problem is what stands in the character's way: ${e.problem.toLowerCase()}.`,
      hints: [
        "What goes wrong, or what does the character want and not have?",
        "The problem comes before the solution.",
      ],
      difficulty: grade <= 2 ? 1020 : 1100,
    };
  }

  if (aspect === "solution") {
    return {
      stem: `**How is the problem solved?**`,
      audioText: "How is the problem solved?",
      correct: e.solution,
      distractors: [
        { value: e.problem, misconception: "sequence_out_of_order" },
        ...foreignOptions(p, (o) => o.elements?.solution, rng, 2),
        ...absentOptions(p, rng, 2),
      ],
      explanation: `${e.solution.charAt(0).toUpperCase()}${e.solution.slice(1)}.`,
      hints: ["Look near the end of the story.", "What changes, and what causes it to change?"],
      difficulty: 1120,
    };
  }

  // Development: how a character changes over the course of the plot.
  const first = p.perspectives?.[0];
  const last = p.perspectives?.[p.perspectives.length - 1];
  if (!first || !last || first === last) return skip;

  return {
    stem: `How does **${e.characters[0]}** change over the course of the story?`,
    audioText: `How does ${e.characters[0]} change over the course of the story?`,
    correct: `${first.view} By the end, ${last.view.charAt(0).toLowerCase()}${last.view.slice(1)}`,
    distractors: [
      {
        // Read the change backwards.
        value: `${last.view} By the end, ${first.view.charAt(0).toLowerCase()}${first.view.slice(1)}`,
        misconception: "sequence_out_of_order",
      },
      { value: `${first.view} Nothing changes this by the end.`, misconception: "used_part_not_whole" },
      ...absentOptions(p, rng, 2),
    ],
    explanation: `${e.characters[0]} does not change what happens — the events change what ${e.characters[0]} understands. ${last.view}`,
    hints: [
      "Compare the character at the start with the character at the end.",
      "A change in understanding counts as much as a change in action.",
    ],
    difficulty: 1220,
  };
}

/* ------------------------------------------------------------------ *
 * R.1.2 — Moral and theme
 * ------------------------------------------------------------------ */

export function theme(p: Passage, rng: Rng, grade: number): ElaBuild {
  if (!p.theme) return skip;

  return {
    stem:
      grade <= 2
        ? `What **lesson** does this ${p.genre === "poetry" ? "poem" : "story"} teach?`
        : `Which sentence best states the **theme** of this ${p.genre === "poetry" ? "poem" : "text"}?`,
    audioText:
      grade <= 2
        ? "What lesson does this teach?"
        : "Which sentence best states the theme?",
    correct: p.theme,
    distractors: [
      ...foreignOptions(p, (o) => o.theme, rng, 2),
      {
        // A specific event from the text offered as if it were the theme. The
        // commonest theme error: retelling instead of generalising.
        value: p.elements
          ? `${p.elements.problem}.`
          : (p.supportingDetails?.[0] ?? p.title),
        misconception: "detail_not_central_idea",
      },
      ...absentOptions(p, rng, 1),
    ],
    explanation: `A theme is the idea the whole text is about, not a single thing that happens in it. Here that idea is: ${p.theme.toLowerCase()}`,
    hints: [
      "A theme is a lesson about life, not a summary of events.",
      "Would the sentence still make sense to someone who had not read this text?",
    ],
    difficulty: grade <= 2 ? 1080 : 1200,
  };
}

/* ------------------------------------------------------------------ *
 * R.1.3 — Narrator and character perspective
 * ------------------------------------------------------------------ */

export function narratorOrPerspective(
  p: Passage,
  rng: Rng,
  grade: number,
): ElaBuild {
  const e = p.elements;
  if (!e) return skip;

  const askPerspective = grade >= 2 && (p.perspectives?.length ?? 0) >= 2;

  if (!askPerspective) {
    return {
      stem: `**Who is telling** this story?`,
      audioText: "Who is telling this story?",
      correct: e.narrator,
      distractors: [
        {
          value: `${e.characters[0]}, telling it about ${e.characters[0] === "Rosa" ? "herself" : "themselves"}`,
          misconception: "wrong_character_perspective",
        },
        {
          value: e.pointOfView === "third person"
            ? "One of the characters, using the word I"
            : "Someone outside the story who never appears in it",
          misconception: "wrong_character_perspective",
        },
        { value: "The reader", misconception: "distractor_plausible" },
        { value: "A character who appears only at the end", misconception: "plausible_but_absent" },
      ],
      explanation: `The story is told in the ${e.pointOfView}: ${e.narrator}. ${
        e.pointOfView === "third person"
          ? 'You can tell because the characters are called by name or "he" and "she", never "I".'
          : 'You can tell because the teller uses the word "I".'
      }`,
      hints: [
        `Does the teller use "I", or names like ${e.characters[0]}?`,
        "The narrator is not always a character in the story.",
      ],
      difficulty: 1050,
    };
  }

  const target = rng.pick(p.perspectives!);
  const others = p.perspectives!.filter((v) => v !== target);

  return {
    stem: `How does **${target.character}** see what is happening?`,
    audioText: `How does ${target.character} see what is happening?`,
    correct: target.view,
    distractors: [
      ...others.map((o) => ({
        value: o.view,
        misconception: "wrong_character_perspective" as const,
      })),
      ...foreignOptions(p, (o) => o.perspectives?.[0]?.view, rng, 1),
      ...absentOptions(p, rng, 2),
    ],
    explanation: `${target.character}'s view is not the only one in this text. ${target.view}`,
    hints: [
      "Two characters can watch the same events and think different things.",
      "Look for what this character says or does, not what the other one does.",
    ],
    difficulty: grade <= 2 ? 1140 : 1240,
  };
}

/* ------------------------------------------------------------------ *
 * R.1.4 — Poetry structure
 * ------------------------------------------------------------------ */

export function poetryStructure(p: Passage, rng: Rng, grade: number): ElaBuild {
  if (p.genre !== "poetry" || !p.stanzas) return skip;

  const aspect = rng.pick(
    grade <= 2
      ? (["stanzas", "lines"] as const)
      : (["stanzas", "lines", "rhyme", "form"] as const),
  );

  if (aspect === "stanzas") {
    return {
      stem: `How many **stanzas** does this poem have?`,
      audioText: "How many stanzas does this poem have?",
      correct: String(p.stanzas),
      distractors: [
        {
          // Counted the lines instead of the groups.
          value: String(p.stanzas * (p.linesPerStanza ?? 4)),
          misconception: "surface_word_match",
        },
        { value: String(p.stanzas + 1), misconception: "off_by_one" },
        { value: String(Math.max(1, p.stanzas - 1)), misconception: "off_by_one" },
        { value: String(p.linesPerStanza ?? 4), misconception: "distractor_plausible" },
      ],
      explanation: `A stanza is a group of lines with a blank line before the next group. This poem has ${p.stanzas}.`,
      hints: ["Look for the gaps between groups of lines.", "A stanza is like a paragraph in a poem."],
      difficulty: 970,
    };
  }

  if (aspect === "lines") {
    const n = p.linesPerStanza;
    if (!n) return skip;
    return {
      stem: `How many **lines** are in each stanza of this poem?`,
      audioText: "How many lines are in each stanza?",
      correct: String(n),
      distractors: [
        { value: String(p.stanzas), misconception: "surface_word_match" },
        { value: String(n + 1), misconception: "off_by_one" },
        { value: String(n - 1), misconception: "off_by_one" },
        { value: String(n * p.stanzas), misconception: "used_part_not_whole" },
      ],
      explanation: `Each stanza has ${n} lines. A line ends where the poet chose to break it, not where the sentence ends.`,
      hints: ["Count the lines in one group only.", "A line break is a choice the poet made."],
      difficulty: 990,
    };
  }

  if (aspect === "rhyme") {
    if (!p.rhymeScheme) return skip;
    return {
      stem: `What is the **rhyme scheme** of each stanza in this poem?`,
      audioText: "What is the rhyme scheme of each stanza?",
      correct: p.rhymeScheme,
      distractors: (
        [
          { value: "AABB", misconception: "distractor_plausible" as const },
          { value: "ABAB", misconception: "distractor_plausible" as const },
          { value: "AAAA", misconception: "distractor_plausible" as const },
          { value: "No rhyme at all", misconception: "distractor_plausible" as const },
        ]
      ).filter((d) => d.value !== p.rhymeScheme),
      explanation: `Lines that rhyme get the same letter. In this poem the pattern is ${p.rhymeScheme}: ${
        p.rhymeScheme === "ABCB"
          ? "only the second and fourth lines rhyme."
          : "read the last word of each line and match the sounds."
      }`,
      hints: [
        "Say the last word of each line aloud.",
        "Give matching sounds the same letter, starting with A.",
      ],
      difficulty: 1180,
    };
  }

  return {
    stem: `Which best describes the **form** of this poem?`,
    audioText: "Which best describes the form of this poem?",
    correct: p.rhymeScheme
      ? `Rhymed verse in ${p.stanzas} stanzas of ${p.linesPerStanza ?? 4} lines`
      : `Free verse in ${p.stanzas} stanzas`,
    distractors: [
      {
        value: p.rhymeScheme ? "Free verse, with no regular rhyme" : "Rhymed verse with an AABB pattern",
        misconception: "distractor_plausible",
      },
      { value: "A haiku of three lines", misconception: "distractor_plausible" },
      { value: "A limerick of five lines", misconception: "distractor_plausible" },
    ],
    explanation: p.rhymeScheme
      ? `The poem keeps a steady shape: ${p.stanzas} stanzas of ${p.linesPerStanza ?? 4} lines, rhyming ${p.rhymeScheme}. A haiku has three lines and a limerick five, so neither fits.`
      : `The lines do not rhyme in a regular pattern, which makes this free verse. It still has ${p.stanzas} stanzas.`,
    hints: [
      "Count the lines per stanza first.",
      "Then check whether the line endings rhyme in a pattern.",
    ],
    difficulty: 1230,
  };
}

/* ------------------------------------------------------------------ *
 * R.2.1 — Text features and structure
 * ------------------------------------------------------------------ */

export function textFeatures(p: Passage, rng: Rng, grade: number): ElaBuild {
  const features = p.textFeatures;
  if (!features || features.length === 0) return skip;
  const f = rng.pick(features);

  return {
    stem: `In an informational text, what is a **${f.feature}** for?`,
    audioText: `In an informational text, what is a ${f.feature} for?`,
    correct: `It ${f.purpose}`,
    distractors: f.notPurpose.map((n) => ({
      value: `It ${n}`,
      misconception: "confused_author_purpose" as const,
    })),
    explanation: `A ${f.feature} ${f.purpose}. Text features are not decoration — each one does a job the running text cannot do as well.`,
    hints: [
      "What would you lose if this feature were removed?",
      "Each feature answers a different kind of question.",
    ],
    difficulty: grade <= 2 ? 1000 : 1120,
  };
}

/* ------------------------------------------------------------------ *
 * R.2.2 — Central idea and supporting details
 * ------------------------------------------------------------------ */

export function centralIdea(p: Passage, rng: Rng, grade: number): ElaBuild {
  if (!p.centralIdea || !p.supportingDetails?.length) return skip;

  const askDetail = grade >= 3 && rng.bool(0.35);

  if (askDetail) {
    const detail = rng.pick(p.supportingDetails);
    return {
      stem: `Which detail from the text **best supports** this central idea: "${p.centralIdea}"?`,
      audioText: `Which detail best supports the central idea?`,
      correct: detail,
      distractors: [
        ...absentOptions(p, rng, 2),
        ...foreignOptions(p, (o) => o.supportingDetails?.[0], rng, 2),
      ],
      explanation: `"${detail}" is stated in the text and it backs up the central idea directly. A detail that is true but unrelated does not support an idea, and a detail the text never gives cannot support anything.`,
      hints: [
        "The supporting detail has to appear in the text.",
        "It also has to be about the same idea.",
      ],
      difficulty: 1210,
    };
  }

  return {
    stem:
      grade <= 2
        ? `What is this text **mostly about**?`
        : `Which sentence best states the **central idea** of this text?`,
    audioText:
      grade <= 2 ? "What is this text mostly about?" : "What is the central idea of this text?",
    correct: p.centralIdea,
    distractors: [
      {
        // A real detail from the text, offered as the main point. The single
        // most common central-idea error.
        value: rng.pick(p.supportingDetails),
        misconception: "detail_not_central_idea",
      },
      ...foreignOptions(p, (o) => o.centralIdea, rng, 2),
      ...absentOptions(p, rng, 1),
    ],
    explanation: `The central idea covers the whole text, not one part of it. "${rng.pick(p.supportingDetails)}" is true, but it is one detail; the idea that holds the whole text together is: ${p.centralIdea}`,
    hints: [
      "Which sentence would still be true if you deleted a paragraph?",
      "A detail supports the main idea; it is not the main idea.",
    ],
    difficulty: grade <= 2 ? 1060 : 1180,
  };
}

/* ------------------------------------------------------------------ *
 * R.2.3 — Author's purpose and perspective
 * ------------------------------------------------------------------ */

const PURPOSE_EXPLANATION: Record<string, string> = {
  "to inform": "gives facts and explanations without trying to change what you do",
  "to persuade": "argues for something and wants the reader to agree or act",
  "to entertain": "is written mainly to be enjoyed",
};

export function authorPurpose(p: Passage, rng: Rng, grade: number): ElaBuild {
  if (!p.authorPurpose) return skip;
  const all = ["to inform", "to persuade", "to entertain"] as const;

  return {
    stem: `What is the author's main **purpose** in writing this text?`,
    audioText: "What is the author's main purpose in writing this text?",
    correct: p.authorPurpose,
    distractors: [
      ...all
        .filter((a) => a !== p.authorPurpose)
        .map((a) => ({ value: a, misconception: "confused_author_purpose" as const })),
      {
        value: `To describe ${p.title.toLowerCase()}`,
        misconception: "surface_word_match",
      },
    ],
    explanation: `This text ${PURPOSE_EXPLANATION[p.authorPurpose]}. ${
      p.authorPurpose === "to persuade"
        ? "Look for the sentence where the writer tells you what should happen — that is the give-away."
        : "A text can be interesting without being written to entertain, and can mention an opinion without being written to persuade."
    }`,
    hints: [
      "Does the writer want you to know something, or to do something?",
      "Facts alone usually mean the purpose is to inform.",
    ],
    difficulty: grade <= 2 ? 1080 : 1170,
  };
}

/* ------------------------------------------------------------------ *
 * R.2.4 — Author's claim and evidence
 * ------------------------------------------------------------------ */

export function authorClaim(p: Passage, rng: Rng, grade: number): ElaBuild {
  if (!p.authorOpinion || !p.opinionEvidence?.length) return skip;

  const askEvidence = grade >= 3 && rng.bool(0.5);

  if (askEvidence) {
    const ev = rng.pick(p.opinionEvidence);
    return {
      stem: `The author argues: "${p.authorOpinion}"\n\nWhich statement from the text is **evidence** for that?`,
      audioText: "Which statement from the text is evidence for the author's argument?",
      correct: ev,
      distractors: [
        ...absentOptions(p, rng, 2),
        ...foreignOptions(p, (o) => o.opinionEvidence?.[0], rng, 2),
      ],
      explanation: `"${ev}" is something the text actually states, and it gives a reason to accept the author's claim. Evidence has to do both jobs: be in the text, and support the claim.`,
      hints: [
        "Evidence is stated in the text, not assumed by the reader.",
        "Ask whether it gives a reason for the claim or just sits near it.",
      ],
      difficulty: 1260,
    };
  }

  return {
    stem: `What is the author's **opinion** in this text?`,
    audioText: "What is the author's opinion in this text?",
    correct: p.authorOpinion,
    distractors: [
      {
        // A fact from the text offered as an opinion. Distinguishing the two
        // is the skill this benchmark is after.
        value: rng.pick(p.supportingDetails ?? p.opinionEvidence),
        misconception: "detail_not_central_idea",
      },
      ...foreignOptions(p, (o) => o.authorOpinion, rng, 2),
      ...absentOptions(p, rng, 1),
    ],
    explanation: `An opinion is something a reasonable person could disagree with. "${rng.pick(p.opinionEvidence)}" is a fact the author gives; the opinion those facts are working towards is: ${p.authorOpinion}`,
    hints: [
      "Could someone disagree with this sentence and still be reasonable?",
      "Facts support an opinion; they are not the opinion.",
    ],
    difficulty: grade <= 2 ? 1140 : 1230,
  };
}

/* ------------------------------------------------------------------ *
 * R.3.1 — Figurative and descriptive language
 * ------------------------------------------------------------------ */

export function figurative(p: Passage, rng: Rng, grade: number): ElaBuild {
  const notes = p.figurative;
  if (!notes || notes.length === 0) return skip;
  const f = rng.pick(notes);

  const askKind = grade >= 2 && rng.bool(0.4);

  if (askKind) {
    const kinds = ["simile", "metaphor", "personification", "idiom", "alliteration", "hyperbole"] as const;
    return {
      stem: `The text says: "${f.phrase}"\n\nWhat kind of language is this?`,
      audioText: `The text says, ${f.phrase}. What kind of language is this?`,
      correct: f.kind,
      distractors: rng
        .shuffle(kinds.filter((k) => k !== f.kind))
        .slice(0, 3)
        .map((k) => ({ value: k, misconception: "distractor_plausible" as const })),
      explanation: `"${f.phrase}" is ${f.kind === "simile" ? "a simile — it compares two things using like or as" : f.kind === "metaphor" ? "a metaphor — it says one thing *is* another, without like or as" : f.kind === "personification" ? "personification — it gives human qualities to something that is not human" : f.kind === "alliteration" ? "alliteration — the same sound repeats at the start of nearby words" : f.kind === "hyperbole" ? "hyperbole — a deliberate exaggeration, not meant literally" : "an idiom — a phrase whose meaning cannot be worked out from the individual words"}.`,
      hints: [
        "Does it use like or as? Then it is a simile.",
        "Is something not human doing something human? Then it is personification.",
      ],
      difficulty: 1190,
    };
  }

  return {
    stem: `The text says: "${f.phrase}"\n\nWhat does this **mean**?`,
    audioText: `The text says, ${f.phrase}. What does this mean?`,
    correct: f.meaning,
    distractors: [
      {
        // Took the phrase at face value — the point of the benchmark.
        value: f.literalReading,
        misconception: "literal_reading_of_figurative",
      },
      ...foreignOptions(p, (o) => o.figurative?.[0]?.meaning, rng, 2),
      ...absentOptions(p, rng, 1),
    ],
    explanation: `Taken word for word this would mean ${f.literalReading.toLowerCase()}, which is not what the writer intends. It means ${f.meaning.toLowerCase()}.`,
    hints: [
      "The writer is not being literal here.",
      "What picture is the phrase trying to put in your head?",
    ],
    difficulty: grade <= 2 ? 1120 : 1210,
  };
}

/* ------------------------------------------------------------------ *
 * R.3.2 — Retell, summarise, paraphrase
 * ------------------------------------------------------------------ */

export function summarise(p: Passage, rng: Rng, grade: number): ElaBuild {
  const seq = p.sequence;
  if (!seq || seq.length < 3) return skip;

  const askOrder = grade <= 3;

  if (askOrder) {
    const i = rng.int(1, seq.length - 1);
    return {
      stem: `What happens **right after** this?\n\n"${seq[i - 1]}"`,
      audioText: `What happens right after: ${seq[i - 1]}`,
      correct: seq[i],
      distractors: [
        ...(i >= 2
          ? [{ value: seq[i - 2], misconception: "sequence_out_of_order" as const }]
          : []),
        ...(i + 1 < seq.length
          ? [{ value: seq[i + 1], misconception: "sequence_out_of_order" as const }]
          : []),
        { value: seq[seq.length - 1], misconception: "sequence_out_of_order" },
        ...absentOptions(p, rng, 2),
      ],
      explanation: `Retelling means putting the events back in the order they happened. After "${seq[i - 1]}" comes "${seq[i]}".`,
      hints: [
        "Go back to the text and find the first event.",
        "Then read forward to what happens next.",
      ],
      difficulty: 1060,
    };
  }

  const good = `${seq[0]} ${seq[Math.floor(seq.length / 2)]} ${seq[seq.length - 1]}`;

  return {
    stem: `Which is the best **summary** of this text?`,
    audioText: "Which is the best summary of this text?",
    correct: good,
    distractors: [
      {
        // A single event, offered as the whole summary.
        value: seq[Math.floor(seq.length / 2)],
        misconception: "detail_not_central_idea",
      },
      {
        // Right events, wrong order.
        value: `${seq[seq.length - 1]} ${seq[0]}`,
        misconception: "sequence_out_of_order",
      },
      ...absentOptions(p, rng, 2),
    ],
    explanation: `A summary keeps the events that matter, in order, and leaves out the rest. One event on its own is not a summary, and the same events in the wrong order tell a different story.`,
    hints: [
      "A summary is shorter than the text but covers all of it.",
      "Keep the order the events happened in.",
    ],
    difficulty: 1240,
  };
}

/* ------------------------------------------------------------------ *
 * R.3.3 — Compare two texts
 * ------------------------------------------------------------------ */

export function compareTexts(
  p: Passage,
  rng: Rng,
  grade: number,
  lookup: (id: string) => Passage,
): ElaBuild {
  if (!p.pairedWith || !p.sharedWithPair?.length || !p.uniqueToThis?.length) {
    return skip;
  }
  const other = lookup(p.pairedWith);
  const askShared = rng.bool();

  if (askShared) {
    return {
      stem: `This text and **"${other.title}"** are about related topics. Which statement is true of **both**?`,
      audioText: `Which statement is true of both texts?`,
      correct: rng.pick(p.sharedWithPair),
      distractors: [
        ...p.uniqueToThis.slice(0, 1).map((v) => ({
          value: v,
          misconception: "wrong_text" as const,
        })),
        ...(other.uniqueToThis ?? []).slice(0, 1).map((v) => ({
          value: v,
          misconception: "wrong_text" as const,
        })),
        ...absentOptions(p, rng, 2),
      ],
      explanation: `Comparing means finding what the texts share. Something true of only one of them is a contrast, not a comparison.`,
      hints: [
        "Check the statement against both texts, not just the one in front of you.",
        "If it is true of only one, it belongs in the contrast column.",
      ],
      difficulty: grade <= 2 ? 1150 : 1250,
    };
  }

  return {
    stem: `Which is true of **this text** but **not** of "${other.title}"?`,
    audioText: `Which is true of this text but not of the other one?`,
    correct: rng.pick(p.uniqueToThis),
    distractors: [
      ...p.sharedWithPair.map((v) => ({
        value: v,
        misconception: "wrong_text" as const,
      })),
      ...(other.uniqueToThis ?? []).slice(0, 1).map((v) => ({
        value: v,
        misconception: "wrong_text" as const,
      })),
      ...absentOptions(p, rng, 1),
    ],
    explanation: `A contrast has to be true of one text and false of the other. Something both texts say is a similarity, however specific it sounds.`,
    hints: [
      "First check it is in this text.",
      "Then check it is not in the other one.",
    ],
    difficulty: grade <= 2 ? 1170 : 1270,
  };
}

/* ------------------------------------------------------------------ *
 * R.3.4 — Rhetorical appeals (grade 6)
 * ------------------------------------------------------------------ */

export function rhetoricalAppeals(p: Passage, rng: Rng): ElaBuild {
  if (!p.opinionEvidence?.length || !p.authorOpinion) return skip;
  const ev = rng.pick(p.opinionEvidence);
  const numeric = /\d/.test(ev);

  return {
    stem: `The author writes: "${ev}"\n\nWhich kind of appeal is the author using here?`,
    audioText: `The author writes: ${ev}. Which kind of appeal is this?`,
    correct: numeric
      ? "An appeal to logic, using figures the reader can check"
      : "An appeal to logic, giving a reason that follows from the facts",
    distractors: [
      {
        value: "An appeal to emotion, meant to make the reader feel something",
        misconception: "confused_author_purpose",
      },
      {
        value: "An appeal to authority, resting on the writer's own reputation",
        misconception: "confused_author_purpose",
      },
      {
        value: "No appeal at all — the sentence is purely decorative",
        misconception: "distractor_plausible",
      },
    ],
    explanation: `${numeric ? "Figures the reader could look up" : "A stated reason"} is an appeal to logic. Emotional appeals work on how a reader feels; appeals to authority work on who is speaking. Writers often use all three, so the question is which one *this sentence* is doing.`,
    hints: [
      "Is the sentence giving a reason, stirring a feeling, or citing a person?",
      "Numbers and stated facts point to logic.",
    ],
    difficulty: 1320,
  };
}

/* ------------------------------------------------------------------ *
 * V.1.3 — Context clues and multiple meanings
 * ------------------------------------------------------------------ */

export function contextClues(p: Passage, rng: Rng, grade: number): ElaBuild {
  const notes = p.vocabulary;
  if (!notes || notes.length === 0) return skip;

  // Prefer multiple-meaning words once the benchmark asks for them.
  const preferred = grade >= 3 ? notes.filter((v) => v.multipleMeaning) : notes;
  const v = rng.pick(preferred.length ? preferred : notes);

  return {
    stem: `Read this sentence from the text:\n\n"${v.context}"\n\nWhat does **${v.word}** mean **here**?`,
    audioText: `In the sentence: ${v.context}. What does ${v.word} mean here?`,
    correct: v.meaning,
    distractors: v.wrongMeanings.map((m) => ({
      value: m,
      misconception: v.multipleMeaning
        ? ("wrong_context_sense" as const)
        : ("plausible_but_absent" as const),
    })),
    explanation: v.multipleMeaning
      ? `"${v.word}" has more than one meaning. The other meanings are real, but the sentence around it decides which one applies here: ${v.meaning}.`
      : `The words around "${v.word}" tell you what it means: ${v.meaning}.`,
    hints: [
      "Read the whole sentence, not just the word.",
      "Try each answer in the sentence and see which one still makes sense.",
    ],
    difficulty: grade <= 2 ? 1090 : 1200,
  };
}

/* ------------------------------------------------------------------ *
 * V.1.1 — Academic vocabulary used in context
 * ------------------------------------------------------------------ */

export function academicVocabulary(p: Passage, rng: Rng, grade: number): ElaBuild {
  const notes = p.vocabulary;
  if (!notes || notes.length === 0) return skip;
  const v = rng.pick(notes);

  return {
    stem: `Which sentence uses the word **${v.word}** correctly?`,
    audioText: `Which sentence uses the word ${v.word} correctly?`,
    correct: v.context,
    distractors: v.wrongMeanings.slice(0, 3).map((m) => ({
      value: `The ${v.word} ${m.replace(/^(a|an|the) /, "")}.`,
      misconception: "wrong_context_sense" as const,
    })),
    explanation: `"${v.context}" uses ${v.word} the way the text does, meaning ${v.meaning}. Using a word correctly means matching both its meaning and the way it fits into a sentence.`,
    hints: [
      "Say each sentence aloud.",
      "A word has to fit the grammar as well as the meaning.",
    ],
    difficulty: grade <= 2 ? 1100 : 1190,
  };
}
