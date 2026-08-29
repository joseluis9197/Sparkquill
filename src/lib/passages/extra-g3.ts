import type { Passage } from "./types";

/**
 * More passages for grades 3 and 4.
 *
 * Depth matters as much as coverage here. With one story per grade a child
 * practising reading for half an hour meets the same text four times: the
 * questions vary, the passage does not, and by the third pass they are
 * answering from memory rather than from reading. That is the opposite of
 * what the practice is for.
 */

export const EXTRA_G3_G4_PASSAGES: Passage[] = [
  /* ---------------------------------------------------------------- *
   * Grade 3
   * ---------------------------------------------------------------- */
  {
    id: "g3.wrong-key",
    grade: 3,
    genre: "literary",
    title: "The Wrong Key",
    text: `The key to the shed had hung on the same nail in the kitchen for as long as Tomás could remember. On Saturday it was not there.

His grandmother was already outside with the seed trays, waiting.

Tomás checked the drawer where the batteries lived. He checked the pocket of the coat by the door. He checked under the mat, which was where his father hid a key, and found a spider and no key at all.

Then he stopped moving and thought about it properly.

The last person to use the shed was his grandmother, on Thursday, and on Thursday it had rained. She had come in through the back door instead of the front. Tomás went to the back door and looked at the hooks there.

Four coats. In the second pocket he tried, the key.

"You took eleven minutes," his grandmother said, when he handed it to her.

"I looked in the wrong places first."

"Everybody does," she said. "The eleven minutes is not the part I noticed."`,
    elements: {
      characters: ["Tomás", "his grandmother"],
      setting: "a house and its garden shed, on a Saturday morning",
      problem: "The shed key is missing from the nail where it always hangs",
      solution:
        "Tomás stops searching at random and works out who used it last and which door they came in by",
      narrator: "someone outside the story who can tell what Tomás is thinking",
      pointOfView: "third person",
    },
    theme:
      "Thinking about where something should be beats searching everywhere it might be.",
    perspectives: [
      {
        character: "Tomás at the start",
        view: "He searched the places keys are usually kept, one after another.",
      },
      {
        character: "His grandmother",
        view: "She noticed that he stopped guessing and started reasoning, which mattered more to her than how long he took.",
      },
    ],
    sequence: [
      "Tomás finds the key missing from its nail.",
      "He searches the drawer, a coat pocket and under the mat.",
      "He stops and thinks about who used the shed last.",
      "He remembers it rained on Thursday, so his grandmother used the back door.",
      "He finds the key in a coat by the back door.",
    ],
    vocabulary: [
      {
        word: "properly",
        meaning: "carefully and in the right way",
        wrongMeanings: ["quickly", "out loud", "for a long time"],
        context: "Then he stopped moving and thought about it properly.",
      },
      {
        word: "hooks",
        meaning: "bent pieces of metal for hanging things on",
        wrongMeanings: ["small windows", "keys to a door", "shelves for books"],
        context: "Tomás went to the back door and looked at the hooks there.",
      },
    ],
    figurative: [
      {
        phrase: "The eleven minutes is not the part I noticed",
        kind: "idiom",
        meaning: "how long he took mattered less than how he went about it",
        literalReading: "she did not see the clock",
      },
    ],
    notInText: [
      "Tomás found the key under the mat.",
      "His grandmother had lost the key on purpose.",
      "The shed was locked from the inside.",
      "Tomás gave up and asked for help.",
    ],
  },
  {
    id: "g3.paper-boats",
    grade: 3,
    genre: "poetry",
    title: "Paper Boats",
    text: `We fold them in the morning,
We name them on the deck,
We send them down the gutter
With a pencil for a mast.

The Otter and The Marigold,
The Hurry-Up, The Wren —
Four boats and four brave captains
Who will never sail again.

The rain stops after lunchtime.
The gutter runs to nought.
We carry home the paper crews
And every one is caught.

Tomorrow there is weather.
Tomorrow there is more.
A fleet is not a thing you keep.
A fleet is what you pour.`,
    stanzas: 4,
    linesPerStanza: 4,
    theme:
      "Some things are worth making even though they will not last, because the making is the point.",
    figurative: [
      {
        phrase: "Four boats and four brave captains",
        kind: "alliteration",
        meaning: "the repeated b sound gives the line the swing of a chant",
        literalReading: "there are exactly four people commanding the boats",
      },
      {
        phrase: "A fleet is what you pour",
        kind: "metaphor",
        meaning: "the boats exist only while the water runs, and are made again next time",
        literalReading: "you can pour a fleet out of a jug",
      },
      {
        phrase: "The gutter runs to nought",
        kind: "personification",
        meaning: "the water stops flowing when the rain ends",
        literalReading: "the gutter is counting down to zero",
      },
    ],
    vocabulary: [
      {
        word: "fleet",
        meaning: "a group of boats together",
        wrongMeanings: ["very fast", "a kind of river", "a paper crease"],
        context: "A fleet is not a thing you keep.",
        multipleMeaning: true,
      },
      {
        word: "mast",
        meaning: "the upright pole that holds a sail",
        wrongMeanings: ["the front of a boat", "a rope for steering", "the name of a boat"],
        context: "With a pencil for a mast.",
      },
    ],
    notInText: [
      "One of the boats reaches the sea.",
      "The children are sad when the rain stops.",
      "The boats are made of wood.",
      "They will never make boats again.",
    ],
  },
  {
    id: "g3.honey-bees",
    grade: 3,
    genre: "informational",
    title: "How a Bee Tells the Others",
    text: `A honey bee that finds a good patch of flowers has a problem. The flowers may be a mile away, and she cannot lead the whole hive there one bee at a time.

So she dances.

Back inside the dark hive, the bee walks a shape like the number eight, over and over, on the wall of the comb. The other bees crowd round and feel the movement.

The dance carries two pieces of information. The angle the bee walks tells the others which direction to fly, measured against the sun. The length of the middle part of the dance tells them how far. A longer waggle means a longer flight.

The bees watching cannot see the dance. It is completely dark inside the hive. They read it by touch and by the sound the wings make.

Karl von Frisch worked this out in the 1940s by marking individual bees with paint and following where they went. Almost nobody believed him at first. An insect with a brain the size of a grass seed was not supposed to be able to say *where*.`,
    centralIdea:
      "A honey bee tells the rest of the hive where food is by dancing a pattern that carries both direction and distance.",
    supportingDetails: [
      "The bee walks a figure-eight shape on the comb.",
      "The angle of the dance gives the direction, measured against the sun.",
      "The length of the middle part gives the distance.",
      "The watching bees read the dance by touch and sound, because the hive is dark.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "What a bee can communicate is far more than people expected from an insect.",
    opinionEvidence: [
      "Almost nobody believed Karl von Frisch at first.",
      "An insect with a brain the size of a grass seed was not supposed to be able to say where.",
      "The dance carries both a direction and a distance.",
    ],
    textFeatures: [
      {
        feature: "diagram",
        purpose: "shows how the parts of something fit together or how a process works",
        notPurpose: [
          "gives the meanings of technical words",
          "lists what is on each page",
          "shows the writer's opinion about the topic",
        ],
      },
      {
        feature: "caption",
        purpose: "explains what a picture is showing",
        notPurpose: [
          "gives the order events happened in",
          "names the sources the writer used",
          "defines a word used in the heading",
        ],
      },
    ],
    vocabulary: [
      {
        word: "comb",
        meaning: "the wax structure bees build inside a hive",
        wrongMeanings: [
          "a tool for tidying hair",
          "the entrance to the hive",
          "the queen bee's chamber",
        ],
        context: "over and over, on the wall of the comb",
        multipleMeaning: true,
      },
      {
        word: "angle",
        meaning: "the direction a line turns away from another",
        wrongMeanings: ["the speed of the dance", "a corner of the hive", "a kind of flower"],
        context: "The angle the bee walks tells the others which direction to fly",
      },
      {
        word: "individual",
        meaning: "single, one at a time",
        wrongMeanings: ["unusual", "very small", "belonging to a group"],
        context: "by marking individual bees with paint",
      },
    ],
    notInText: [
      "Bees use their eyes to watch the dance.",
      "The dance tells the others which flowers to pick.",
      "Karl von Frisch discovered the dance in the 1900s.",
      "Only the queen bee can dance.",
    ],
    pairedWith: "g3.ant-trails",
    sharedWithPair: [
      "Both insects have a way of telling others where food is.",
      "Both texts describe a message that does not use words.",
    ],
    uniqueToThis: [
      "Describes a dance performed in the dark.",
      "Gives both direction and distance in one message.",
    ],
  },
  {
    id: "g3.ant-trails",
    grade: 3,
    genre: "informational",
    title: "The Line of Ants",
    text: `Watch a line of ants crossing a path and it looks organised, as though somebody is in charge. Nobody is.

An ant that finds food picks up a crumb and walks home. As she walks she drops a chemical from her body onto the ground. The chemical has a smell other ants can follow.

The next ant follows the smell, finds the food, and drops her own chemical on the way back. Now the trail smells twice as strong. The more ants use a path, the stronger it gets, and the stronger it gets the more ants use it.

When the food runs out, ants stop walking that way. The chemical dries and fades within a few hours, and the trail disappears on its own.

There is no ant deciding any of this. Each one follows a simple rule, and the line across the path is what those rules add up to.`,
    centralIdea:
      "Ants form trails to food without any leader, because each one follows a simple rule about a chemical smell.",
    supportingDetails: [
      "An ant returning with food drops a chemical other ants can smell.",
      "The more ants use a path, the stronger the smell becomes.",
      "The chemical fades within a few hours when the food runs out.",
      "No single ant decides where the trail goes.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "Something that looks organised does not need anyone organising it.",
    opinionEvidence: [
      "It looks organised, as though somebody is in charge. Nobody is.",
      "Each one follows a simple rule.",
      "The line across the path is what those rules add up to.",
    ],
    vocabulary: [
      {
        word: "chemical",
        meaning: "a substance with particular properties",
        wrongMeanings: ["a kind of food", "a small stone", "a sound too high to hear"],
        context: "she drops a chemical from her body onto the ground",
      },
      {
        word: "trail",
        meaning: "a path marked out for others to follow",
        wrongMeanings: ["to walk slowly behind", "a group of ants", "a hole in the ground"],
        context: "the trail disappears on its own",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "One ant leads the others to the food.",
      "The chemical lasts for weeks.",
      "Ants can see the trail they follow.",
      "The queen chooses which path to use.",
    ],
    pairedWith: "g3.honey-bees",
    sharedWithPair: [
      "Both insects have a way of telling others where food is.",
      "Both texts describe a message that does not use words.",
    ],
    uniqueToThis: [
      "Describes a message left on the ground rather than performed.",
      "Explains how the message fades away by itself.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 4
   * ---------------------------------------------------------------- */
  {
    id: "g4.the-substitute",
    grade: 4,
    genre: "literary",
    title: "The Substitute",
    text: `Everyone in 4B knew what to do with a substitute teacher. You worked out in the first ten minutes how much you could get away with, and then you got away with exactly that much and no more.

Mr. Halloran did not follow the script.

He came in, wrote nothing on the board, sat on the desk instead of behind it, and asked what they had been doing. Then he asked what they had been doing *before* that. Then he asked Priscilla Okonkwo, who had not spoken in class since October, a question about the water cycle, and waited through eleven seconds of silence without filling any of it.

Priscilla answered. It was a good answer.

Deion, who had planned to spend the lesson testing the boundaries, found that he could not locate any. There was nothing to push against. Mr. Halloran simply seemed interested, which was a thing 4B had no procedure for.

There was a moment, about twenty minutes in, when Trevor knocked a chair over — not entirely by accident — and the class turned to watch what would happen. Mr. Halloran picked it up, said "thanks", and carried on with what he had been saying about condensation. Trevor sat down looking mildly cheated.

By the second half of the lesson the room had gone quiet in the working way rather than the told-off way. Deion noticed it happening and could not identify the moment it had started. He suspected it was the chair.

At the end Mr. Halloran said, "You are a good class."

Somebody said, "You have to say that."

"No," he said, packing his bag. "That is the thing about being a substitute. I never have to say anything."`,
    elements: {
      characters: ["Deion", "Mr. Halloran", "Priscilla Okonkwo", "class 4B"],
      setting: "a fourth grade classroom during a lesson with a substitute teacher",
      problem:
        "The class expects to test a substitute's limits, and this one gives them nothing to push against",
      solution:
        "Mr. Halloran's genuine interest changes the room's behaviour without any rules being stated",
      narrator: "someone outside the story who can tell what Deion notices",
      pointOfView: "third person",
    },
    theme:
      "Being taken seriously changes how people behave more reliably than being controlled.",
    perspectives: [
      {
        character: "Deion at the start",
        view: "He expected to find the limits of what a substitute would allow and work up to them.",
      },
      {
        character: "Mr. Halloran",
        view: "He treated the class as people worth asking questions of, and waited for answers.",
      },
      {
        character: "Deion at the end",
        view: "He noticed the room had settled and could not point to when it happened.",
      },
    ],
    sequence: [
      "4B prepares to test how much they can get away with.",
      "Mr. Halloran sits on the desk and asks what they have been doing.",
      "He asks Priscilla a question and waits through the silence.",
      "Deion finds there is nothing to push against.",
      "The room goes quiet in a working way, and Mr. Halloran says they are a good class.",
    ],
    vocabulary: [
      {
        word: "boundaries",
        meaning: "the limits of what is allowed",
        wrongMeanings: [
          "the walls of the classroom",
          "the rules written on the board",
          "the edges of the school grounds",
        ],
        context: "who had planned to spend the lesson testing the boundaries",
        multipleMeaning: true,
      },
      {
        word: "procedure",
        meaning: "a usual way of dealing with something",
        wrongMeanings: [
          "a punishment",
          "a school assembly",
          "a written instruction from the head",
        ],
        context: "which was a thing 4B had no procedure for",
      },
      {
        word: "locate",
        meaning: "find",
        wrongMeanings: ["build", "argue about", "remember"],
        context: "found that he could not locate any",
      },
    ],
    figurative: [
      {
        phrase: "the room had gone quiet in the working way rather than the told-off way",
        kind: "metaphor",
        meaning: "the silence came from concentration, not from being disciplined",
        literalReading: "there are two different volumes of silence",
      },
    ],
    notInText: [
      "Mr. Halloran gave the class a punishment.",
      "Deion was sent out of the room.",
      "Priscilla had never spoken in class before.",
      "The regular teacher returned during the lesson.",
    ],
  },
  {
    id: "g4.first-clock",
    grade: 4,
    genre: "poetry",
    title: "What the Sundial Knows",
    text: `It has one moving part,
And that part is the sun.
It has no gears to wind,
No spring to overrun.

It cannot tell you Tuesday.
It cannot tell you June.
It has never once been early.
It has never once been late.

On a grey day it says nothing,
Which is more than most things do
When they have nothing to report —
They guess. It waits.

And should the power fail
In every clock we own,
The garden will keep time
The way it always has.`,
    stanzas: 4,
    linesPerStanza: 4,
    theme:
      "Something simple that admits what it does not know can be more trustworthy than something clever that guesses.",
    figurative: [
      {
        phrase: "It has one moving part, and that part is the sun",
        kind: "hyperbole",
        meaning: "the sundial itself has no mechanism at all",
        literalReading: "the sun is a component installed inside the sundial",
      },
      {
        phrase: "They guess. It waits.",
        kind: "personification",
        meaning: "the sundial gives no answer rather than a wrong one",
        literalReading: "the sundial is patiently sitting and thinking",
      },
      {
        phrase: "The garden will keep time",
        kind: "metaphor",
        meaning: "the sundial in the garden goes on working without electricity",
        literalReading: "the plants are keeping track of the hours",
      },
    ],
    vocabulary: [
      {
        word: "gears",
        meaning: "toothed wheels that turn each other inside a machine",
        wrongMeanings: ["hands on a clock face", "batteries", "numbers around a dial"],
        context: "It has no gears to wind",
      },
      {
        word: "report",
        meaning: "give information about",
        wrongMeanings: [
          "complain about someone",
          "a written school assessment",
          "a loud bang",
        ],
        context: "When they have nothing to report",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "The sundial is broken.",
      "The speaker prefers digital clocks.",
      "The sundial works at night.",
      "Someone winds the sundial each morning.",
    ],
  },
];
