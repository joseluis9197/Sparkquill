"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { parents, students } from "@/db/schema";
import { auth, hashPassword } from "@/auth";
import { getStudentForParent } from "@/lib/data/students";
import { releaseSeat } from "@/lib/data/subscriptions";
import { clearActiveStudent, getActiveStudentId } from "@/lib/student-session";

export interface ManageState {
  error?: string;
  success?: string;
}

/* ------------------------------------------------------------------ *
 * Changing a password while signed in
 * ------------------------------------------------------------------ */

const changeSchema = z.object({
  current: z.string().min(1, "Enter your current password"),
  next: z
    .string()
    .min(10, "Use at least 10 characters")
    .max(200, "That password is too long"),
  confirm: z.string(),
});

/**
 * Changes a password from inside the account.
 *
 * The current password is required even though the session already proves who
 * they are: it is what stops someone who walks up to an unlocked laptop from
 * taking the account over, which is a far more likely threat here than a
 * stolen session token.
 */
export async function changePassword(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) return { error: "Please sign in again." };

  const parsed = changeSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (parsed.data.next !== parsed.data.confirm) {
    return { error: "The two new passwords do not match." };
  }
  if (parsed.data.next === parsed.data.current) {
    return { error: "That is the password you already have." };
  }

  const [parent] = await db
    .select({ hash: parents.passwordHash })
    .from(parents)
    .where(eq(parents.id, parentId))
    .limit(1);

  if (!parent?.hash) return { error: "Please sign in again." };

  const ok = await bcrypt.compare(parsed.data.current, parent.hash);
  if (!ok) return { error: "That is not your current password." };

  await db
    .update(parents)
    .set({ passwordHash: await hashPassword(parsed.data.next) })
    .where(eq(parents.id, parentId));

  revalidatePath("/parent");
  return { success: "Your password has been changed." };
}

/* ------------------------------------------------------------------ *
 * Deleting a child
 * ------------------------------------------------------------------ */

const deleteSchema = z.object({
  studentId: z.string().uuid(),
  /** The child's name, typed out, so a mis-click cannot delete a history. */
  confirmName: z.string().min(1),
});

/**
 * Deletes a child and everything recorded about them.
 *
 * The privacy notice promises a parent can do exactly this, so it has to be
 * real: the row goes, and attempts, mastery, sessions and seat assignments go
 * with it through the schema's cascades. There is no shadow copy and no soft
 * delete — a promise to delete that quietly keeps the data is worse than not
 * promising.
 *
 * The seat is released first so the family is not left paying for a child who
 * no longer exists.
 */
export async function deleteStudent(
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) return { error: "Please sign in again." };

  const parsed = deleteSchema.safeParse({
    studentId: formData.get("studentId"),
    confirmName: formData.get("confirmName"),
  });
  if (!parsed.success) return { error: "Something was missing from that form." };

  const student = await getStudentForParent(parsed.data.studentId, parentId);
  if (!student) return { error: "That profile is not on this account." };

  if (
    parsed.data.confirmName.trim().toLowerCase() !==
    student.firstName.trim().toLowerCase()
  ) {
    return {
      error: `Type ${student.firstName} exactly to confirm. Nothing has been deleted.`,
    };
  }

  await releaseSeat(student.id);

  // If this child is the one currently signed in, end their session too,
  // otherwise the app would hold a cookie pointing at a profile that is gone.
  const active = await getActiveStudentId();
  if (active === student.id) await clearActiveStudent();

  await db
    .delete(students)
    .where(and(eq(students.id, student.id), eq(students.parentId, parentId)));

  revalidatePath("/parent");
  revalidatePath("/students");
  return {
    success: `${student.firstName}'s profile and practice history have been deleted.`,
  };
}
