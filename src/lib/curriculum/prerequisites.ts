/**
 * What each skill builds on.
 *
 * This is the graph that makes cross-grade remediation possible: a fifth
 * grader who keeps failing "add fractions with unlike denominators" does not
 * need a fourth attempt at the same question, they need equivalent fractions,
 * which is a fourth grade skill. Without these edges the selector can only
 * serve more of what is already failing.
 *
 * ## Chains, not a web
 *
 * Most edges are one link long and run backwards through the grades within a
 * single idea. Comparing numbers to 100 leads to 1,000, to 10,000, to a
 * million, to decimals, to rational numbers — one continuous skill taught six
 * times with the range widened.
 *
 * A handful of edges cross between ideas, and those are hand-picked. They are
 * the dependencies where a child genuinely cannot proceed: division needs the
 * multiplication facts, area needs multiplication, unlike denominators need
 * equivalence. Adding more than that produces a graph where everything
 * depends on everything and nothing is ever unlocked.
 *
 * ## What a prerequisite is *not*
 *
 * These edges do not gate access. A child who has never touched a skill is
 * not thereby blocked from their own grade — see `unmetPrerequisites`, which
 * treats a prerequisite as missing only when the child has tried it and
 * struggled. Gating on "not yet mastered" would send every new fifth grader
 * to first grade counting, which is both wrong and insulting.
 */

/** A chain: each entry depends on the one before it. */
function chain(...slugs: string[]): [string, string][] {
  const out: [string, string][] = [];
  for (let i = 1; i < slugs.length; i++) out.push([slugs[i], slugs[i - 1]]);
  return out;
}

