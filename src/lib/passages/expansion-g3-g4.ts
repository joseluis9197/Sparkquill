import type { Passage } from "./types";

/**
 * More passages for grades 3 and 4.
 *
 * The evidence items were the thinnest thing in the library: finding the
 * sentence that backs a writer's claim needs a text that actually makes a
 * claim and actually backs it, and only five passages in each of these grades
 * did. Four of the eight texts here are arguments for that reason, and their
 * evidence sentences are written to stand on their own — a sentence that only
 * makes sense with the one before it is not evidence a child can point at.
 */

export const EXPANSION_G3_G4_PASSAGES: Passage[] = [
  /* ---------------------------------------------------------------- *
   * Grade 3 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g3x.the-handoff",
    grade: 3,
    genre: "literary",
    title: "The Handoff",
    text: `Jonah was the fastest runner in the third grade, and everyone knew it, including Jonah.

That was why Ms. Reyes put him last in the relay. The last runner gets the glory. The last runner also gets whatever the other three have left him.

At the practice on Thursday, Priya handed him the baton and he dropped it. It rolled off the track and into the grass. Jonah picked it up and ran anyway, and he still nearly caught the other team, and afterwards he was furious.

"You threw it," he told Priya.

"I put it in your hand," she said. "You were already running."

Ms. Reyes made them practise the handoff by itself for twenty minutes. No racing. Just the last three steps and the pass. Jonah hated every minute of it. He was the fastest runner in the third grade and he was standing still, taking a stick from a girl over and over.

On Saturday, at the real meet, Priya came around the last bend in second place. Jonah started moving before she reached him, the way they had practised, and he felt the baton land in his palm without looking at it.

He did not remember the race afterwards. He remembered the handoff — the small solid weight arriving exactly where his hand already was.`,
    elements: {
      characters: ["Jonah", "Priya", "Ms. Reyes"],
      setting: "a school running track, at practice and then at a Saturday meet",
      problem:
        "Jonah drops the baton at practice and blames Priya instead of the handoff itself",
      solution:
        "Ms. Reyes makes them drill the handoff alone until it works without looking",
      narrator: "someone outside the story who knows what Jonah is thinking",
      pointOfView: "third person",
    },
    theme:
      "Being the best at your part is not the same as being good at the part where you depend on someone else.",
    perspectives: [
      {
        character: "Jonah",
        view: "He thought the drop was Priya's fault and that practising a handoff was beneath him.",
      },
      {
        character: "Priya",
        view: "She thought Jonah had started running too early and had not been ready to receive it.",
      },
      {
        character: "Ms. Reyes",
        view: "She thought the race would be decided by the pass rather than by anyone's speed.",
      },
    ],
    sequence: [
      "Ms. Reyes puts Jonah last in the relay because he is the fastest.",
      "At Thursday's practice Priya hands him the baton and he drops it.",
      "Jonah blames Priya, and Priya says he was already running.",
      "Ms. Reyes makes them practise only the handoff for twenty minutes.",
      "At Saturday's meet the baton lands in Jonah's hand without him looking.",
    ],
    vocabulary: [
      {
        word: "furious",
        meaning: "extremely angry",
        wrongMeanings: [
          "moving very quickly",
          "slightly disappointed",
          "confused about what happened",
        ],
        context: "and afterwards he was furious",
      },
      {
        word: "solid",
        meaning: "firm and definite, not vague",
        wrongMeanings: [
          "made of stone",
          "extremely heavy to carry",
          "completely silent",
        ],
        context: "the small solid weight arriving exactly where his hand already was",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "The last runner gets the glory",
        kind: "metaphor",
        meaning: "The runner who finishes is the one people remember and praise.",
        literalReading: "A prize called glory is handed to whoever runs last.",
      },
    ],
    notInText: [
      "Jonah's team won the Saturday meet.",
      "Priya was the slowest runner on the team.",
      "Ms. Reyes moved Jonah to the first leg.",
      "Jonah apologised to Priya at the practice.",
    ],
  },
  {
    id: "g3x.paper-map",
    grade: 3,
    genre: "literary",
    title: "The Map With No Streets",
    text: `Before she died, Elena's grandmother drew her a map of the neighbourhood. It had no street names on it at all.

Instead it had a tree with a knot shaped like an eye. It had a fence where one board was missing. It had a house with a blue door, and next to the blue door a small careful drawing of a dog.

Elena's mother said the map was useless. "You can't navigate with that," she said. "Those are just things."

But Elena took it out one Saturday and walked. She found the tree in the first ten minutes. The fence took longer, and the missing board had been replaced with a newer, paler one, which was its own kind of clue.

The house with the blue door was on Pearl Street, and the door was green now. Elena stood on the pavement for a while, looking at it.

An old man came out with a watering can. "You're Rosa's granddaughter," he said. It was not a question. "You have her exact way of standing."

He told her the dog's name had been Chico, and that her grandmother had walked past that house every single day for forty years, and that the door had been blue for most of them.

Elena walked home the long way. The map worked. It just answered a different question than her mother had asked of it.`,
    elements: {
      characters: ["Elena", "Elena's mother", "the old man"],
      setting: "a neighbourhood of streets and houses, walked on a Saturday",
      problem:
        "Elena's grandmother left her a map with no street names, which her mother calls useless",
      solution:
        "Elena walks the map by its landmarks and learns what her grandmother's daily life had been",
      narrator: "someone outside the story who follows Elena through her walk",
      pointOfView: "third person",
    },
    theme:
      "A record of what somebody noticed can be worth more than a record of where things are.",
    perspectives: [
      {
        character: "Elena's mother",
        view: "She judged the map by whether it could give directions, and it could not.",
      },
      {
        character: "Elena",
        view: "She followed it anyway and found it was a record of what her grandmother loved.",
      },
    ],
    sequence: [
      "Elena's grandmother draws her a map with landmarks instead of street names.",
      "Elena's mother says the map is useless for finding your way.",
      "Elena walks out on a Saturday and finds the tree, then the fence.",
      "She reaches the house with the door, which is now green.",
      "An old man tells her about her grandmother's daily walk.",
    ],
    vocabulary: [
      {
        word: "navigate",
        meaning: "find your way from one place to another",
        wrongMeanings: [
          "draw a picture of a place",
          "give something a name",
          "measure how long a walk takes",
        ],
        context: "You can't navigate with that",
      },
      {
        word: "clue",
        meaning: "a small piece of information that helps you work something out",
        wrongMeanings: [
          "a mistake somebody made",
          "a sticky substance for joining things",
          "a rule you have to follow",
        ],
        context: "which was its own kind of clue",
      },
    ],
    figurative: [
      {
        phrase: "a knot shaped like an eye",
        kind: "simile",
        meaning: "a round mark on the tree trunk that looked like an eye",
        literalReading: "the tree had a real eye growing in its bark",
      },
    ],
    notInText: [
      "Elena's grandmother drew the streets in later.",
      "Elena got lost and had to be collected.",
      "The old man was Elena's grandfather.",
      "The dog Chico was still living at the house.",
    ],
  },
  {
    id: "g3x.the-quiet-hour",
    grade: 3,
    genre: "literary",
    title: "The Quiet Hour",
    text: `Every day from four to five, Tomas had to sit in the front room and do nothing.

That was his father's rule, and his father was serious about it. No screen. No book. No going outside. One hour.

Tomas thought it was the stupidest rule any parent had ever invented. For the first week he mostly stared at the clock and made a small sound of complaint every few minutes, which his father ignored completely.

In the second week he started noticing things. The clock in the front room was two minutes ahead of the one in the kitchen. A crack in the ceiling paint ran from the corner almost to the light, and it had a smaller crack branching off it like a river on a map.

In the third week he found that if he sat still long enough, the sparrows came back to the feeder outside the window. They would not come while he was moving. They had been waiting for him to be boring.

He never told his father the rule was a good one. But when the hour ended on Friday, he stayed in the chair another ten minutes, watching a sparrow that had one white feather in its wing, and he came back the next day specifically to see whether it would return.`,
    elements: {
      characters: ["Tomas", "Tomas's father"],
      setting: "the front room of a house, every afternoon from four to five",
      problem:
        "Tomas is made to sit doing nothing for an hour a day and thinks the rule is pointless",
      solution:
        "over three weeks he starts noticing small things and begins to stay past the hour by choice",
      narrator: "someone outside the story who knows how Tomas feels about the rule",
      pointOfView: "third person",
    },
    theme: "Paying attention is a thing you get better at, not a thing you either have or do not.",
    perspectives: [
      {
        character: "Tomas",
        view: "He thought the hour was a punishment invented to waste his time.",
      },
      {
        character: "Tomas's father",
        view: "He thought the hour was worth keeping even while his son complained about it.",
      },
    ],
    sequence: [
      "Tomas's father makes a rule that Tomas must sit and do nothing from four to five.",
      "In the first week Tomas stares at the clock and complains.",
      "In the second week he notices the clocks disagree and the crack in the ceiling.",
      "In the third week the sparrows come back to the feeder because he is still.",
      "On Friday he stays in the chair after the hour ends.",
    ],
    vocabulary: [
      {
        word: "invented",
        meaning: "made up or thought up for the first time",
        wrongMeanings: [
          "found somewhere by accident",
          "copied from somebody else",
          "written down carefully",
        ],
        context: "the stupidest rule any parent had ever invented",
      },
      {
        word: "specifically",
        meaning: "for that one particular reason and no other",
        wrongMeanings: [
          "by chance, without planning",
          "very quickly",
          "in a way that is hard to explain",
        ],
        context: "he came back the next day specifically to see whether it would return",
      },
    ],
    figurative: [
      {
        phrase: "branching off it like a river on a map",
        kind: "simile",
        meaning: "the smaller crack split away from the bigger one the way a stream leaves a river",
        literalReading: "there was water running across the ceiling",
      },
      {
        phrase: "They had been waiting for him to be boring",
        kind: "personification",
        meaning: "The birds only came near once he had stopped moving about.",
        literalReading: "The sparrows had made a plan and were watching the clock.",
      },
    ],
    notInText: [
      "Tomas's father sat with him during the hour.",
      "Tomas was allowed to read after the first week.",
      "Tomas fed the sparrows by hand.",
      "The rule was ended after three weeks.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 3 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g3x.longer-recess",
    grade: 3,
    genre: "informational",
    title: "Give Us the Whole Half Hour",
    text: `Recess should be thirty minutes, not fifteen.

Fifteen minutes sounds like enough until you watch what happens in it. Two minutes to line up. Three minutes to get outside. By the time a game is organised, the whistle goes. Children spend most of a short recess arriving and leaving rather than playing.

Teachers notice the difference in the lesson afterwards. Classes that come in from a long recess settle faster and ask more questions. Nobody has to be told twice to sit down, because the running has already happened.

Recess is also where children learn things no lesson teaches. Deciding whose turn it is, changing the rules when the game is not working, letting a younger child join in — none of that fits into fifteen minutes, and none of it happens when an adult is running the activity.

The usual argument against a longer recess is that it takes time away from reading and mathematics. That argument assumes the hours are the same either way. They are not. An hour of teaching after a proper recess is not the same hour as one taught to a room full of children who have been sitting since nine.

Half an hour. It is not a lot to ask for.`,
    centralIdea:
      "Recess should be lengthened to thirty minutes because a short recess is mostly spent getting in and out, and a real break makes the lessons afterwards work better.",
    supportingDetails: [
      "Children spend most of a fifteen-minute recess lining up and walking rather than playing.",
      "Classes that come in from a long recess settle faster and ask more questions.",
      "Recess is where children learn to take turns and change the rules of a game themselves.",
    ],
    authorPurpose: "to persuade",
    authorOpinion: "Recess should be thirty minutes, not fifteen.",
    opinionEvidence: [
      "Children spend most of a short recess arriving and leaving rather than playing.",
      "Classes that come in from a long recess settle faster and ask more questions.",
      "An hour of teaching after a proper recess is not the same hour as one taught to a room full of children who have been sitting since nine.",
    ],
    textFeatures: [
      {
        feature: "sidebar",
        purpose: "holds an extra piece of information beside the main text",
        notPurpose: [
          "lists which page each chapter begins on",
          "gives the meaning of every difficult word",
          "shows where a place is found on a map",
        ],
      },
    ],
    vocabulary: [
      {
        word: "organised",
        meaning: "arranged so that everyone knows what is happening",
        wrongMeanings: [
          "made much larger",
          "written down on paper",
          "finished and put away",
        ],
        context: "By the time a game is organised, the whistle goes.",
      },
      {
        word: "assumes",
        meaning: "takes something to be true without checking it",
        wrongMeanings: [
          "proves something with evidence",
          "asks a question about something",
          "refuses to believe something",
        ],
        context: "That argument assumes the hours are the same either way.",
      },
    ],
    notInText: [
      "Recess should be taken away completely.",
      "Most schools already have a thirty-minute recess.",
      "Teachers want a longer recess so they can rest.",
      "Children should be given games to play at recess.",
    ],
  },
  {
    id: "g3x.gopher-tortoise",
    grade: 3,
    genre: "informational",
    title: "The Landlord of the Sandhills",
    text: `The gopher tortoise digs a burrow, and then about three hundred and fifty other kinds of animal move in.

A gopher tortoise burrow is not a shallow hole. It can run forty feet back into the sand and drop ten feet down. The temperature inside stays steady all year, which is the whole point: it is cool when Florida is hot and warm when Florida is cold.

That makes the burrow valuable to animals that could never dig one themselves. Indigo snakes use them. Burrowing owls, gopher frogs, mice, foxes, and hundreds of kinds of insect use them. When a fire moves across the sandhills, animals go down the nearest burrow and come out afterwards to a burnt landscape they survived by borrowing somebody's house.

Scientists call an animal like this a keystone species. A keystone is the stone at the top of an arch that holds the rest in place; take it out and the arch comes down. Take the gopher tortoise out of the sandhills and the animals that depend on its burrows go too.

Gopher tortoises are protected in Florida. It is against the law to disturb a burrow, and builders must move tortoises safely before work begins. That law protects one animal on paper and several hundred in practice.`,
    centralIdea:
      "The gopher tortoise is a keystone species because the burrows it digs shelter hundreds of other kinds of animal.",
    supportingDetails: [
      "A burrow can run forty feet back and ten feet down, staying a steady temperature all year.",
      "Indigo snakes, burrowing owls, gopher frogs, mice, foxes, and insects all use the burrows.",
      "Animals shelter in burrows when fire moves across the sandhills.",
      "Florida law makes it illegal to disturb a gopher tortoise burrow.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "Protecting the gopher tortoise is worth far more than protecting a single animal.",
    opinionEvidence: [
      "That law protects one animal on paper and several hundred in practice.",
      "Take the gopher tortoise out of the sandhills and the animals that depend on its burrows go too.",
      "When a fire moves across the sandhills, animals go down the nearest burrow and come out afterwards to a burnt landscape they survived by borrowing somebody's house.",
    ],
    textFeatures: [
      {
        feature: "diagram",
        purpose: "shows the parts of something and labels each one",
        notPurpose: [
          "tells you which page a section starts on",
          "gives the writer's opinion about the subject",
          "explains the meaning of an unfamiliar word",
        ],
      },
      {
        feature: "glossary",
        purpose: "gives the meaning of the difficult words used in the text",
        notPurpose: [
          "shows how two things compare in size",
          "names the person who took the photographs",
          "lists the places mentioned in order",
        ],
      },
    ],
    vocabulary: [
      {
        word: "steady",
        meaning: "staying at about the same level instead of changing",
        wrongMeanings: [
          "extremely cold",
          "moving quickly in one direction",
          "difficult to reach",
        ],
        context: "The temperature inside stays steady all year",
      },
      {
        word: "disturb",
        meaning: "interfere with something so that it is damaged or upset",
        wrongMeanings: [
          "measure something carefully",
          "photograph something from above",
          "move something to a safer place",
        ],
        context: "It is against the law to disturb a burrow",
      },
    ],
    figurative: [
      {
        phrase: "The Landlord of the Sandhills",
        kind: "metaphor",
        meaning: "the animal whose digging provides homes for everything else there",
        literalReading: "a tortoise that collects rent from other animals",
      },
    ],
    notInText: [
      "Gopher tortoises share their burrows only with snakes.",
      "A burrow collapses after a fire.",
      "Gopher tortoises dig a new burrow every year.",
      "Builders are not allowed to work near sandhills at all.",
    ],
  },
  {
    id: "g3x.handwriting",
    grade: 3,
    genre: "informational",
    title: "Why Anyone Still Learns Handwriting",
    text: `Almost nothing you write as an adult will be written by hand. So why do schools still spend time on handwriting?

The answer is not tradition. It is what happens in your head while your hand is moving.

Researchers have watched children learn letters two ways: by typing them and by writing them out. The children who wrote the letters by hand recognised them faster afterwards. Forming a letter yourself, badly, over and over, seems to teach the brain what the shape of a letter really is, in a way that pressing a key does not.

The same thing shows up with notes. Students who take notes by hand cannot write fast enough to record everything, so they have to decide what matters as they go. Students typing can keep up, so they often type without deciding anything at all. Afterwards, the handwriters remember more of the ideas.

None of this means typing is bad. Typing is faster and easier to read, and most work will be typed. But handwriting is not only a way of getting words onto paper. It is also a way of getting them into the person writing them.`,
    centralIdea:
      "Handwriting is still taught because forming letters and notes by hand helps people learn and remember what they are writing.",
    supportingDetails: [
      "Children who learned letters by writing them recognised them faster than children who typed them.",
      "Students taking notes by hand must decide what matters because they cannot record everything.",
      "Students who type can keep up and often type without deciding anything.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "Handwriting is worth the school time it takes, even though most adult writing is typed.",
    opinionEvidence: [
      "The children who wrote the letters by hand recognised them faster afterwards.",
      "Afterwards, the handwriters remember more of the ideas.",
      "Students who take notes by hand cannot write fast enough to record everything, so they have to decide what matters as they go.",
    ],
    textFeatures: [
      {
        feature: "table",
        purpose: "sets facts side by side so two things can be compared quickly",
        notPurpose: [
          "explains what a picture shows",
          "gives the meaning of a hard word",
          "shows where each chapter begins",
        ],
      },
    ],
    vocabulary: [
      {
        word: "forming",
        meaning: "making the shape of something",
        wrongMeanings: [
          "reading something aloud",
          "asking about something",
          "putting something away",
        ],
        context: "Forming a letter yourself, badly, over and over",
      },
      {
        word: "record",
        meaning: "write something down so it is kept",
        wrongMeanings: [
          "a flat disc that plays music",
          "the best result anyone has achieved",
          "listen very carefully",
        ],
        context: "cannot write fast enough to record everything",
        multipleMeaning: true,
      },
    ],
    notInText: [
      "Typing should be removed from schools.",
      "Children who type learn letters faster.",
      "Handwriting was invented before typing was needed.",
      "Most adults write everything by hand.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 3 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g3x.afternoon-storm",
    grade: 3,
    genre: "poetry",
    title: "Four O'Clock, June",
    text: `All morning the sky held its breath,
white and flat and still.
The heat sat down on everything
and would not move until

the clouds came stacking in the west
like furniture upstairs,
and something heavy shifted
and fell down the air.

Ten minutes. Maybe twelve.
The gutters ran like streams.
Then blue again, and steam came up,
and everything was clean.

We went outside in the wet grass
before the sun could dry it,
because the storm had come and gone
and nobody could buy it.`,
    stanzas: 4,
    linesPerStanza: 4,
    rhymeScheme: "abcb",
    theme: "The best things about a place are often the ones that cannot be arranged or paid for.",
    vocabulary: [
      {
        word: "stacking",
        meaning: "piling up one on top of another",
        wrongMeanings: [
          "spreading out thinly",
          "disappearing slowly",
          "moving in a circle",
        ],
        context: "the clouds came stacking in the west",
      },
      {
        word: "gutters",
        meaning: "the channels that carry rainwater away at the edge of a road or roof",
        wrongMeanings: [
          "the windows on the top floor",
          "small streams in the countryside",
          "the gaps between paving stones",
        ],
        context: "The gutters ran like streams.",
      },
    ],
    figurative: [
      {
        phrase: "the sky held its breath",
        kind: "personification",
        meaning: "the air was completely still before the storm",
        literalReading: "the sky filled its lungs and stopped breathing",
      },
      {
        phrase: "The heat sat down on everything",
        kind: "personification",
        meaning: "the heat was heavy and would not lift",
        literalReading: "the heat lowered itself into a chair",
      },
      {
        phrase: "like furniture upstairs",
        kind: "simile",
        meaning: "the thunder sounded like heavy things being dragged overhead",
        literalReading: "there were tables and chairs in the clouds",
      },
      {
        phrase: "The gutters ran like streams",
        kind: "simile",
        meaning: "so much water fell that the drains flowed like small rivers",
        literalReading: "the gutters got up and ran away",
      },
    ],
    notInText: [
      "The storm lasted all afternoon.",
      "The rain flooded the house.",
      "Nobody went outside afterwards.",
      "The storm came in the early morning.",
    ],
  },
  {
    id: "g3x.two-kitchens",
    grade: 3,
    genre: "poetry",
    title: "Two Kitchens",
    text: `In my mother's kitchen
everything has a place.
The knives lie in a drawer in rows.
The clock has a serious face.

In my grandmother's kitchen
there is flour on the floor,
and three pots going at once,
and somebody always at the door.

My mother says it is chaos.
My grandmother says it is life.
I stand between the two of them
and hold a wooden knife

for stirring, not for cutting,
because I am eight, they say,
and I think I could love both kitchens
if they would let me stay.`,
    stanzas: 4,
    linesPerStanza: 4,
    rhymeScheme: "abcb",
    theme: "Two people you love can be right about opposite things at the same time.",
    perspectives: [
      {
        character: "the mother",
        view: "She sees the busy kitchen as disorder that should be tidied.",
      },
      {
        character: "the grandmother",
        view: "She sees the same kitchen as a sign that people are being fed and welcomed.",
      },
    ],
    vocabulary: [
      {
        word: "chaos",
        meaning: "a state of complete disorder",
        wrongMeanings: [
          "a careful plan",
          "a quiet moment",
          "a kind of cooking pot",
        ],
        context: "My mother says it is chaos.",
      },
    ],
    figurative: [
      {
        phrase: "The clock has a serious face",
        kind: "personification",
        meaning: "the kitchen is orderly and strict, right down to the clock",
        literalReading: "the clock is frowning at the people in the room",
      },
    ],
    notInText: [
      "The child prefers the grandmother's kitchen.",
      "The two women live in the same house.",
      "The child is allowed to use a real knife.",
      "The grandmother tidies her kitchen at the end.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 4 — literary
   * ---------------------------------------------------------------- */
  {
    id: "g4x.negative-result",
    grade: 4,
    genre: "literary",
    title: "A Negative Result",
    text: `Dev's science fair question was whether plants grow better with music. He had read that they did. He was fairly sure he already knew the answer, which, as it turned out, was the actual problem.

He set up twelve bean plants in the garage: six with a radio playing for four hours a day, six in silence. Same soil, same pots, same water measured with a syringe so it was exactly the same amount. He measured every stem on Sunday evenings with a ruler and wrote the numbers in a notebook.

After five weeks the two groups were the same. Not close — the same. The music plants averaged 18.2 centimetres and the silent plants averaged 18.4.

Dev sat in the garage and felt the whole project collapse. There was nothing to show. His poster was going to say that he had spent five weeks proving nothing happened.

His mother, who is a nurse, looked at the notebook for a long time.

"This is a result," she said. "Most of what we test doesn't work. If nobody wrote that down, everyone would keep testing it forever."

He made the poster anyway. He titled it "Music Does Not Make Beans Grow Faster" and he put both averages in large numbers at the top, and he wrote a paragraph at the bottom about the things his experiment could not rule out — a different kind of music, a longer time, a different plant.

He did not win. The judge who came to his table, though, stayed for eleven minutes, which was longer than she stayed anywhere else, and she asked him what he would change if he ran it again.

He had an answer ready. He had been thinking about almost nothing else.`,
    elements: {
      characters: ["Dev", "Dev's mother", "the judge"],
      setting: "a garage where twelve bean plants are being grown, and a school science fair",
      problem:
        "Dev's experiment shows no difference at all, and he thinks that means he has nothing to present",
      solution:
        "his mother points out that a result showing nothing works is still a result, and he presents it honestly",
      narrator: "someone outside the story who knows what Dev expects and fears",
      pointOfView: "third person",
    },
    theme:
      "An experiment that disproves what you expected has done its job; the failure is only in hiding it.",
    perspectives: [
      {
        character: "Dev",
        view: "He thought an experiment that showed no difference was a wasted five weeks.",
      },
      {
        character: "Dev's mother",
        view: "She thought a result showing nothing works is worth recording so others stop repeating it.",
      },
    ],
    sequence: [
      "Dev sets up twelve bean plants, six with music and six in silence.",
      "He measures every stem each Sunday and records the numbers.",
      "After five weeks both groups have grown the same amount.",
      "His mother tells him that a negative result is still a result.",
      "He presents it honestly and the judge stays eleven minutes asking questions.",
    ],
    vocabulary: [
      {
        word: "averaged",
        meaning: "came to a middle figure when all the measurements were combined",
        wrongMeanings: [
          "grew taller than expected",
          "were counted one at a time",
          "were the ordinary sort",
        ],
        context: "The music plants averaged 18.2 centimetres",
      },
      {
        word: "rule out",
        meaning: "show that something is definitely not the explanation",
        wrongMeanings: [
          "draw a straight line under something",
          "make a new rule about something",
          "decide which rule applies",
        ],
        context: "about the things his experiment could not rule out",
      },
    ],
    figurative: [
      {
        phrase: "felt the whole project collapse",
        kind: "metaphor",
        meaning: "he felt that everything he had worked on had come to nothing",
        literalReading: "the plants and the equipment physically fell down",
      },
    ],
    notInText: [
      "Dev's plants with music grew taller.",
      "Dev won first prize at the fair.",
      "Dev changed his numbers to show a difference.",
      "Dev's mother helped him build the experiment.",
    ],
  },
  {
    id: "g4x.say-it-right",
    grade: 4,
    genre: "literary",
    title: "Say It Right",
    text: `On the first day, the substitute got to her name and stopped.

"Ah — Nguyen? Noo-gwen?"

Some of the class laughed, mostly out of nerves. Thuy said "here" and let it go, because she had let it go for six years and the letting go had become automatic.

Her friend Marisol, sitting behind her, did not let it go. Marisol had been in that classroom for exactly one hour longer than the substitute had.

"It's Win," Marisol said. "Like winning. And Thuy is more like Twee."

The substitute wrote something on her list and said both names back, slowly, twice, and got them right the second time. Then she carried on down the register.

At lunch Thuy was not sure whether to be grateful or furious, and she kept turning it over while her food went cold. She had spent years making her name small so that nobody had to work at it, and Marisol had made it big again in about four seconds without asking.

"You could have let it go," Thuy said.

"You've been letting it go since second grade," said Marisol. "I counted."

In April, a new boy arrived called Oluwaseun, and the teacher stumbled on the first syllable, and the room went quiet in the particular way it does.

Thuy heard her own voice before she had decided to use it.

"It's O-lu-wa-SHAY-un," she said. "The stress is on the shay."

The boy turned around and looked at her, and for a second neither of them did anything at all. He did not smile, exactly. But he sat differently for the rest of the lesson, and so did she.`,
    elements: {
      characters: ["Thuy", "Marisol", "the substitute teacher", "Oluwaseun"],
      setting: "a classroom, from the first day of the year through to April",
      problem:
        "Thuy has spent years quietly accepting her name being said wrong",
      solution:
        "Marisol corrects it for her, and months later Thuy does the same thing for a new student",
      narrator: "someone outside the story who knows what Thuy is feeling and remembering",
      pointOfView: "third person",
    },
    theme:
      "Somebody has to go first, and afterwards the thing they did becomes possible for everyone who saw it.",
    perspectives: [
      {
        character: "Thuy",
        view: "She had decided it was easier to make her name small than to make people work at it.",
      },
      {
        character: "Marisol",
        view: "She thought a name said wrongly for six years was worth interrupting for.",
      },
    ],
    sequence: [
      "A substitute teacher says Thuy's name wrong on the first day.",
      "Thuy lets it go, as she has done since second grade.",
      "Marisol corrects the teacher, who repeats both names until they are right.",
      "Thuy is unsure whether to be grateful or angry about it.",
      "In April Thuy corrects the pronunciation of a new boy's name herself.",
    ],
    vocabulary: [
      {
        word: "automatic",
        meaning: "done without having to think about it",
        wrongMeanings: [
          "done by a machine",
          "done very slowly",
          "done for the first time",
        ],
        context: "the letting go had become automatic",
        multipleMeaning: true,
      },
      {
        word: "stress",
        meaning: "the part of a word that is said with more force",
        wrongMeanings: [
          "a feeling of worry and pressure",
          "the length of a word",
          "the first letter of a name",
        ],
        context: "The stress is on the shay.",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "making her name small",
        kind: "metaphor",
        meaning: "letting her name be shortened or mispronounced so it caused no trouble",
        literalReading: "shrinking the letters of her name until they were tiny",
      },
    ],
    notInText: [
      "Thuy asked Marisol to correct the teacher.",
      "The substitute teacher apologised to the class.",
      "Oluwaseun corrected the teacher himself.",
      "Thuy changed her name officially.",
    ],
  },
  {
    id: "g4x.the-loan",
    grade: 4,
    genre: "literary",
    title: "The Loan",
    text: `Kwame lent his bike to Silas on a Tuesday, and by Thursday he had begun to regret it in a way he could not say out loud.

The arrangement had been for two days. Silas's own bike had a bent wheel and his father would not fix it until payday, and Silas had asked in front of other people, which made saying no complicated.

On Thursday afternoon Kwame walked past the corner and saw his bike leaning against a wall with nobody near it. Not locked. Not even against a post — just leaning.

He wheeled it home without telling anyone.

Silas came to the door that evening looking genuinely confused, which made it worse. "I went into the shop for two minutes," he said.

"You left it in the street."

"I was watching it through the window."

They stood there. Kwame had rehearsed a speech in his head about respect and about how long he had saved, and none of it came out, because the truth underneath it was simpler and more embarrassing: he had been frightened. For about four seconds on that corner he had thought the bike was gone.

"I got scared," he said finally.

Silas looked at the bike, and then at the ground, and then said, "I'd have got scared too."

They agreed the loan was over, without either of them saying that it was because of a fight. On Saturday, Kwame helped Silas straighten the bent wheel with two spanners and a lot of guessing, and it was not a good repair, but it turned.`,
    elements: {
      characters: ["Kwame", "Silas"],
      setting: "a neighbourhood street, a doorstep, and a garage over one week",
      problem:
        "Kwame lends his bike, finds it left unlocked in the street, and takes it back without explaining",
      solution:
        "he admits he was frightened rather than angry, and the two of them repair Silas's own bike instead",
      narrator: "someone outside the story who knows what Kwame cannot say aloud",
      pointOfView: "third person",
    },
    theme:
      "Saying the true, smaller reason is usually more useful than winning the argument you rehearsed.",
    perspectives: [
      {
        character: "Kwame",
        view: "He saw an unlocked bike in the street as carelessness with something he had saved for.",
      },
      {
        character: "Silas",
        view: "He thought watching the bike through a shop window counted as looking after it.",
      },
    ],
    sequence: [
      "Kwame lends Silas his bike for two days.",
      "On Thursday he finds the bike leaning unlocked against a wall.",
      "He wheels it home without telling Silas.",
      "Silas comes to the door and they argue on the step.",
      "Kwame admits he was frightened, and on Saturday they fix Silas's wheel together.",
    ],
    vocabulary: [
      {
        word: "arrangement",
        meaning: "a plan two people have agreed on",
        wrongMeanings: [
          "a group of flowers in a vase",
          "an argument between friends",
          "a piece of written music",
        ],
        context: "The arrangement had been for two days.",
        multipleMeaning: true,
      },
      {
        word: "rehearsed",
        meaning: "practised in advance",
        wrongMeanings: [
          "shouted angrily",
          "forgotten completely",
          "written down on paper",
        ],
        context: "Kwame had rehearsed a speech in his head",
      },
    ],
    figurative: [
      {
        phrase: "the truth underneath it was simpler and more embarrassing",
        kind: "metaphor",
        meaning: "the real reason lay below the speech he had prepared",
        literalReading: "one truth was physically lying beneath another one",
      },
    ],
    notInText: [
      "Silas's bike was stolen from the corner.",
      "Kwame's parents made him lend the bike.",
      "Silas apologised the same afternoon.",
      "The repair on Saturday worked perfectly.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 4 — informational
   * ---------------------------------------------------------------- */
  {
    id: "g4x.homework-argument",
    grade: 4,
    genre: "informational",
    title: "Ten Minutes a Year",
    text: `There is a rule that many teachers use for homework: about ten minutes a night for each grade level. Ten minutes in first grade, forty in fourth, an hour in sixth. It is a sensible-sounding rule, and it is worth asking whether it is the right one.

The case for homework in primary school is weaker than most people assume. Studies that follow large numbers of children find almost no link between homework and achievement before about sixth grade. The link appears later, in secondary school, and it gets stronger the older the students are. For a nine-year-old, an extra half hour of worksheets on a Tuesday evening does very little that can be measured.

What homework does do at this age is practise a habit. Sitting down at the same time, finding the right page, working when nobody is watching — those are real skills, and they are easier to build at nine than at fourteen.

There is also a fairness problem that has nothing to do with the children. Homework happens at home, and homes are not the same. One child has a desk, a quiet room, and a parent who was taught the same method. Another shares a table with three siblings and a parent working an evening shift. The same assignment is not the same task.

None of that argues for abolishing homework. It argues for a smaller amount of it, chosen carefully, that a child can genuinely do alone. Twenty minutes that a fourth grader finishes without help is worth more than forty that a parent has to sit through.`,
    centralIdea:
      "Primary school homework does little for achievement but can build habits, so it should be short and doable without help.",
    supportingDetails: [
      "Studies find almost no link between homework and achievement before about sixth grade.",
      "The link between homework and achievement gets stronger the older students are.",
      "Homework builds the habit of working at a set time without being watched.",
      "Homes differ in space, quiet, and the help available, so the same assignment is not the same task.",
    ],
    authorPurpose: "to persuade",
    authorOpinion:
      "Primary school homework should be short and possible to finish without an adult's help.",
    opinionEvidence: [
      "Studies that follow large numbers of children find almost no link between homework and achievement before about sixth grade.",
      "The same assignment is not the same task.",
      "Twenty minutes that a fourth grader finishes without help is worth more than forty that a parent has to sit through.",
    ],
    textFeatures: [
      {
        feature: "table",
        purpose: "lines figures up in rows and columns so they can be compared",
        notPurpose: [
          "explains what a photograph is showing",
          "gives the meaning of a difficult word",
          "names the sections of the text in order",
        ],
      },
      {
        feature: "sidebar",
        purpose: "holds extra information beside the main text without interrupting it",
        notPurpose: [
          "shows where each chapter begins",
          "labels the parts of a picture",
          "shows where a place is on a map",
        ],
      },
    ],
    vocabulary: [
      {
        word: "achievement",
        meaning: "how much a student learns and can show they have learned",
        wrongMeanings: [
          "how long a student spends working",
          "a prize given at the end of a year",
          "how well a student behaves",
        ],
        context: "almost no link between homework and achievement",
      },
      {
        word: "abolishing",
        meaning: "getting rid of something completely",
        wrongMeanings: [
          "making something shorter",
          "making something compulsory",
          "changing the time something happens",
        ],
        context: "None of that argues for abolishing homework.",
      },
    ],
    notInText: [
      "Homework should be removed from every grade.",
      "Fourth graders should get an hour of homework.",
      "Homework helps younger children more than older ones.",
      "Most schools have already stopped setting homework.",
    ],
  },
  {
    id: "g4x.springs",
    grade: 4,
    genre: "informational",
    title: "Where Florida Keeps Its Water",
    text: `Under most of Florida there is a layer of limestone with holes in it, and inside those holes there is fresh water. The layer is called the Floridan aquifer, and it holds more water than every lake in the state put together.

Limestone dissolves slowly in slightly acidic rainwater. Over hundreds of thousands of years, water working down through cracks has widened them into channels, and channels into caves. Where one of those channels reaches the surface, water comes up out of the ground, and that is a spring.

Florida has more than a thousand of them, which is more than anywhere else on earth. The largest are called first-magnitude springs, and each one pushes out at least sixty-five million gallons a day. The water arrives at about 72 degrees no matter what month it is, because it has been underground long enough to forget the weather.

That constant temperature is why manatees crowd into springs in January. It is also why the water is so clear: it has been filtered through rock rather than running across fields.

The aquifer is also where most Floridians get their drinking water. That makes what happens on the surface important in a way it is not everywhere. Fertiliser spread on a lawn does not stay on the lawn. Rain carries the nitrogen down through the same cracks the water travels, and it comes out at the spring, where it feeds algae that turn clear water green.

Several famous springs that were clear in photographs from the 1950s are green in photographs from today. Nothing was dumped into them. The change came from a thousand ordinary lawns.`,
    centralIdea:
      "Florida's springs come from the Floridan aquifer, and what people do on the surface changes what comes out of them.",
    supportingDetails: [
      "The Floridan aquifer holds more water than every lake in the state put together.",
      "Florida has more than a thousand springs, more than anywhere else on earth.",
      "Spring water arrives at about 72 degrees all year, which is why manatees gather there in winter.",
      "Nitrogen from fertiliser travels down through the rock and feeds algae at the spring.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "What ordinary people do on their own land matters more to Florida's springs than any single polluter.",
    opinionEvidence: [
      "Fertiliser spread on a lawn does not stay on the lawn.",
      "The change came from a thousand ordinary lawns.",
      "Rain carries the nitrogen down through the same cracks the water travels, and it comes out at the spring, where it feeds algae that turn clear water green.",
    ],
    textFeatures: [
      {
        feature: "map",
        purpose: "shows where places are and how they are arranged",
        notPurpose: [
          "gives the meaning of a technical word",
          "lists the parts of the text in order",
          "explains what a photograph shows",
        ],
      },
      {
        feature: "timeline",
        purpose: "shows when events happened and in what order",
        notPurpose: [
          "compares two amounts side by side",
          "labels the parts of a diagram",
          "gives the writer's opinion",
        ],
      },
    ],
    vocabulary: [
      {
        word: "dissolves",
        meaning: "breaks down and disappears into a liquid",
        wrongMeanings: [
          "grows harder over time",
          "cracks into large pieces",
          "floats to the surface",
        ],
        context: "Limestone dissolves slowly in slightly acidic rainwater.",
      },
      {
        word: "constant",
        meaning: "staying the same and not changing",
        wrongMeanings: [
          "happening again and again",
          "extremely cold",
          "very large in amount",
        ],
        context: "That constant temperature is why manatees crowd into springs in January.",
        multipleMeaning: true,
      },
    ],
    figurative: [
      {
        phrase: "long enough to forget the weather",
        kind: "personification",
        meaning: "the water has been underground so long that surface temperature no longer affects it",
        literalReading: "the water has a memory and has lost it",
      },
    ],
    notInText: [
      "Florida's springs are fed by rivers on the surface.",
      "Spring water is coldest in winter and warmest in summer.",
      "Factories dumped waste into the famous springs.",
      "The aquifer is used only for farming.",
    ],
  },
  {
    id: "g4x.phone-in-school",
    grade: 4,
    genre: "informational",
    title: "The Argument About Phones",
    text: `Schools that ban phones during the day usually report the same three things: quieter corridors, fewer fights that started online, and more talking at lunch. Schools that allow them point out that a phone is how a child reaches a parent, and that confiscating property is not a small thing to do.

Both sides have a real case, and the argument is usually conducted as though only one of them does.

The evidence on learning is clearer than the evidence on anything else. When a phone is in a pocket, on silent, students still perform worse on tasks that need sustained attention than students whose phones are in another room. Not because they are checking it. Because part of the mind is spent on not checking it. Researchers call this a cost of attention, and it is measurable even in people who are certain they are not affected.

The safety argument is not so easily answered. In an emergency, parents want to reach their children, and children want to reach their parents. Schools that ban phones have to be honest that they are taking on a responsibility instead: their own systems for reaching families have to be good, and tested, and fast.

The middle position, which most schools eventually reach, is that phones come to school but live in a pouch or a locker between the first bell and the last. The phone is present. It is not in a pocket. That distinction sounds small and turns out to be the whole thing.`,
    centralIdea:
      "Both sides of the school phone argument have a real case, and the workable answer is that phones are stored away during the day rather than banned or carried.",
    supportingDetails: [
      "Schools that ban phones report quieter corridors and more talking at lunch.",
      "Students perform worse on tasks needing sustained attention even when the phone is silent in a pocket.",
      "Parents want a way to reach their children in an emergency.",
      "Most schools settle on storing phones in a pouch or locker during the day.",
    ],
    authorPurpose: "to inform",
    authorOpinion:
      "Storing phones during the day is better than either banning them from school or letting students carry them.",
    opinionEvidence: [
      "Because part of the mind is spent on not checking it.",
      "Schools that ban phones have to be honest that they are taking on a responsibility instead: their own systems for reaching families have to be good, and tested, and fast.",
      "When a phone is in a pocket, on silent, students still perform worse on tasks that need sustained attention than students whose phones are in another room.",
    ],
    textFeatures: [
      {
        feature: "heading",
        purpose: "tells you what the section below it is going to be about",
        notPurpose: [
          "gives the meaning of a difficult word",
          "shows what a photograph contains",
          "lists the pages in order",
        ],
      },
    ],
    vocabulary: [
      {
        word: "sustained",
        meaning: "kept going without a break",
        wrongMeanings: [
          "damaged or injured",
          "started very suddenly",
          "shared between people",
        ],
        context: "tasks that need sustained attention",
        multipleMeaning: true,
      },
      {
        word: "confiscating",
        meaning: "taking something away from somebody, usually as a punishment",
        wrongMeanings: [
          "borrowing something for a short time",
          "buying something second-hand",
          "repairing something that is broken",
        ],
        context: "confiscating property is not a small thing to do",
      },
    ],
    notInText: [
      "Phones improve results in every subject.",
      "No school allows phones during lessons.",
      "Parents do not want to reach their children at school.",
      "Storing phones in lockers has been shown not to work.",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Grade 4 — poetry
   * ---------------------------------------------------------------- */
  {
    id: "g4x.taping-windows",
    grade: 4,
    genre: "poetry",
    title: "Taping the Windows",
    text: `My father says the tape does nothing.
He says it every year.
He says the physics is quite clear.
He tapes them anyway.

The radio has a woman's voice
that will not go to sleep.
She names the towns. She names the roads.
She never says our street.

We fill the tub. We fill the pots.
We fill the empty jars.
Outside the palms are practising
a dance with both their arms.

And then the sound arrives, and stays,
and does not stop for hours.
My father sits between the doors
and reads a book of ours

out loud, though nobody can hear,
because the point is not the words.
The point is that a voice goes on
under the noise outdoors.`,
    stanzas: 5,
    linesPerStanza: 4,
    rhymeScheme: "abcb",
    theme:
      "In a frightening night, the useless things people do can be the ones that hold everyone together.",
    perspectives: [
      {
        character: "the father",
        view: "He knows the tape is pointless and does it because the doing matters more than the effect.",
      },
      {
        character: "the child",
        view: "The child notices that the reading is not for information but for company.",
      },
    ],
    vocabulary: [
      {
        word: "physics",
        meaning: "the science that explains how forces and materials behave",
        wrongMeanings: [
          "a set of exercises for the body",
          "a kind of medicine",
          "the study of living things",
        ],
        context: "He says the physics is quite clear.",
      },
    ],
    figurative: [
      {
        phrase: "a woman's voice that will not go to sleep",
        kind: "personification",
        meaning: "the radio broadcast continues all night without stopping",
        literalReading: "a person refuses to lie down and rest",
      },
      {
        phrase: "the palms are practising a dance with both their arms",
        kind: "personification",
        meaning: "the palm trees are being thrown about by the wind",
        literalReading: "the trees have arms and are rehearsing a routine",
      },
    ],
    notInText: [
      "The windows broke during the storm.",
      "The radio named the family's street.",
      "The father believed the tape would hold the glass.",
      "The family left the house before the storm.",
    ],
  },
  {
    id: "g4x.the-bench",
    grade: 4,
    genre: "poetry",
    title: "Buddy Bench",
    text: `They painted it blue and screwed on a sign
and everybody clapped.
The rule is: sit here if you have nobody,
and somebody will come.

I did not want to be the one who sat.
I wanted to be the one who came.
So for a week I stood beside the wall
and watched the empty bench.

On Thursday Ana sat there with her book
held up in front of her face
the way you hold a thing you are not reading.
I counted to eleven. Then I went.

I did not have a single word prepared.
I said, "That book's got dragons?"
She said, "It's got a map." She moved along.
The bench is wide. It fits four.

Now it is April and the bench is full
most days, and nobody sits alone,
and nobody remembers who went first,
which is the point of it.`,
    stanzas: 5,
    linesPerStanza: 4,
    rhymeScheme: "free verse",
    theme:
      "The hard part of helping is going first, and the reward is that afterwards nobody remembers you did.",
    perspectives: [
      {
        character: "the narrator",
        view: "They wanted to be the person who helped rather than the person who needed help.",
      },
      {
        character: "Ana",
        view: "She sat with a book in front of her face rather than admit she was on her own.",
      },
    ],
    sequence: [
      "The school paints a buddy bench and explains the rule.",
      "The narrator stands by the wall for a week, watching it.",
      "On Thursday Ana sits on the bench holding a book up.",
      "The narrator counts to eleven and goes over to talk to her.",
      "By April the bench is full most days.",
    ],
    vocabulary: [
      {
        word: "prepared",
        meaning: "got ready in advance",
        wrongMeanings: [
          "spoken very loudly",
          "written down and memorised",
          "asked for permission",
        ],
        context: "I did not have a single word prepared.",
      },
    ],
    figurative: [
      {
        phrase: "the way you hold a thing you are not reading",
        kind: "metaphor",
        meaning: "she was using the book to hide behind rather than to read",
        literalReading: "there is one correct way to hold an unread book",
      },
    ],
    notInText: [
      "The narrator sat on the bench themselves.",
      "Ana was reading a book about dragons.",
      "A teacher told the narrator to go over.",
      "The bench was removed in April.",
    ],
  },
];
