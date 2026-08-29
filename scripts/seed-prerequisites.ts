import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { skillPrerequisites, skills } from "../src/db/schema";
import { PREREQUISITE_EDGES } from "../src/lib/curriculum/prerequisites";

/**
 * Seeds the prerequisite graph.
 *
 * Two checks run before anything is written, because both failures are
 * silent otherwise:
 *
 *   1. An edge naming a skill that does not exist is a typo, and a typo here
 *      means a child never gets the remediation that edge was meant to give.
 *      It is reported and skipped rather than inserted as a dangling row.
 *   2. A cycle means the selector can chase prerequisites for ever. The graph
 *      is written by hand from a curriculum, so a cycle is always a mistake —
 *      but it is not one you notice by reading a list of two hundred pairs.
 */

function findCycle(edges: [string, string][]): string[] | null {
  const out = new Map<string, string[]>();
  for (const [skill, prereq] of edges) {
    out.set(skill, [...(out.get(skill) ?? []), prereq]);
  }

  const state = new Map<string, "visiting" | "done">();
  const stack: string[] = [];

  function walk(node: string): string[] | null {
    if (state.get(node) === "done") return null;
    if (state.get(node) === "visiting") {
      return [...stack.slice(stack.indexOf(node)), node];
    }
    state.set(node, "visiting");
    stack.push(node);
    for (const next of out.get(node) ?? []) {
      const cycle = walk(next);
      if (cycle) return cycle;
    }
    stack.pop();
    state.set(node, "done");
    return null;
  }

  for (const node of out.keys()) {
    const cycle = walk(node);
    if (cycle) return cycle;
  }
  return null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const cycle = findCycle(PREREQUISITE_EDGES);
  if (cycle) {
    throw new Error(
      `The prerequisite graph has a cycle: ${cycle.join(" -> ")}. A skill cannot, directly or indirectly, be its own prerequisite.`,
    );
  }
  console.log(`${PREREQUISITE_EDGES.length} edges, no cycles.`);

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);

  const rows = await db.select({ id: skills.id, slug: skills.slug }).from(skills);
  const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));

  const good: { skillId: string; prerequisiteId: string; strength: number }[] = [];
  const missing: string[] = [];

  for (const [skill, prereq] of PREREQUISITE_EDGES) {
    const skillId = idBySlug.get(skill);
    const prereqId = idBySlug.get(prereq);
    if (!skillId) {
      missing.push(`${skill} (as a skill)`);
      continue;
    }
    if (!prereqId) {
      missing.push(`${prereq} (as a prerequisite of ${skill})`);
      continue;
    }
    if (skillId === prereqId) {
      missing.push(`${skill} points at itself`);
      continue;
    }
    good.push({ skillId, prerequisiteId: prereqId, strength: 1 });
  }

  if (missing.length > 0) {
    console.log(`\n${missing.length} edges name a skill that does not exist:`);
    for (const m of missing) console.log(`  ${m}`);
  }

  console.log(`\n${good.length} edges are valid.`);
  if (dryRun) {
    console.log("Dry run: nothing written.");
    await sql.end();
    return;
  }

  // Replaced wholesale rather than merged: the file is the source of truth,
  // and an edge deleted there must disappear here too.
  await db.delete(skillPrerequisites);
  if (good.length > 0) {
    await db.insert(skillPrerequisites).values(good);
  }
  console.log(`Seeded ${good.length} prerequisite edges.`);
  await sql.end();
}

main().catch((err) => {
  // Just the message: a failed bulk insert prints every parameter otherwise,
  // which buries the one line that says what went wrong.
  console.error(err?.message ?? err);
  process.exit(1);
});
