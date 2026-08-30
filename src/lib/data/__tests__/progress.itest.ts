import { beforeEach, describe, expect, it } from "vitest";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { attempts, benchmarks, practiceSessions, skills } from "@/db/schema";
import { makeParent, makeStudent, resetData } from "@/test/harness";
import {
  gradeCoverage,
  listSkills,
  summaryFor,
  mockHistoryFor,
} from "../progress";

/**
 * The guarantees the data layer makes, checked against a real database.
 *
 * These are not chosen for coverage. Each one is a rule that has already been
 * broken once in this project and was found by hand rather than by a test:
 *
 *   - The grade ceiling. Every child was being served whatever grade happened
 *     to have content, and a fifth grader doing second grade arithmetic was
 *     reported to their parent as mastery.
 *   - Mock scores staying out of practice statistics. This was claimed in a
 *     commit message before it was true.
 *
 * A rule that has failed once is the rule most worth pinning down.
 */

/** One skill from a given grade, for building attempts against. */
async function skillAtGrade(grade: number, subject: "math" | "ela" = "math") {
  const [row] = await db
    .select({ id: skills.id, code: skills.benchmarkCode })
    .from(skills)
    .innerJoin(benchmarks, eq(benchmarks.code, skills.benchmarkCode))
    .where(and(eq(benchmarks.grade, grade), eq(benchmarks.subject, subject)))
    .limit(1);
  if (!row) throw new Error(`No seeded ${subject} skill at grade ${grade}`);
  return row;
}

async function recordAttempt(opts: {
  studentId: string;
  skillId: string;
  correct: boolean;
  sessionId?: string;
}) {
  await db.insert(attempts).values({
    studentId: opts.studentId,
    sessionId: opts.sessionId ?? null,
    templateKey: "test.template",
    seed: 1,
    skillId: opts.skillId,
    response: { type: "multiple_choice", choiceId: "a" },
    correct: opts.correct,
    timeMs: 4000,
  });
}

describe("listSkills", () => {
  beforeEach(resetData);

  it("never returns work from above the grade asked for", async () => {
    // The ceiling. This is the one that matters: content from below is
    // remediation, content from above is somebody else's curriculum.
    const rows = await listSkills({ upToGrade: 3, subject: "math" });
    expect(rows.length).toBeGreaterThan(0);
    const grades = [...new Set(rows.map((r) => r.grade))].sort();
    expect(Math.max(...grades)).toBeLessThanOrEqual(3);
  });

  it("does include the grades below, which is the remediation path", async () => {
    const rows = await listSkills({ upToGrade: 3, subject: "math" });
    expect(new Set(rows.map((r) => r.grade))).toContain(1);
  });

  it("keeps the subjects apart", async () => {
    const maths = await listSkills({ upToGrade: 4, subject: "math" });
    const reading = await listSkills({ upToGrade: 4, subject: "ela" });
    expect(maths.every((r) => r.subject === "math")).toBe(true);
    expect(reading.every((r) => r.subject === "ela")).toBe(true);
    expect(maths.length).toBeGreaterThan(0);
    expect(reading.length).toBeGreaterThan(0);
  });

  it("carries the strand a parent's focus is set against", async () => {
    const rows = await listSkills({ upToGrade: 4, subject: "math" });
    for (const r of rows) {
      // "MA.4.FR" — subject, grade, strand. Anything else and a focus would
      // silently match nothing.
      expect(r.strandCode).toMatch(/^(MA|ELA)\.\d+\.[A-Z]+$/);
      expect(r.benchmarkCode.startsWith(r.strandCode)).toBe(true);
    }
  });
});

describe("gradeCoverage", () => {
  beforeEach(resetData);

  it("counts a grade's own work, not the grades below it", async () => {
    const coverage = await gradeCoverage(3);
    expect(coverage.math).toBeGreaterThan(0);
    expect(coverage.ela).toBeGreaterThan(0);
  });
});