const MATH_CHAINS: [string, string][][] = [
  // Reading and writing numbers, widening range then crossing into decimals.
  [
    ...chain(
      "count-within-120",
      "read-write-numbers-to-100",
      "read-write-numbers-to-1000",
      "read-write-numbers-to-10000",
      "read-write-numbers-to-million",
      "read-write-decimals",
    ),
  ],
  [
    ...chain(
      "compose-decompose-to-100",
      "compose-decompose-to-1000",
      "compose-decompose-to-10000",
      "decompose-decimals",
    ),
  ],
  [
    ...chain(
      "compare-numbers-to-100",
      "compare-numbers-to-1000",
      "compare-numbers-to-10000",
      "compare-numbers-to-million",
      "compare-decimals-hundredths",
      "compare-decimals-thousandths",
      "compare-rational-numbers",
    ),
  ],
  [...chain("place-value-relationships", "decimal-place-value")],
  [
    ...chain(
      "round-to-nearest-ten",
      "round-to-ten-hundred",
      "round-to-thousand",
      "round-decimals",
    ),
  ],

  // Addition and subtraction.
  [
    ...chain(
      "facts-to-ten",
      "sums-to-twenty",
      "facts-to-twenty",
      "add-two-digit-within-100",
      "add-subtract-within-1000",
      "add-subtract-multi-digit",
    ),
  ],
  [...chain("one-ten-more-less", "ten-hundred-more-less", "tenth-hundredth-more-less")],
  [...chain("two-digit-plus-one-digit", "add-two-digit-within-100")],
  [...chain("two-digit-minus-one-digit", "subtract-two-digit-within-100")],

  // Multiplication and division.
  [
    ...chain(
      "repeated-addition-arrays",
      "multiplication-as-groups",
      "multiplication-division-facts",
      "facts-to-twelve",
      "multiply-three-by-two",
      "multiply-two-by-two",
      "multiply-multi-digit",
    ),
  ],
  [
    ...chain(
      "division-as-missing-factor",
      "divide-by-one-digit",
      "divide-by-two-digit",
    ),
  ],
  [...chain("multiply-by-multiples-of-ten", "estimate-products", "estimate-decimals")],
  [...chain("multiples-of-one-digit", "prime-composite-factors", "prime-factorisation")],
  [...chain("even-and-odd", "even-odd-to-1000")],

  // Fractions, the longest and most consequential chain in the curriculum.
  [
    ...chain(
      "halves-and-fourths",
      "partition-into-equal-parts",
      "partition-two-ways",
      "unit-fractions",
      "fractions-as-repeated-units",
      "compare-fractions",
      "equivalent-fractions-g3",
      "equivalent-fractions-g4",
      "compare-unlike-fractions",
      "add-subtract-like-fractions",
      "add-subtract-unlike-fractions",
      "multiply-fractions",
      "multiply-divide-fractions",
    ),
  ],
  [...chain("fraction-word-form", "unit-fractions")],
  [...chain("decompose-fractions", "add-subtract-like-fractions")],
  [...chain("fraction-times-whole", "multiply-fractions")],
  [...chain("divide-unit-fractions", "unit-fraction-division-problems")],

  // Decimals.
  [
    ...chain(
      "tenths-as-hundredths",
      "fraction-decimal-notation",
      "add-subtract-decimals-hundredths",
      "add-subtract-decimals-thousandths",
      "multiply-divide-decimals",
    ),
  ],
  [...chain("add-tenths-and-hundredths", "add-subtract-decimals-hundredths")],
  [...chain("fraction-decimal-notation", "fraction-decimal-percent")],

  // Equations and expressions.
  [
    ...chain(
      "unknown-in-equation-g1",
      "unknown-in-equation",
      "unknown-in-multiplication",
      "write-equation-for-unknown",
      "write-equation-g5",
      "values-that-satisfy",
    ),
  ],
  [...chain("values-that-satisfy", "one-step-add-equations")],
  [...chain("values-that-satisfy", "one-step-multiply-equations")],
  [...chain("one-step-add-equations", "unknown-decimal-fraction")],
  [
    ...chain(
      "true-false-equations-g1",
      "true-false-equations",
      "true-false-multiplication",
      "true-false-four-operations",
      "true-false-g5",
    ),
  ],
  [
    ...chain(
      "translate-expressions",
      "order-of-operations",
      "evaluate-expressions",
      "equivalent-expressions",
    ),
  ],
  [...chain("translate-expressions", "translate-algebraic-expressions")],
  [...chain("subtraction-as-missing-addend", "division-as-missing-factor")],

  // Word problems, growing in steps.
  [
    ...chain(
      "add-subtract-word-problems",
      "two-step-word-problems",
      "four-operation-problems",
      "multi-step-problems",
      "multi-step-rational-problems",
    ),
  ],
  [...chain("interpret-remainders", "multi-step-problems")],

  // Patterns.
  [
    ...chain(
      "number-patterns",
      "patterns-from-a-rule",
      "pattern-rules",
      "input-output-tables",
    ),
  ],

  // Time.
  [
    ...chain(
      "tell-time-hour-half-hour",
      "tell-time-five-minutes",
      "tell-time-to-minute",
      "elapsed-time",
    ),
  ],

  // Money.
  [
    ...chain(
      "identify-coins",
      "count-coin-combinations",
      "count-money",
      "money-problems-decimal",
      "money-problems-g5",
    ),
  ],

  // Measurement and conversion.
  [
    ...chain(
      "measure-length-g1",
      "order-lengths",
      "compare-lengths",
      "length-word-problems",
      "measurement-problems",
    ),
  ],
  [
    ...chain(
      "choose-length-unit",
      "choose-measuring-tool",
      "choose-tool-g4",
      "convert-units",
      "multi-step-conversions",
    ),
  ],
  [...chain("convert-units", "distance-time-problems")],

  // Shape.
  [
    ...chain(
      "shape-from-attributes",
      "identify-2d-figures",
      "categorize-2d-figures",
      "quadrilaterals",
      "classify-triangles-quadrilaterals",
    ),
  ],
  [...chain("compose-decompose-shapes", "identify-2d-figures")],
  [...chain("lines-of-symmetry", "lines-of-symmetry-g3")],
  [
    ...chain(
      "identify-3d-real-world",
      "identify-3d-attributes",
      "classify-solids",
      "surface-area",
    ),
  ],
  [...chain("points-lines-rays", "classify-angles", "angles-are-additive", "unknown-angles")],

  // Perimeter, area, volume.
  [
    ...chain(
      "perimeter-by-counting",
      "perimeter-of-polygon",
      "area-by-counting",
      "area-of-rectangle",
      "perimeter-and-area",
      "composite-area",
      "rectangle-unknown-side",
      "area-with-decimals",
      "composite-area-g6",
    ),
  ],
  [...chain("area-of-rectangle", "same-perimeter-different-area")],
  [...chain("area-of-rectangle", "triangle-area")],
  [
    ...chain(
      "volume-by-counting",
      "volume-formula",
      "volume-unknown-edge",
      "volume-rational-edges",
    ),
  ],
  [...chain("coordinates-quadrant-one", "coordinate-problems", "four-quadrants")],
  [...chain("four-quadrants", "distance-on-a-grid", "rectangle-from-points")],

  // Data.
  [...chain("tally-marks", "interpret-pictograph", "represent-data", "interpret-data")],
  [...chain("interpret-data", "scaled-graphs", "data-problems", "data-problems-g4")],
  [...chain("line-plots", "line-graphs")],
  [
    ...chain(
      "mode-median-range",
      "mean-median-mode-range",
      "averages-g6",
      "box-plots",
    ),
  ],
  [...chain("averages-g6", "effect-on-averages")],
  [...chain("scaled-graphs", "histograms")],

  // Integers and ratio, grade 6.
  [...chain("compare-rational-numbers", "signed-quantities", "absolute-value", "absolute-value-problems")],
  [...chain("absolute-value", "add-subtract-integers", "multiply-divide-integers")],
  [...chain("write-ratios", "equivalent-ratios", "unit-rate", "rate-problems")],
  [...chain("fraction-decimal-percent", "percent-problems")],
  [...chain("multiples-of-one-digit", "gcf-and-lcm", "factor-out-common-factor")],
  [...chain("distributive-property", "factor-out-common-factor")],
  [...chain("exponents", "prime-factorisation")],
];

