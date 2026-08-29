import type { Passage } from "./types";

/**
 * More passages for grades 1, 2, 5 and 6.
 *
 * The grade 6 set in particular needed a second story and a second poem: with
 * one of each, the reading benchmarks that depend on genre were asking about
 * the same text every time.
 */

export const EXTRA_PASSAGES: Passage[] = [
  /* ---------------------------------------------------------------- *
   * Grade 1
   * ---------------------------------------------------------------- */
  {
    id: "g1.new-shoes",
    grade: 1,
    genre: "literary",
    title: "New Shoes",
    text: `Amir got new shoes on Friday. They were blue with a white stripe.

On Monday he did not want to wear them to school.

"Why not?" said his mum.

"They are too new," said Amir. "Everyone will look."

His mum put his old shoes in his bag. "Take both," she said.

At school, Nia said, "I like your shoes."

Amir looked down. Then he smiled. The old shoes stayed in the bag all day.`,
    elements: {
      characters: ["Amir", "his mum", "Nia"],
      setting: "at home and at school on a Monday",
      problem: "Amir does not want to wear his new shoes because people will notice",
      solution: "A friend says she likes them, and he keeps them on all day",
      narrator: "someone outside the story who tells what happens",
      pointOfView: "third person",
    },
    theme: "Something you are worried about is often not a problem at all.",
    sequence: [
      "Amir gets new blue shoes on Friday.",
      "On Monday he does not want to wear them.",
      "His mum packs the old shoes in his bag.",
      "Nia says she likes the new shoes.",
      "Amir keeps the new shoes on all day.",
    ],
    vocabulary: [
      {
        word: "stripe",
        meaning: "a long thin band of colour",
        wrongMeanings: ["a small round spot", "a hole in the shoe", "a shoelace"],
        context: "They were blue with a white stripe.",
      },
    ],
    notInText: [
      "Amir wore the old shoes at lunchtime.",
      "The new shoes were too small.",
      "Nia had the same shoes.",
      "Amir's mum was cross with him.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 2
   * ---------------------------------------------------------------- */
  {
    id: "g2.library-fish",
    grade: 2,
    genre: "literary",
    title: "The Library Fish",
    text: `There was a fish tank in the school library with one fish in it. The fish was orange and slow and had been there longer than anyone could remember. Nobody had given it a name.

Ivy started calling it Bartholomew. She did not tell anyone; she just said it out loud each time she came in, quietly, the way you greet somebody.

By November other children were saying it too.

In January, Mrs. Danso put a small card on the tank. It said: **Bartholomew. Goldfish. Please do not tap the glass.**

Ivy stopped in front of it for a long time.

"Who told you his name?" she asked.

Mrs. Danso was shelving books and did not look up. "Everybody knows his name," she said.`,
    elements: {
      characters: ["Ivy", "Mrs. Danso", "the fish"],
      setting: "a school library, from autumn through to January",
      problem: "The library fish has no name, and nobody has ever given it one",
      solution:
        "Ivy quietly starts calling it Bartholomew, other children copy her, and the name becomes official",
      narrator: "someone outside the story who can tell what Ivy does and thinks",
      pointOfView: "third person",
    },
    theme:
      "One small thing done quietly and often can change something for everybody.",
    perspectives: [
      {
        character: "Ivy",
        view: "She thought she was the only one calling the fish anything.",
      },
      {
        character: "Mrs. Danso",
        view: "She had noticed the name spreading and made it official without making a fuss about who started it.",
      },
    ],
    sequence: [
      "The library fish has no name.",
      "Ivy starts greeting it as Bartholomew, quietly.",
      "By November other children use the name too.",
      "In January Mrs. Danso puts a card on the tank with the name on it.",
      "Ivy asks who told her, and Mrs. Danso says everybody knows.",
    ],
    vocabulary: [
      {
        word: "greet",
        meaning: "say hello to someone",
        wrongMeanings: ["feed someone", "argue with someone", "walk past someone"],
        context: "the way you greet somebody",
      },
      {
        word: "shelving",
        meaning: "putting books back on the shelves",
        wrongMeanings: ["reading aloud", "counting books", "repairing books"],
        context: "Mrs. Danso was shelving books and did not look up.",
      },
    ],
    notInText: [
      "Ivy asked permission to name the fish.",
      "The fish was given to the school by Ivy's family.",
      "Mrs. Danso named the fish herself.",
      "The other children argued about the name.",
    ],
  },

  {
    id: "g1.the-loose-tooth",
    grade: 1,
    genre: "poetry",
    title: "Loose Tooth",
    text: `It wobbles when I talk.
It wobbles when I eat.
It wobbles when I do not
Do anything at all.

I push it with my tongue.
I push it with my thumb.
I tell it to come out.
It will not. Not yet. Not yet.

But one day in the morning
It will be on my plate,
And I will have a window
Where a tooth was yesterday.`,
    stanzas: 3,
    linesPerStanza: 4,
    theme: "Waiting for something is part of it happening.",
    figurative: [
      {
        phrase: "I will have a window where a tooth was yesterday",
        kind: "metaphor",
        meaning: "there will be a gap you can see through",
        literalReading: "a piece of glass will be fitted in the mouth",
      },
      {
        phrase: "I tell it to come out",
        kind: "personification",
        meaning: "the child is talking to the tooth as if it could decide",
        literalReading: "the tooth can hear and understand",
      },
    ],
    vocabulary: [
      {
        word: "wobbles",
        meaning: "moves a little from side to side",
        wrongMeanings: ["hurts a lot", "grows bigger", "makes a sound"],
        context: "It wobbles when I talk.",
      },
    ],
    notInText: [
      "The tooth came out at school.",
      "The child is frightened of the dentist.",
      "The tooth stopped wobbling.",
      "A new tooth has already grown.",
    ],
  },
  {
    id: "g2.the-last-page",
    grade: 2,
    genre: "poetry",
    title: "The Last Page",
    text: `I am reading slower now.
I am reading slower now
Because there are eleven pages left
And then there will be none.

I could stop and save them.
I could read them twice.
I could put the book back on the shelf
And leave the ending shut.

But I want to know. I want to know.
I always want to know.
So I read the eleven pages
And then I sit and think.

The people are still in there
Doing what they did.
I can open it tomorrow
And they will not have moved.`,
    stanzas: 4,
    linesPerStanza: 4,
    theme:
      "Wanting a good thing to last and wanting to know how it ends pull against each other.",
    figurative: [
      {
        phrase: "leave the ending shut",
        kind: "metaphor",
        meaning: "not read the last part, so it stays unknown",
        literalReading: "close a door on the ending",
      },
      {
        phrase: "The people are still in there doing what they did",
        kind: "personification",
        meaning: "the characters can be met again by rereading",
        literalReading: "the characters are alive inside the book",
      },
    ],
    vocabulary: [
      {
        word: "ending",
        meaning: "the last part of a story",
        wrongMeanings: ["the front cover", "the middle of a book", "a chapter title"],
        context: "And leave the ending shut.",
      },
    ],
    notInText: [
      "The reader stopped before the last page.",
      "The book was too hard to read.",
      "Somebody told the reader the ending.",
      "The reader did not enjoy the book.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 5
   * ---------------------------------------------------------------- */
  {
    id: "g5.the-scoreboard",
    grade: 5,
    genre: "literary",
    title: "The Scoreboard",
    text: `The scoreboard in the gym had been broken since before Yusuf started at the school. The eight in the tens column was stuck: it lit up whether it was meant to or not. Every home game, the visiting team was told to add or subtract eighty in their heads.

In September, Yusuf asked the caretaker whether it could be fixed.

"Board is fine," Mr. Petrelli said. "It is the relay behind the eight. Twelve dollars. The part has been on the shelf since March."

"Then why is it broken?"

"Because fixing it is not anybody's job," he said, in the tone of a man who had explained this before. "It is not mine, because it is scoring equipment. It is not the athletics department's, because it is wiring. So it sits."

Yusuf looked the board up that evening. It was a Fair-Play 3000, installed in 1998, and the manual was still on the manufacturer's site as a scanned PDF that someone had photographed slightly crooked. Page nineteen showed the relay board. It was held on by two screws and one plug. The whole repair, from the diagram, looked like about four minutes of work.

Yusuf thought about this for a week. Then he did something that surprised him more than it surprised anyone else: he emailed both of them at once, on the same message, and asked which of them he should thank when it was working.

The reply came from the athletics director within the hour, copying the caretaker, saying he would sort it out that afternoon.

The eight went dark on a Thursday. Nobody at the Friday game noticed anything at all, which Yusuf decided was the correct outcome. The point of a working scoreboard, Yusuf thought, is that nobody in the building ever has to think about the scoreboard again.`,
    elements: {
      characters: ["Yusuf", "Mr. Petrelli", "the athletics director"],
      setting: "a school gymnasium, over the autumn term",
      problem:
        "The scoreboard has been broken for years because no department considers the repair their responsibility",
      solution:
        "Yusuf emails both departments together, which makes the gap between them visible, and it is fixed within a day",
      narrator: "someone outside the story who can tell what Yusuf thinks",
      pointOfView: "third person",
    },
    theme:
      "A problem nobody owns is not the same as a problem nobody can solve.",
    perspectives: [
      {
        character: "Mr. Petrelli",
        view: "He saw the repair as sitting outside his responsibility, and had made his peace with that.",
      },
      {
        character: "Yusuf",
        view: "He treated the split between the two departments as the actual problem, rather than the broken relay.",
      },
    ],
    sequence: [
      "The scoreboard's stuck eight has been ignored for years.",
      "Yusuf asks the caretaker why it is not fixed.",
      "Mr. Petrelli explains that neither department considers it theirs.",
      "Yusuf emails both departments on one message.",
      "It is repaired that afternoon, and nobody notices at the next game.",
    ],
    vocabulary: [
      {
        word: "relay",
        meaning: "a small electrical switch inside a device",
        wrongMeanings: [
          "a race run by a team",
          "a message passed along",
          "a spare scoreboard",
        ],
        context: "It is the relay behind the eight.",
        multipleMeaning: true,
      },
      {
        word: "outcome",
        meaning: "the way something turns out",
        wrongMeanings: ["a way out of a building", "a loud complaint", "a final score"],
        context: "which Yusuf decided was the correct outcome",
      },
      {
        word: "copying",
        meaning: "sending someone the same message as well",
        wrongMeanings: [
          "writing something out twice",
          "imitating what someone does",
          "printing a document",
        ],
        context: "copying the caretaker",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "in the tone of a man who had explained this before",
        kind: "idiom",
        meaning: "he was tired of the question and had given up expecting it to change anything",
        literalReading: "he had literally given this exact explanation on an earlier occasion",
      },
    ],
    notInText: [
      "Yusuf paid for the part himself.",
      "Mr. Petrelli refused to help.",
      "The scoreboard broke again the following week.",
      "The school bought a new scoreboard.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 6
   * ---------------------------------------------------------------- */
  {
    id: "g6.the-recount",
    grade: 6,
    genre: "literary",
    title: "The Recount",
    text: `Elena lost the student council election by four votes, and asked for a recount the way you ask for a glass of water — as an ordinary thing a person is entitled to.

Ms. Ferreira agreed at once, which Elena had not expected. They counted in the empty classroom after school, the two of them and Aditi, who had won and who had insisted on being there.

It took forty minutes. Ms. Ferreira read each ballot aloud, Aditi made a tally on the board, and Elena watched the tally rather than the ballots, because watching the ballots would have looked like she did not trust anyone, and she did. Twice a ballot was ambiguous — a tick that sat between two names — and twice all three of them looked at it and agreed, without much discussion, that it could not be counted. Elena was the one who said so first, both times.

The second count gave the same result. Elena had known it would. She had counted them once already, in her head, from the announced totals, and arithmetic does not change overnight.

"Then why ask?" Aditi said afterwards, not unkindly. They were walking out together because they lived in the same direction and always had.

"Because next year somebody is going to lose by two votes and want a recount," Elena said, "and they are going to be told that we do not do that here. Now we do."

Aditi thought about this for most of the walk. At the corner where they split she said, "You could have just told me that. You did not have to actually lose first."

"I did have to," Elena said. "You cannot ask for a recount you do not need. It only counts as a rule if somebody uses it when it matters to them."

Aditi's first act as president, in October — before the fundraiser, before anything anyone had campaigned on — was to write the recount procedure into the council's constitution. She named it after nobody. Elena thought that was exactly right, and told her so, and meant it.`,
    elements: {
      characters: ["Elena", "Aditi", "Ms. Ferreira"],
      setting: "a school after a student council election, over the autumn",
      problem:
        "There is no established right to a recount, and Elena has just lost narrowly",
      solution:
        "Elena requests one she knows will not change the result, which establishes the precedent, and Aditi writes it into the constitution",
      narrator: "someone outside the story who can tell what Elena thinks",
      pointOfView: "third person",
    },
    theme:
      "A right that has never been used is not yet a right; someone has to claim it first, at their own cost.",
    perspectives: [
      {
        character: "Elena",
        view: "She saw the recount as a precedent worth setting for whoever comes next, not as a chance to win.",
      },
      {
        character: "Aditi at first",
        view: "She could not see the point of a recount that would not change anything.",
      },
      {
        character: "Aditi later",
        view: "She understood it well enough to write the procedure into the constitution and leave Elena's name off it.",
      },
    ],
    sequence: [
      "Elena loses the election by four votes and asks for a recount.",
      "The three of them recount after school and get the same result.",
      "Aditi asks why Elena bothered.",
      "Elena explains that a rule only exists once somebody uses it.",
      "Aditi writes the recount procedure into the constitution, naming it after nobody.",
    ],
    vocabulary: [
      {
        word: "entitled",
        meaning: "having a right to something",
        wrongMeanings: [
          "given a title or name",
          "expecting special treatment",
          "written at the top of a page",
        ],
        context: "an ordinary thing a person is entitled to",
        multipleMeaning: true,
      },
      {
        word: "constitution",
        meaning: "the written rules by which a group governs itself",
        wrongMeanings: [
          "a person's general health",
          "the make-up of a substance",
          "a meeting of the council",
        ],
        context: "to write the recount procedure into the council's constitution",
        multipleMeaning: true,
      },
      {
        word: "precedent",
        meaning: "an earlier case that sets the pattern for later ones",
        wrongMeanings: [
          "the person in charge",
          "something that happens beforehand by chance",
          "a formal apology",
        ],
        context: "It only counts as a rule if somebody uses it when it matters to them.",
      },
    ],
    figurative: [
      {
        phrase: "the way you ask for a glass of water",
        kind: "simile",
        meaning: "without drama, as though it were obviously reasonable",
        literalReading: "she asked for the recount while thirsty",
      },
      {
        phrase: "She named it after nobody",
        kind: "idiom",
        meaning: "she deliberately left Elena's name off the rule so it belonged to everyone",
        literalReading: "she gave the rule the name Nobody",
      },
    ],
    notInText: [
      "The recount changed the result.",
      "Aditi and Elena stopped being friends.",
      "Ms. Ferreira refused the recount at first.",
      "Elena ran again the following year.",
    ],
  },
  {
    id: "g6.instructions",
    grade: 6,
    genre: "poetry",
    title: "Instructions for the Next Tenant",
    text: `The third stair complains. Step nearer the wall.
The kitchen window sticks in August only.
There is a nail behind the door for the coat
You will buy in October and not before.

The neighbour on the left is loud on Sundays.
The neighbour on the right will take a parcel in
And never mention it, and you will find it
Leaning on your door, and never know who.

The radiator knocks. It is not broken.
The garden looks like nothing until May.
The previous tenant left the shelf. Keep it.
Everyone here leaves something. That is the rent.

I am taking the curtains and the kettle.
I am leaving the light above the sink,
Which is too much trouble to remove
And is, in any case, the best thing here.`,
    stanzas: 4,
    linesPerStanza: 4,
    theme:
      "What we pass on to the people who come after us is usually small, practical and unnamed.",
    figurative: [
      {
        phrase: "The third stair complains",
        kind: "personification",
        meaning: "the stair creaks when stepped on",
        literalReading: "the stair is voicing an objection",
      },
      {
        phrase: "Everyone here leaves something. That is the rent.",
        kind: "metaphor",
        meaning: "what you contribute to a place is the real price of living there",
        literalReading: "the landlord accepts objects instead of money",
      },
      {
        phrase: "The garden looks like nothing until May",
        kind: "hyperbole",
        meaning: "the garden is unremarkable for most of the year and then is not",
        literalReading: "the garden is invisible for eight months",
      },
    ],
    vocabulary: [
      {
        word: "tenant",
        meaning: "a person who rents a place to live",
        wrongMeanings: [
          "the owner of a building",
          "a person who repairs houses",
          "a next-door neighbour",
        ],
        context: "the title: Instructions for the Next Tenant",
      },
      {
        word: "in any case",
        meaning: "whatever else is true",
        wrongMeanings: [
          "inside a container",
          "if something goes wrong",
          "at the same time",
        ],
        context: "And is, in any case, the best thing here.",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "The speaker is buying the flat.",
      "The neighbours are all unfriendly.",
      "The radiator needs repairing.",
      "The speaker has lived there for twenty years.",
    ],
  },
  {
    id: "g6.streetlights",
    grade: 6,
    genre: "informational",
    title: "The Argument About Streetlights",
    text: `When a city replaces its streetlights, it is not simply buying newer bulbs. It is choosing, usually without saying so, between two things people want and cannot both have in full.

The older orange lamps that lit most streets for fifty years are sodium. They are inefficient, they waste light upwards into the sky, and they render colour so badly that a security camera under one cannot reliably distinguish a red car from a brown one.

LEDs fix all three. They use roughly half the electricity, they can be aimed, and they show colour accurately. Almost every city that has switched reports lower bills within three years.

The difficulty is the light itself. Early LED replacements were installed at 4000 kelvin — a cold, blue-white light. Blue wavelengths scatter more in the atmosphere, so the sky glow above those cities got worse rather than better, despite the fixtures pointing down. Blue light also suppresses melatonin more strongly than orange does, which is the mechanism by which light at night interferes with sleep.

There is a further cost, harder to price, that does not appear on any invoice. A street lit at 4000K photographs as a different place than the same street at 2700K: harder, flatter, more like a car park than a road people live beside. Residents in several cities described the change in almost identical words without having read one another's complaints, which is the kind of agreement that usually means something real is being described rather than something imagined separately by a great many people at once.

Cities that switched early and cheaply have, in a number of cases, replaced their replacements. Warmer 2700K LEDs cost slightly more and save slightly less electricity. They are also, on the evidence available, the ones a city does not have to install twice.

The general shape of this is not unique to lighting. A decision framed as a technical upgrade turns out to contain a choice about what a street is for at eleven at night, and that choice is a great deal easier to make deliberately at the start than to discover, years later, from the complaints.`,
    centralIdea:
      "Replacing streetlights is not a purely technical upgrade: the colour of the light involves a trade-off between efficiency, sky glow and sleep.",
    supportingDetails: [
      "Sodium lamps waste light upwards and render colour poorly.",
      "LEDs use roughly half the electricity and can be aimed.",
      "Blue-white light at 4000K scatters more and worsens sky glow.",
      "Warmer 2700K LEDs cost more and save less electricity.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "Cities should choose the colour of their streetlights deliberately rather than treating the switch as a purely technical decision.",
    opinionEvidence: [
      "Cities that switched early and cheaply have, in a number of cases, replaced their replacements.",
      "They are also, on the evidence available, the ones a city does not have to install twice.",
      "A decision framed as a technical upgrade turns out to contain a choice about what a street is for at eleven at night, and that choice is a great deal easier to make deliberately at the start than to discover, years later, from the complaints.",
    ],
    textFeatures: [
      {
        feature: "table",
        purpose: "sets numbers side by side so they can be compared exactly",
        notPurpose: [
          "shows where something is located",
          "explains what a photograph shows",
          "lists the sources a writer used",
        ],
      },
      {
        feature: "sidebar",
        purpose: "holds related information that would interrupt the main text",
        notPurpose: [
          "gives the order events happened in",
          "defines every technical term used",
          "summarises the writer's conclusion",
        ],
      },
    ],
    vocabulary: [
      {
        word: "render",
        meaning: "show or represent",
        wrongMeanings: [
          "tear apart",
          "melt down for fat",
          "provide a service",
        ],
        context: "they render colour so badly",
        multipleMeaning: true,
      },
      {
        word: "scatter",
        meaning: "spread out in many directions",
        wrongMeanings: [
          "throw seeds on the ground",
          "run away in fear",
          "grow dimmer with distance",
        ],
        context: "Blue wavelengths scatter more in the atmosphere",
        multipleMeaning: true,
      },
      {
        word: "suppresses",
        meaning: "holds back or reduces",
        wrongMeanings: [
          "presses down physically",
          "keeps a secret",
          "increases sharply",
        ],
        context: "Blue light also suppresses melatonin more strongly",
      },
    ],
    figurative: [
      {
        phrase: "replaced their replacements",
        kind: "idiom",
        meaning: "they had to do the whole job twice",
        literalReading: "they swapped one spare part for another spare part",
      },
    ],
    notInText: [
      "LEDs use more electricity than sodium lamps.",
      "Sky glow is caused by pointing lights downwards.",
      "All cities now use 2700K lighting.",
      "Sodium lamps are better for security cameras.",
    ],
  },
];
