import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  benchmarks,
  reportingCategories,
  strands,
} from "../src/db/schema";

/* ------------------------------------------------------------------ *
 * CSV parsing
 * ------------------------------------------------------------------ */

/** Minimal RFC-4180 reader: handles quoted fields containing commas. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

/* ------------------------------------------------------------------ *
 * Reference data
 * ------------------------------------------------------------------ */

const STRAND_NAMES: Record<string, Record<string, string>> = {
  math: {
    NSO: "Number Sense and Operations",
    FR: "Fractions",
    AR: "Algebraic Reasoning",
    M: "Measurement",
    GR: "Geometric Reasoning",
    DP: "Data Analysis and Probability",
  },
  ela: {
    F: "Foundational Skills",
    R: "Reading",
    C: "Communication",
    V: "Vocabulary",
  },
};

const STRAND_ORDER: Record<string, string[]> = {
  math: ["NSO", "FR", "AR", "M", "GR", "DP"],
  ela: ["F", "R", "C", "V"],
};

/**
 * Target weight of each reporting category, from the FDOE Test Design
 * Summary and Blueprint. Names must match the CSV values exactly — the
 * adaptive engine joins on them.
 */
type CategoryWeight = {
  subject: "math" | "ela";
  grade: number;
  name: string;
  min: number;
  max: number;
};

const CATEGORY_WEIGHTS: CategoryWeight[] = [
  // FAST Mathematics — grade 3: four categories, 23-29% each
  { subject: "math", grade: 3, name: "Number Sense and Additive Reasoning", min: 0.23, max: 0.29 },
  { subject: "math", grade: 3, name: "Number Sense and Multiplicative Reasoning", min: 0.23, max: 0.29 },
  { subject: "math", grade: 3, name: "Fractional Reasoning", min: 0.23, max: 0.29 },
  { subject: "math", grade: 3, name: "Geometric Reasoning Measurement and Data", min: 0.23, max: 0.29 },
  // grade 4: three categories, 31-37% each
  { subject: "math", grade: 4, name: "Whole Numbers", min: 0.31, max: 0.37 },
  { subject: "math", grade: 4, name: "Fractions and Decimals", min: 0.31, max: 0.37 },
  { subject: "math", grade: 4, name: "Geometric Reasoning Measurement and Data", min: 0.31, max: 0.37 },
  // grade 5: four categories, 23-29% each
  { subject: "math", grade: 5, name: "Whole Numbers", min: 0.23, max: 0.29 },
  { subject: "math", grade: 5, name: "Fractions and Decimals", min: 0.23, max: 0.29 },
  { subject: "math", grade: 5, name: "Algebraic Reasoning", min: 0.23, max: 0.29 },
  { subject: "math", grade: 5, name: "Geometric Reasoning Measurement and Data", min: 0.23, max: 0.29 },
  // grade 6
  { subject: "math", grade: 6, name: "Number Sense and Operations", min: 0.33, max: 0.42 },
  { subject: "math", grade: 6, name: "Algebraic Reasoning", min: 0.25, max: 0.36 },
  { subject: "math", grade: 6, name: "Geometric Reasoning Data and Probability", min: 0.25, max: 0.36 },
];

// FAST ELA Reading uses the same three categories and weights in every
// tested grade, which keeps the weighting logic identical across grades.
for (const grade of [3, 4, 5, 6]) {
  CATEGORY_WEIGHTS.push(
    { subject: "ela", grade, name: "Reading Prose and Poetry", min: 0.25, max: 0.35 },
    { subject: "ela", grade, name: "Reading Informational Text", min: 0.25, max: 0.35 },
    { subject: "ela", grade, name: "Reading Across Genres and Vocabulary", min: 0.35, max: 0.5 },
  );
}

/* ------------------------------------------------------------------ *
 * Seed
 * ------------------------------------------------------------------ */

type BenchmarkRow = {
  code: string;
  grade: number;
  subject: "math" | "ela";
  strandKey: string;
  standard: number;
  description: string;
  reportingCategory: string | null;
};

function loadBenchmarks(file: string): BenchmarkRow[] {
  const raw = readFileSync(join(process.cwd(), "docs", file), "utf8");
  const [header, ...rows] = parseCsv(raw);
  const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

  return rows.map((r) => {
    const code = r[col.code].trim();
    const subject = r[col.subject].trim() as "math" | "ela";
    const grade = Number(r[col.grade]);
    const strandKey = r[col.strand].trim();
    const standard = Number(r[col.standard]);
    const description = r[col.description].trim();
    const rc = (r[col.reporting_category] ?? "").trim();

    // Sanity-check the code against its own columns; a mismatch means the
    // CSV drifted from the official codes and must not reach the database.
    const parts = code.split(".");
    if (parts.length !== 5) {
      throw new Error(`Malformed benchmark code: ${code}`);
    }
    const expectedPrefix = subject === "math" ? "MA" : "ELA";
    if (parts[0] !== expectedPrefix) {
      throw new Error(`${code}: prefix does not match subject ${subject}`);
    }
    if (Number(parts[1]) !== grade) {
      throw new Error(`${code}: grade segment does not match column ${grade}`);
    }
    if (parts[2] !== strandKey) {
      throw new Error(`${code}: strand segment does not match ${strandKey}`);
    }
    if (Number(parts[3]) !== standard) {
      throw new Error(`${code}: standard segment does not match ${standard}`);
    }

    return {
      code,
      grade,
      subject,
      strandKey,
      standard,
      description,
      reportingCategory: rc || null,
    };
  });
}

