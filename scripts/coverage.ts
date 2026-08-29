import { readFileSync } from "node:fs";
import { GENERATORS } from "../src/lib/items/registry";

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

for (const subject of ["math", "ela"] as const) {
  console.log(`\n${subject.toUpperCase()}`);
  for (let grade = 1; grade <= 6; grade++) {
    const rows = benchmarks.filter(
      (b) => b.subject === subject && b.grade === grade,
    );
    const hit = rows.filter((b) => covered.has(b.code));
    total += rows.length;
    done += hit.length;
    const pct = rows.length ? Math.round((hit.length / rows.length) * 100) : 0;
    const bar = "#".repeat(Math.round(pct / 5)).padEnd(20, ".");
    console.log(
      `  grade ${grade}  ${bar} ${String(hit.length).padStart(3)}/${String(rows.length).padEnd(3)} ${String(pct).padStart(3)}%`,
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
  `\n${done}/${total} benchmarks covered (${Math.round((done / total) * 100)}%), ${GENERATORS.length} generators.`,
);
