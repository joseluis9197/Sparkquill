import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { auth } from "@/auth";
import { getActiveStudentId } from "@/lib/student-session";

export type Student = typeof students.$inferSelect;

/** Every child belonging to the signed-in parent. */
export async function listStudents(parentId: string): Promise<Student[]> {
  return db
    .select()
    .from(students)
    .where(and(eq(students.parentId, parentId), eq(students.active, true)))
    .orderBy(students.createdAt);
}

/**
 * Fetches a child, but only if they belong to this parent.
 *
 * Scoping by parent on every read is what makes the signed student cookie
 * safe: even a forged cookie can only name a child the signed-in parent
 * already owns.
 */
export async function getStudentForParent(
  studentId: string,
  parentId: string,
): Promise<Student | null> {
  const [row] = await db
    .select()
    .from(students)
    .where(and(eq(students.id, studentId), eq(students.parentId, parentId)))
    .limit(1);
  return row ?? null;
}

/**
 * The child currently using the app, or null.
 *
 * Returns null rather than throwing when nobody is selected, because that is
 * the ordinary state on the parent's own pages.
 */
export async function requireActiveStudent(): Promise<{
  student: Student;
  parentId: string;
} | null> {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) return null;

  const studentId = await getActiveStudentId();
  if (!studentId) return null;

  const student = await getStudentForParent(studentId, parentId);
  return student ? { student, parentId } : null;
}
