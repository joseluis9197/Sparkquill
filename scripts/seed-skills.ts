import { config } from "dotenv";

// Same precedence as Next: .env.local wins over .env.
config({ path: ".env.local" });
config({ path: ".env" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// Aliased: `sql` is taken further down by the postgres.js client itself.
import { inArray, sql as raw } from "drizzle-orm";
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

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // One row per distinct skill, with the benchmark it belongs to.
  const bySlug = new Map<
    string,
    { benchmark: string; title: string; generators: string[] }
  >();
  for (const g of GENERATORS) {
    const entry = bySlug.get(g.skillSlug) ?? {
      benchmark: g.benchmark,
      title: g.skillTitle,
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

  /*
   * Ordered by the standard's own code, not by the order the registry happens
   * to list generators in. The parent report reads top to bottom in this
   * order, and curriculum order is the only one that means anything to them:
   * grade, then strand, then standard.
   *
   * Each numeric part is padded before comparing, because a plain string sort
   * puts MA.2.NSO.1.10 ahead of MA.2.NSO.1.2.
   */
  const codeOrder = (code: string) =>
    code
      .split(".")
      .map((part) => (/^[0-9]+$/.test(part) ? part.padStart(4, "0") : part))
      .join(".");

  const rows = [...bySlug.entries()]
    .sort((a, b) =>
      codeOrder(a[1].benchmark).localeCompare(codeOrder(b[1].benchmark)),
    )
    .map(([slug, { benchmark, title }], i) => ({
      slug,
      benchmarkCode: benchmark,
      title,
      sortOrder: i,
    }));

  await db
    .insert(skills)
    .values(rows)
    .onConflictDoUpdate({
      target: skills.slug,
      // sortOrder is refreshed too: adding a grade renumbers everything, and
      // a stale order would interleave the new skills at random in the report.
      set: {
        title: raw`excluded.title`,
        benchmarkCode: raw`excluded.benchmark_code`,
        sortOrder: raw`excluded.sort_order`,
      },
    });

  console.log(`\nSeeded ${rows.length} skills.`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
