import type { Passage } from "./types";

/**
 * Passages for grades 3 and 4.
 *
 * From grade 3 the reading test starts asking what a text implies rather than
 * what it states, so these passages are written to support inference: the
 * central idea is never a sentence you can lift out whole, and the character
 * who is wrong about something is never told they are wrong.
 */

export const G3_G4_PASSAGES: Passage[] = [
  /* ---------------------------------------------------------------- *
   * Grade 3 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g3.bird-count",
    grade: 3,
    genre: "literary",
    title: "The Bird Count",
    text: `Every January, Nadia's neighbourhood counted birds. Volunteers walked the same routes, wrote down every bird they saw, and sent the numbers to a university.

Nadia had wanted to help since she was six. This year she was nine, which was old enough.

Her partner was Mr. Delgado, who had done the count for nineteen years. He walked slowly and stopped often, which Nadia found frustrating at first. She wanted to cover ground.

"Six house sparrows," he said, without seeming to look up.

Nadia squinted at the hedge. She could see leaves. She could see a fence. Then something small shifted, and there were sparrows everywhere, as if the hedge had been full of them the entire time.

"How did you do that?" she asked.

"I did not see them," Mr. Delgado said. "I heard them. Then I looked where the sound was."

For the rest of the morning Nadia tried it his way. She stopped walking. She closed her eyes for a moment at each stop.

By noon her list had forty-one birds on it. Mr. Delgado's had forty-three.

"Not bad," he said, "for nineteen years less practice."`,
    elements: {
      characters: ["Nadia", "Mr. Delgado"],
      setting: "a neighbourhood on a January morning during an annual bird count",
      problem: "Nadia cannot spot the birds and is frustrated by how slowly her partner works",
      solution: "She learns to listen first and look second, and her count nearly matches his",
      narrator: "someone outside the story who can tell what Nadia thinks and feels",
      pointOfView: "third person",
    },
    theme: "Learning from someone experienced often means changing how you do something, not just trying harder.",
    perspectives: [
      {
        character: "Nadia at the start",
        view: "She thought covering more ground would mean finding more birds.",
      },
      {
        character: "Mr. Delgado",
        view: "He knew that standing still and listening finds more birds than walking fast.",
      },
    ],
    sequence: [
      "Nadia joins the neighbourhood bird count for the first time.",
      "She is paired with Mr. Delgado, who works slowly.",
      "He identifies six sparrows she cannot see.",
      "He explains that he heard them before he looked.",
      "Nadia adopts his method and ends the morning with forty-one birds.",
    ],
    vocabulary: [
      {
        word: "volunteers",
        meaning: "people who choose to do a job without being paid",
        wrongMeanings: [
          "people who are paid to do a job",
          "scientists who work at a university",
          "people who live in the same street",
        ],
        context: "Volunteers walked the same routes, wrote down every bird they saw",
      },
      {
        word: "frustrating",
        meaning: "annoying because it stops you doing what you want",
        wrongMeanings: ["frightening", "confusing to understand", "boring and slow to watch"],
        context: "He walked slowly and stopped often, which Nadia found frustrating at first.",
      },
      {
        word: "squinted",
        meaning: "narrowed her eyes to see more clearly",
        wrongMeanings: ["turned away", "shouted loudly", "pointed at something"],
        context: "Nadia squinted at the hedge.",
      },
    ],
    figurative: [
      {
        phrase: "as if the hedge had been full of them the entire time",
        kind: "simile",
        meaning: "the birds had been there all along and Nadia simply had not noticed them",
        literalReading: "the hedge was somehow filled with birds at that exact moment",
      },
    ],
    notInText: [
      "Mr. Delgado had taught Nadia before this day.",
      "Nadia counted more birds than Mr. Delgado.",
      "The bird count happened in the summer.",
      "Nadia gave up before the morning ended.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 3 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g3.springs",
    grade: 3,
    genre: "informational",
    title: "The Water Under Florida",
    text: `Most of Florida sits on limestone, a soft rock full of holes. Rain sinks through the sandy soil, collects in those holes, and forms an enormous underground store of water called an aquifer.

In some places the ground opens and this water comes back to the surface. That is a spring. Florida has more first-magnitude springs — the largest kind — than anywhere else on Earth.

Spring water stays at about 22 degrees Celsius all year. It does not warm up in August or cool down in January. That steady temperature is why manatees crowd into springs during cold snaps and why swimmers find the water shockingly cold in summer and surprisingly warm in winter. The water has not changed. The air has.

The aquifer is also where most Floridians get their drinking water. What people pour onto lawns and roads does not simply disappear. It sinks through the same sandy soil, into the same limestone, and arrives in the same water people later drink.

A spring, then, is not only a nice place to swim. It is a window into the water supply, and what you can see coming out of it is a fair report of what has been going in.`,
    centralIdea:
      "Florida's springs come from an underground store of water that people also drink from, so what happens on the surface affects it.",
    supportingDetails: [
      "Florida sits on limestone full of holes that collect rainwater.",
      "Spring water stays at about 22 degrees Celsius all year.",
      "Manatees crowd into springs during cold weather.",
      "Most Floridians get their drinking water from the aquifer.",
    ],
    authorPurpose: "to inform",
    authorOpinion: "What people put on the ground matters, because it ends up in the water they drink.",
    opinionEvidence: [
      "What people pour onto lawns and roads does not simply disappear.",
      "It sinks through the same sandy soil, into the same limestone, and arrives in the same water people later drink.",
      "It is a window into the water supply, and what you can see coming out of it is a fair report of what has been going in.",
    ],
    textFeatures: [
      {
        feature: "diagram",
        purpose: "shows how the parts of something fit together or how a process works",
        notPurpose: [
          "lists the meanings of technical words",
          "tells you which page a topic is on",
          "gives the author's name and background",
        ],
      },
      {
        feature: "bold word",
        purpose: "marks a key term that the reader is meant to notice and learn",
        notPurpose: [
          "shows that the writer disagrees with something",
          "indicates a quotation from another book",
          "means the word is difficult to pronounce",
        ],
      },
    ],
    vocabulary: [
      {
        word: "aquifer",
        meaning: "an underground layer of rock that holds water",
        wrongMeanings: ["a river that runs above ground", "a machine that cleans water", "a very deep lake"],
        context: "forms an enormous underground store of water called an aquifer",
      },
      {
        word: "steady",
        meaning: "staying the same, not changing",
        wrongMeanings: ["moving very quickly", "extremely cold", "gradually rising"],
        context: "That steady temperature is why manatees crowd into springs",
      },
      {
        word: "spring",
        meaning: "a place where underground water comes to the surface",
        wrongMeanings: [
          "the season after winter",
          "a coiled piece of metal",
          "to jump upwards suddenly",
        ],
        context: "In some places the ground opens and this water comes back to the surface. That is a spring.",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "a window into the water supply",
        kind: "metaphor",
        meaning: "a spring lets you see the condition of water you cannot otherwise see",
        literalReading: "there is a glass window built into the spring",
      },
    ],
    notInText: [
      "Spring water is heated by the sun in summer.",
      "Florida has fewer springs than other states.",
      "The aquifer is filled by rivers running into it.",
      "Manatees avoid springs in cold weather.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 3 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g3.library-card",
    grade: 3,
    genre: "poetry",
    title: "Library Card",
    text: `It is only a rectangle,
Thin as a leaf,
Printed with numbers
And my name underneath.

But hand it across
And the desk becomes a door,
And whatever I am carrying
I did not have before.

A card for a boat.
A card for a war.
A card for the bottom
Of the ocean floor.

It is only a rectangle.
It weighs almost nought.
It is the cheapest thing I own
And the most I ever bought.`,
    stanzas: 4,
    linesPerStanza: 4,
    rhymeScheme: "ABCB",
    theme: "A small ordinary object can give access to something far larger than itself.",
    figurative: [
      {
        phrase: "the desk becomes a door",
        kind: "metaphor",
        meaning: "the library desk is the way through to everything the books contain",
        literalReading: "the desk physically turns into a door",
      },
      {
        phrase: "Thin as a leaf",
        kind: "simile",
        meaning: "the card is very thin and light",
        literalReading: "the card is made from a leaf",
      },
      {
        phrase: "the cheapest thing I own and the most I ever bought",
        kind: "hyperbole",
        meaning: "the card costs nothing but gives more than anything the speaker has paid for",
        literalReading: "the speaker paid a large amount of money for the card",
      },
    ],
    vocabulary: [
      {
        word: "rectangle",
        meaning: "a flat shape with four straight sides and four square corners",
        wrongMeanings: ["a round flat object", "a thick book", "a small box"],
        context: "It is only a rectangle, thin as a leaf",
      },
    ],
    notInText: [
      "The speaker has lost the card.",
      "The library is closing down.",
      "The card cost a lot of money.",
      "The speaker prefers boats to books.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 4 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g4.relay",
    grade: 4,
    genre: "literary",
    title: "The Handoff",
    text: `Priya was the fastest girl in the fourth grade and everyone knew it, including Priya.

So when Coach Whitfield put her in the third leg of the relay instead of the last, she waited until the others had gone to get water, and then asked why.

"Because the third leg runs the curve," the coach said, "and because the handoff into the fourth is the one we drop."

"I would not drop it."

"You would not drop it running," Coach Whitfield agreed. "You would drop it waiting."

Priya did not know what that meant, and said so.

"The runner ahead of you is Devon. Devon is slower than you. If you start at your own pace, you are gone before he reaches you and the baton falls in the exchange zone. Your job on the third leg is not to be fast. Your job is to match him, take the baton, and then be fast."

They practised the handoff on its own for three days. Devon running the last forty metres of his leg at full speed; Priya starting when his foot crossed a chalk mark she had drawn on the track; the baton arriving, or not arriving, in the two seconds that followed. The first eleven attempts were a mess. Twice she went too early and had to slow down, which felt to her like being asked to run badly on purpose.

"That is the job," Coach Whitfield said. "Nobody in the stands will ever know you did it."

At the meet on Saturday, Priya stood in the exchange zone with her hand back and made herself count Devon's steps rather than watch the other lanes. She felt the baton hit her palm. Then she ran.

They came second. Priya had never come second at anything and been pleased about it before.

Afterwards she found Coach Whitfield. "The other teams dropped two batons," she said.

"I know," said the coach. "I counted."`,
    elements: {
      characters: ["Priya", "Coach Whitfield", "Devon"],
      setting: "a school running track, at practice and then at a Saturday meet",
      problem: "Priya does not understand why the fastest runner is not given the final leg",
      solution:
        "She learns the third leg is about matching the runner ahead so the handoff works, and the team finishes second without dropping the baton",
      narrator: "someone outside the story who can tell what Priya thinks",
      pointOfView: "third person",
    },
    theme: "Being the best at one thing does not make you the right person for every job.",
    perspectives: [
      {
        character: "Priya at the start",
        view: "She assumed the fastest runner should always run the most important leg.",
      },
      {
        character: "Coach Whitfield",
        view: "He judged the position by what it demands — timing, not raw speed.",
      },
    ],
    sequence: [
      "Priya is placed in the third leg instead of the last.",
      "She asks the coach why and is told the handoff is what the team drops.",
      "The coach explains her job is to match Devon's pace before running.",
      "They practise the handoff on its own for three days.",
      "At the meet she counts Devon's steps and takes the baton cleanly.",
      "The team comes second, and other teams drop two batons.",
    ],
    vocabulary: [
      {
        word: "exchange",
        meaning: "the act of passing something from one person to another",
        wrongMeanings: [
          "a race between two schools",
          "the moment a race begins",
          "a change of clothing",
        ],
        context: "the baton falls in the exchange zone",
        multipleMeaning: true,
      },
      {
        word: "leg",
        meaning: "one part of a longer race, run by one person",
        wrongMeanings: [
          "a part of the body used for walking",
          "the finish line of a race",
          "a piece of equipment",
        ],
        context: "Coach Whitfield put her in the third leg of the relay",
        multipleMeaning: true,
      },
      {
        word: "match",
        meaning: "move at the same speed as someone else",
        wrongMeanings: ["compete against", "look similar to", "light a fire"],
        context: "Your job is to match him, take the baton, and then be fast.",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "Priya's team won the race.",
      "Devon dropped the baton at the meet.",
      "Priya asked to be moved to the fourth leg again.",
      "Coach Whitfield had been a runner himself.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 4 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g4.hurricane-names",
    grade: 4,
    genre: "informational",
    title: "Why Hurricanes Have Names",
    text: `Before 1950, forecasters described storms by their position: the hurricane at latitude 24 north, longitude 80 west. It was accurate and almost impossible to use. Two storms in the same week could be confused in a single radio message, and a warning meant for one town could send another town in the wrong direction.

Names solved that. A name is short, hard to mistake for a number, and impossible to confuse with a second storm's name. Once forecasters began saying "Hurricane Carol", the number of misunderstood warnings dropped sharply.

Today the World Meteorological Organization keeps six lists of names, used in rotation. The list from 2019 was used again in 2025, and will be used again in 2031.

The lists themselves are not arbitrary. Each alternates between names traditionally given to women and to men, and each uses names common across the Atlantic, the Caribbean and the Gulf, because a warning has to be pronounceable by the people it is warning. Names beginning with Q, U, X, Y and Z are skipped entirely: there are not enough common names to fill six lists.

There is one exception to the rotation. When a storm causes enough death or damage, its name is retired and never used again. Andrew, Katrina, Michael and Ian are all retired. A retired name is replaced at the next meeting with a new one beginning with the same letter, so the alphabetical order of the list survives.

That rule is not really about weather. It is about people. A forecaster in 2040 warning a family about Hurricane Katrina would be asking them to hear a name that, for many, means the worst week of their lives.`,
    centralIdea:
      "Hurricanes are named to make warnings clear, and the worst storms have their names retired out of respect for the people affected.",
    supportingDetails: [
      "Before 1950 storms were described by latitude and longitude.",
      "Names are short and hard to confuse with one another.",
      "Six lists of names are used in rotation, so a list repeats every six years.",
      "Names of especially damaging storms are retired and replaced.",
    ],
    authorPurpose: "to inform",
    authorOpinion: "Retiring a hurricane's name is a decision about people rather than about weather.",
    opinionEvidence: [
      "A forecaster in 2040 warning a family about Hurricane Katrina would be asking them to hear a name that, for many, means the worst week of their lives.",
      "That rule is not really about weather.",
    ],
    textFeatures: [
      {
        feature: "timeline",
        purpose: "shows when events happened and in what order",
        notPurpose: [
          "defines specialist vocabulary",
          "shows where places are in relation to each other",
          "summarises the writer's argument",
        ],
      },
      {
        feature: "sidebar",
        purpose: "holds extra information that is related but would interrupt the main text",
        notPurpose: [
          "lists the chapters of the book",
          "shows how two things compare in size",
          "gives instructions for an experiment",
        ],
      },
    ],
    vocabulary: [
      {
        word: "rotation",
        meaning: "a repeating cycle in which things are used in turn",
        wrongMeanings: [
          "the spinning of a storm",
          "a sudden change of direction",
          "a list arranged in alphabetical order",
        ],
        context: "keeps six lists of names, used in rotation",
        multipleMeaning: true,
      },
      {
        word: "retired",
        meaning: "taken out of use permanently",
        wrongMeanings: [
          "stopped working because of age",
          "kept for special occasions",
          "written down in a record book",
        ],
        context: "its name is retired and never used again",
        multipleMeaning: true,
      },
      {
        word: "forecasters",
        meaning: "people whose job is to predict the weather",
        wrongMeanings: [
          "people who report the news on television",
          "scientists who study the ocean floor",
          "officials who order evacuations",
        ],
        context: "Before 1950, forecasters described storms by their position",
      },
    ],
    notInText: [
      "Storms were given names as early as 1900.",
      "The same name is never used twice.",
      "Retired names are chosen by the public.",
      "Naming storms made them easier to predict.",
    ],
    pairedWith: "g4.storm-shutters",
    sharedWithPair: [
      "Both texts are about preparing people for hurricanes.",
      "Both texts say that clear information saves lives.",
    ],
    uniqueToThis: [
      "Explains where hurricane names come from.",
      "Describes why some names are never used again.",
    ],
  },
  {
    id: "g4.storm-shutters",
    grade: 4,
    genre: "informational",
    title: "The Week Before the Storm",
    text: `A hurricane warning gives a community about thirty-six hours. Everything that matters has to have been decided before that.

Shutters are the clearest example. A house with shutters already fitted takes an hour to secure. A house buying plywood the day a warning is issued is competing with every other household in the county for the same sheets at the same hardware store, and often loses.

Water is the same story. The advice is one gallon per person per day for three days. Bought in June, that is an ordinary purchase. Bought the afternoon of a warning, it is a queue and an empty shelf.

Fuel behaves the same way and worse, because a shortage spreads. When a warning is issued, stations along the evacuation routes empty first, which sends drivers further inland to look, which empties those stations too. A tank filled on the first of June is not clever. It is just early.

The list is short and unglamorous: shutters or measured plywood, three days of water, a week of food that needs no cooking, batteries, a printed copy of insurance papers, and a full tank. None of it makes a good photograph. All of it is easier to do in May than in September.

Emergency managers have a phrase for this: preparation is something you do in the quiet season. The loud season is for acting on decisions already made.

None of this is expensive. Most of it is not even difficult. It is only inconvenient at a time of year when nothing seems urgent, which is exactly why it so often does not get done.`,
    centralIdea:
      "Hurricane preparation has to happen long before a warning, because there is not enough time or supply once one is issued.",
    supportingDetails: [
      "A hurricane warning gives about thirty-six hours.",
      "A house with shutters already fitted takes an hour to secure.",
      "The advice is one gallon of water per person per day for three days.",
      "Emergency managers say preparation belongs in the quiet season.",
    ],
    authorPurpose: "to persuade",
    authorOpinion: "Families should prepare for hurricanes months before the season, not when a warning arrives.",
    opinionEvidence: [
      "A house buying plywood the day a warning is issued is competing with every other household in the county for the same sheets at the same hardware store, and often loses.",
      "Bought the afternoon of a warning, it is a queue and an empty shelf.",
      "It is only inconvenient at a time of year when nothing seems urgent, which is exactly why it so often does not get done.",
    ],
    vocabulary: [
      {
        word: "secure",
        meaning: "make safe and firmly fastened",
        wrongMeanings: ["buy from a shop", "take apart carefully", "check for damage"],
        context: "A house with shutters already fitted takes an hour to secure.",
        multipleMeaning: true,
      },
      {
        word: "inconvenient",
        meaning: "awkward or a nuisance, though not difficult",
        wrongMeanings: ["extremely expensive", "physically dangerous", "completely impossible"],
        context: "It is only inconvenient at a time of year when nothing seems urgent",
      },
    ],
    notInText: [
      "Hurricane shutters are too expensive for most families.",
      "A warning gives about a week's notice.",
      "Hardware stores stay open during the storm.",
      "Most families are already fully prepared.",
    ],
    pairedWith: "g4.hurricane-names",
    sharedWithPair: [
      "Both texts are about preparing people for hurricanes.",
      "Both texts say that clear information saves lives.",
    ],
    uniqueToThis: [
      "Explains what families should buy before the season starts.",
      "Argues that preparation belongs in the quiet months.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 4 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g4.tide-pool",
    grade: 4,
    genre: "poetry",
    title: "Tide Pool",
    text: `The ocean leaves a coin of itself
Behind the rocks at nine,
A borrowed water, shallow, still,
And for six hours, mine.

A crab reviews his kingdom.
An anemone unfurls.
A hermit tries on shells the way
That other people try on worlds.

I could stand here until the sea
Comes shouldering back at three
And takes the whole arrangement home
And leaves no note for me.

But nothing here belonged to me.
The pool was never still.
It only held its breath a while
Before the ocean will.`,
    stanzas: 4,
    linesPerStanza: 4,
    rhymeScheme: "ABCB",
    theme: "Something beautiful can be worth attention even when — perhaps because — it is temporary.",
    figurative: [
      {
        phrase: "The ocean leaves a coin of itself",
        kind: "metaphor",
        meaning: "the round tide pool is a small piece of the ocean left behind",
        literalReading: "the sea drops actual money on the rocks",
      },
      {
        phrase: "A crab reviews his kingdom",
        kind: "personification",
        meaning: "the crab moves about the pool as though it belonged to him",
        literalReading: "the crab is a king inspecting land he rules",
      },
      {
        phrase: "Comes shouldering back at three",
        kind: "personification",
        meaning: "the returning tide pushes in with force, like a person shoving through",
        literalReading: "the sea has shoulders",
      },
      {
        phrase: "It only held its breath a while",
        kind: "personification",
        meaning: "the pool was still and quiet only for a short time",
        literalReading: "the pool is breathing",
      },
    ],
    vocabulary: [
      {
        word: "unfurls",
        meaning: "opens out from being rolled or folded up",
        wrongMeanings: ["closes up tightly", "moves away quickly", "changes colour"],
        context: "An anemone unfurls.",
      },
      {
        word: "borrowed",
        meaning: "taken for a short time and meant to be given back",
        wrongMeanings: ["stolen and kept", "bought and paid for", "found by accident"],
        context: "A borrowed water, shallow, still",
      },
    ],
    notInText: [
      "The speaker takes a shell home.",
      "The tide pool stays behind the rocks all day.",
      "The crab is trapped and needs rescuing.",
      "The speaker is disappointed by the pool.",
    ],
  },
];