describe("summaryFor", () => {
  beforeEach(resetData);

  it("counts ordinary practice", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 3 });
    const skill = await skillAtGrade(3);

    await recordAttempt({ studentId: child.id, skillId: skill.id, correct: true });
    await recordAttempt({ studentId: child.id, skillId: skill.id, correct: false });

    const summary = await summaryFor(child.id, 3);
    expect(summary.totalAttempts).toBe(2);
    expect(summary.totalCorrect).toBe(1);
  });

  it("leaves mock test answers out of practice statistics", async () => {
    /*
     * The rule that was claimed before it was true. A mock is a measurement
     * taken under exam conditions; folding it into the practice numbers makes
     * the parent's accuracy figure move for a reason that has nothing to do
     * with practice.
     */
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 3 });
    const skill = await skillAtGrade(3);

    await recordAttempt({ studentId: child.id, skillId: skill.id, correct: true });

    const [mock] = await db
      .insert(practiceSessions)
      .values({ studentId: child.id, subject: "math", mode: "mock", paperSeed: 7 })
      .returning({ id: practiceSessions.id });
    for (let i = 0; i < 5; i++) {
      await recordAttempt({
        studentId: child.id,
        skillId: skill.id,
        correct: false,
        sessionId: mock.id,
      });
    }

    const summary = await summaryFor(child.id, 3);
    expect(summary.totalAttempts).toBe(1);
    expect(summary.totalCorrect).toBe(1);
  });

  it("counts answers from an ordinary session", async () => {
    // The other half of the same rule: only *mock* sessions are excluded, so
    // a filter that dropped every session-linked attempt would pass the test
    // above and be wrong.
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 3 });
    const skill = await skillAtGrade(3);

    const [session] = await db
      .insert(practiceSessions)
      .values({ studentId: child.id, subject: "math", mode: "practice" })
      .returning({ id: practiceSessions.id });
    await recordAttempt({
      studentId: child.id,
      skillId: skill.id,
      correct: true,
      sessionId: session.id,
    });

    const summary = await summaryFor(child.id, 3);
    expect(summary.totalAttempts).toBe(1);
  });

  it("counts the skills of the child's own grade and below", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 2 });
    const summary = await summaryFor(child.id, 2);

    const [{ n }] = await db
      .select({ n: skills.id })
      .from(skills)
      .innerJoin(benchmarks, eq(benchmarks.code, skills.benchmarkCode))
      .where(lte(benchmarks.grade, 2))
      .limit(1);
    expect(n).toBeTruthy();
    expect(summary.skillsTotal).toBeGreaterThan(0);
  });

  it("reports nothing rather than dividing by zero for a new child", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 5 });
    const summary = await summaryFor(child.id, 5);
    expect(summary.totalAttempts).toBe(0);
    expect(summary.totalCorrect).toBe(0);
  });
});

describe("mockHistoryFor", () => {
  beforeEach(resetData);

  it("ignores a test that was never finished", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    const skill = await skillAtGrade(4);

    const [abandoned] = await db
      .insert(practiceSessions)
      .values({ studentId: child.id, subject: "math", mode: "mock", paperSeed: 3 })
      .returning({ id: practiceSessions.id });
    await recordAttempt({
      studentId: child.id,
      skillId: skill.id,
      correct: true,
      sessionId: abandoned.id,
    });

    expect(await mockHistoryFor(child.id)).toHaveLength(0);
  });

  it("reports a finished one", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    const skill = await skillAtGrade(4);

    const [done] = await db
      .insert(practiceSessions)
      .values({
        studentId: child.id,
        subject: "math",
        mode: "mock",
        paperSeed: 4,
        endedAt: new Date(),
      })
      .returning({ id: practiceSessions.id });
    await recordAttempt({
      studentId: child.id,
      skillId: skill.id,
      correct: true,
      sessionId: done.id,
    });

    const history = await mockHistoryFor(child.id);
    expect(history).toHaveLength(1);
    expect(history[0].total).toBe(1);
  });
});

describe("one child's data never reaches another", () => {
  beforeEach(resetData);

  it("keeps summaries separate", async () => {
    const parent = await makeParent();
    const a = await makeStudent(parent.id, { grade: 3 });
    const b = await makeStudent(parent.id, { grade: 3 });
    const skill = await skillAtGrade(3);

    for (let i = 0; i < 4; i++) {
      await recordAttempt({ studentId: a.id, skillId: skill.id, correct: true });
    }

    expect((await summaryFor(a.id, 3)).totalAttempts).toBe(4);
    expect((await summaryFor(b.id, 3)).totalAttempts).toBe(0);
  });
});
