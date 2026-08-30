import { beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { makeParent, makeStudent, resetData } from "@/test/harness";

/**
 * The authorisation boundary on the practice focus.
 *
 * This file exists because of a specific admission: the ownership check was
 * written, read, and never once executed. Every other guarantee in the focus
 * feature is covered by pure unit tests, but "a parent may only change their
 * own child" is not a pure function — it reads a row and compares it to a
 * session — and so it sat unverified while everything around it was proved.
 *
 * The check that matters is the *refusal*. A test that only proves the happy
 * path passes just as well against an action with no check in it at all.
 */

const session = vi.hoisted(() => ({ value: null as { user?: { id?: string } } | null }));
vi.mock("@/auth", () => ({ auth: async () => session.value }));

/*
 * revalidatePath reaches for the store Next keeps per request, and there is
 * no request here. Stubbed rather than worked around: what these tests are
 * for is who may write and what gets written, and Next's cache invalidation
 * is Next's to test.
 *
 * Worth noting which tests needed this. The refusal cases all passed without
 * it, because they return before reaching the cache call — so the stub is
 * only load-bearing for the paths that succeed.
 */
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const { setPracticeFocus, clearPracticeFocus } = await import("../focus");

/** The strand every fixture child is pointed at; grade 4 has fractions. */
const FRACTIONS = "MA.4.FR";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.append(k, v);
  return data;
}

async function focusOf(studentId: string) {
  const [row] = await db
    .select({ strand: students.focusStrand, until: students.focusUntil })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  return row;
}

describe("setting a focus", () => {
  beforeEach(async () => {
    await resetData();
    session.value = null;
  });

  it("saves it for your own child", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    session.value = { user: { id: parent.id } };

    const result = await setPracticeFocus(
      {},
      form({ studentId: child.id, strandCode: FRACTIONS, days: "7" }),
    );

    expect(result.ok).toBe(true);
    const saved = await focusOf(child.id);
    expect(saved.strand).toBe(FRACTIONS);
    expect(saved.until!.getTime()).toBeGreaterThan(Date.now());
  });

  it("refuses another family's child", async () => {
    // The whole reason this file exists. Two accounts, and the second one
    // posts the first one's student id.
    const mine = await makeParent();
    const theirs = await makeParent();
    const theirChild = await makeStudent(theirs.id, { grade: 4 });
    session.value = { user: { id: mine.id } };

    const result = await setPracticeFocus(
      {},
      form({ studentId: theirChild.id, strandCode: FRACTIONS, days: "7" }),
    );

    expect(result.ok).toBeFalsy();
    expect(result.error).toBeTruthy();
    // Not merely refused: nothing was written.
    expect((await focusOf(theirChild.id)).strand).toBeNull();
  });

  it("refuses when nobody is signed in", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    session.value = null;

    const result = await setPracticeFocus(
      {},
      form({ studentId: child.id, strandCode: FRACTIONS, days: "7" }),
    );

    expect(result.ok).toBeFalsy();
    expect((await focusOf(child.id)).strand).toBeNull();
  });

  it("refuses a strand from another grade", async () => {
    // A second grader has no fractions strand. Posted values are claims, and
    // a focus that matched nothing would look like the feature was broken
    // rather than like the request was wrong.
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 2 });
    session.value = { user: { id: parent.id } };

    const result = await setPracticeFocus(
      {},
      form({ studentId: child.id, strandCode: FRACTIONS, days: "7" }),
    );

    expect(result.ok).toBeFalsy();
    expect(result.error).toMatch(/grade/i);
    expect((await focusOf(child.id)).strand).toBeNull();
  });

  it("refuses a duration that was not offered", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    session.value = { user: { id: parent.id } };

    const result = await setPracticeFocus(
      {},
      form({ studentId: child.id, strandCode: FRACTIONS, days: "3650" }),
    );

    expect(result.ok).toBeFalsy();
    expect((await focusOf(child.id)).strand).toBeNull();
  });

  it("refuses an empty topic", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    session.value = { user: { id: parent.id } };

    const result = await setPracticeFocus(
      {},
      form({ studentId: child.id, strandCode: "", days: "7" }),
    );

    expect(result.ok).toBeFalsy();
    expect((await focusOf(child.id)).strand).toBeNull();
  });
});

describe("clearing a focus", () => {
  beforeEach(async () => {
    await resetData();
    session.value = null;
  });

  it("clears your own child's", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    session.value = { user: { id: parent.id } };
    await setPracticeFocus(
      {},
      form({ studentId: child.id, strandCode: FRACTIONS, days: "7" }),
    );

    const result = await clearPracticeFocus({}, form({ studentId: child.id }));

    expect(result.ok).toBe(true);
    const after = await focusOf(child.id);
    expect(after.strand).toBeNull();
    expect(after.until).toBeNull();
  });

  it("refuses to clear another family's", async () => {
    const mine = await makeParent();
    const theirs = await makeParent();
    const theirChild = await makeStudent(theirs.id, { grade: 4 });
    session.value = { user: { id: theirs.id } };
    await setPracticeFocus(
      {},
      form({ studentId: theirChild.id, strandCode: FRACTIONS, days: "7" }),
    );

    session.value = { user: { id: mine.id } };
    const result = await clearPracticeFocus({}, form({ studentId: theirChild.id }));

    expect(result.ok).toBeFalsy();
    // Still set: a refusal that quietly cleared it would be the same bug
    // wearing a different hat.
    expect((await focusOf(theirChild.id)).strand).toBe(FRACTIONS);
  });
});
