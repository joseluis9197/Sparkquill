import { describe, expect, it, beforeEach } from "vitest";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { benchmarks, skills } from "@/db/schema";
import { resetData, makeParent, makeStudent } from "./harness";
import { databaseName } from "./database";

describe("the harness itself", () => {
  beforeEach(resetData);

  it("is pointed at a disposable database", () => {
    expect(databaseName(process.env.DATABASE_URL!)).toMatch(/_test$/);
  });

  it("has the curriculum the migrations and seeds produce", async () => {
    const [b] = await db.select({ n: sql<number>`count(*)::int` }).from(benchmarks);
    const [s] = await db.select({ n: sql<number>`count(*)::int` }).from(skills);
    expect(b.n).toBeGreaterThan(300);
    expect(s.n).toBeGreaterThan(290);
  });

  it("clears what a test writes", async () => {
    const parent = await makeParent();
    await makeStudent(parent.id);
    await resetData();
    const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(skills);
    expect(row.n).toBeGreaterThan(290);
  });
});
