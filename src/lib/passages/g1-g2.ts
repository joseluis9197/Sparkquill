import type { Passage } from "./types";

/**
 * Passages for grades 1 and 2.
 *
 * Short sentences, concrete nouns, and a problem a six-year-old recognises.
 * The vocabulary notes deliberately pick words a child can work out from the
 * sentence around them rather than words they simply will or will not know —
 * the benchmark is about using context, not about having met the word before.
 */

export const G1_G2_PASSAGES: Passage[] = [
  /* ---------------------------------------------------------------- *
   * Grade 1 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g1.lost-mitten",
    grade: 1,
    genre: "literary",
    title: "The Lost Mitten",
    text: `Rosa lost one red mitten on the way to school.

Her hand was cold all morning. She kept it in her pocket.

At lunch, Sam held up a red mitten. "I found this by the gate," he said.

Rosa smiled. "That is mine! Thank you, Sam."

Now both of her hands were warm.`,
    elements: {
      characters: ["Rosa", "Sam"],
      setting: "at school on a cold day",
      problem: "Rosa lost one of her red mittens and her hand was cold",
      solution: "Sam found the mitten by the gate and gave it back to her",
      narrator: "someone outside the story who watches what happens",
      pointOfView: "third person",
    },
    theme: "Helping someone with a small problem can make their whole day better.",
    sequence: [
      "Rosa loses a mitten on the way to school.",
      "Her hand is cold all morning.",
      "Sam finds the mitten by the gate.",
      "Rosa gets her mitten back and is warm.",
    ],
    vocabulary: [
      {
        word: "lost",
        meaning: "could not find something any more",
        wrongMeanings: ["threw something away on purpose", "gave something to a friend", "made something new"],
        context: "Rosa lost one red mitten on the way to school.",
      },
    ],
    notInText: [
      "Rosa was late for school.",
      "Sam lost his own mitten too.",
      "Rosa's mitten was blue.",
      "It started to snow at lunch.",
    ],
  },
  {
    id: "g1.turtle-and-hare",
    grade: 1,
    genre: "literary",
    title: "Slow and Steady",
    text: `Hare could run fast. Turtle could not.

"I will win," said Hare. "You are too slow."

They began the race. Hare ran far ahead. Then he sat down under a tree to rest. Soon he fell asleep.

Turtle kept walking. Step, step, step. He did not stop.

When Hare woke up, Turtle was already at the end.`,
    elements: {
      characters: ["Hare", "Turtle"],
      setting: "a race along a path with a tree beside it",
      problem: "Hare is much faster than Turtle, so the race seems unfair",
      solution: "Hare stops to rest and falls asleep while Turtle keeps going and finishes first",
      narrator: "someone outside the story telling what the animals did",
      pointOfView: "third person",
    },
    theme: "Keeping going steadily matters more than being fast.",
    perspectives: [
      { character: "Hare", view: "He was sure he would win because he could run fast." },
      { character: "Turtle", view: "He knew he was slow, so he decided not to stop at all." },
    ],
    sequence: [
      "Hare says he will win because Turtle is slow.",
      "The race begins and Hare runs far ahead.",
      "Hare rests under a tree and falls asleep.",
      "Turtle keeps walking and reaches the end first.",
    ],
    vocabulary: [
      {
        word: "steady",
        meaning: "going on at the same pace without stopping",
        wrongMeanings: ["very fast", "very loud", "asleep"],
        context: "Turtle kept walking. Step, step, step. He did not stop.",
      },
    ],
    notInText: [
      "Turtle ran faster than Hare.",
      "Hare said sorry at the end.",
      "The race was around a lake.",
      "Turtle woke Hare up.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 1 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g1.bats",
    grade: 1,
    genre: "informational",
    title: "Bats at Night",
    text: `Bats sleep all day. They wake up when the sun goes down.

Bats are not birds. Bats have fur, not feathers.

Most bats eat insects. One bat can eat hundreds of bugs in one night.

Bats make small sounds as they fly. The sounds bounce back and tell the bat what is ahead. This is how a bat can fly in the dark without bumping into things.`,
    centralIdea: "Bats are night animals with special ways of finding food and flying in the dark.",
    supportingDetails: [
      "Bats have fur instead of feathers.",
      "Most bats eat insects.",
      "Bats use sounds that bounce back to find their way.",
      "Bats sleep during the day.",
    ],
    authorPurpose: "to inform",
    textFeatures: [
      {
        feature: "title",
        purpose: "tells you what the whole text will be about",
        notPurpose: [
          "tells you who wrote the text",
          "explains what a hard word means",
          "shows where to find each page",
        ],
      },
    ],
    vocabulary: [
      {
        word: "bounce",
        meaning: "come back after hitting something",
        wrongMeanings: ["jump up and down for fun", "disappear completely", "get louder and louder"],
        context: "The sounds bounce back and tell the bat what is ahead.",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "Bats are a kind of bird.",
      "Bats cannot see anything at all.",
      "Bats build nests in trees.",
      "All bats eat fruit.",
    ],
    pairedWith: "g1.owls",
    sharedWithPair: ["Both animals hunt at night.", "Both animals eat other creatures."],
    uniqueToThis: ["Uses sound that bounces back to find its way.", "Has fur instead of feathers."],
  },
  {
    id: "g1.owls",
    grade: 1,
    genre: "informational",
    title: "Owls at Night",
    text: `Owls hunt at night. They rest during the day.

An owl has very big eyes. Big eyes let in more light, so an owl can see when it is nearly dark.

Owls have soft feathers. Soft feathers make almost no sound when an owl flies. A mouse below does not hear the owl coming.

Owls eat mice, insects and small birds.`,
    centralIdea: "Owls have big eyes and quiet feathers that help them hunt at night.",
    supportingDetails: [
      "Owls have very big eyes that let in more light.",
      "Soft feathers make an owl's flight almost silent.",
      "Owls eat mice, insects and small birds.",
    ],
    authorPurpose: "to inform",
    vocabulary: [
      {
        word: "hunt",
        meaning: "look for animals to catch and eat",
        wrongMeanings: ["hide from other animals", "sing to other birds", "build a home"],
        context: "Owls hunt at night.",
      },
    ],
    notInText: [
      "Owls sleep in caves.",
      "Owls cannot fly in the rain.",
      "Owls use sound that bounces back.",
      "Owls eat only fruit.",
    ],
    pairedWith: "g1.bats",
    sharedWithPair: ["Both animals hunt at night.", "Both animals eat other creatures."],
    uniqueToThis: ["Has very big eyes for seeing in low light.", "Has soft feathers that make flying quiet."],
  },

  {
    id: "g1.recess",
    grade: 1,
    genre: "informational",
    title: "More Time Outside",
    text: `Kids need time outside every day.

Running and playing helps your body get strong.

Going outside also helps your brain. After recess, kids sit still better and listen better.

Some schools give only fifteen minutes of recess. That is not enough. Every school should give kids at least thirty minutes to play outside.`,
    centralIdea: "Children need time outside every day, and schools should give them more of it.",
    supportingDetails: [
      "Running and playing helps your body get strong.",
      "Going outside helps your brain.",
      "After recess, kids listen better.",
      "Some schools give only fifteen minutes of recess.",
    ],
    authorPurpose: "to persuade",
    authorOpinion: "Every school should give kids at least thirty minutes of recess.",
    opinionEvidence: [
      "Running and playing helps your body get strong.",
      "After recess, kids sit still better and listen better.",
      "Going outside also helps your brain.",
    ],
    textFeatures: [
      {
        feature: "title",
        purpose: "tells you what the writer wants you to think about",
        notPurpose: [
          "gives the meaning of a hard word",
          "shows a picture of the topic",
          "lists the pages in the book",
        ],
      },
    ],
    vocabulary: [
      {
        word: "recess",
        meaning: "a break in the school day for playing outside",
        wrongMeanings: ["a test at the end of the year", "a room inside the school", "a kind of homework"],
        context: "Some schools give only fifteen minutes of recess.",
      },
    ],
    notInText: [
      "Recess should happen twice a day.",
      "Playing outside is dangerous in hot weather.",
      "Most schools already give thirty minutes.",
      "Children learn nothing during recess.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 1 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g1.rain-song",
    grade: 1,
    genre: "poetry",
    title: "Rain Song",
    text: `Rain on the window,
Rain on the street,
Rain on the roof
Makes a soft little beat.

Rain in the garden,
Rain on the tree,
Rain in the puddle
That waits here for me.`,
    stanzas: 2,
    linesPerStanza: 4,
    rhymeScheme: "ABCB",
    theme: "Rain touches everything around us, and even a puddle can be something to look forward to.",
    figurative: [
      {
        phrase: "Makes a soft little beat",
        kind: "metaphor",
        meaning: "the sound of the rain is like quiet drumming",
        literalReading: "the rain is playing a drum",
      },
      {
        phrase: "the puddle that waits here for me",
        kind: "personification",
        meaning: "the puddle will still be there when the writer comes out",
        literalReading: "the puddle is a person standing and waiting",
      },
    ],
    vocabulary: [
      {
        word: "beat",
        meaning: "a repeated sound, like a drum",
        wrongMeanings: ["won a game", "mixed something up", "a kind of vegetable"],
        context: "Rain on the roof makes a soft little beat.",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "The rain stops at the end of the poem.",
      "The writer is standing in the garden.",
      "It is snowing as well.",
      "The rain is loud and frightening.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 2 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g2.garden-plot",
    grade: 2,
    genre: "literary",
    title: "The Empty Patch",
    text: `Behind the school there was a patch of dirt where nothing grew. Weeds came up in spring and died by summer. Everyone walked past it.

Marisol looked at the patch for a whole week. Then she asked Mr. Okafor if her class could plant something there.

"That dirt is packed hard as a road," he said. "Nothing has grown there in years."

"Then we will dig it up," said Marisol.

It took four afternoons. The class broke the hard ground with trowels, pulled out stones, and mixed in dark compost from the bin behind the kitchen. Marisol's hands ached.

In April they planted beans. In May the first green shoots pushed through.

Mr. Okafor stood at the edge of the patch and shook his head slowly. "I was wrong about that dirt," he said.

Marisol grinned. "It was not the dirt," she said. "It was that nobody had tried."`,
    elements: {
      characters: ["Marisol", "Mr. Okafor", "the class"],
      setting: "a patch of hard dirt behind a school, in spring",
      problem: "Nothing would grow in the hard, packed patch of dirt behind the school",
      solution: "Marisol and her class dug up the ground, removed stones and added compost until beans grew",
      narrator: "someone outside the story who tells what the characters did and said",
      pointOfView: "third person",
    },
    theme: "A problem that looks impossible is often just a problem nobody has tried to solve yet.",
    perspectives: [
      {
        character: "Mr. Okafor",
        view: "He believed the soil itself was the problem and that planting would fail.",
      },
      {
        character: "Marisol",
        view: "She believed the patch could grow things if someone put the work in.",
      },
    ],
    sequence: [
      "Marisol notices the empty patch and thinks about it for a week.",
      "She asks Mr. Okafor if the class can plant there, and he doubts it.",
      "The class spends four afternoons digging, clearing stones and adding compost.",
      "They plant beans in April.",
      "Green shoots appear in May and Mr. Okafor admits he was wrong.",
    ],
    vocabulary: [
      {
        word: "compost",
        meaning: "rotted plant material added to soil to help things grow",
        wrongMeanings: ["a tool for digging holes", "a kind of seed", "water mixed with soil"],
        context: "mixed in dark compost from the bin behind the kitchen",
      },
      {
        word: "packed",
        meaning: "pressed together so tightly it was hard",
        wrongMeanings: ["put into a suitcase", "full of people", "wrapped in paper"],
        context: "That dirt is packed hard as a road,",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "packed hard as a road",
        kind: "simile",
        meaning: "the ground was extremely hard and solid",
        literalReading: "the dirt had been made into an actual road",
      },
    ],
    notInText: [
      "Marisol had grown beans at home before.",
      "The class planted flowers as well as beans.",
      "Mr. Okafor helped them dig.",
      "The beans were ready to eat in May.",
    ],
  },
  {
    id: "g2.night-of-the-storm",
    grade: 2,
    genre: "literary",
    title: "The Night the Lights Went Out",
    text: `The storm knocked out the power just after dinner. The whole house went dark and quiet at once. Even the hum of the refrigerator stopped.

Theo did not like it. He liked his lamp and his shows and the little green light on the clock.

His grandmother found two candles and set them on the kitchen table. The flames made shadows that stretched up the wall and leaned over like tall visitors.

"Tell me about when you were small," Theo said, mostly so somebody would be talking.

So she did. She told him about a village with one water pump, and a dog named Biscuit who followed her to school every day and waited outside.

The power came back at ten o'clock. The lights snapped on and the refrigerator started humming again.

Theo blinked. "Can we blow the candles out again?" he asked.`,
    elements: {
      characters: ["Theo", "his grandmother"],
      setting: "a house during a storm, in the evening",
      problem: "A storm cuts the power and Theo is uneasy in the dark",
      solution: "His grandmother lights candles and tells him stories, and he ends up enjoying it",
      narrator: "someone outside the story who can tell what Theo is thinking",
      pointOfView: "third person",
    },
    theme: "Something that seems like a problem at first can turn into the best part of the day.",
    perspectives: [
      { character: "Theo at the start", view: "He was uneasy and missed his lamp, his shows and the clock light." },
      { character: "Theo at the end", view: "He wanted the lights off again so the storytelling could continue." },
    ],
    sequence: [
      "The storm knocks out the power after dinner.",
      "Theo is uneasy in the sudden dark and quiet.",
      "His grandmother lights two candles.",
      "She tells him stories about her childhood.",
      "The power returns, and Theo asks to put the candles back on.",
    ],
    vocabulary: [
      {
        word: "stretched",
        meaning: "grew longer",
        wrongMeanings: ["became narrow and thin", "disappeared suddenly", "made a loud noise"],
        context: "The flames made shadows that stretched up the wall",
      },
      {
        word: "hum",
        meaning: "a low steady sound",
        wrongMeanings: ["a song with words", "a bright light", "a sudden bang"],
        context: "Even the hum of the refrigerator stopped.",
      },
    ],
    figurative: [
      {
        phrase: "leaned over like tall visitors",
        kind: "simile",
        meaning: "the shadows looked like people standing over the table",
        literalReading: "actual visitors came into the kitchen",
      },
    ],
    notInText: [
      "Theo was frightened of the storm itself.",
      "The candles went out during the night.",
      "Theo's grandmother lived in the village now.",
      "Biscuit was Theo's dog.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 2 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g2.manatees",
    grade: 2,
    genre: "informational",
    title: "Florida's Gentle Giants",
    text: `A manatee can weigh as much as a small car, but it moves slowly and eats only plants.

Manatees live in the warm water of Florida's rivers and springs. When the sea gets cold in winter, manatees swim inland to water that stays warm all year. A manatee that stays in cold water can get sick.

Manatees eat sea grass. A grown manatee eats for six or seven hours every day.

Boats are the biggest danger to manatees. Because manatees swim near the surface, a fast boat can hit one before the driver sees it. Many rivers now have signs telling boats to go slowly.

Manatees have no natural enemies. Almost everything that hurts them comes from people, which means almost everything that hurts them is something people can change.`,
    centralIdea:
      "Manatees are large, slow plant-eaters that need warm water, and the dangers they face come mostly from people.",
    supportingDetails: [
      "Manatees move inland in winter to find warm water.",
      "A grown manatee eats sea grass for six or seven hours a day.",
      "Boats are the biggest danger because manatees swim near the surface.",
      "Many rivers have signs telling boats to go slowly.",
    ],
    authorPurpose: "to inform",
    authorOpinion: "The dangers manatees face are ones people could fix.",
    opinionEvidence: [
      "Manatees have no natural enemies.",
      "Almost everything that hurts them comes from people, which means almost everything that hurts them is something people can change.",
      "Many rivers now have signs telling boats to go slowly.",
    ],
    textFeatures: [
      {
        feature: "heading",
        purpose: "tells you what the section underneath it is about",
        notPurpose: [
          "gives the meaning of a difficult word",
          "shows where an animal lives on a map",
          "names the person who wrote the text",
        ],
      },
      {
        feature: "caption",
        purpose: "explains what a picture is showing",
        notPurpose: [
          "lists the pages in order",
          "tells you the writer's opinion",
          "shows how big something is compared with a person",
        ],
      },
    ],
    vocabulary: [
      {
        word: "inland",
        meaning: "away from the sea, towards the middle of the land",
        wrongMeanings: ["deeper under the water", "further out to sea", "up onto the beach"],
        context: "manatees swim inland to water that stays warm all year",
      },
      {
        word: "surface",
        meaning: "the top of the water",
        wrongMeanings: ["the bottom of the river", "the shore beside the water", "a kind of sea grass"],
        context: "manatees swim near the surface",
      },
    ],
    figurative: [
      {
        phrase: "gentle giants",
        kind: "metaphor",
        meaning: "very large animals that are not dangerous",
        literalReading: "giants from a story who are being kind",
      },
    ],
    notInText: [
      "Manatees eat fish as well as plants.",
      "Manatees are hunted by sharks.",
      "Manatees live only in the ocean.",
      "Manatees swim faster than boats.",
    ],
    pairedWith: "g2.sea-turtles",
    sharedWithPair: [
      "Both animals live in Florida's warm water.",
      "Both animals are put in danger by things people do.",
    ],
    uniqueToThis: ["Eats only plants.", "Needs to move to warmer water in winter."],
  },
  {
    id: "g2.sea-turtles",
    grade: 2,
    genre: "informational",
    title: "The Long Walk to the Sea",
    text: `Every summer, sea turtles come up onto Florida beaches at night. A mother turtle digs a deep hole in the sand, lays her eggs, covers them, and goes back into the water. She never sees her babies.

About two months later, the eggs hatch. The tiny turtles dig their way up through the sand and head for the sea.

They find the water by looking for the brightest, lowest light. For millions of years that light was the moon shining on the ocean. Now bright lights from houses and streets can be brighter than the moon, and a baby turtle may crawl the wrong way.

That is why some Florida towns turn beach lights off in summer. A dark beach in July is not an empty beach. It is a beach doing its job.`,
    centralIdea:
      "Baby sea turtles find the ocean by following light, so bright lights near the beach can send them the wrong way.",
    supportingDetails: [
      "A mother turtle buries her eggs in the sand and returns to the sea.",
      "The eggs hatch about two months later.",
      "Hatchlings head towards the brightest, lowest light.",
      "Some Florida towns turn off beach lights in summer.",
    ],
    authorPurpose: "to persuade",
    authorOpinion: "Turning beach lights off in summer is worth doing.",
    opinionEvidence: [
      "Now bright lights from houses and streets can be brighter than the moon, and a baby turtle may crawl the wrong way.",
      "They find the water by looking for the brightest, lowest light.",
      "It is a beach doing its job.",
    ],
    vocabulary: [
      {
        word: "hatch",
        meaning: "break out of an egg",
        wrongMeanings: ["dig a hole in the sand", "swim out to sea", "grow to full size"],
        context: "About two months later, the eggs hatch.",
      },
    ],
    notInText: [
      "The mother turtle stays to guard the eggs.",
      "Baby turtles follow their mother to the water.",
      "Sea turtles hatch in winter.",
      "Turtles cannot see light at all.",
    ],
    pairedWith: "g2.manatees",
    sharedWithPair: [
      "Both animals live in Florida's warm water.",
      "Both animals are put in danger by things people do.",
    ],
    uniqueToThis: ["Lays eggs on the beach at night.", "Its babies find the sea by following light."],
  },

  /* ---------------------------------------------------------------- *
   * Grade 2 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g2.sidewalk-crack",
    grade: 2,
    genre: "poetry",
    title: "Crack in the Sidewalk",
    text: `Nobody planted it,
Nobody cared,
Nobody watered it,
Nobody stared.

Up through the concrete,
Green as can be,
One small determined
Dandelion tree.

Sidewalks are solid.
Sidewalks are grey.
Something inside it
Grew anyway.`,
    stanzas: 3,
    linesPerStanza: 4,
    rhymeScheme: "ABCB",
    theme: "Living things can find a way through even in the hardest, least likely places.",
    figurative: [
      {
        phrase: "Nobody planted it, Nobody cared",
        kind: "alliteration",
        meaning: "the repeated 'n' sound at the start of each line makes the neglect feel steady and complete",
        literalReading: "the poem is listing four different people called Nobody",
      },
      {
        phrase: "One small determined dandelion tree",
        kind: "personification",
        meaning: "the plant is described as if it decided to grow",
        literalReading: "the dandelion is actually a tree that made up its mind",
      },
    ],
    vocabulary: [
      {
        word: "determined",
        meaning: "not giving up, even when it is hard",
        wrongMeanings: ["very tall", "brightly coloured", "growing quickly"],
        context: "One small determined dandelion tree.",
      },
      {
        word: "solid",
        meaning: "hard all the way through, with no gaps",
        wrongMeanings: ["a single colour", "very heavy to lift", "completely flat"],
        context: "Sidewalks are solid.",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "Someone planted the dandelion on purpose.",
      "The sidewalk was repaired at the end.",
      "The poem is about a garden.",
      "The dandelion died in the concrete.",
    ],
  },
];