async function main() {
  // --dry-run parses and validates the CSVs without touching a database,
  // which is how the curriculum gets checked in CI.
  const dryRun = process.argv.includes("--dry-run");

  const rows = [
    ...loadBenchmarks("benchmarks-math.csv"),
    ...loadBenchmarks("benchmarks-ela.csv"),
  ];

  console.log(`Parsed ${rows.length} benchmarks.`);

  const seenCodes = new Set<string>();
  for (const b of rows) {
    if (seenCodes.has(b.code)) throw new Error(`Duplicate code: ${b.code}`);
    seenCodes.add(b.code);
  }

  for (const c of CATEGORY_WEIGHTS) {
    const used = rows.some(
      (b) =>
        b.subject === c.subject &&
        b.grade === c.grade &&
        b.reportingCategory === c.name,
    );
    if (!used) {
      throw new Error(
        `Reporting category "${c.name}" (${c.subject} g${c.grade}) matches no benchmark — name drift between the CSV and the blueprint table.`,
      );
    }
  }
  for (const b of rows) {
    if (!b.reportingCategory) continue;
    const known = CATEGORY_WEIGHTS.some(
      (c) =>
        c.subject === b.subject &&
        c.grade === b.grade &&
        c.name === b.reportingCategory,
    );
    if (!known) {
      throw new Error(
        `${b.code} references unknown reporting category "${b.reportingCategory}".`,
      );
    }
  }

  if (dryRun) {
    reportCounts(rows);
    console.log("\nDry run: CSVs are valid. No database writes performed.");
    return;
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);

  /* ---- strands, derived from the benchmark codes ---- */
  const strandMap = new Map<
    string,
    { code: string; subject: "math" | "ela"; grade: number; key: string; name: string; sortOrder: number }
  >();

  for (const b of rows) {
    const prefix = b.subject === "math" ? "MA" : "ELA";
    const code = `${prefix}.${b.grade}.${b.strandKey}`;
    if (strandMap.has(code)) continue;
    const name = STRAND_NAMES[b.subject][b.strandKey];
    if (!name) throw new Error(`Unknown strand key: ${b.strandKey}`);
    strandMap.set(code, {
      code,
      subject: b.subject,
      grade: b.grade,
      key: b.strandKey,
      name,
      sortOrder: STRAND_ORDER[b.subject].indexOf(b.strandKey),
    });
  }

  const strandRows = [...strandMap.values()];
  await db
    .insert(strands)
    .values(strandRows)
    .onConflictDoUpdate({
      target: strands.code,
      set: { name: strands.name },
    });
  console.log(`Seeded ${strandRows.length} strands.`);

  /* ---- reporting categories ---- */
  await db
    .insert(reportingCategories)
    .values(
      CATEGORY_WEIGHTS.map((c, i) => ({
        subject: c.subject,
        grade: c.grade,
        name: c.name,
        weightMin: c.min,
        weightMax: c.max,
        sortOrder: i,
      })),
    )
    .onConflictDoNothing();
  console.log(`Seeded ${CATEGORY_WEIGHTS.length} reporting categories.`);

  /* ---- benchmarks ---- */
  const byStrand = new Map<string, number>();
  const benchmarkRows = rows.map((b) => {
    const prefix = b.subject === "math" ? "MA" : "ELA";
    const strandCode = `${prefix}.${b.grade}.${b.strandKey}`;
    const order = (byStrand.get(strandCode) ?? 0) + 1;
    byStrand.set(strandCode, order);
    return {
      code: b.code,
      subject: b.subject,
      grade: b.grade,
      strandCode,
      standard: b.standard,
      description: b.description,
      reportingCategory: b.reportingCategory,
      sortOrder: order,
    };
  });

  await db
    .insert(benchmarks)
    .values(benchmarkRows)
    .onConflictDoUpdate({
      target: benchmarks.code,
      set: {
        description: benchmarks.description,
        reportingCategory: benchmarks.reportingCategory,
      },
    });
  console.log(`Seeded ${benchmarkRows.length} benchmarks.`);

  reportCounts(rows);
  await sql.end();
}

function reportCounts(rows: BenchmarkRow[]) {
  const counts = new Map<string, { total: number; assessed: number }>();
  for (const b of rows) {
    const k = `${b.subject.padEnd(4)} grade ${b.grade}`;
    const c = counts.get(k) ?? { total: 0, assessed: 0 };
    c.total++;
    if (b.reportingCategory) c.assessed++;
    counts.set(k, c);
  }
  console.log("\nBy subject and grade:");
  for (const k of [...counts.keys()].sort()) {
    const c = counts.get(k)!;
    console.log(
      `  ${k}: ${String(c.total).padStart(3)} benchmarks, ${String(c.assessed).padStart(3)} assessed`,
    );
  }
  const assessed = rows.filter((b) => b.reportingCategory).length;
  console.log(
    `\nTotal: ${rows.length} benchmarks, ${assessed} on a blueprinted test.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
