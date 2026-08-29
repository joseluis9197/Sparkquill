"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { students } from "@/db/schema";
import { clearFocus, setFocus } from "@/lib/data/focus";
import { FOCUS_DAYS, type FocusDays } from "@/lib/focus-shared";

/**
 * Setting and clearing a child's practice focus, from the parent dashboard.
 *
 * Every path here re-checks that the child belongs to the signed-in parent.
 * The form only ever offers a parent their own children, but a form field is
 * a claim rather than a fact, and "which child" is exactly the field somebody
 * would edit first.
 */

export interface FocusState {
  ok?: boolean;
  error?: string;
}

async function ownsChild(studentId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const [row] = await db
    .select({ parentId: students.parentId })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  return row?.parentId === session.user.id;
}

export async function setPracticeFocus(
  _prev: FocusState,
  formData: FormData,
): Promise<FocusState> {
  const studentId = String(formData.get("studentId") ?? "");
  const strandCode = String(formData.get("strandCode") ?? "");
  const days = Number(formData.get("days"));

  if (!(await ownsChild(studentId))) {
    return { error: "That profile is not on this account." };
  }
  if (!strandCode) return { error: "Choose a topic first." };
  if (!(FOCUS_DAYS as readonly number[]).includes(days)) {
    return { error: "Choose how long the focus should last." };
  }

  const result = await setFocus(studentId, strandCode, days as FocusDays);
  if (!result.ok) return { error: result.error };

  revalidatePath("/parent");
  return { ok: true };
}

export async function clearPracticeFocus(
  _prev: FocusState,
  formData: FormData,
): Promise<FocusState> {
  const studentId = String(formData.get("studentId") ?? "");
  if (!(await ownsChild(studentId))) {
    return { error: "That profile is not on this account." };
  }
  await clearFocus(studentId);
  revalidatePath("/parent");
  return { ok: true };
}
