import type { Passage } from "./types";

/**
 * Passages for grades 5 and 6.
 *
 * By this point the reading test expects a student to track an argument, not
 * only a plot. The informational texts here therefore make a claim and back
 * it — and one of them makes a claim the reader is meant to weigh rather than
 * accept, because "identify the author's opinion" is a different skill from
 * "agree with the author".
 */

export const G5_G6_PASSAGES: Passage[] = [
  /* ---------------------------------------------------------------- *
   * Grade 5 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g5.violin",
    grade: 5,
    genre: "literary",
    title: "The Loaner",
    text: `The school violins lived in a cupboard behind the music room, and every September Ms. Ferrante handed them out to whoever could not buy their own. Everybody knew which instruments those were. The loaners had a strip of masking tape on the back with a number written in marker.

Josefina got number 11. It had a scratch across the front the shape of a river, and the case smelled like a basement.

For two weeks she carried it under her arm with the numbered side turned in.

Then Ms. Ferrante played it. She was demonstrating something about bow pressure and she picked up whichever violin was nearest, which happened to be number 11, and for about forty seconds the room went completely silent in a way that rooms rarely do.

"That is a good instrument," she said afterwards, mostly to herself, running a thumb over the scratch. "Someone played this one hard for a long time."

Josefina thought about that for a week. It had not occurred to her that the scratch was evidence of something rather than damage. Somebody had owned this violin before the school did. Somebody had played it enough, and hard enough, to leave a mark across the front of it, and whoever they were, they had got good on it.

She started noticing other things. The bridge had been shaped by hand, not stamped out. There were two small holes near the tailpiece where a fine tuner had once been fitted and later removed. The case was ugly, but the case was not the instrument.

Number 7, which belonged to a girl in the row ahead, had no scratches on it at all.

In October she stopped turning the number in. By November she had stopped noticing it. In May, when she played her audition piece, the thing the panel wrote down was *warm tone, unusually good projection for the size*, and none of them asked where the violin had come from.`,
    elements: {
      characters: ["Josefina", "Ms. Ferrante"],
      setting: "a school music room over the course of a school year",
      problem:
        "Josefina is ashamed of the borrowed, scratched violin she has been assigned",
      solution:
        "Her teacher's remark makes her see the scratch as evidence of the instrument's history, and she stops hiding it",
      narrator: "someone outside the story who can tell what Josefina thinks",
      pointOfView: "third person",
    },
    theme:
      "How you see something can change completely without the thing itself changing at all.",
    perspectives: [
      {
        character: "Josefina in September",
        view: "She saw the number and the scratch as marks of not being able to afford her own violin.",
      },
      {
        character: "Ms. Ferrante",
        view: "She heard the instrument's quality and read the scratch as a sign it had been well used.",
      },
    ],
    sequence: [
      "Josefina is assigned loaner violin number 11 in September.",
      "For two weeks she hides the numbered side under her arm.",
      "Ms. Ferrante happens to play number 11 during a demonstration.",
      "The teacher remarks that it is a good instrument that has been played hard.",
      "Josefina stops hiding the number, and in May the audition panel praises the tone.",
    ],
    vocabulary: [
      {
        word: "evidence",
        meaning: "something that shows a fact is true",
        wrongMeanings: [
          "damage that needs repairing",
          "a decoration added on purpose",
          "a mistake made by the maker",
        ],
        context: "the scratch was evidence of something rather than damage",
      },
      {
        word: "projection",
        meaning: "how well a sound carries to a listener",
        wrongMeanings: [
          "an image thrown onto a screen",
          "a guess about what will happen",
          "the shape of the instrument's body",
        ],
        context: "unusually good projection for the size",
        multipleMeaning: true,
      },
      {
        word: "demonstrating",
        meaning: "showing how something is done",
        wrongMeanings: ["protesting about something", "practising alone", "testing for damage"],
        context: "She was demonstrating something about bow pressure",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "a scratch across the front the shape of a river",
        kind: "simile",
        meaning: "the scratch was long and winding",
        literalReading: "there was water running across the violin",
      },
      {
        phrase: "the room went completely silent in a way that rooms rarely do",
        kind: "hyperbole",
        meaning: "the playing was striking enough to stop everyone talking at once",
        literalReading: "the room had never been silent before",
      },
    ],
    notInText: [
      "Josefina bought her own violin later in the year.",
      "Ms. Ferrante gave Josefina a better instrument.",
      "The audition panel knew the violin was a loaner.",
      "Josefina repaired the scratch on the violin.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 5 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g5.everglades",
    grade: 5,
    genre: "informational",
    title: "The River That Does Not Look Like One",
    text: `The Everglades is a river. That statement surprises most people, because it does not look like a river. It has no banks you can stand between and no current you can see. It is sixty miles wide, six inches deep in many places, and it moves about half a mile a day.

For most of the twentieth century, Florida treated it as a swamp to be drained. Between 1948 and 1971 engineers built roughly 1,400 miles of canals and levees to push water off the land and out to sea, opening ground for farms and cities. The project worked exactly as designed. That turned out to be the problem.

Water that once spread slowly southwards now left quickly through straight channels. Wading bird numbers fell by around ninety per cent. Saltwater pushed inland into wells. The sawgrass marshes that depend on a slow, seasonal flood dried in the wrong months and flooded in the wrong months.

The consequences reached further than the marsh. Florida Bay, at the southern tip, depends on fresh water arriving from the Everglades and mixing with the sea. When that flow was cut, the bay grew saltier than the sea itself in places, and the sea grass that carpeted it died across tens of thousands of acres. Sea grass is where young fish shelter. The fishery followed the grass.

Restoration began in 2000 and is now among the largest environmental projects ever attempted anywhere. Much of the work involves removing structures that were themselves enormous engineering achievements. Twenty-three miles of the Tamiami Trail, a road built across the flow in 1928, have been raised onto bridges so water can pass underneath again.

There is a lesson in the timeline that is easy to miss. The draining took about twenty-five years. The repair has taken longer than that already, and is not finished. It is generally quicker to change how a system works than to change it back.`,
    centralIdea:
      "The Everglades is a slow-moving river that was damaged by drainage projects, and restoring it is proving far harder and slower than the damage was.",
    supportingDetails: [
      "The Everglades is sixty miles wide and only inches deep in places.",
      "Engineers built about 1,400 miles of canals and levees between 1948 and 1971.",
      "Wading bird numbers fell by around ninety per cent.",
      "Twenty-three miles of the Tamiami Trail have been raised onto bridges.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "Undoing damage to a natural system takes far longer than causing it.",
    opinionEvidence: [
      "The draining took about twenty-five years.",
      "The repair has taken longer than that already, and is not finished.",
      "Much of the work involves removing structures that were themselves enormous engineering achievements.",
    ],
    textFeatures: [
      {
        feature: "map",
        purpose: "shows where places are and how they are positioned in relation to each other",
        notPurpose: [
          "shows the order in which events happened",
          "explains the meaning of technical terms",
          "compares two quantities as bars",
        ],
      },
      {
        feature: "glossary",
        purpose: "gives the meanings of specialist words used in the text",
        notPurpose: [
          "lists the sources the author used",
          "shows a photograph with an explanation",
          "summarises each section in one line",
        ],
      },
    ],
    vocabulary: [
      {
        word: "levees",
        meaning: "raised banks built to hold water back",
        wrongMeanings: [
          "channels dug to carry water away",
          "pumps that move water uphill",
          "bridges built across a river",
        ],
        context: "engineers built roughly 1,400 miles of canals and levees",
      },
      {
        word: "restoration",
        meaning: "the work of returning something to its earlier condition",
        wrongMeanings: [
          "the study of how a system works",
          "the building of something entirely new",
          "the protection of an area from visitors",
        ],
        context: "Restoration began in 2000",
      },
      {
        word: "current",
        meaning: "the movement of water in one direction",
        wrongMeanings: [
          "happening at the present time",
          "a flow of electricity",
          "a type of small fruit",
        ],
        context: "no current you can see",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "The project worked exactly as designed. That turned out to be the problem.",
        kind: "idiom",
        meaning: "the drainage succeeded at its goal, and the goal itself was the mistake",
        literalReading: "the engineers made a technical error in their design",
      },
    ],
    notInText: [
      "The Everglades restoration was finished in 2000.",
      "The canals were built by accident.",
      "Wading bird numbers have returned to normal.",
      "The Tamiami Trail was closed permanently.",
    ],
    pairedWith: "g5.python",
    sharedWithPair: [
      "Both texts are about human decisions that changed the Everglades.",
      "Both texts describe problems that are far easier to start than to reverse.",
    ],
    uniqueToThis: [
      "Describes the canal and levee system built in the twentieth century.",
      "Explains that the Everglades is technically a river.",
    ],
  },
  {
    id: "g5.python",
    grade: 5,
    genre: "informational",
    title: "The Snake That Should Not Be Here",
    text: `Burmese pythons are native to Southeast Asia. They now live, breed and hunt across more than a thousand square miles of South Florida.

Nobody released them deliberately as a group. They arrived a few at a time, as pets that grew larger than their owners expected, and possibly in a rush after a storm destroyed a breeding facility in 1992. A handful of animals became a population because South Florida happens to offer a python everything it needs: heat, water, cover and prey that has no idea what it is looking at.

That last point matters most. Native marsh rabbits, raccoons and opossums evolved alongside alligators and panthers. They have inherited responses to those animals. They have no inherited response to a fifteen-foot constrictor, because until recently there was no reason to have one. Surveys along one road in Everglades National Park found raccoon sightings down 99.3 per cent and marsh rabbit sightings down to zero.

There is a second reason the population grew so fast. A female Burmese python lays between twenty and a hundred eggs at a time, guards them until they hatch, and then leaves. The hatchlings are already about two feet long and fully capable of hunting. A species that arrives in small numbers but reproduces like that does not stay rare for long.

Florida now runs a paid removal programme and an annual competition. Together these take several thousand snakes. Estimates of the population run into the tens of thousands, and pythons are extraordinarily difficult to see: in one study, searchers walking directly over pythons found them about one time in every three.

Removal is worth doing. It is not, and nobody involved claims it is, a solution. The realistic goal is to hold the edges of the range while researchers look for something better.`,
    centralIdea:
      "Burmese pythons have established themselves in South Florida because native animals have no defences against them, and removal efforts can only slow the spread rather than stop it.",
    supportingDetails: [
      "Pythons now live across more than a thousand square miles of South Florida.",
      "Native prey animals have no inherited response to a large constrictor.",
      "Raccoon sightings on one road fell by 99.3 per cent.",
      "Searchers walking directly over pythons found them only about a third of the time.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "Removal programmes are worthwhile but cannot solve the problem on their own.",
    opinionEvidence: [
      "Together these take several thousand snakes.",
      "Estimates of the population run into the tens of thousands, and pythons are extraordinarily difficult to see: in one study, searchers walking directly over pythons found them about one time in every three.",
      "The realistic goal is to hold the edges of the range while researchers look for something better.",
    ],
    vocabulary: [
      {
        word: "native",
        meaning: "naturally living in a particular place from the beginning",
        wrongMeanings: [
          "brought in from somewhere else",
          "raised by people as a pet",
          "protected by law",
        ],
        context: "Burmese pythons are native to Southeast Asia.",
      },
      {
        word: "inherited",
        meaning: "passed down from earlier generations",
        wrongMeanings: [
          "learned by watching others",
          "taught by scientists",
          "developed during one animal's lifetime",
        ],
        context: "They have inherited responses to those animals.",
        multipleMeaning: true,
      },
      {
        word: "range",
        meaning: "the area where a kind of animal is found",
        wrongMeanings: [
          "the distance a snake can strike",
          "a row of mountains",
          "the difference between the largest and smallest",
        ],
        context: "hold the edges of the range",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "Pythons were deliberately released to control rabbits.",
      "The removal programme has ended the problem.",
      "Alligators cannot compete with pythons at all.",
      "Pythons are easy to spot in the marsh.",
    ],
    pairedWith: "g5.everglades",
    sharedWithPair: [
      "Both texts are about human decisions that changed the Everglades.",
      "Both texts describe problems that are far easier to start than to reverse.",
    ],
    uniqueToThis: [
      "Explains how the pythons first arrived in Florida.",
      "Describes why native prey animals have no defence against them.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 5 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g5.first-frost",
    grade: 5,
    genre: "poetry",
    title: "Inventory, October",
    text: `The maple has decided.
It spent the summer green
On the understanding
That green was permanent.

Now it is counting losses
The way a shopkeeper does,
Slowly, out loud,
One leaf at a time.

I want to tell it something
Reassuring and false —
That nothing is being taken,
That this is only sleep.

But the maple is not frightened.
The maple has done this before.
It is only I who am standing here
Doing arithmetic in the cold.`,
    stanzas: 4,
    linesPerStanza: 4,
    theme:
      "The fear of loss often belongs to the person watching rather than to the thing that is changing.",
    figurative: [
      {
        phrase: "It is counting losses the way a shopkeeper does",
        kind: "simile",
        meaning: "the tree drops its leaves slowly and steadily, one after another",
        literalReading: "the tree is running a shop and keeping accounts",
      },
      {
        phrase: "The maple has decided",
        kind: "personification",
        meaning: "the tree has begun losing its leaves as though it had made a choice",
        literalReading: "the tree thought about it and made up its mind",
      },
      {
        phrase: "Doing arithmetic in the cold",
        kind: "metaphor",
        meaning: "the speaker is the one tallying up what is being lost",
        literalReading: "the speaker is solving maths problems outdoors",
      },
    ],
    vocabulary: [
      {
        word: "inventory",
        meaning: "a full count of what is there",
        wrongMeanings: [
          "something newly invented",
          "a story told in verse",
          "the entrance to a building",
        ],
        context: "the title: Inventory, October",
      },
      {
        word: "reassuring",
        meaning: "meant to stop someone worrying",
        wrongMeanings: ["completely truthful", "said very loudly", "written down carefully"],
        context: "Reassuring and false",
      },
    ],
    notInText: [
      "The maple loses all its leaves in a single night.",
      "The speaker plants a new tree.",
      "The poem takes place in spring.",
      "The maple will not grow leaves again.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 6 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g6.debate",
    grade: 6,
    genre: "literary",
    title: "The Side You Are Given",
    text: `The rule at the county tournament was that you did not choose. Twenty minutes before each round the judges announced the motion and flipped a coin, and you argued whichever side the coin gave you.

Amara thought this was ridiculous, and said so, at length, on the bus.

"You are asking people to argue for things they do not believe," she told Mr. Achebe. "That is just training people to lie well."

"Is it," he said. It was not really a question. He did that.

"You are asking them to find out whether they have a reason," he said. "Those are not the same thing, and most people never check."

Amara said that sounded like something a teacher would say to win an argument. Mr. Achebe agreed that it did.

Her first round was on whether schools should require uniforms. She got *for*. She was against uniforms and had been since she was eight, on grounds she considered obvious: that what you wear is yours, and that a school which takes that away is telling you something about how much of you it thinks it owns.

She spent the twenty minutes furious. Then, because losing was worse than being furious, she started writing.

What surprised her was how much there was. Cost, for families buying five outfits instead of twenty. The morning argument that does not happen. A friend of hers, two years ago, who had stopped coming to school for reasons that had turned out to be about clothes.

What surprised her second was that the judge's comment sheet said her strongest moment was the one where she had conceded a point to the other side. She had done it because she could not see a way round it. Apparently that had read as confidence.

She won the round. She was not pleased about it.

On the bus home she said, "I still think uniforms are a bad idea."

"Good," said Mr. Achebe.

"But I could not have said why before. I only knew that I did not like them."

"That," he said, "is the entire point of the coin."`,
    elements: {
      characters: ["Amara", "Mr. Achebe"],
      setting: "a school debate tournament and the bus journeys either side of it",
      problem:
        "Amara objects to being made to argue a position she does not hold",
      solution:
        "Arguing the opposing side forces her to understand her own position properly, which she recognises afterwards",
      narrator: "someone outside the story who can tell what Amara thinks",
      pointOfView: "third person",
    },
    theme:
      "You do not really understand your own position until you can state the strongest case against it.",
    perspectives: [
      {
        character: "Amara before the round",
        view: "She believed arguing an opposing side was dishonest and taught people to lie convincingly.",
      },
      {
        character: "Mr. Achebe",
        view: "He believed the coin forces students to find reasons rather than rely on preferences.",
      },
      {
        character: "Amara after the round",
        view: "She still opposed uniforms, but now understood why, rather than only that she disliked them.",
      },
    ],
    sequence: [
      "Amara objects on the bus to the rule that debaters cannot choose their side.",
      "The coin gives her the side she disagrees with.",
      "She spends the preparation time angry, then starts finding arguments.",
      "She discovers there is more evidence than she expected, and wins the round.",
      "On the bus home she realises she now knows why she holds her own view.",
    ],
    vocabulary: [
      {
        word: "motion",
        meaning: "the statement being debated",
        wrongMeanings: [
          "movement from one place to another",
          "a hand signal made by a judge",
          "the order in which speakers go",
        ],
        context: "the judges announced the motion and flipped a coin",
        multipleMeaning: true,
      },
      {
        word: "grounds",
        meaning: "reasons for holding a view",
        wrongMeanings: [
          "the land around a building",
          "the floor of a room",
          "what is left after coffee is made",
        ],
        context: "on grounds she considered obvious",
        multipleMeaning: true,
      },
      {
        word: "at length",
        meaning: "for a long time and in detail",
        wrongMeanings: ["finally, after a delay", "measured from end to end", "in a very loud voice"],
        context: "and said so, at length, on the bus",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "training people to lie well",
        kind: "hyperbole",
        meaning: "Amara is overstating her objection to make the point forcefully",
        literalReading: "the tournament is a school for dishonesty",
      },
    ],
    notInText: [
      "Amara changed her mind about uniforms.",
      "Mr. Achebe agreed that the rule was unfair.",
      "Amara lost the round she was assigned.",
      "The tournament changed its rule afterwards.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 6 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g6.citrus-greening",
    grade: 6,
    genre: "informational",
    title: "What Happened to Florida Orange Juice",
    text: `In the 1997–98 season Florida produced 244 million boxes of oranges. In 2023–24 it produced about 17 million. That is a decline of roughly ninety-three per cent, and almost all of it comes down to an insect the size of a grain of rice.

The Asian citrus psyllid carries a bacterium that causes huanglongbing, usually called citrus greening. An infected tree does not die immediately. It produces smaller fruit, then bitter fruit, then fruit that drops before ripening. The tree may stand for years, looking mostly normal, producing nothing worth harvesting.

The disease was confirmed in Florida in 2005, in a grove in Miami-Dade County. By 2015 it was in every commercial grove in the state.

It is worth pausing on how fast that is. Ten years is one generation of citrus trees. A grower who planted a healthy block in 2005, expecting it to bear fruit for thirty years, was watching it decline before it reached full production. Nothing was done wrong in that grove. The trees were simply standing in the path of something moving faster than they could grow.

What makes greening so difficult is the gap between infection and symptom, which can run to two years. A grower who removes visibly sick trees is removing the ones infected two years ago while the psyllids move through the ones infected last month. Control measures are always working on out-of-date information.

Several approaches are being tried: heat treatment, antibacterial injections, protective screen houses for young trees, and breeding or engineering resistant rootstock. Some show promise. None has yet restored a grove to what it was, and the screen houses only work until the tree is large enough to need planting out.

The economics are worth stating plainly. Growing oranges in Florida now costs roughly three times what it did in 2003, per box, while the yield per acre has fallen. A grower deciding whether to replant is not making an agricultural decision. They are making a financial one, weighing thirty years of uncertain fruit against a certain offer from a developer this year. For many the arithmetic has already answered it: the land is worth more with houses on it than with trees.`,
    centralIdea:
      "Citrus greening has cut Florida's orange production by more than ninety per cent, and the delay between infection and symptoms makes it extremely hard to control.",
    supportingDetails: [
      "Production fell from 244 million boxes in 1997–98 to about 17 million in 2023–24.",
      "The disease is spread by the Asian citrus psyllid and was confirmed in Florida in 2005.",
      "Infection can precede visible symptoms by up to two years.",
      "Growing costs have roughly tripled per box since 2003.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "For many growers the decision to stop replanting is now an economic one rather than an agricultural one.",
    opinionEvidence: [
      "Growing oranges in Florida now costs roughly three times what it did in 2003, per box, while the yield per acre has fallen.",
      "They are making a financial one, weighing thirty years of uncertain fruit against a certain offer from a developer this year.",
      "For many the arithmetic has already answered it: the land is worth more with houses on it than with trees.",
    ],
    textFeatures: [
      {
        feature: "table",
        purpose: "sets numbers side by side so they can be compared exactly",
        notPurpose: [
          "shows the order events happened in",
          "gives the meanings of specialist terms",
          "shows where something is located",
        ],
      },
      {
        feature: "diagram",
        purpose: "shows how the stages of a process follow one another",
        notPurpose: [
          "lists sources at the end of a text",
          "provides an opinion from an expert",
          "compares two places on a map",
        ],
      },
    ],
    vocabulary: [
      {
        word: "commercial",
        meaning: "run as a business to make money",
        wrongMeanings: [
          "advertised on television",
          "owned by the government",
          "open to the public to visit",
        ],
        context: "By 2015 it was in every commercial grove in the state.",
        multipleMeaning: true,
      },
      {
        word: "yield",
        meaning: "the amount produced",
        wrongMeanings: [
          "to give way to something",
          "the price something sells for",
          "the size of a piece of land",
        ],
        context: "while the yield per acre has fallen",
        multipleMeaning: true,
      },
      {
        word: "resistant",
        meaning: "able to withstand something without being harmed",
        wrongMeanings: [
          "unwilling to change",
          "grown in a laboratory",
          "protected by a fence",
        ],
        context: "breeding or engineering resistant rootstock",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "Control measures are always working on out-of-date information",
        kind: "metaphor",
        meaning: "by the time a sick tree is visible, the infection has already moved on",
        literalReading: "growers are reading old newspapers",
      },
    ],
    notInText: [
      "Citrus greening kills a tree within weeks.",
      "A cure for greening has been found.",
      "The psyllid was introduced deliberately.",
      "Florida still leads the country in orange production.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 6 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g6.map-of-the-town",
    grade: 6,
    genre: "poetry",
    title: "Map of the Town I Left",
    text: `The cartographers were thorough.
They marked the river's bend,
The county line, the water tower,
The road that does not end.

They did not mark the corner
Where the bus let out at four,
Or which of the identical houses
Had the loose board in the floor.

They gave the park its acreage.
They gave the school its name.
They could not give the difference
Between the swings — they look the same.

So I have drawn my own edition.
It is not to any scale.
It has one road, four corners,
And a hundred years of detail.`,
    stanzas: 4,
    linesPerStanza: 4,
    rhymeScheme: "ABCB",
    theme:
      "An accurate record and a meaningful one are not the same thing; what matters to a person rarely fits on an official map.",
    figurative: [
      {
        phrase: "a hundred years of detail",
        kind: "hyperbole",
        meaning: "the speaker's memories of the place are far richer than any map could hold",
        literalReading: "the speaker's map records a century of events",
      },
      {
        phrase: "The road that does not end",
        kind: "metaphor",
        meaning: "a road that runs out of the town and away, standing for leaving",
        literalReading: "an infinitely long road",
      },
      {
        phrase: "They could not give the difference between the swings",
        kind: "metaphor",
        meaning: "official records cannot capture personal significance",
        literalReading: "the mapmakers failed to measure two swings accurately",
      },
    ],
    vocabulary: [
      {
        word: "cartographers",
        meaning: "people who make maps",
        wrongMeanings: [
          "people who drive delivery carts",
          "people who write local history",
          "people who survey buildings for damage",
        ],
        context: "The cartographers were thorough.",
      },
      {
        word: "acreage",
        meaning: "the area of a piece of land measured in acres",
        wrongMeanings: [
          "the age of a place",
          "the number of people living there",
          "the height above sea level",
        ],
        context: "They gave the park its acreage.",
      },
      {
        word: "edition",
        meaning: "one particular version of something published",
        wrongMeanings: [
          "a mathematical operation",
          "something added on afterwards",
          "a piece of advice",
        ],
        context: "So I have drawn my own edition.",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "The speaker still lives in the town.",
      "The cartographers made mistakes in their measurements.",
      "The speaker's map is more accurate than the official one.",
      "The town has changed since the speaker left.",
    ],
  },
];
