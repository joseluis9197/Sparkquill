import "server-only";
import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { benchmarks, skills, strands, students } from "@/db/schema";
import type { Focus } from "@/lib/adaptive/select";
import type { Subject } from "./progress";
import type { FocusDays, StrandOption } from "@/lib/focus-shared";

/**
 * The focus a parent can put on a child's practice for a few days.
 *
 * The problem it solves is narrow and real: there is a test on fractions on
 * Thursday, and until now the platform had no way to hear that. An adaptive
 * selector with no override is a system its user cannot correct, and when it
 * is wrong the only remaining move is to cancel.
 *
 * What it deliberately is not is a topic menu for the child. Two reasons, and
 * both are load-bearing:
 *
 *   - A child choosing picks what they can already do. That is not a slight;
 *     it is what anyone does when the measure is visible, and it is the exact
 *     behaviour the mastery bands and the prerequisite graph exist to push
 *     against.
 *   - Reviews come due on a schedule. A filter that could postpone them would
 *     leave the spaced repetition intervals meaning nothing.
 *
 * So it is set from the parent dashboard, it names a strand rather than a
 * single skill, it expires, and it never reaches the review tier. See
 * `selectNextSkill` for where those last two are enforced.
 */

export { FOCUS_DAYS, type FocusDays, type StrandOption } from "@/lib/focus-shared";

/**
 * The strands a particular child could be pointed at.
 *
 * Counted from skills that actually exist rather than from the curriculum, so
 * a parent is never offered a topic with nothing behind it. The count is shown
 * for the same reason: "Fractions (14 skills)" tells them what they are asking
 * for, and a strand with two skills would run out in one sitting.
 */
export async function strandOptions(grade: number): Promise<StrandOption[]> {
  const rows = await db
    .select({
      code: strands.code,
      name: strands.name,
      subject: strands.subject,
      skillId: skills.id,
    })
    .from(skills)
    .innerJoin(benchmarks, eq(benchmarks.code, skills.benchmarkCode))
    .innerJoin(strands, eq(strands.code, benchmarks.strandCode))
    // A child's own grade only, and filtered here rather than after the fact.
    // Offering "third grade fractions" to a fifth grader's parent would be
    // revision dressed up as this week's homework; the selector still reaches
    // down on its own when a prerequisite is genuinely missing.
    .where(eq(strands.grade, grade))
    .orderBy(asc(strands.subject), asc(strands.sortOrder));

  const counted = new Map<string, StrandOption>();
  for (const r of rows) {
    const entry = counted.get(r.code) ?? {
      code: r.code,
      name: r.name,
      subject: r.subject as Subject,
      skillCount: 0,
    };
    entry.skillCount += 1;
    counted.set(r.code, entry);
  }
  return [...counted.values()];
}

/**
 * The focus currently in force for a child, or null.
 *
 * Expiry is applied by the query rather than by a cleanup job, so a focus
 * stops applying the moment it runs out even if nothing has since written to
 * the row. The stale columns are harmless and are overwritten by the next
 * focus that is set.
 */
export async function activeFocus(studentId: string): Promise<Focus | null> {
  const [row] = await db
    .select({ strandCode: students.focusStrand, name: strands.name })
    .from(students)
    .innerJoin(strands, eq(strands.code, students.focusStrand))
    .where(
      and(eq(students.id, studentId), gt(students.focusUntil, new Date())),
    )
    .limit(1);

  if (!row?.strandCode) return null;
  return { strandCode: row.strandCode, label: row.name };
}

/** What the parent dashboard shows: the focus and when it runs out. */
export async function focusDetail(
  studentId: string,
): Promise<{ strandCode: string; label: string; until: Date } | null> {
  const [row] = await db
    .select({
      strandCode: students.focusStrand,
      until: students.focusUntil,
      name: strands.name,
    })
    .from(students)
    .innerJoin(strands, eq(strands.code, students.focusStrand))
    .where(
      and(eq(students.id, studentId), gt(students.focusUntil, new Date())),
    )
    .limit(1);

  if (!row?.strandCode || !row.until) return null;
  return { strandCode: row.strandCode, label: row.name, until: row.until };
}

/**
 * Points a child's practice at one strand until a date.
 *
 * Verifies the strand belongs to the child's own grade rather than trusting
 * the form: the picker only offers valid ones, but a posted value is a posted
 * value, and a focus on a strand from another grade would silently match
 * nothing and look like the feature was broken.
 */
export async function setFocus(
  studentId: string,
  strandCode: string,
  days: FocusDays,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [child] = await db
    .select({ grade: students.grade })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (!child) return { ok: false, error: "No such profile." };

  const allowed = await strandOptions(child.grade);
  if (!allowed.some((s) => s.code === strandCode)) {
    return { ok: false, error: "That topic is not part of this grade." };
  }

  await db
    .update(students)
    .set({
      focusStrand: strandCode,
      focusUntil: new Date(Date.now() + days * 86_400_000),
    })
    .where(eq(students.id, studentId));
  return { ok: true };
}

export async function clearFocus(studentId: string): Promise<void> {
  await db
    .update(students)
    .set({ focusStrand: null, focusUntil: null })
    .where(eq(students.id, studentId));
}
