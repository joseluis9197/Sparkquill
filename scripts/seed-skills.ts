import { config } from "dotenv";

// Same precedence as Next: .env.local wins over .env.
config({ path: ".env.local" });
config({ path: ".env" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { inArray } from "drizzle-orm";
import { benchmarks, skills } from "../src/db/schema";
import { GENERATORS } from "../src/lib/items/registry";

/**
 * Seeds the `skills` table from the generator registry.
 *
 * Skills are the unit of mastery, and right now a skill exists precisely when
 * something can generate practice for it. Deriving the table from the registry
 * keeps the two from drifting: a generator without a skill row would record
 * attempts against nothing, and a skill row without a generator would be a
 * promise the app cannot keep.
 */

/** Human titles, keyed by skill slug. Falls back to the benchmark text. */
const TITLES: Record<string, string> = {
  "add-two-digit-within-100": "Adding within 100",
  "subtract-two-digit-within-100": "Subtracting within 100",
  "read-write-numbers-to-1000": "Reading and writing numbers to 1,000",
  "compose-decompose-to-1000": "Breaking numbers into hundreds, tens and ones",
  "round-to-nearest-ten": "Rounding to the nearest ten",
  "compare-numbers-to-1000": "Comparing numbers to 1,000",
  "tell-time-five-minutes": "Telling time to five minutes",
  "identify-3d-attributes": "Faces, edges and corners of solids",
  "identify-3d-real-world": "Spotting solid shapes in the world",
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // One row per distinct skill, with the benchmark it belongs to.
  const bySlug = new Map<string, { benchmark: string; generators: string[] }>();
  for (const g of GENERATORS) {
    const entry = bySlug.get(g.skillSlug) ?? {
      benchmark: g.benchmark,
      generators: [],
    };
    entry.generators.push(g.key);
    if (entry.benchmark !== g.benchmark) {
      throw new Error(
        `Skill "${g.skillSlug}" is claimed by two benchmarks: ${entry.benchmark} and ${g.benchmark}. A skill belongs to exactly one.`,
      );
    }
    bySlug.set(g.skillSlug, entry);
  }

  console.log(`${bySlug.size} skills across ${GENERATORS.length} generators.`);
  for (const [slug, { benchmark, generators }] of bySlug) {
    console.log(`  ${benchmark.padEnd(14)} ${slug.padEnd(34)} ${generators.join(", ")}`);
  }

  if (dryRun) {
    console.log("\nDry run: nothing written.");
    return;
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);

  // Every skill must hang off a benchmark that actually exists, or the
  // curriculum seed and this one have drifted apart.
  const codes = [...new Set([...bySlug.values()].map((v) => v.benchmark))];
  const found = await db
    .select({ code: benchmarks.code })
    .from(benchmarks)
    .where(inArray(benchmarks.code, codes));
  const known = new Set(found.map((r) => r.code));
  const missing = codes.filter((c) => !known.has(c));
  if (missing.length > 0) {
    throw new Error(
      `These benchmarks are referenced by generators but are not in the database: ${missing.join(", ")}. Run the curriculum seed first.`,
    );
  }

  const rows = [...bySlug.entries()].map(([slug, { benchmark }], i) => ({
    slug,
    benchmarkCode: benchmark,
    title: TITLES[slug] ?? slug,
    sortOrder: i,
  }));

  await db
    .insert(skills)
    .values(rows)
    .onConflictDoUpdate({
      target: skills.slug,
      set: { title: skills.title, benchmarkCode: skills.benchmarkCode },
    });

  console.log(`\nSeeded ${rows.length} skills.`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
