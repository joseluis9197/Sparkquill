"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { db } from "@/db";
import { parents, students } from "@/db/schema";
import { auth, hashPassword, hashPin, signIn, verifyPin } from "@/auth";
import { clearActiveStudent, setActiveStudent } from "@/lib/student-session";
import {
  checkThrottle,
  clearThrottle,
  recordFailure,
  waitMessage,
} from "@/lib/auth/throttle";
import { getStudentForParent } from "@/lib/data/students";

export interface ActionState {
  error?: string;
}

/* ------------------------------------------------------------------ *
 * Parent account
 * ------------------------------------------------------------------ */

const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().trim().toLowerCase().email("That does not look like an email address"),
  password: z
    .string()
    .min(10, "Use at least 10 characters")
    .max(200, "That password is too long"),
});

export async function signUp(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: parents.id })
    .from(parents)
    .where(eq(parents.email, email))
    .limit(1);
  if (existing) {
    return { error: "There is already an account with that email address." };
  }

  await db.insert(parents).values({
    name,
    email,
    passwordHash: await hashPassword(password),
  });

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/students",
  });
  return {};
}

export async function logIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Enter your email address and password." };
  }

  const key = `login:${email}`;
  const throttle = await checkThrottle(key);
  if (!throttle.allowed) {
    return { error: waitMessage(throttle.retryAfter) };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/students" });
    await clearThrottle(key);
    return {};
  } catch (err) {
    if (err instanceof AuthError) {
      await recordFailure(key);
      // Never distinguish "no such account" from "wrong password": the
      // difference tells an attacker which addresses are registered.
      return { error: "Those details did not match an account." };
    }
    throw err;
  }
}

/* ------------------------------------------------------------------ *
 * Student profiles
 * ------------------------------------------------------------------ */

const studentSchema = z.object({
  // First name only. No surname is collected anywhere in the product.
  firstName: z.string().trim().min(1, "Enter a first name").max(40),
  grade: z.coerce.number().int().min(1).max(6),
  pin: z
    .string()
    .regex(/^\d{4}$/, "The PIN must be exactly four digits"),
});

export async function addStudent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) return { error: "Please sign in again." };

  const parsed = studentSchema.safeParse({
    firstName: formData.get("firstName"),
    grade: formData.get("grade"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.parentId, parentId));
  // A soft ceiling, not a business rule: it exists so a scripted signup
  // cannot fill the table.
  if (existing.length >= 10) {
    return { error: "You can add up to ten children on one account." };
  }

  await db.insert(students).values({
    parentId,
    firstName: parsed.data.firstName,
    grade: parsed.data.grade,
    pinHash: await hashPin(parsed.data.pin),
    avatarKey: pickAvatar(existing.length),
  });

  revalidatePath("/students");
  return {};
}

const AVATARS = ["fox", "owl", "otter", "bear", "hare", "heron"] as const;
function pickAvatar(index: number) {
  return AVATARS[index % AVATARS.length];
}

/**
 * Signs a child in to their own profile.
 *
 * The parent must already be authenticated; this only selects which of *their*
 * children is using the app. A wrong PIN reveals nothing about the others.
 */
export async function selectStudent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) return { error: "Please sign in again." };

  const studentId = String(formData.get("studentId") ?? "");
  const pin = String(formData.get("pin") ?? "");
  if (!/^\d{4}$/.test(pin)) {
    return { error: "Type your four numbers." };
  }

  const student = await getStudentForParent(studentId, parentId);
  if (!student) return { error: "That profile is not on this account." };

  // Four digits is ten thousand possibilities. Without a limit that is not a
  // secret, it is a formality.
  const key = `pin:${student.id}`;
  const throttle = await checkThrottle(key);
  if (!throttle.allowed) {
    return { error: waitMessage(throttle.retryAfter) };
  }

  if (!(await verifyPin(pin, student.pinHash))) {
    const next = await recordFailure(key);
    // Written for a seven-year-old reading it, not for a developer.
    return {
      error: next.allowed
        ? "That is not the right PIN. Try again."
        : waitMessage(next.retryAfter),
    };
  }

  await clearThrottle(key);
  await setActiveStudent(student.id);
  redirect("/learn");
}

export async function switchStudent() {
  await clearActiveStudent();
  redirect("/students");
}

const pinChangeSchema = z.object({
  studentId: z.string().uuid(),
  pin: z.string().regex(/^\d{4}$/, "The PIN must be exactly four digits"),
});

export async function resetStudentPin(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) return { error: "Please sign in again." };

  const parsed = pinChangeSchema.safeParse({
    studentId: formData.get("studentId"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const student = await getStudentForParent(parsed.data.studentId, parentId);
  if (!student) return { error: "That profile is not on this account." };

  await db
    .update(students)
    .set({ pinHash: await hashPin(parsed.data.pin) })
    .where(
      and(eq(students.id, student.id), eq(students.parentId, parentId)),
    );

  revalidatePath("/parent");
  return {};
}