/**
 * Cross-family edges: places where a child genuinely cannot proceed without
 * something from a different strand.
 *
 * Kept short on purpose. Each one is a dependency a teacher would name, not a
 * loose association — and every edge added here is one more way for the
 * unlocked tier to find nothing available.
 */
const CROSS_STRAND: [string, string][] = [
  // You cannot divide without the multiplication facts to invert.
  ["division-as-missing-factor", "multiplication-division-facts"],
  ["divide-by-one-digit", "multiplication-division-facts"],
  // Area is multiplication in disguise, and is taught that way.
  ["area-of-rectangle", "multiplication-division-facts"],
  ["area-by-counting", "repeated-addition-arrays"],
  // Volume is area, one more time.
  ["volume-formula", "area-of-rectangle"],
  // Adding unlike denominators is equivalence applied twice.
  ["add-subtract-unlike-fractions", "equivalent-fractions-g4"],
  // Percent is a fraction with a fixed denominator.
  ["percent-problems", "fraction-decimal-percent"],
  // A unit rate is a division.
  ["unit-rate", "divide-by-one-digit"],
  // Order of operations underlies every later expression.
  ["evaluate-expressions", "order-of-operations"],
  ["equivalent-expressions", "distributive-property"],
  // The standard algorithms rest on regrouping.
  ["multiply-two-by-two", "distributive-property"],
  // Decimal arithmetic rests on decimal place value.
  ["add-subtract-decimals-hundredths", "place-value-relationships"],
  ["multiply-divide-by-tenths", "decimal-place-value"],
];

/**
 * English Language Arts.
 *
 * Every reading skill is taught at all six grades under the same slug base,
 * so the chains are generated rather than listed: `central-idea-g4` builds on
 * `central-idea-g3`. The reading standards genuinely are the same skill at
 * increasing difficulty, which is exactly what a chain expresses.
 */
/** Families taught at all six grades. */
const ELA_FAMILIES = [
  "story-elements",
  "theme",
  "narrator-perspective",
  "poetry-structure",
  "text-features",
  "central-idea",
  "author-purpose",
  "author-claim",
  "figurative-language",
  "retell-summarise",
  "compare-two-texts",
  "academic-vocabulary",
  "affixes-and-roots",
  "context-clues",
  "conventions",
];

/**
 * Decoding stops after grade 5. Florida drops the Foundational Skills strand
 * at grade 6, so a `phonics-g6` edge would point at a skill that does not and
 * should not exist.
 */
const ELA_FAMILIES_TO_GRADE_5 = ["phonics"];

function elaEdges(): [string, string][] {
  const out: [string, string][] = [];
  for (const family of ELA_FAMILIES) {
    for (let g = 2; g <= 6; g++) {
      out.push([`${family}-g${g}`, `${family}-g${g - 1}`]);
    }
  }
  for (const family of ELA_FAMILIES_TO_GRADE_5) {
    for (let g = 2; g <= 5; g++) {
      out.push([`${family}-g${g}`, `${family}-g${g - 1}`]);
    }
  }
  // Understanding what a word means comes before using it in your own
  // writing, and knowing the pieces of a word comes before both.
  for (let g = 1; g <= 6; g++) {
    out.push([`academic-vocabulary-g${g}`, `context-clues-g${g}`]);
  }
  return out;
}

/**
 * Every edge, as [skill, prerequisite] pairs, deduplicated.
 *
 * The same dependency is easy to write twice — once inside a chain and once
 * as a cross-strand edge — and the pair is the table's primary key, so a
 * duplicate makes the whole seeding insert fail rather than the one row.
 */
export const PREREQUISITE_EDGES: [string, string][] = (() => {
  const seen = new Set<string>();
  const out: [string, string][] = [];
  for (const [skill, prereq] of [
    ...MATH_CHAINS.flat(),
    ...CROSS_STRAND,
    ...elaEdges(),
  ]) {
    const key = `${skill}<-${prereq}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([skill, prereq]);
  }
  return out;
})();

/** Prerequisites of each skill, keyed by slug. */
export function prerequisiteMap(): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const [skill, prereq] of PREREQUISITE_EDGES) {
    const list = out.get(skill) ?? [];
    if (!list.includes(prereq)) list.push(prereq);
    out.set(skill, list);
  }
  return out;
}
