import type { Passage } from "./types";

/**
 * More passages for grades 5 and 6.
 *
 * These two grades had the smallest pools in the library once grade 1 is set
 * aside — eleven texts each, counting everything they could borrow from the
 * grade below. They are also the grades whose passages take longest to write,
 * because the length bands are three to eight hundred words and a text that
 * short-changes the band is a text that cannot carry a real argument.
 *
 * The pair at the end is deliberate. Compare-and-contrast items need two texts
 * that genuinely disagree about the same question, and a disagreement written
 * by one hand tends to give the losing side a straw argument. Both halves here
 * are written to be the one a reasonable person would hold.
 */

export const EXPANSION_G5_G6_PASSAGES: Passage[] = [
  /* ---------------------------------------------------------------- *
   * Grade 5 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g5x.second-chair",
    grade: 5,
    genre: "literary",
    title: "Second Chair",
    text: `The audition results went up on the choir room door on a Friday, and Nadia read her own name in second chair before she had finished taking off her coat.

She had expected first. That was the honest part, and it took her most of the weekend to admit it to herself. She had practised the Bach every day since October, including the two days she had a fever, and she had played it cleanly on Thursday with only one place where the tempo slipped.

Beatriz, who got first chair, had joined the orchestra in January.

On Monday Nadia sat down in the second chair and discovered something she had not thought about at all, which was that the second chair's job is different. First chair plays the melody where the composer put it. Second chair plays underneath, and the two parts have to arrive at the same moment, and if they do not, the person who sounds wrong is not always the person who is wrong.

For three weeks it went badly. Nadia was half a breath behind on every entry because she was listening for Beatriz, and listening takes time, and by the time she had heard she was late.

Mr. Okonkwo stopped them in the middle of the second movement.

"You are following," he said to Nadia. "Don't follow. Start together."

"How do I start together if I don't know when she's starting?"

"Watch her shoulders," he said. "Not the bow. The shoulders go first."

It was not a metaphor. Nadia watched Beatriz's shoulders for the rest of the rehearsal and came in with her four times out of five, and by the end of the month she stopped counting because she was no longer surprised when it worked.

At the spring concert she still played second, and in the last movement there are eight bars where the second part carries the tune alone, and her mother, sitting in row six, heard it and did not know which of the two girls was playing.`,
    elements: {
      characters: ["Nadia", "Beatriz", "Mr. Okonkwo", "Nadia's mother"],
      setting: "a school orchestra, from the Friday auditions to the spring concert",
      problem:
        "Nadia expected first chair, gets second, and cannot play in time because she is following instead of playing with Beatriz",
      solution:
        "Mr. Okonkwo tells her to watch Beatriz's shoulders rather than her bow, and she learns to start together",
      narrator: "someone outside the story who knows what Nadia expected and admits to herself",
      pointOfView: "third person",
    },
    theme:
      "The second place in something is a different job, not a smaller version of the first.",
    perspectives: [
      {
        character: "Nadia",
        view: "She thought second chair meant she had lost, and only later found it was a different task.",
      },
      {
        character: "Mr. Okonkwo",
        view: "He thought her problem was not skill but that she was listening instead of watching.",
      },
    ],
    sequence: [
      "Nadia reads the audition results and sees she is second chair.",
      "She spends the weekend admitting to herself that she had expected first.",
      "For three weeks she comes in late because she is following Beatriz.",
      "Mr. Okonkwo tells her to watch Beatriz's shoulders instead of her bow.",
      "By the spring concert the two parts sound like one.",
    ],
    vocabulary: [
      {
        word: "tempo",
        meaning: "the speed at which a piece of music is played",
        wrongMeanings: [
          "how loud the music is",
          "the order the notes come in",
          "the mood a piece creates",
        ],
        context: "only one place where the tempo slipped",
      },
      {
        word: "entry",
        meaning: "the moment a player begins their part",
        wrongMeanings: [
          "the door into a hall",
          "something written in a diary",
          "a fee paid to take part",
        ],
        context: "Nadia was half a breath behind on every entry",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "half a breath behind",
        kind: "metaphor",
        meaning: "very slightly late, by less than a moment",
        literalReading: "she was standing a short distance behind somebody breathing",
      },
      {
        phrase: "It was not a metaphor",
        kind: "idiom",
        meaning: "the advice was meant exactly and literally rather than as a comparison",
        literalReading: "a metaphor had been ruled out of the conversation",
      },
    ],
    notInText: [
      "Nadia was moved to first chair before the concert.",
      "Beatriz had been playing longer than Nadia.",
      "Mr. Okonkwo told Nadia to practise the Bach again.",
      "Nadia's mother had expected her to win first chair.",
    ],
  },
  {
    id: "g5x.the-till",
    grade: 5,
    genre: "literary",
    title: "Short by Nine Dollars",
    text: `Cataleya counted the till on Saturdays because her father's eyes had got bad and he would not say so.

It took twenty minutes. Bills flat and facing the same way, coins into the paper rolls, the total written in the green book with the date beside it. Her father checked the number against the register tape, and if the two agreed he initialled the line, and if they did not he counted the whole thing again himself.

On the second Saturday in March, the drawer was nine dollars short.

She counted it three times. Nine dollars each time. She sat with the green book open and did not write anything in it, because writing it down would make it a fact that existed outside her own head.

Her cousin Marco had worked the register from two until five. Marco was seventeen, and he had a car that needed a tyre, and he had mentioned the tyre twice that week in the way people mention things they are hoping somebody will solve.

Cataleya thought about not writing the number. She thought about it for long enough that she noticed she was thinking about it, which was worse.

She wrote 9 SHORT in the margin and took the book to her father.

He read it. He did not ask about Marco. He said, "Did you count it three times?" and she said yes, and he initialled the line and closed the book.

On Tuesday Marco came in before school and put nine dollars on the counter and said nothing at all, and her father put it in the drawer and said nothing at all, and neither of them ever mentioned it in front of her.

Years later Cataleya understood that her father had known on Saturday, and that the whole point of asking whether she had counted three times had been to tell her that her job was the number and not the person.`,
    elements: {
      characters: ["Cataleya", "her father", "Marco"],
      setting: "a family shop, counted out on Saturday afternoons",
      problem:
        "the till is nine dollars short and Cataleya believes she knows who took it",
      solution:
        "she records the shortage honestly, her father accepts it without accusing anyone, and Marco returns the money on Tuesday",
      narrator:
        "someone outside the story who knows what Cataleya thinks and what she understood later",
      pointOfView: "third person",
    },
    theme:
      "Doing your part of a difficult situation accurately can be more useful than deciding who is to blame.",
    perspectives: [
      {
        character: "Cataleya",
        view: "She felt that writing the number down would be an accusation against her cousin.",
      },
      {
        character: "her father",
        view: "He treated the count as her only responsibility and dealt with the rest himself.",
      },
    ],
    sequence: [
      "Cataleya counts the till every Saturday because her father's sight is failing.",
      "On the second Saturday in March the drawer is nine dollars short.",
      "She counts three times and thinks about not recording it.",
      "She writes the shortage in the book and takes it to her father.",
      "On Tuesday Marco returns the nine dollars without a word.",
    ],
    vocabulary: [
      {
        word: "initialled",
        meaning: "signed with the first letters of his name to show he had checked it",
        wrongMeanings: [
          "began something for the first time",
          "crossed out a mistake",
          "wrote the date in a book",
        ],
        context: "he initialled the line and closed the book",
      },
      {
        word: "margin",
        meaning: "the blank strip at the edge of a page",
        wrongMeanings: [
          "the amount of profit a shop makes",
          "the middle of a page",
          "the cover of a notebook",
        ],
        context: "She wrote 9 SHORT in the margin",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "her father's eyes had got bad and he would not say so",
        kind: "idiom",
        meaning: "his sight was failing and he refused to admit it",
        literalReading: "his eyes had begun behaving badly on purpose",
      },
    ],
    notInText: [
      "Cataleya accused Marco of taking the money.",
      "Her father fired Marco from the shop.",
      "The register tape was wrong.",
      "Cataleya put the nine dollars in herself.",
    ],
  },
  {
    id: "g5x.deep-end",
    grade: 5,
    genre: "literary",
    title: "The Deep End",
    text: `To pass the swim test you had to tread water in the deep end for sixty seconds. Everyone in the fifth grade had done it except Idris, and everyone knew that too, because the list was on the wall of the changing room with ticks next to the names.

Idris could swim. That was the strange part. He could swim two lengths of the shallow end without stopping and his stroke was better than half the class. What he could not do was be somewhere his feet did not reach.

He had tried in September and got out after eleven seconds. He tried again in November and did not get in at all.

Coach Whelan did not talk to him about courage. She talked to him about buoyancy.

"You float," she said. "Everybody floats. Your body is less dense than water and it cannot sink unless you make it. The problem is not the water. The problem is that when you panic you push down, and pushing down is the only way to go under."

She taught him to lie on his back in four feet of water and do nothing at all. Nothing turned out to be difficult. He did it every Tuesday for a month.

In January she moved him to five feet, which was still standing depth for her and not for him, and he lay on his back with her hand under his shoulder blades and then, at some point he did not notice, without it.

The test was in February. He got in at the ladder and let go and started counting, and at about twenty seconds he realised he had stopped counting and had been looking at the ceiling tiles, and he made himself start counting again from twenty because he was not sure it was honest otherwise.

Sixty-four seconds. Coach Whelan put the tick on the wall herself and did not say anything about it, which he was grateful for the whole rest of the year.`,
    elements: {
      characters: ["Idris", "Coach Whelan"],
      setting: "a school swimming pool between September and February",
      problem:
        "Idris can swim but panics in water deeper than he can stand in, so he cannot pass the test",
      solution:
        "Coach Whelan teaches him to float doing nothing, in gradually deeper water, until he passes",
      narrator: "someone outside the story who knows what Idris can and cannot do",
      pointOfView: "third person",
    },
    theme:
      "Fear is usually beaten by learning a small physical skill rather than by being braver.",
    perspectives: [
      {
        character: "Idris",
        view: "He believed the problem was the depth of the water itself.",
      },
      {
        character: "Coach Whelan",
        view: "She treated it as a question of how bodies float rather than a question of courage.",
      },
    ],
    sequence: [
      "Idris is the only fifth grader who has not passed the swim test.",
      "He tries in September and gets out after eleven seconds.",
      "Coach Whelan teaches him to float on his back in four feet of water.",
      "In January he floats in five feet without her hand supporting him.",
      "In February he treads water for sixty-four seconds and passes.",
    ],
    vocabulary: [
      {
        word: "buoyancy",
        meaning: "the tendency of a body to float rather than sink",
        wrongMeanings: [
          "the ability to hold your breath",
          "the speed at which someone swims",
          "the depth of a pool",
        ],
        context: "She talked to him about buoyancy.",
      },
      {
        word: "dense",
        meaning: "having a lot of mass packed into its size",
        wrongMeanings: [
          "difficult to understand",
          "crowded with people",
          "very cold to the touch",
        ],
        context: "Your body is less dense than water",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "Nothing turned out to be difficult",
        kind: "idiom",
        meaning: "doing nothing at all was the hardest thing to learn",
        literalReading: "no single thing was found to be hard",
      },
    ],
    notInText: [
      "Idris could not swim at the start of the year.",
      "Coach Whelan told him to be braver.",
      "Idris passed the test in November.",
      "The other students helped him practise.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 5 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g5x.prescribed-fire",
    grade: 5,
    genre: "informational",
    title: "Setting Fire to Save the Forest",
    text: `Every year, the Florida Forest Service deliberately sets fire to about two million acres of the state. This is not an accident, a mistake, or a last resort. It is the plan.

The reason is that the pine forests of the southeastern United States evolved with fire. Lightning strikes Florida more often than anywhere else in the country, and for thousands of years those strikes burned through the understory every two to five years. The fires were frequent, and because they were frequent they were small: there was never enough fallen material on the ground for a fire to become large.

Longleaf pines are built for this. Their bark is thick enough to survive a low fire. Their seedlings spend their first years as a tuft of needles at ground level, protecting the growing bud in the middle, and a fire passing over one does very little to it. Several plants of the sandhills will not release seed at all until they have been burned.

Then, for most of the twentieth century, the policy was suppression: people put out every fire they could reach, as fast as they could reach it. It seemed obviously correct. What it produced was a hundred years of unburned material — dead needles, fallen branches, shrubs growing where fire used to keep them out — piled up under trees that had never seen a load like it.

A fire in that forest is not the fire the forest evolved with. It climbs the shrubs into the crowns of the trees and kills them, and it does not stop at a road.

So the Forest Service burns on purpose, on days chosen for wind and humidity, in blocks bounded by cleared lines. A prescribed burn puts smoke over a highway for an afternoon and makes people uneasy. It also removes the fuel that a summer lightning strike would otherwise find.

Florida burns more acres on purpose than any other state. It also loses fewer acres to wildfire than states with far less fire and far more forest left standing.`,
    centralIdea:
      "Florida deliberately burns its forests because the pines evolved with frequent small fires, and preventing all fire creates the conditions for a destructive one.",
    supportingDetails: [
      "Lightning strikes Florida more often than anywhere else in the country.",
      "Longleaf pine bark is thick enough to survive a low fire, and some plants need fire to release seed.",
      "A century of fire suppression left a hundred years of fuel on the forest floor.",
      "Prescribed burns are done on days chosen for wind and humidity, inside cleared lines.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "Deliberately burning forests is safer than protecting them from all fire.",
    opinionEvidence: [
      "It also removes the fuel that a summer lightning strike would otherwise find.",
      "Florida burns more acres on purpose than any other state.",
      "It also loses fewer acres to wildfire than states with far less fire and far more forest left standing.",
    ],
    textFeatures: [
      {
        feature: "map",
        purpose: "shows where things are and how far apart they lie",
        notPurpose: [
          "explains the meaning of a technical word",
          "lists the sections of the text in order",
          "compares two amounts side by side",
        ],
      },
      {
        feature: "timeline",
        purpose: "shows the order events happened in and how far apart they were",
        notPurpose: [
          "labels the parts of a diagram",
          "gives the writer's opinion about the topic",
          "shows where a photograph was taken",
        ],
      },
    ],
    vocabulary: [
      {
        word: "understory",
        meaning: "the layer of small plants growing beneath the tall trees",
        wrongMeanings: [
          "the ground beneath the soil",
          "the tops of the tallest trees",
          "the account of an event",
        ],
        context: "those strikes burned through the understory every two to five years",
      },
      {
        word: "suppression",
        meaning: "the act of stopping something from happening",
        wrongMeanings: [
          "the act of studying something closely",
          "the spread of something over a wide area",
          "the measurement of something's size",
        ],
        context: "the policy was suppression: people put out every fire they could reach",
      },
    ],
    figurative: [
      {
        phrase: "It climbs the shrubs into the crowns of the trees",
        kind: "personification",
        meaning: "the fire spreads upward from the low plants into the treetops",
        literalReading: "the fire uses its hands and feet to climb",
      },
    ],
    notInText: [
      "Prescribed burns are set only after a wildfire has started.",
      "Longleaf pines are killed by low fires.",
      "Florida has fewer lightning strikes than most states.",
      "The Forest Service burns on any day of the year.",
    ],
  },
  {
    id: "g5x.read-aloud",
    grade: 5,
    genre: "informational",
    title: "Don't Stop Reading to Them",
    text: `Most families stop reading aloud to a child at about the age of eight, usually within a year of the child learning to read independently. That is the wrong moment to stop, and the reason is worth understanding rather than simply believing.

A child's listening comprehension runs ahead of their reading comprehension until roughly the age of thirteen. A ten-year-old can follow a book read aloud that is two or three years beyond what they can decode themselves. Those are the years when the sentences get longer, the vocabulary gets less common, and the ideas stop being about things you can see. If the only books a child meets are the ones they can read alone, they meet none of that until their reading catches up, and by then the habit of expecting difficulty may not have formed.

Reading aloud also solves the problem of the hard beginning. Many good books have a slow first thirty pages. A child reading alone abandons those books. A child being read to gets carried past the beginning by somebody else's voice and arrives at the part where the book takes hold.

There is a third reason that is harder to measure. A book read aloud is read together, and reading together produces a conversation that reading alone does not. The child asks what a word means at the moment it is needed. Both people stop at the same sentence. Something in the story gets discussed on the stairs three days later.

The practical objection is time, and it is a fair one. Ten minutes is enough. It does not have to be a novel, it does not have to be every night, and it does not have to be a book anybody has heard of. What it has to be is above the level the child would pick alone, because that is the entire point of somebody else doing the reading.`,
    centralIdea:
      "Families should keep reading aloud to children well past the age they learn to read alone, because listening comprehension stays ahead of reading comprehension for years.",
    supportingDetails: [
      "Listening comprehension runs ahead of reading comprehension until about thirteen.",
      "A ten-year-old can follow a book two or three years beyond what they can decode alone.",
      "A child being read to gets carried past a book's slow opening chapters.",
      "Reading together produces conversation that reading alone does not.",
    ],
    authorPurpose: "to persuade",
    authorOpinion:
      "Families should keep reading aloud to a child long after the child can read independently.",
    opinionEvidence: [
      "A child's listening comprehension runs ahead of their reading comprehension until roughly the age of thirteen.",
      "A child reading alone abandons those books.",
      "What it has to be is above the level the child would pick alone, because that is the entire point of somebody else doing the reading.",
    ],
    textFeatures: [
      {
        feature: "sidebar",
        purpose: "carries an extra piece of information beside the main text",
        notPurpose: [
          "shows which page each chapter starts on",
          "explains what a picture contains",
          "gives the meaning of every hard word",
        ],
      },
    ],
    vocabulary: [
      {
        word: "decode",
        meaning: "work out what written words say",
        wrongMeanings: [
          "understand the meaning of a story",
          "read something out loud",
          "translate into another language",
        ],
        context: "beyond what they can decode themselves",
      },
      {
        word: "abandons",
        meaning: "gives up on something and leaves it unfinished",
        wrongMeanings: [
          "finishes something quickly",
          "recommends something to a friend",
          "reads something a second time",
        ],
        context: "A child reading alone abandons those books.",
      },
    ],
    figurative: [
      {
        phrase: "the part where the book takes hold",
        kind: "metaphor",
        meaning: "the point at which the story becomes gripping",
        literalReading: "the book grips the reader with its hands",
      },
    ],
    notInText: [
      "Reading aloud should stop once a child can read alone.",
      "Children should only hear books at their own reading level.",
      "Listening comprehension develops after reading comprehension.",
      "Most families read aloud until a child is thirteen.",
    ],
  },
  {
    id: "g5x.the-tomato-truck",
    grade: 5,
    genre: "informational",
    title: "Why a Supermarket Tomato Tastes of Nothing",
    text: `A tomato picked ripe and eaten the same day tastes of tomato. A tomato from a supermarket in February usually does not, and the reason is not that growers do not care.

A ripe tomato is soft, and soft fruit cannot be shipped. It bruises against its neighbours in the box, it splits when the box is stacked, and by the time a lorry has driven it fifteen hundred miles a third of the load is unsellable. So tomatoes for shipping are picked green and hard, when they can survive the journey.

Green tomatoes will still turn red. Growers put them in rooms filled with a small amount of ethylene, a gas that tomatoes themselves produce as they ripen, and after a few days the fruit is the colour of a ripe tomato. The colour is real. What is missing is everything that happens in the last week on the vine, when the plant is still sending sugars and the compounds that give a tomato its smell into the fruit. A tomato picked green never receives those, and no amount of gas afterwards puts them in.

There is also a breeding story. For fifty years, tomato varieties were selected for how they travelled, how uniformly they ripened, and how they looked in a box. Flavour was not measured, so it was not selected for, and a trait nobody selects for tends to drift away. In 2012 researchers found that a mutation making tomatoes ripen to an even colour — bred into almost every commercial variety because uneven fruit is harder to sell — also switched off part of the machinery that builds sugar in the fruit.

Farmers' market tomatoes taste better mainly because they were picked ripe and travelled twenty miles. If you have space for one pot on a balcony, that is the entire secret, and it is not a secret at all.`,
    centralIdea:
      "Supermarket tomatoes taste bland because they must be picked unripe to survive shipping, and because varieties were bred for travel and appearance rather than flavour.",
    supportingDetails: [
      "Ripe tomatoes are too soft to ship and bruise or split in the box.",
      "Green tomatoes are ripened with ethylene gas, which restores colour but not flavour.",
      "The last week on the vine is when sugars and smell compounds enter the fruit.",
      "A mutation bred in for even colour also reduced sugar production.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "The blandness of shipped tomatoes is a predictable result of what was measured, not a failure of care.",
    opinionEvidence: [
      "A tomato from a supermarket in February usually does not, and the reason is not that growers do not care.",
      "Flavour was not measured, so it was not selected for, and a trait nobody selects for tends to drift away.",
      "For fifty years, tomato varieties were selected for how they travelled, how uniformly they ripened, and how they looked in a box.",
    ],
    textFeatures: [
      {
        feature: "diagram",
        purpose: "shows the parts of something and names each one",
        notPurpose: [
          "lists the pages where each topic appears",
          "gives the writer's opinion",
          "shows how far apart two places are",
        ],
      },
      {
        feature: "glossary",
        purpose: "gives the meanings of the technical words used in the text",
        notPurpose: [
          "shows the order events happened in",
          "explains what a photograph shows",
          "compares two sets of figures",
        ],
      },
    ],
    vocabulary: [
      {
        word: "uniformly",
        meaning: "in the same way all over, without variation",
        wrongMeanings: [
          "very quickly",
          "in a particular set of clothes",
          "one at a time",
        ],
        context: "how uniformly they ripened",
      },
      {
        word: "trait",
        meaning: "a particular quality that a living thing has",
        wrongMeanings: [
          "a path across the countryside",
          "an agreement between two countries",
          "a mistake in an experiment",
        ],
        context: "a trait nobody selects for tends to drift away",
      },
    ],
    notInText: [
      "Ethylene gas is added to make tomatoes sweeter.",
      "Growers pick tomatoes green because it is cheaper.",
      "Farmers' market tomatoes are a different species.",
      "Tomato flavour was measured throughout the breeding programmes.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 5 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g5x.night-shift",
    grade: 5,
    genre: "poetry",
    title: "Night Shift",
    text: `She leaves at ten, when I am nearly sleeping,
and pulls the door until it clicks, not slams.
I hear the car cough twice and catch and go.
The house gets very large.

At two I wake and see the kitchen light
left on for me, though I did not ask for it,
a small square yellow promise on the floor
that somebody is coming.

At six she comes. I hear her take her shoes off
outside the door, so as not to wake the house.
The house is already awake. The house has been
awake since two, and lying still.

I keep my eyes shut while she checks the room,
because I know she needs to think I slept.
We are both of us pretending, and we know it,
and neither of us says.

At seven she is up again with breakfast,
her face the colour of the winter sky.
I eat the eggs. I say the eggs are good.
They are. That part is true.`,
    stanzas: 5,
    linesPerStanza: 4,
    rhymeScheme: "free verse",
    theme:
      "Love between people who are tired often shows up as small acts of pretending for each other's sake.",
    perspectives: [
      {
        character: "the mother",
        view: "She works nights and wants the child to believe they slept undisturbed.",
      },
      {
        character: "the child",
        view: "The child lies awake but keeps their eyes shut so the mother can believe it worked.",
      },
    ],
    vocabulary: [
      {
        word: "pretending",
        meaning: "acting as though something is true when you know it is not",
        wrongMeanings: [
          "planning something in advance",
          "arguing about something",
          "forgetting something completely",
        ],
        context: "We are both of us pretending, and we know it",
      },
    ],
    figurative: [
      {
        phrase: "The house gets very large",
        kind: "hyperbole",
        meaning: "the house feels empty and frightening once she has gone",
        literalReading: "the walls of the building move further apart",
      },
      {
        phrase: "a small square yellow promise on the floor",
        kind: "metaphor",
        meaning: "the patch of light from the kitchen is a sign that she will return",
        literalReading: "a promise has been written on a square of paper",
      },
      {
        phrase: "her face the colour of the winter sky",
        kind: "simile",
        meaning: "she looks grey and exhausted",
        literalReading: "her skin has turned the same shade as clouds",
      },
    ],
    notInText: [
      "The mother works during the day.",
      "The child sleeps through the night.",
      "The mother knows the child is awake.",
      "The child asks her not to go.",
    ],
  },
  {
    id: "g5x.the-photograph",
    grade: 5,
    genre: "poetry",
    title: "Nobody Wrote the Names",
    text: `Four people on a step in someone's yard,
a dog that would not sit, a hat, a wall.
On the back, in pencil, 1954,
and after that, nothing at all.

My grandmother is one of them. She thinks.
She says the one on the left is probably Anne.
She says the man might be her mother's cousin,
or else some other man.

The dog is the only one that anybody's certain of.
His name was Rex. That much has come down whole.
A dog's name outlived four people's faces,
which tells you something about what we choose to hold.

So write the names. Write them in pencil, softly,
on the back of every picture, every year.
It takes eight seconds. Somebody in the future
is standing where I am, and wants to know who's here.`,
    stanzas: 4,
    linesPerStanza: 4,
    rhymeScheme: "abcb",
    theme:
      "The small effort of recording who somebody was is what keeps them from disappearing.",
    vocabulary: [
      {
        word: "certain",
        meaning: "completely sure about something",
        wrongMeanings: [
          "a particular one, not named",
          "worried about something",
          "photographed clearly",
        ],
        context: "The dog is the only one that anybody's certain of.",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "A dog's name outlived four people's faces",
        kind: "personification",
        meaning: "the dog's name was remembered longer than the identities of the people",
        literalReading: "a name stayed alive after some faces died",
      },
      {
        phrase: "That much has come down whole",
        kind: "metaphor",
        meaning: "that one fact survived being passed between generations without being lost",
        literalReading: "something descended from a height without breaking",
      },
    ],
    notInText: [
      "The grandmother remembers all four names.",
      "The photograph was taken at a wedding.",
      "The names were written on the back in ink.",
      "The dog belonged to the grandmother.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 6 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g6x.the-witness",
    grade: 6,
    genre: "literary",
    title: "What Rafi Saw",
    text: `Rafi was the only person in the corridor when the fire alarm was pulled, which is how he came to know something that nobody had asked him about.

He had been at his locker, low down, half hidden by the open door, and Jules had walked past him and put a hand on the little white box and kept walking, and the noise had started three seconds later. Jules had not seen him. Rafi was fairly sure of that.

Eleven hundred people stood in the car park for forty minutes in February. Two lessons were lost. The fire service sent an engine, and somebody in the office had to fill in a form explaining why.

By Wednesday there was a theory going around that it had been a boy called Tomás, on no evidence Rafi could find except that Tomás had been in trouble twice before and was easy to believe things about. By Thursday Tomás had been called to the office. By Friday he had a two-day suspension, and his mother had come in, and there had been an argument in the corridor outside the office that the whole of the second floor could hear.

Rafi did not like Jules. That was the part that made it complicated rather than simple. If he spoke now, he would be telling the truth, and he would also be doing something he had wanted to do for other reasons, and he could not separate the two well enough to be sure which one was moving him.

He wrote it down instead. Not a note to anybody: just the facts, in order, on a piece of paper, at his desk on Friday night. Where he had been. What he had seen. What time.

Reading it back, the reason to speak turned out not to be about Jules at all. There was a boy serving two days for something he had not done, and Rafi was the only person on earth who knew it.

He went in on Monday morning before the first bell. He was not brave about it and his voice did not work properly at the start. But he had the paper, and the paper said what he had seen, and once he had said the first sentence the rest of them came out in order.`,
    elements: {
      characters: ["Rafi", "Jules", "Tomás"],
      setting: "a school corridor, car park, and office over the course of a week in February",
      problem:
        "Rafi is the only witness to who pulled the fire alarm, and another boy is punished for it",
      solution:
        "he writes down the facts, recognises that the reason to speak is Tomás rather than Jules, and reports it",
      narrator: "someone outside the story who knows what Rafi cannot separate in his own motives",
      pointOfView: "third person",
    },
    theme:
      "Acting rightly is harder when you would also benefit, and writing the facts down can separate the two.",
    perspectives: [
      {
        character: "Rafi",
        view: "He hesitated because telling the truth would also serve a grudge he already held.",
      },
      {
        character: "the school",
        view: "It settled on the student who was easiest to believe the accusation about.",
      },
    ],
    sequence: [
      "Rafi sees Jules pull the fire alarm while he is at his locker.",
      "The school is evacuated for forty minutes and two lessons are lost.",
      "A rumour blames Tomás, who has been in trouble before.",
      "Tomás is given a two-day suspension.",
      "Rafi writes down the facts and reports what he saw on Monday morning.",
    ],
    vocabulary: [
      {
        word: "theory",
        meaning: "an explanation people believe without having proved it",
        wrongMeanings: [
          "a fact established by evidence",
          "a rule that everyone must follow",
          "a written record of events",
        ],
        context: "there was a theory going around that it had been a boy called Tomás",
        multipleMeaning: true,
      },
      {
        word: "separate",
        meaning: "tell two things apart from each other",
        wrongMeanings: [
          "add two things together",
          "keep something secret",
          "explain something clearly",
        ],
        context: "he could not separate the two well enough to be sure which one was moving him",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "was easy to believe things about",
        kind: "idiom",
        meaning: "people accepted accusations against him without needing proof",
        literalReading: "believing things required little effort in his presence",
      },
    ],
    notInText: [
      "Jules confessed to pulling the alarm.",
      "Rafi told his friends what he had seen on Wednesday.",
      "Tomás asked Rafi for help.",
      "The fire alarm was pulled by accident.",
    ],
  },
  {
    id: "g6x.recipe-card",
    grade: 6,
    genre: "literary",
    title: "The Card That Was Wrong",
    text: `The recipe card was in her great-grandmother's handwriting, and it did not work.

Amina had made it four times. Four times the dough came out of the oven flat and slightly grey, spreading into one continuous sheet on the tray, tasting of not very much. The card said one teaspoon of baking powder, and the card was wrong, and saying so out loud in her family was roughly equivalent to saying the sky was a different colour than everyone had agreed.

"You did something," her aunt said, on the phone, from two states away. "Your grandmother made these every Eid for fifty years."

"I did exactly what it says."

"Then you did exactly what it says wrong."

Amina photographed the card and enlarged it on the screen until the pencil strokes broke into grey dots. The word was definitely teaspoon. The number was definitely one. The card was written in 1961 in a kitchen in Lahore, and it had been carried through two moves and one flood, and it was wrong.

What made it difficult was not the baking. It was that the card had authority and Amina had only four flat trays, and a card in a dead woman's handwriting outranks a living girl's evidence in almost every family she knew of.

Then she found the second card.

It was in the same tin, underneath, in different handwriting — her grandmother's, not her great-grandmother's — and it was a copy of the same recipe, and it said one tablespoon.

Amina made it with a tablespoon. They rose. They were the biscuits she remembered, exactly, including a slight cracked dome on top that she had assumed for years was something you either got or did not.

She thought for a while about which card to keep. In the end she kept both, and clipped them together, and wrote on a third card: the first one has a copying error, the second one is right, and here is how you can tell — because the only reason she had found the answer at all was that somebody sixty years ago had bothered to make a second copy instead of trusting the first.`,
    elements: {
      characters: ["Amina", "her aunt", "her great-grandmother", "her grandmother"],
      setting: "a kitchen, with a tin of handwritten recipe cards from 1961 onward",
      problem:
        "the inherited recipe does not work and the family will not accept that the card could be wrong",
      solution:
        "Amina finds a second copy in a different hand giving a tablespoon instead of a teaspoon, and it works",
      narrator: "someone outside the story who knows what Amina thinks about her family",
      pointOfView: "third person",
    },
    theme:
      "A record is only as good as the copies made of it, and doubting one carefully is a way of respecting it.",
    perspectives: [
      {
        character: "Amina",
        view: "She trusted her own repeated results over the authority of the card.",
      },
      {
        character: "her aunt",
        view: "She assumed the card must be right and the cook must have made a mistake.",
      },
    ],
    sequence: [
      "Amina makes the recipe four times and it fails every time.",
      "Her aunt insists the card is right and Amina must be doing something wrong.",
      "Amina enlarges a photograph of the card and confirms it says one teaspoon.",
      "She finds a second copy in her grandmother's handwriting saying one tablespoon.",
      "The recipe works, and she keeps both cards clipped together with a note.",
    ],
    vocabulary: [
      {
        word: "continuous",
        meaning: "joined together without a break",
        wrongMeanings: [
          "happening again and again",
          "extremely thin",
          "very slow to cook",
        ],
        context: "spreading into one continuous sheet on the tray",
      },
      {
        word: "authority",
        meaning: "the right to be believed or obeyed",
        wrongMeanings: [
          "a person who writes recipes",
          "a large amount of experience",
          "permission to enter a place",
        ],
        context: "the card had authority and Amina had only four flat trays",
      },
    ],
    figurative: [
      {
        phrase: "roughly equivalent to saying the sky was a different colour than everyone had agreed",
        kind: "hyperbole",
        meaning: "contradicting the recipe felt like contradicting something obvious to the whole family",
        literalReading: "the family had held a vote on the colour of the sky",
      },
    ],
    notInText: [
      "Amina's aunt came to help her bake.",
      "The recipe card was destroyed in the flood.",
      "Amina threw away the first card.",
      "Her grandmother had told her about the second copy.",
    ],
  },
  {
    id: "g6x.the-cut",
    grade: 6,
    genre: "literary",
    title: "The List on the Door",
    text: `There were forty-one people at the tryout and fourteen places, and the list went up at four o'clock on Thursday, and Wren's name was not on it.

She had known within about a second of looking, but she read the whole list anyway, twice, the way you do, in case the second reading changed something.

Behind her, Ify made a sound and then apologised for making it, which was worse than anything else that happened that afternoon.

Wren went home and did not cry, which surprised her, and did her mathematics homework, which surprised her more. At about nine she got out the notebook she kept for nothing in particular and wrote down what she thought had gone wrong, and the list came to four things, and only one of them was about being cut.

The four things were: she had been slow to the ball on the left side; her first touch under pressure was inconsistent; she had spent the whole hour trying not to make a mistake instead of trying to do something; and she had not spoken once during the entire tryout, not to anybody, not even to call for a pass.

The last one was the one she kept looking at. It had nothing to do with being good at football.

Coach Adeyemi had office hours on Fridays, which nobody used. Wren used them. She asked what she should work on, and braced herself for something kind and useless.

He said, "You're quicker than four people who made it. You didn't ask for the ball once."

"I didn't want to be — " She stopped, because she was not sure how the sentence ended.

"Greedy," he said. "I know. Everybody who doesn't ask says the same word." He wrote something on a card and gave it to her. "Winter league at the community centre. Sunday mornings, no tryout, anybody can play. Go and be greedy there for four months, and come back in April."

She went. It was cold and disorganised and the pitch had a slope, and for the first three Sundays she was terrible in a new way, which turned out to be different from being terrible in the old way, and much more useful.`,
    elements: {
      characters: ["Wren", "Ify", "Coach Adeyemi"],
      setting: "a school tryout, a bedroom, an office, and a winter league pitch",
      problem:
        "Wren is cut from the team and does not know what she should work on",
      solution:
        "she analyses her own play, asks the coach directly, and joins a winter league to practise asking for the ball",
      narrator: "someone outside the story who knows what Wren notices about herself",
      pointOfView: "third person",
    },
    theme:
      "The most useful thing to fix is often not the skill you were judged on but the habit underneath it.",
    perspectives: [
      {
        character: "Wren",
        view: "She assumed she had been cut for not being good enough at football.",
      },
      {
        character: "Coach Adeyemi",
        view: "He thought her speed was fine and her silence was the actual problem.",
      },
    ],
    sequence: [
      "The team list goes up and Wren's name is not on it.",
      "That evening she writes down four things she thinks went wrong.",
      "She notices the last one is about not speaking rather than about skill.",
      "She goes to the coach's office hours and asks what to work on.",
      "He sends her to a winter league and tells her to come back in April.",
    ],
    vocabulary: [
      {
        word: "inconsistent",
        meaning: "not the same every time; unreliable",
        wrongMeanings: [
          "extremely slow",
          "always the same",
          "difficult to see",
        ],
        context: "her first touch under pressure was inconsistent",
      },
      {
        word: "braced",
        meaning: "got herself ready for something unpleasant",
        wrongMeanings: [
          "leaned against a wall",
          "asked a question politely",
          "fixed something that was broken",
        ],
        context: "braced herself for something kind and useless",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "terrible in a new way",
        kind: "metaphor",
        meaning: "failing at something she had never attempted before, which is progress",
        literalReading: "a fresh variety of badness had been invented",
      },
    ],
    notInText: [
      "Wren was the fastest player at the tryout.",
      "Ify was also cut from the team.",
      "Coach Adeyemi offered Wren a place on the team.",
      "Wren stopped playing football after being cut.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 6 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g6x.red-tide",
    grade: 6,
    genre: "informational",
    title: "The Bloom That Empties the Beaches",
    text: `Karenia brevis is a single-celled organism about a fiftieth of a millimetre across. When enough of them gather in one place, the water turns rust-coloured, fish die in numbers large enough to be bulldozed off the sand, and people standing on the beach start to cough. Floridians call it red tide.

Red tide is not new and it is not caused by people. Spanish explorers recorded fish kills off the Gulf coast in the sixteenth century, long before there was a single fertiliser factory on the continent. The organism lives permanently offshore in low numbers, thirty or forty miles out, and it always has.

What turns a normal population into a bloom is a combination of things. Currents and winds have to carry the offshore cells toward the coast. Once there, they need nutrients — nitrogen and phosphorus — and this is where human activity enters a story it did not begin. Runoff from farms, leaking septic tanks, treated wastewater and fertilised lawns all deliver nitrogen to coastal water. The bloom did not start because of that nitrogen. It can be fed, extended, and intensified by it.

The organism produces brevetoxins, which attack the nervous systems of fish. Waves break the cells open and put the toxin into the air as an aerosol, which is why a red tide can make a person on the beach cough without their ever entering the water. For people with asthma it is considerably worse than a cough.

The economic effect is easier to measure than the ecological one. A single severe bloom in 2018 closed beaches along a hundred and fifty miles of coast through the summer, and Lee County alone estimated losses to tourism in the hundreds of millions.

The uncomfortable part of the science is that we cannot stop a bloom once it forms, and we cannot prevent one from starting, because we did not cause the starting. What is within reach is the fuel. Reducing what runs off the land will not end red tide. It will make the difference between a bloom that lasts weeks and one that lasts a year — which, to anybody who lives on that coast, is not a small difference at all.`,
    centralIdea:
      "Red tide is a natural offshore organism whose blooms people cannot start or stop, but human nutrient runoff can make a bloom last far longer.",
    supportingDetails: [
      "Spanish explorers recorded Gulf coast fish kills in the sixteenth century.",
      "Karenia brevis lives permanently offshore in low numbers.",
      "Brevetoxins become airborne when waves break the cells open.",
      "A 2018 bloom closed a hundred and fifty miles of coast and cost Lee County hundreds of millions.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "Cutting nutrient runoff is worth doing even though it cannot prevent red tide from occurring.",
    opinionEvidence: [
      "What is within reach is the fuel.",
      "It will make the difference between a bloom that lasts weeks and one that lasts a year — which, to anybody who lives on that coast, is not a small difference at all.",
      "It can be fed, extended, and intensified by it.",
    ],
    textFeatures: [
      {
        feature: "map",
        purpose: "shows where places are and how they relate to one another",
        notPurpose: [
          "defines the technical terms used in the text",
          "shows the order in which events happened",
          "names the person who took the photographs",
        ],
      },
      {
        feature: "table",
        purpose: "sets figures beside one another so they can be compared",
        notPurpose: [
          "explains what a diagram is showing",
          "lists the sections of the text",
          "gives the writer's opinion",
        ],
      },
    ],
    vocabulary: [
      {
        word: "runoff",
        meaning: "water that flows over land into rivers and the sea, carrying what it picks up",
        wrongMeanings: [
          "a race held to decide a tie",
          "water that soaks straight down into rock",
          "the tide going out from a beach",
        ],
        context: "Runoff from farms, leaking septic tanks, treated wastewater and fertilised lawns",
        multipleMeaning: true,
      },
      {
        word: "intensified",
        meaning: "made stronger or more severe",
        wrongMeanings: [
          "measured accurately",
          "brought to an end",
          "moved further away",
        ],
        context: "It can be fed, extended, and intensified by it.",
      },
    ],
    figurative: [
      {
        phrase: "this is where human activity enters a story it did not begin",
        kind: "metaphor",
        meaning: "people did not cause red tide but do affect how it develops",
        literalReading: "a person walked into a book that was already being written",
      },
    ],
    notInText: [
      "Red tide was first recorded in the twentieth century.",
      "Fertiliser runoff causes red tide blooms to begin.",
      "Brevetoxins are harmless to people on the beach.",
      "Blooms can be stopped once they have formed.",
    ],
  },
  {
    id: "g6x.grades-for",
    grade: 6,
    genre: "informational",
    title: "What Grades Are For",
    text: `Every few years somebody proposes abolishing grades, and the proposal is usually made by people who did well at school. That is not an argument against it, but it is worth noticing.

A grade does three jobs, and they are frequently confused with one another. It tells a student where they stand. It tells a teacher whether the teaching worked. And it tells somebody outside the classroom — the next school, an employer, a scholarship committee — something they cannot find out for themselves.

The third job is the one that is hardest to replace. A written comment saying that a student engages thoughtfully with challenging texts is more informative than a B, provided you trust the person who wrote it and you have time to read four hundred of them. A scholarship committee reading two thousand applications has neither. Where grades have been removed, what usually replaces them is not a richer picture but a reliance on things that are worse: the reputation of the school, the confidence of the applicant, and who knows whom.

The second job matters more than students realise. A teacher looking at a set of results can see that eleven people missed the same question, which is information about the lesson rather than about the eleven people. Removing the measurement does not remove the problem; it removes the teacher's ability to see it.

The first job is the one grades do worst, and most of the case against them is really a case about this. A single letter tells a student almost nothing about what to do next. But the answer to a bad instrument is a better one, not none — a grade with a comment attached, returned quickly enough to act on, is a different thing from a grade alone at the end of a term.

It is also worth being honest about who the objection usually protects. A student with a strong grade rarely wants the grade removed. The demand tends to come on behalf of students who are doing badly, and for some of them the number is the only evidence anybody will accept that the teaching, not the student, is what failed.

Grades are a poor summary of a person. They were never meant to be a summary of a person. They are a summary of a set of work, and the mistake worth fixing is the one that confuses the two.`,
    centralIdea:
      "Grades should be kept and improved rather than abolished, because they do jobs — especially communicating outside the classroom — that comments alone cannot do at scale.",
    supportingDetails: [
      "A grade tells a student where they stand, tells a teacher whether the lesson worked, and tells outsiders something they cannot find out themselves.",
      "A scholarship committee reading two thousand applications cannot read long written comments.",
      "Results showing eleven students missed the same question are information about the lesson.",
      "Where grades are removed, reputation and connections often take their place.",
    ],
    authorPurpose: "to persuade",
    authorOpinion: "Grades should be improved rather than abolished.",
    opinionEvidence: [
      "Where grades have been removed, what usually replaces them is not a richer picture but a reliance on things that are worse: the reputation of the school, the confidence of the applicant, and who knows whom.",
      "Removing the measurement does not remove the problem; it removes the teacher's ability to see it.",
      "But the answer to a bad instrument is a better one, not none — a grade with a comment attached, returned quickly enough to act on, is a different thing from a grade alone at the end of a term.",
    ],
    textFeatures: [
      {
        feature: "heading",
        purpose: "tells the reader what the section below it will discuss",
        notPurpose: [
          "gives the meaning of an unfamiliar word",
          "shows where a place can be found",
          "lists the figures being compared",
        ],
      },
    ],
    vocabulary: [
      {
        word: "abolishing",
        meaning: "putting an end to something completely",
        wrongMeanings: [
          "improving something gradually",
          "making something compulsory",
          "measuring something more often",
        ],
        context: "somebody proposes abolishing grades",
      },
      {
        word: "instrument",
        meaning: "a tool used for measuring something",
        wrongMeanings: [
          "a device for making music",
          "a legal document",
          "a person who carries out a plan",
        ],
        context: "the answer to a bad instrument is a better one",
        multipleMeaning: true,
      },
    ],
    pairedWith: "g6x.grades-against",
    sharedWithPair: [
      "Both texts agree that a single letter tells a student little about what to do next.",
      "Both texts are about whether schools should keep giving grades.",
      "Both texts accept that grades affect what happens after school.",
    ],
    uniqueToThis: [
      "Only this text argues that removing grades makes reputation and connections matter more.",
      "Only this text says grades let a teacher see that a lesson did not work.",
    ],
    notInText: [
      "Grades were introduced in the nineteenth century.",
      "Most schools have already abolished grades.",
      "Employers do not look at school records.",
      "Written comments are always less accurate than grades.",
    ],
  },
  {
    id: "g6x.grades-against",
    grade: 6,
    genre: "informational",
    title: "What Grades Cost",
    text: `Ask a class what they got and every hand knows the answer. Ask the same class what they learned and the room goes quiet. That gap is the case against grades, and it is not a small one.

The clearest evidence comes from a study design that has been repeated many times. Students are given the same piece of work back in three different ways: with a grade only, with a comment only, or with both. The students who received a comment only improved most on the next piece. The students who received both improved about as little as the students who received a grade alone — because once a grade is present, almost nobody reads the comment. The grade answers the question the student was asking, and the reading stops there.

Grades also change what a student chooses to do. A student being graded picks the task they can already do. This is rational: the safe essay title, the science project with a known result, the piece of music learned last year. Every one of those decisions is correct if the goal is the grade and wrong if the goal is learning, and students work out very quickly which goal is actually being measured.

The obvious reply is that the world grades people, and school should prepare them for it. But the world grades people occasionally and at the end: a driving test, an interview, a licence. It does not grade a learner driver on every roundabout while they are still learning to use the mirrors, and if it did, fewer people would learn to drive.

There is a cost to the relationship as well. A teacher who grades is, several times a term, a judge. That is not incompatible with being a coach, but it is in tension with it, and students manage the tension by hiding what they do not understand from the person best placed to fix it.

None of this means results should never be recorded. It means the recording should happen rarely — a few times a year rather than weekly — and that the work in between should come back with something a student can act on and no number at the top. The argument is not against measuring. It is against measuring so often that the measurement becomes the subject.`,
    centralIdea:
      "Grades should be given rarely, because a grade attached to work stops students reading feedback and pushes them toward tasks they can already do.",
    supportingDetails: [
      "Students given a comment only improved more on the next piece than students given a grade.",
      "Students given both a grade and a comment improved as little as those given a grade alone.",
      "A student being graded chooses the safe task they can already complete.",
      "Students hide what they do not understand from the teacher who is also the judge.",
    ],
    authorPurpose: "to persuade",
    authorOpinion:
      "Work should usually be returned with feedback and no grade, with results recorded only a few times a year.",
    opinionEvidence: [
      "The students who received a comment only improved most on the next piece.",
      "The students who received both improved about as little as the students who received a grade alone — because once a grade is present, almost nobody reads the comment.",
      "It is against measuring so often that the measurement becomes the subject.",
    ],
    textFeatures: [
      {
        feature: "table",
        purpose: "puts results side by side so the difference between them is visible",
        notPurpose: [
          "explains the meaning of a specialist term",
          "shows the order in which events happened",
          "labels the parts of an illustration",
        ],
      },
      {
        feature: "bold word",
        purpose: "marks a term that is important and defined somewhere in the text",
        notPurpose: [
          "shows which page a section begins on",
          "indicates the writer's opinion",
          "names the source of a photograph",
        ],
      },
    ],
    vocabulary: [
      {
        word: "rational",
        meaning: "sensible given what the person is trying to achieve",
        wrongMeanings: [
          "dishonest but effective",
          "decided without thinking",
          "shared by everyone",
        ],
        context: "This is rational: the safe essay title",
      },
      {
        word: "tension",
        meaning: "a pull between two things that do not fit easily together",
        wrongMeanings: [
          "a feeling of physical pain",
          "a tightly stretched rope",
          "an argument between two people",
        ],
        context: "it is in tension with it",
        multipleMeaning: true,
      },
    ],
    pairedWith: "g6x.grades-for",
    sharedWithPair: [
      "Both texts agree that a single letter tells a student little about what to do next.",
      "Both texts are about whether schools should keep giving grades.",
      "Both texts accept that grades affect what happens after school.",
    ],
    uniqueToThis: [
      "Only this text reports that students given both a grade and a comment improve as little as those given a grade alone.",
      "Only this text argues that being graded pushes students toward tasks they can already do.",
    ],
    notInText: [
      "Schools should stop recording results entirely.",
      "Students read comments more carefully when a grade is attached.",
      "Graded students choose harder tasks than ungraded ones.",
      "Teachers prefer grading to writing comments.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 6 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g6x.the-move",
    grade: 6,
    genre: "poetry",
    title: "Inventory",
    text: `Eleven boxes. Everything I own
fits into eleven boxes and a bag.
I did not know that. Now I know that.
The rooms look bigger empty than they did.

The pencil marks are on the kitchen doorframe,
one every birthday, seven up to twelve.
My mother says we cannot take a doorframe.
My father goes and photographs it anyway.

The new place has a window facing east,
which means the mornings will arrive too early,
which means that I will wake before I want to
in a room that has not learned my name yet.

I am allowed to feel two things at once.
Nobody told me that. I worked it out
somewhere around the third or fourth box,
taping it shut, and glad about the window.`,
    stanzas: 4,
    linesPerStanza: 4,
    rhymeScheme: "free verse",
    theme:
      "Leaving a place and looking forward to the next one are not opposites, and a person can hold both.",
    perspectives: [
      {
        character: "the mother",
        view: "She takes the practical view that a doorframe cannot be packed.",
      },
      {
        character: "the father",
        view: "He photographs the marks so the record survives even though the wood cannot.",
      },
    ],
    vocabulary: [
      {
        word: "inventory",
        meaning: "a complete list of everything in a place",
        wrongMeanings: [
          "a new idea nobody has had before",
          "a journey to a distant place",
          "an argument about who owns something",
        ],
        context: "the title",
      },
    ],
    figurative: [
      {
        phrase: "in a room that has not learned my name yet",
        kind: "personification",
        meaning: "the new bedroom does not feel like his own yet",
        literalReading: "a room is capable of learning names and has not done so",
      },
      {
        phrase: "The rooms look bigger empty than they did",
        kind: "metaphor",
        meaning: "removing everything changes how the familiar place feels",
        literalReading: "the walls moved outward once the boxes were filled",
      },
    ],
    notInText: [
      "The family is moving to another country.",
      "The narrator does not want to move at all.",
      "The pencil marks were painted over.",
      "There are twelve boxes in total.",
    ],
  },
  {
    id: "g6x.the-river",
    grade: 6,
    genre: "poetry",
    title: "What the River Is Made Of",
    text: `Ask where a river starts and you will get
a place on a map, a spring, a name, a date.
That is the answer people like to give.
It is not wrong. It is not adequate.

A river is the rain of eighty counties.
It is the field that would not hold its soil,
the roof that shed in April, the one storm
in 1993 nobody recalls.

It carries what was given. That is all.
It has no view about the fertiliser,
the loosened bank, the concrete, or the oil.
It simply takes the sum and moves it south.

So when we say the river has gone bad
we are describing arithmetic, not blame,
and every term in it was set by somebody
upstream, who did not think to sign their name.`,
    stanzas: 4,
    linesPerStanza: 4,
    rhymeScheme: "free verse",
    theme:
      "The condition of a shared thing is the total of many separate choices, most of them made by people who never see the result.",
    vocabulary: [
      {
        word: "adequate",
        meaning: "enough for what is needed",
        wrongMeanings: [
          "completely incorrect",
          "extremely detailed",
          "difficult to understand",
        ],
        context: "It is not adequate.",
      },
      {
        word: "terms",
        meaning: "the separate parts that are added together in a sum",
        wrongMeanings: [
          "the conditions of an agreement",
          "the periods a school year is divided into",
          "words used in a particular subject",
        ],
        context: "every term in it was set by somebody",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "A river is the rain of eighty counties",
        kind: "metaphor",
        meaning: "everything in the river came from the whole area that drains into it",
        literalReading: "the river is composed only of rainwater from eighty places",
      },
      {
        phrase: "It has no view about the fertiliser",
        kind: "personification",
        meaning: "the river carries whatever enters it without judgement",
        literalReading: "the river is capable of holding opinions and holds none",
      },
      {
        phrase: "we are describing arithmetic, not blame",
        kind: "metaphor",
        meaning: "the state of the river is a total of contributions rather than one person's fault",
        literalReading: "a sum has been written down instead of an accusation",
      },
    ],
    notInText: [
      "The river begins at a spring in 1993.",
      "One factory is responsible for the river's condition.",
      "The river flows north to the sea.",
      "Eighty counties have agreed to clean the river.",
    ],
  },
];
