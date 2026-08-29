import type { Passage } from "./types";

/**
 * More passages for grades 1 and 2.
 *
 * Written because coverage and depth are not the same thing. Every reading
 * standard already had a question template, but every question hung off a
 * library of thirty-nine texts — and grade 1 could draw on eight, with no
 * grade below it to borrow from. A child practising reading daily would have
 * met all of them inside a fortnight, and after that the exercise stops
 * testing reading and starts testing memory of the passage.
 *
 * The shortages were specific rather than general, so these are aimed rather
 * than merely added: texts that state an opinion and back it, which is what
 * the evidence items need; two characters who see one event differently; and
 * a wider spread of text features, whose questions vary by the *kinds* of
 * feature the library knows about rather than by how many passages it holds.
 */

export const EXPANSION_G1_G2_PASSAGES: Passage[] = [
  /* ---------------------------------------------------------------- *
   * Grade 1 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g1x.squeaky-shoes",
    grade: 1,
    genre: "literary",
    title: "The Shoes That Sang",
    text: `Ben got new shoes on Monday.

They squeaked when he walked. Squeak, squeak, all down the hall.

The other children laughed. Ben looked at the floor.

Then Mr. Diaz walked by. His shoes squeaked too.

"New shoes sing for a week," he said. "Then they get quiet."

Ben stood up tall. He walked to his desk. Squeak, squeak, squeak.`,
    elements: {
      characters: ["Ben", "Mr. Diaz"],
      setting: "a school hallway on the day Ben wears his new shoes",
      problem: "Ben's new shoes squeak and the other children laugh at him",
      solution:
        "Mr. Diaz shows Ben that his own shoes squeak too and tells him it stops after a week",
      narrator: "someone outside the story who tells what Ben did",
      pointOfView: "third person",
    },
    theme: "Something that feels embarrassing is often ordinary, and it passes.",
    perspectives: [
      {
        character: "Ben",
        view: "He thought the squeaking made him look silly in front of everyone.",
      },
      {
        character: "Mr. Diaz",
        view: "He thought squeaky new shoes were normal and nothing to hide.",
      },
    ],
    sequence: [
      "Ben wears new shoes to school on Monday.",
      "The shoes squeak and the other children laugh.",
      "Mr. Diaz walks by and his shoes squeak too.",
      "Ben stands up tall and walks to his desk.",
    ],
    vocabulary: [
      {
        word: "squeaked",
        meaning: "made a short, high sound",
        wrongMeanings: [
          "became very wet",
          "grew bigger every day",
          "fell apart at the sides",
        ],
        context: "They squeaked when he walked.",
      },
    ],
    figurative: [
      {
        phrase: "New shoes sing for a week",
        kind: "personification",
        meaning: "New shoes make a noise for a while and then stop.",
        literalReading: "Shoes open their mouths and sing songs out loud.",
      },
    ],
    notInText: [
      "Ben's new shoes were red.",
      "Ben took his shoes off in the hall.",
      "Mr. Diaz bought the shoes for Ben.",
      "The children were sent home.",
    ],
  },
  {
    id: "g1x.too-high",
    grade: 1,
    genre: "literary",
    title: "Too High",
    text: `Maya wanted the blue book. It sat on the top shelf.

She reached. She jumped. She could not touch it.

Her brother Theo was taller. But Theo was outside.

Maya thought for a moment. Then she pushed her chair to the shelf.

She stood on the chair and reached again.

The blue book came down into her hands.`,
    elements: {
      characters: ["Maya", "Theo"],
      setting: "a room at home with a tall bookshelf",
      problem: "the book Maya wants is on a shelf she cannot reach",
      solution: "Maya pushes a chair to the shelf and stands on it",
      narrator: "someone outside the story who watches Maya",
      pointOfView: "third person",
    },
    theme: "You can often solve a problem yourself instead of waiting for help.",
    sequence: [
      "Maya sees the blue book on the top shelf.",
      "She reaches and jumps but cannot touch it.",
      "She pushes her chair over to the shelf.",
      "She stands on the chair and gets the book.",
    ],
    vocabulary: [
      {
        word: "reached",
        meaning: "stretched out an arm to try to touch something",
        wrongMeanings: [
          "arrived at the end of a trip",
          "shouted as loudly as she could",
          "sat down to rest for a while",
        ],
        context: "She reached. She jumped. She could not touch it.",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "Theo got the book down for Maya.",
      "The blue book was about dogs.",
      "Maya called her mother to help.",
      "The shelf fell over on the floor.",
    ],
  },
  {
    id: "g1x.tapping-window",
    grade: 1,
    genre: "literary",
    title: "Who Is Knocking?",
    text: `Tap. Tap. Tap.

Nina heard it at the window. "Someone is knocking," she said. She hid behind the door.

Her grandpa listened. "That is not knocking," he said. "That is rain."

Nina looked out. Little drops hit the glass. Tap. Tap. Tap.

Nina laughed. She was not scared any more.`,
    elements: {
      characters: ["Nina", "Grandpa"],
      setting: "a room by a window on a rainy day",
      problem: "Nina hears a tapping sound and thinks someone is at the window",
      solution: "Grandpa tells her it is rain and she looks out and sees the drops",
      narrator: "someone outside the story telling what Nina and Grandpa did",
      pointOfView: "third person",
    },
    theme: "A sound that seems frightening often has a simple explanation.",
    perspectives: [
      {
        character: "Nina",
        view: "She thought the tapping was a person knocking, so she hid.",
      },
      {
        character: "Grandpa",
        view: "He knew the sound was rain because he had heard it many times.",
      },
    ],
    sequence: [
      "Nina hears tapping at the window.",
      "She thinks someone is knocking and hides behind the door.",
      "Grandpa tells her the sound is rain.",
      "Nina looks out, sees the drops, and laughs.",
    ],
    vocabulary: [
      {
        word: "scared",
        meaning: "afraid that something bad might happen",
        wrongMeanings: [
          "very tired after a long day",
          "hungry and ready to eat",
          "pleased about a surprise",
        ],
        context: "She was not scared any more.",
      },
    ],
    figurative: [
      {
        phrase: "Tap. Tap. Tap.",
        kind: "onomatopoeia",
        meaning: "the small sound raindrops make when they hit the glass",
        literalReading: "A person is hitting the window with one finger.",
      },
    ],
    notInText: [
      "Nina opened the window.",
      "It was snowing outside.",
      "Grandpa was asleep in his chair.",
      "A bird was at the window.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 1 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g1x.school-garden",
    grade: 1,
    genre: "informational",
    title: "Every School Needs a Garden",
    text: `Every school should have a garden.

A garden gives children something to care for. Plants need water every day.

Children learn where food comes from. Carrots grow under the ground. Beans climb up a string.

A garden is also a quiet place. Some children want somewhere quiet at lunch.

Ask your teacher for a garden. You can start with one pot.`,
    centralIdea:
      "Schools should have gardens because they give children something to care for and show them where food comes from.",
    supportingDetails: [
      "Plants in a garden need water every day.",
      "Carrots grow under the ground and beans climb up a string.",
      "A garden gives children a quiet place at lunch.",
    ],
    authorPurpose: "to persuade",
    authorOpinion: "Every school should have a garden.",
    opinionEvidence: [
      "Children learn where food comes from.",
      "Some children want somewhere quiet at lunch.",
    ],
    textFeatures: [
      {
        feature: "title",
        purpose: "tells you what the writer wants you to think",
        notPurpose: [
          "lists every word used in the text",
          "shows how tall a plant will grow",
          "names the person who watered the plants",
        ],
      },
    ],
    vocabulary: [
      {
        word: "care",
        meaning: "look after something so it stays well",
        wrongMeanings: [
          "carry something to another room",
          "count how many there are",
          "give something away",
        ],
        context: "A garden gives children something to care for.",
      },
    ],
    pairedWith: "g1x.one-pot",
    sharedWithPair: [
      "Both texts say plants need water.",
      "Both texts are about growing plants at school.",
    ],
    uniqueToThis: [
      "Only this text says every school should have a garden.",
      "Only this text says a garden can be a quiet place.",
    ],
    notInText: [
      "The school garden won a prize.",
      "There are apple trees in the garden.",
      "Children may take the plants home.",
      "The garden is open on Saturday.",
    ],
  },
  {
    id: "g1x.one-pot",
    grade: 1,
    genre: "informational",
    title: "Start With One Pot",
    text: `You do not need a big garden. One pot is enough.

Fill the pot with soil. Push a bean seed down with your thumb.

Put the pot where the sun comes in. Give it water every day.

In about a week, a green shoot comes up.

Beans grow fast. Soon the shoot will need a string to climb.`,
    centralIdea:
      "You can grow a plant at school in a single pot by giving it soil, sun, and water.",
    supportingDetails: [
      "You fill the pot with soil and push a bean seed down with your thumb.",
      "The pot goes where the sun comes in.",
      "A green shoot comes up in about a week.",
    ],
    authorPurpose: "to inform",
    textFeatures: [
      {
        feature: "table of contents",
        purpose: "shows you which page each part of a book starts on",
        notPurpose: [
          "explains what a picture is showing",
          "gives the meaning of a hard word",
          "tells you the writer's opinion",
        ],
      },
    ],
    vocabulary: [
      {
        word: "shoot",
        meaning: "the first small green stem a plant sends up",
        wrongMeanings: [
          "a fast kick at a ball",
          "a loud bang",
          "a hole in the ground",
        ],
        context: "In about a week, a green shoot comes up.",
        multipleMeaning: true,
      },
    ],
    pairedWith: "g1x.school-garden",
    sharedWithPair: [
      "Both texts say plants need water.",
      "Both texts are about growing plants at school.",
    ],
    uniqueToThis: [
      "Only this text tells you how to plant the seed.",
      "Only this text says a shoot comes up in about a week.",
    ],
    notInText: [
      "The bean plant grows flowers first.",
      "You should put the pot in the dark.",
      "One pot holds ten seeds.",
      "Beans grow slower than carrots.",
    ],
  },
  {
    id: "g1x.penguin-feet",
    grade: 1,
    genre: "informational",
    title: "Warm Feet on Ice",
    text: `Penguins stand on ice all day. Their feet do not freeze.

Blood moves fast through a penguin's feet. The warm blood keeps the feet just warm enough.

Penguins also lean back on their tails. That lifts part of each foot off the ice.

A penguin can stand on ice for hours and stay warm.`,
    centralIdea:
      "Penguins have ways to keep their feet from freezing while they stand on ice.",
    supportingDetails: [
      "Blood moves fast through a penguin's feet and keeps them warm.",
      "Penguins lean back on their tails to lift part of each foot off the ice.",
    ],
    authorPurpose: "to inform",
    textFeatures: [
      {
        feature: "glossary",
        purpose: "gives the meaning of hard words used in the text",
        notPurpose: [
          "shows where an animal lives",
          "lists the pages in order",
          "explains what a photograph is showing",
        ],
      },
      {
        feature: "caption",
        purpose: "explains what a picture is showing",
        notPurpose: [
          "tells you which page to turn to",
          "gives the meaning of a hard word",
          "tells you who wrote the text",
        ],
      },
    ],
    vocabulary: [
      {
        word: "freeze",
        meaning: "get so cold that it turns hard like ice",
        wrongMeanings: [
          "get warm in the sun",
          "run away quickly",
          "grow a new feather",
        ],
        context: "Their feet do not freeze.",
      },
    ],
    notInText: [
      "Penguins wear boots in winter.",
      "Penguins sleep standing on one foot.",
      "A penguin's feet turn blue in the cold.",
      "Penguins live in Florida.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 1 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g1x.a-seed",
    grade: 1,
    genre: "poetry",
    title: "A Seed",
    text: `I put a seed
inside the ground.
I patted it.
I made no sound.

The rain came down.
The sun came through.
I waited days.
I had to, too.

A little green
hand pushed the clay.
My seed said hello
to the day.`,
    stanzas: 3,
    linesPerStanza: 4,
    rhymeScheme: "abcb",
    theme: "Growing things takes waiting, and the waiting is part of it.",
    vocabulary: [
      {
        word: "patted",
        meaning: "pressed down gently with a flat hand",
        wrongMeanings: [
          "dug up with a spade",
          "threw across the garden",
          "washed with water",
        ],
        context: "I patted it.",
      },
    ],
    figurative: [
      {
        phrase: "A little green hand pushed the clay",
        kind: "metaphor",
        meaning: "The first leaf pushed up through the soil.",
        literalReading: "A small green hand reached out of the ground.",
      },
      {
        phrase: "My seed said hello",
        kind: "personification",
        meaning: "The plant appeared above the soil where it could be seen.",
        literalReading: "The seed spoke a word out loud.",
      },
    ],
    notInText: [
      "The seed grew into a tree.",
      "A bird ate the seed.",
      "The seed came up the next morning.",
      "It snowed on the garden.",
    ],
  },
  {
    id: "g1x.puddle",
    grade: 1,
    genre: "poetry",
    title: "After the Rain",
    text: `The rain has gone.
It left behind
a little sea
for me to find.

I put one boot
inside the blue.
The sea jumps up
and eats my shoe.`,
    stanzas: 2,
    linesPerStanza: 4,
    rhymeScheme: "abcb",
    theme: "Small ordinary things can be worth stopping for.",
    vocabulary: [
      {
        word: "behind",
        meaning: "left in a place after going away",
        wrongMeanings: [
          "in front of everything else",
          "high up in the sky",
          "under the ground",
        ],
        context: "It left behind",
      },
    ],
    figurative: [
      {
        phrase: "a little sea",
        kind: "metaphor",
        meaning: "a puddle left by the rain",
        literalReading: "a real ocean with waves and fish in it",
      },
      {
        phrase: "The sea jumps up and eats my shoe",
        kind: "personification",
        meaning: "The water splashes up and covers the shoe.",
        literalReading: "The water opens a mouth and swallows the shoe.",
      },
    ],
    notInText: [
      "The puddle was frozen.",
      "I jumped over the puddle.",
      "My boots were new.",
      "The rain came back again.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 2 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g2x.wrong-bus",
    grade: 2,
    genre: "literary",
    title: "The Wrong Bus",
    text: `Omar sat down on bus 14 and looked out of the window. He was thinking about the spelling test, so he did not notice the shops going by.

Then he did notice. There was no bakery. There was no park with the red gate. This was not the way home.

His stomach went cold. He had taken bus 41.

Omar walked to the front. His voice came out small. "I think I am on the wrong bus," he said.

The driver did not laugh. "Happens twice a week," she said. "Sit behind me. I will turn around at the school and put you back on 14."

Omar sat behind her all the way. When he got off at his own corner, his mother was still watching for the first bus.

That night Omar told the story four times. By the fourth time, it had stopped being frightening and started being funny.`,
    elements: {
      characters: ["Omar", "the bus driver", "Omar's mother"],
      setting: "a city bus on the way home from school",
      problem: "Omar gets on bus 41 by mistake and ends up going the wrong way",
      solution:
        "he tells the driver, who turns around at the school and puts him back on bus 14",
      narrator: "someone outside the story who knows what Omar is thinking",
      pointOfView: "third person",
    },
    theme: "Saying you are lost is what gets you found.",
    perspectives: [
      {
        character: "Omar",
        view: "He felt the mistake was a disaster and was afraid to admit it.",
      },
      {
        character: "the bus driver",
        view: "She thought it was an ordinary problem she fixes all the time.",
      },
    ],
    sequence: [
      "Omar gets on a bus and thinks about his spelling test.",
      "He notices the shops are wrong and realises he is on bus 41.",
      "He tells the driver he is on the wrong bus.",
      "The driver turns around and puts him back on bus 14.",
      "Omar gets off at his own corner and tells the story that night.",
    ],
    vocabulary: [
      {
        word: "notice",
        meaning: "see something and become aware of it",
        wrongMeanings: [
          "write a message on paper",
          "forget something completely",
          "walk quickly past",
        ],
        context: "he did not notice the shops going by",
        multipleMeaning: true,
      },
      {
        word: "frightening",
        meaning: "making somebody feel afraid",
        wrongMeanings: [
          "making somebody feel tired",
          "very difficult to understand",
          "extremely funny",
        ],
        context: "it had stopped being frightening and started being funny",
      },
    ],
    figurative: [
      {
        phrase: "His stomach went cold",
        kind: "idiom",
        meaning: "He suddenly felt afraid.",
        literalReading: "The temperature inside his body dropped.",
      },
      {
        phrase: "His voice came out small",
        kind: "metaphor",
        meaning: "He spoke quietly because he was nervous.",
        literalReading: "The sound he made was tiny in size.",
      },
    ],
    notInText: [
      "Omar missed the spelling test.",
      "The driver was angry with Omar.",
      "Omar walked home from the school.",
      "Omar's mother came to find him on the bus.",
    ],
  },
  {
    id: "g2x.last-tomato",
    grade: 2,
    genre: "literary",
    title: "The Last Tomato",
    text: `There was one tomato left on the plant, and there were two sisters.

Priya had watered the plant every morning since April. Devi had built the cage that kept it standing after the storm.

"I watered it," said Priya.

"It would have fallen over," said Devi.

They stood in the sun and did not pick it. The tomato went on being red.

Their grandmother came out with a knife and a plate. She cut the tomato into two halves and gave one to each girl, and then she took the plant's last small green tomato and put it in her pocket.

"For next week," she said. "There is always one more coming."

Priya and Devi ate their halves standing up. Neither of them said the other one was right, but neither of them said it again either.`,
    elements: {
      characters: ["Priya", "Devi", "their grandmother"],
      setting: "a garden in the sun, beside a tomato plant",
      problem: "two sisters each think they deserve the one tomato that is left",
      solution:
        "their grandmother cuts it in half so they each get one, and points out another is already growing",
      narrator: "someone outside the story who tells what all three of them do",
      pointOfView: "third person",
    },
    theme: "An argument about who deserves something can be worth less than the thing itself.",
    perspectives: [
      {
        character: "Priya",
        view: "She thought the tomato was hers because she had watered the plant all season.",
      },
      {
        character: "Devi",
        view: "She thought it was hers because her cage saved the plant in the storm.",
      },
      {
        character: "their grandmother",
        view: "She thought the argument mattered less than the fact that more tomatoes were coming.",
      },
    ],
    sequence: [
      "One tomato is left on the plant and both sisters want it.",
      "Priya says she watered the plant and Devi says she saved it.",
      "They stand in the sun without picking it.",
      "Their grandmother cuts the tomato in half and gives them one half each.",
      "The sisters eat their halves and stop arguing.",
    ],
    vocabulary: [
      {
        word: "cage",
        meaning: "a frame put around a plant to hold it upright",
        wrongMeanings: [
          "a box for keeping an animal in",
          "a bag for carrying fruit",
          "a hole dug for planting",
        ],
        context: "Devi had built the cage that kept it standing after the storm",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "The tomato went on being red",
        kind: "personification",
        meaning: "Time passed while the sisters argued and nothing was decided.",
        literalReading: "The tomato chose to keep its colour.",
      },
    ],
    notInText: [
      "The grandmother ate the tomato herself.",
      "Priya gave her half to Devi.",
      "The storm broke the plant in two.",
      "The sisters planted a new tomato plant.",
    ],
  },
  {
    id: "g2x.library-card",
    grade: 2,
    genre: "literary",
    title: "Her Own Card",
    text: `The card was thin and blue and had her whole name on it: Amara Nkemdi Okafor. All three parts.

The librarian showed her how to hold it. "You can take out five books," he said. "They come back in three weeks."

Amara chose four straight away. The fifth took twenty minutes. She kept picking one up and putting it down and going back to the shelf.

Her father waited on the low chair with his knees up near his chin. He did not say hurry.

At last she chose a book about volcanoes, though she had never once thought about a volcano before that afternoon.

On the way out she held the card in her hand instead of her pocket, so that anybody looking would see it.`,
    elements: {
      characters: ["Amara", "the librarian", "Amara's father"],
      setting: "a public library on the day Amara gets her first library card",
      problem: "Amara can take five books but cannot decide on the fifth one",
      solution: "she takes her time and finally picks a book about volcanoes",
      narrator: "someone outside the story who tells what Amara notices and does",
      pointOfView: "third person",
    },
    theme: "Being trusted with something small can feel enormous.",
    perspectives: [
      {
        character: "Amara",
        view: "She felt the card was important enough to hold where people could see it.",
      },
      {
        character: "Amara's father",
        view: "He thought the long choosing was worth waiting through without hurrying her.",
      },
    ],
    sequence: [
      "Amara gets a library card with her whole name on it.",
      "The librarian tells her she can take out five books for three weeks.",
      "She chooses four books quickly and cannot decide on the fifth.",
      "She finally picks a book about volcanoes.",
      "She walks out holding the card in her hand.",
    ],
    vocabulary: [
      {
        word: "chose",
        meaning: "picked one thing out of several",
        wrongMeanings: [
          "put something back on a shelf",
          "asked somebody a question",
          "paid money for something",
        ],
        context: "Amara chose four straight away.",
      },
    ],
    figurative: [
      {
        phrase: "with his knees up near his chin",
        kind: "hyperbole",
        meaning: "He looked folded up and uncomfortable on a chair made for children.",
        literalReading: "His knees were actually touching his face.",
      },
    ],
    notInText: [
      "Amara took out six books.",
      "The librarian chose the last book for her.",
      "Amara had been to the library before.",
      "Her father read the volcano book to her.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 2 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g2x.school-later",
    grade: 2,
    genre: "informational",
    title: "School Should Start Later",
    text: `School should start later in the morning.

Children between six and twelve need about ten hours of sleep. Most schools start at eight, and buses come before seven. A child who must be on a bus at ten to seven cannot get ten hours unless bedtime is before nine.

Doctors who study sleep say that a tired child learns less. They do not learn less because they are lazy. They learn less because a tired brain stores much less of what it hears.

Some towns have already moved the start of school to nine. In those towns, fewer children arrive late, and fewer fall asleep in the first lesson.

Nobody is asking for a shorter school day. Moving the start by one hour would move the end by one hour too. The day would be the same length. The children in it would be awake.`,
    centralIdea:
      "Schools should begin later in the morning because children cannot get enough sleep with the start times most schools use.",
    supportingDetails: [
      "Children between six and twelve need about ten hours of sleep.",
      "Buses come before seven when school starts at eight.",
      "Towns that moved the start to nine have fewer late arrivals.",
    ],
    authorPurpose: "to persuade",
    authorOpinion: "School should start later in the morning.",
    opinionEvidence: [
      "Doctors who study sleep say that a tired child learns less.",
      "In those towns, fewer children arrive late, and fewer fall asleep in the first lesson.",
      "Moving the start by one hour would move the end by one hour too.",
    ],
    textFeatures: [
      {
        feature: "table",
        purpose: "puts numbers side by side so you can compare them quickly",
        notPurpose: [
          "tells you the meaning of a hard word",
          "shows what a photograph is of",
          "names the sections of the book",
        ],
      },
    ],
    vocabulary: [
      {
        word: "stores",
        meaning: "keeps something so it can be used later",
        wrongMeanings: [
          "shops where things are sold",
          "throws something away",
          "counts something carefully",
        ],
        context: "a tired brain stores much less of what it hears",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "Children should have a shorter school day.",
      "Most towns have already changed their start time.",
      "Children need twelve hours of sleep.",
      "Buses would stop running if school started later.",
    ],
  },
  {
    id: "g2x.owl-pellets",
    grade: 2,
    genre: "informational",
    title: "What an Owl Leaves Behind",
    text: `An owl swallows a mouse whole. It does not chew.

Inside the owl, the soft parts of the mouse are used as food. The bones and the fur cannot be used. They stay in a part of the owl's stomach and are pressed into a small grey lump.

About ten hours later, the owl coughs the lump back up. It is called a pellet. A pellet is not waste from the other end of the owl. It comes back out of the beak.

Scientists pull pellets apart to find out what owls eat. A single pellet can hold the bones of two or three mice, and the bones are usually whole enough to name the animal.

An owl that lives near a field leaves pellets under the same branch night after night. That is how you can find them: look up first, then look down.`,
    centralIdea:
      "Owls cough up pellets of bone and fur, and scientists use those pellets to learn what owls eat.",
    supportingDetails: [
      "An owl swallows a mouse whole without chewing it.",
      "The bones and fur are pressed into a lump and coughed up about ten hours later.",
      "A single pellet can hold the bones of two or three mice.",
    ],
    authorPurpose: "to inform",
    textFeatures: [
      {
        feature: "diagram",
        purpose: "shows the parts of something and labels each one",
        notPurpose: [
          "lists the pages in the order they come",
          "gives the writer's opinion about the topic",
          "explains the meaning of a hard word",
        ],
      },
      {
        feature: "bold word",
        purpose: "shows you a word that is important and explained somewhere",
        notPurpose: [
          "marks the end of a section",
          "shows which page to turn to next",
          "tells you who took the photograph",
        ],
      },
    ],
    vocabulary: [
      {
        word: "pellet",
        meaning: "a small pressed lump of bone and fur that an owl brings back up",
        wrongMeanings: [
          "a small ball of food an owl is about to eat",
          "the nest an owl builds in a tree",
          "a bone from an owl's own wing",
        ],
        context: "It is called a pellet.",
      },
    ],
    notInText: [
      "Owls chew their food before swallowing.",
      "A pellet comes out at the same end as waste.",
      "Owls make one pellet a week.",
      "Scientists feed pellets back to the owls.",
    ],
  },
  {
    id: "g2x.hurricane-kit",
    grade: 2,
    genre: "informational",
    title: "Before the Storm Comes",
    text: `In Florida, hurricane season runs from June to November. Families get ready before a storm is on the way, not after.

A hurricane kit holds what a family would need if the power went out for three days. Water comes first: one gallon for each person for each day. For a family of four, that is twelve gallons.

Food in the kit must be food that needs no cooking and no cold. Tinned beans, peanut butter, and crackers all keep for months.

A radio that runs on batteries matters more than it sounds. When the power is out, a phone runs down and there is nothing to charge it with. A radio keeps telling you what is happening outside.

The last thing in a good kit is a list. Write down where the family will meet if everyone is in a different place when the storm arrives.`,
    centralIdea:
      "Florida families should put together a hurricane kit before storm season so they can manage three days without power.",
    supportingDetails: [
      "A kit needs one gallon of water for each person for each day.",
      "The food in a kit must keep without cooking or cold.",
      "A battery radio keeps working when the power and the phones are out.",
    ],
    authorPurpose: "to inform",
    textFeatures: [
      {
        feature: "map",
        purpose: "shows where places are and how far apart they lie",
        notPurpose: [
          "explains the meaning of a difficult word",
          "lists what is inside the book",
          "shows the writer's opinion about a topic",
        ],
      },
    ],
    vocabulary: [
      {
        word: "season",
        meaning: "the part of the year when a certain thing happens",
        wrongMeanings: [
          "adding salt and pepper to food",
          "a single day of bad weather",
          "the name of a month",
        ],
        context: "hurricane season runs from June to November",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "Hurricane season lasts all year in Florida.",
      "A kit should hold food that must be cooked.",
      "Families should build a kit once the storm arrives.",
      "Phones work normally when the power is out.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 2 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g2x.thunder",
    grade: 2,
    genre: "poetry",
    title: "Counting the Storm",
    text: `The lightning cracks.
I start to count.
One and two and three.

The thunder rolls
across the roof
and rumbles down to me.

The lightning cracks.
I count again.
One and two. Just two.

The storm is walking
up our street
and knocking to come through.`,
    stanzas: 4,
    linesPerStanza: 3,
    rhymeScheme: "abc abd abe abd",
    theme: "You can make something frightening smaller by measuring it.",
    vocabulary: [
      {
        word: "rumbles",
        meaning: "makes a long, low, rolling sound",
        wrongMeanings: [
          "shines with a bright light",
          "falls straight down",
          "disappears completely",
        ],
        context: "and rumbles down to me",
      },
    ],
    figurative: [
      {
        phrase: "The storm is walking up our street",
        kind: "personification",
        meaning: "The storm is coming steadily closer.",
        literalReading: "The storm has legs and is taking steps along the road.",
      },
      {
        phrase: "knocking to come through",
        kind: "personification",
        meaning: "The thunder is loud enough to sound as though it is at the door.",
        literalReading: "Someone is hitting the door and asking to be let in.",
      },
    ],
    notInText: [
      "The storm never arrived.",
      "The child counted to ten.",
      "The rain put out the lightning.",
      "The child ran outside to look.",
    ],
  },
  {
    id: "g2x.new-country",
    grade: 2,
    genre: "poetry",
    title: "The Word for Window",
    text: `At home I had a word for window.
Here they use another.
I say the new one carefully,
one careful sound, then another.

The teacher smiles and says it back.
She says it just the same.
The window is still a window.
It only changed its name.`,
    stanzas: 2,
    linesPerStanza: 4,
    rhymeScheme: "abcb",
    theme: "Learning a new language changes the words, not the world they name.",
    vocabulary: [
      {
        word: "carefully",
        meaning: "slowly and with attention, so as not to make a mistake",
        wrongMeanings: [
          "very loudly",
          "without thinking at all",
          "in a hurry",
        ],
        context: "I say the new one carefully",
      },
    ],
    figurative: [
      {
        phrase: "It only changed its name",
        kind: "metaphor",
        meaning: "The thing itself is unchanged even though the word is different.",
        literalReading: "The window went somewhere and chose a different name.",
      },
    ],
    notInText: [
      "The child refused to say the new word.",
      "The teacher did not understand.",
      "The child forgot the old word.",
      "There were no windows in the new school.",
    ],
  },
];
