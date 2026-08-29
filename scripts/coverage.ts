import { readFileSync } from "node:fs";
import { GENERATORS } from "../src/lib/items/registry";
import { isNotPractised } from "../src/lib/curriculum/not-practised";

/**
 * Which benchmarks have practice behind them, and which do not.
 *
 * Read straight from the curriculum CSVs and the generator registry, so it
 * needs no database and tells the truth about the build rather than about
 * whatever happens to be seeded in one environment.
 */

function parse(path: string) {
  const rows = readFileSync(path, "utf8").trim().split(/\r?\n/).slice(1);
  return rows.map((line) => {
    // Only the description field is quoted, and it never contains a comma
    // that matters here, so splitting on the first five commas is enough.
    const [code, grade, subject] = line.split(",");
    return { code, grade: Number(grade), subject };
  });
}

const benchmarks = [
  ...parse("docs/benchmarks-math.csv"),
  ...parse("docs/benchmarks-ela.csv"),
];

const covered = new Set(GENERATORS.map((g) => g.benchmark));
const showGaps = process.argv.includes("--gaps");

let total = 0;
let done = 0;
let excluded = 0;

for (const subject of ["math", "ela"] as const) {
  console.log(`\n${subject.toUpperCase()}`);
  for (let grade = 1; grade <= 6; grade++) {
    const all = benchmarks.filter(
      (b) => b.subject === subject && b.grade === grade,
    );
    // Performance standards — handwriting, speaking aloud, doing research —
    // are counted apart rather than as gaps. They are not missing work; they
    // are work a multiple-choice question cannot honestly assess. See
    // src/lib/curriculum/not-practised.ts.
    const rows = all.filter((b) => !isNotPractised(b.code));
    const skipped = all.length - rows.length;
    excluded += skipped;

    const hit = rows.filter((b) => covered.has(b.code));
    total += rows.length;
    done += hit.length;
    const pct = rows.length ? Math.round((hit.length / rows.length) * 100) : 0;
    const bar = "#".repeat(Math.round(pct / 5)).padEnd(20, ".");
    console.log(
      `  grade ${grade}  ${bar} ${String(hit.length).padStart(3)}/${String(rows.length).padEnd(3)} ${String(pct).padStart(3)}%` +
        (skipped ? `   +${skipped} taught in class, not practised here` : ""),
    );
    if (showGaps) {
      for (const b of rows) {
        if (!covered.has(b.code)) console.log(`             missing ${b.code}`);
      }
    }
  }
}

// A generator pointing at a benchmark that does not exist is a typo that would
// otherwise only surface when the seed script refuses to run.
const known = new Set(benchmarks.map((b) => b.code));
const orphans = [...covered].filter((c) => !known.has(c));
if (orphans.length) {
  console.log(`\nGenerators on unknown benchmarks: ${orphans.join(", ")}`);
}

console.log(
  `
${done}/${total} assessable benchmarks covered (${Math.round((done / total) * 100)}%), from ${GENERATORS.length} generators.`,
);
console.log(
  `${excluded} further standards are classroom performance tasks — writing, speaking, handwriting, research — which this platform does not claim to assess.`,
);
