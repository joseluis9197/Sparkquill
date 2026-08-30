import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { makeParent, makeStudent, resetData } from "@/test/harness";
import { activeFocus, clearFocus, setFocus, strandOptions } from "../focus";

/**
 * The database half of the practice focus.
 *
 * The selector's behaviour is covered by pure unit tests, which is where the
 * interesting logic lives. What is left here can only be checked against a
 * real database: that the topics offered are the ones the child's grade
 * actually has, that a focus stops applying when it runs out, and that a
 * request naming somebody else's grade is refused rather than silently
 * matching nothing.
 */

describe("strandOptions", () => {
  beforeEach(resetData);

  it("offers only the child's own grade", async () => {
    const options = await strandOptions(4);
    expect(options.length).toBeGreaterThan(0);
    for (const o of options) {
      expect(o.code).toMatch(/^(MA|ELA)\.4\./);
    }
  });

  it("offers both subjects", async () => {
    const options = await strandOptions(4);
    expect(options.some((o) => o.subject === "math")).toBe(true);
    expect(options.some((o) => o.subject === "ela")).toBe(true);
  });

  it("never offers a topic with nothing behind it", async () => {
    // The count is what the parent chooses on. A strand with no practisable
    // skill would be a dead end presented as an option.
    for (const grade of [1, 2, 3, 4, 5, 6]) {
      for (const o of await strandOptions(grade)) {
        expect(o.skillCount, `${o.code} has no skills`).toBeGreaterThan(0);
      }
    }
  });

  it("gives grades 1 and 2 topics too", async () => {
    // The reason the unit is a strand rather than a reporting category:
    // reporting categories are null for these grades, and a focus that
    // excluded them would have excluded a third of the users.
    expect((await strandOptions(1)).length).toBeGreaterThan(0);
    expect((await strandOptions(2)).length).toBeGreaterThan(0);
  });
});

describe("setFocus", () => {
  beforeEach(resetData);

  it("stores the strand and an expiry in the future", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });

    const result = await setFocus(child.id, "MA.4.FR", 7);
    expect(result.ok).toBe(true);

    const [row] = await db
      .select({ strand: students.focusStrand, until: students.focusUntil })
      .from(students)
      .where(eq(students.id, child.id));
    expect(row.strand).toBe("MA.4.FR");
    const days = (row.until!.getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7.1);
  });

  it("refuses a strand from a different grade", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 2 });

    const result = await setFocus(child.id, "MA.4.FR", 7);
    expect(result.ok).toBe(false);
  });

  it("refuses a strand that does not exist", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });

    expect((await setFocus(child.id, "MA.4.NOPE", 7)).ok).toBe(false);
  });

  it("refuses a profile that is not there", async () => {
    const missing = "00000000-0000-0000-0000-000000000000";
    expect((await setFocus(missing, "MA.4.FR", 7)).ok).toBe(false);
  });

  it("replaces an earlier focus rather than adding to it", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });

    await setFocus(child.id, "MA.4.FR", 3);
    await setFocus(child.id, "MA.4.GR", 7);

    const focus = await activeFocus(child.id);
    expect(focus?.strandCode).toBe("MA.4.GR");
  });
});

describe("activeFocus", () => {
  beforeEach(resetData);

  it("is null for a child with none", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    expect(await activeFocus(child.id)).toBeNull();
  });

  it("reports a live one with the name a child would be shown", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    await setFocus(child.id, "MA.4.FR", 7);

    const focus = await activeFocus(child.id);
    expect(focus?.strandCode).toBe("MA.4.FR");
    // The label is the readable strand name, because it is shown to the
    // child under the question. "MA.4.FR" would not be.
    expect(focus?.label).toMatch(/[a-z]/);
    expect(focus?.label).not.toContain("MA.4");
  });

  it("stops applying once it has run out", async () => {
    /*
     * Expiry is enforced by the query rather than by a cleanup job, so this
     * is the test that the columns being stale does not matter. Written
     * directly rather than through setFocus, because setFocus will not accept
     * a date in the past — which is correct, and would make this untestable
     * through the front door.
     */
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    await db
      .update(students)
      .set({
        focusStrand: "MA.4.FR",
        focusUntil: new Date(Date.now() - 60_000),
      })
      .where(eq(students.id, child.id));

    expect(await activeFocus(child.id)).toBeNull();
  });

  it("does not leak one child's focus to another", async () => {
    const parent = await makeParent();
    const a = await makeStudent(parent.id, { grade: 4 });
    const b = await makeStudent(parent.id, { grade: 4 });
    await setFocus(a.id, "MA.4.FR", 7);

    expect((await activeFocus(a.id))?.strandCode).toBe("MA.4.FR");
    expect(await activeFocus(b.id)).toBeNull();
  });
});

describe("clearFocus", () => {
  beforeEach(resetData);

  it("removes both columns", async () => {
    const parent = await makeParent();
    const child = await makeStudent(parent.id, { grade: 4 });
    await setFocus(child.id, "MA.4.FR", 7);

    await clearFocus(child.id);

    const [row] = await db
      .select({ strand: students.focusStrand, until: students.focusUntil })
      .from(students)
      .where(eq(students.id, child.id));
    expect(row.strand).toBeNull();
    expect(row.until).toBeNull();
  });
});
