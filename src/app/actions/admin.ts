"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { adminUsers, students, subscriptions } from "@/db/schema";
import { hashPin } from "@/auth";
import {
  atLeast,
  currentAdmin,
  endAdminSession,
  startAdminSession,
} from "@/lib/admin/session";
import { recordAudit } from "@/lib/admin/audit";
import { familyDetail } from "@/lib/data/admin-queries";
import { releaseSeat } from "@/lib/data/subscriptions";
import {
  checkThrottle,
  clearThrottle,
  recordFailure,
  waitMessage,
} from "@/lib/auth/throttle";
import { billingConfigured, stripe } from "@/lib/stripe";
import { prorationFor } from "@/lib/billing/rules";

export interface AdminState {
  error?: string;
  success?: string;
}

/* ------------------------------------------------------------------ *
 * Signing in
 * ------------------------------------------------------------------ */

export async function adminSignIn(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  // Staff credentials guard access to every family's data, so the same
  // throttle applies here, keyed separately from parent logins.
  const key = `admin:${email}`;
  const throttle = await checkThrottle(key);
  if (!throttle.allowed) return { error: waitMessage(throttle.retryAfter) };

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(and(eq(adminUsers.email, email), eq(adminUsers.active, true)))
    .limit(1);

  const hash =
    admin?.passwordHash ??
    "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const ok = await bcrypt.compare(password, hash);

  if (!admin || !ok) {
    await recordFailure(key);
    return { error: "Those details did not match." };
  }

  await clearThrottle(key);
  await startAdminSession(admin.id);
  await recordAudit({
    actor: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as "support" | "content" | "owner",
    },
    action: "admin.signed_in",
    targetType: "admin",
    targetId: admin.id,
  });

  redirect("/admin");
}

export async function adminSignOut() {
  await endAdminSession();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ *
 * Support actions
 * ------------------------------------------------------------------ */

async function requireAdmin(minimum: "support" | "content" | "owner" = "support") {
  const admin = await currentAdmin();
  if (!admin) return null;
  if (!atLeast(admin.role, minimum)) return null;
  return admin;
}

const pinSchema = z.object({
  studentId: z.string().uuid(),
  pin: z.string().regex(/^\d{4}$/, "The PIN must be four digits"),
});

/**
 * Resets a child's PIN on a parent's behalf.
 *
 * The commonest support request there will ever be. Logged with the child's
 * id, because "somebody reset my daughter's PIN" needs an answer.
 */
export async function adminResetPin(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not signed in." };

  const parsed = pinSchema.safeParse({
    studentId: formData.get("studentId"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, parsed.data.studentId))
    .limit(1);
  if (!student) return { error: "No such profile." };

  await db
    .update(students)
    .set({ pinHash: await hashPin(parsed.data.pin) })
    .where(eq(students.id, student.id));

  await recordAudit({
    actor: admin,
    action: "student.pin_reset",
    targetType: "student",
    targetId: student.id,
    after: { firstName: student.firstName },
  });

  revalidatePath(`/admin/accounts/${student.parentId}`);
  return { success: `PIN reset for ${student.firstName}.` };
}

const gradeSchema = z.object({
  studentId: z.string().uuid(),
  grade: z.coerce.number().int().min(1).max(6),
});

export async function adminChangeGrade(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not signed in." };

  const parsed = gradeSchema.safeParse({
    studentId: formData.get("studentId"),
    grade: formData.get("grade"),
  });
  if (!parsed.success) return { error: "That grade is not valid." };

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, parsed.data.studentId))
    .limit(1);
  if (!student) return { error: "No such profile." };
  if (student.grade === parsed.data.grade) return {};

  await db
    .update(students)
    .set({ grade: parsed.data.grade })
    .where(eq(students.id, student.id));

  await recordAudit({
    actor: admin,
    action: "student.grade_changed",
    targetType: "student",
    targetId: student.id,
    before: { grade: student.grade },
    after: { grade: parsed.data.grade },
  });

  revalidatePath(`/admin/accounts/${student.parentId}`);
  return {
    success: `${student.firstName} moved to grade ${parsed.data.grade}. Their practice history is kept.`,
  };
}

/**
 * Deletes a child on request.
 *
 * COPPA gives a parent the right to have their child's information removed,
 * and some will ask by email rather than clicking the button themselves.
 * Requires the child's name typed out, exactly as the parent-facing flow does.
 */
export async function adminDeleteStudent(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const admin = await requireAdmin("owner");
  if (!admin) return { error: "This needs an owner account." };

  const studentId = String(formData.get("studentId") ?? "");
  const confirmName = String(formData.get("confirmName") ?? "");

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (!student) return { error: "No such profile." };

  if (
    confirmName.trim().toLowerCase() !== student.firstName.trim().toLowerCase()
  ) {
    return { error: `Type ${student.firstName} exactly. Nothing was deleted.` };
  }

  await releaseSeat(student.id);
  await db.delete(students).where(eq(students.id, student.id));

  await recordAudit({
    actor: admin,
    action: "student.deleted",
    targetType: "student",
    targetId: student.id,
    before: {
      firstName: student.firstName,
      grade: student.grade,
      parentId: student.parentId,
    },
  });

  revalidatePath(`/admin/accounts/${student.parentId}`);
  return { success: `${student.firstName} and their history have been deleted.` };
}

const seatSchema = z.object({
  parentId: z.string().uuid(),
  seats: z.coerce.number().int().min(1).max(10),
});

export async function adminChangeSeats(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const admin = await requireAdmin("owner");
  if (!admin) return { error: "This needs an owner account." };
  if (!billingConfigured()) return { error: "Billing is not configured." };

  const parsed = seatSchema.safeParse({
    parentId: formData.get("parentId"),
    seats: formData.get("seats"),
  });
  if (!parsed.success) return { error: "Choose between one and ten." };

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.parentId, parsed.data.parentId))
    .limit(1);
  if (!sub) return { error: "That family has no subscription." };
  if (sub.seatQuantity === parsed.data.seats) return {};

  const stripeSub = await stripe().subscriptions.retrieve(
    sub.stripeSubscriptionId,
  );
  const item = stripeSub.items.data[0];
  if (!item) return { error: "That subscription has no billable item." };

  await stripe().subscriptions.update(sub.stripeSubscriptionId, {
    items: [{ id: item.id, quantity: parsed.data.seats }],
    proration_behavior: prorationFor(sub.seatQuantity, parsed.data.seats),
  });

  await recordAudit({
    actor: admin,
    action: "subscription.seats_changed",
    targetType: "subscription",
    targetId: sub.id,
    before: { seats: sub.seatQuantity },
    after: { seats: parsed.data.seats },
  });

  revalidatePath(`/admin/accounts/${parsed.data.parentId}`);
  // Stripe's webhook writes the new quantity, so the two paths cannot
  // disagree about what actually happened.
  return { success: "Sent to Stripe. The new count appears once it confirms." };
}

/**
 * Exports everything held about a family, as JSON.
 *
 * The privacy notice promises a parent can review their child's information.
 * Most will just read the dashboard, but a formal request needs a formal
 * answer, and this produces one.
 */
export async function adminExportFamily(
  parentId: string,
): Promise<{ data?: string; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not signed in." };

  const family = await familyDetail(parentId);
  if (!family) return { error: "No such account." };

  await recordAudit({
    actor: admin,
    action: "parent.data_exported",
    targetType: "parent",
    targetId: parentId,
  });

  return {
    data: JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        parent: {
          email: family.parent.email,
          name: family.parent.name,
          createdAt: family.parent.createdAt,
        },
        children: family.children.map((c) => ({
          firstName: c.student.firstName,
          grade: c.student.grade,
          birthYear: c.student.birthYear,
          createdAt: c.student.createdAt,
          questionsAnswered: c.attemptCount,
          correct: c.correctCount,
          skillsMastered: c.mastered,
          lastPractised: c.lastSeen,
        })),
        subscription: family.subscription
          ? {
              status: family.subscription.status,
              seats: family.subscription.seatQuantity,
              currentPeriodEnd: family.subscription.currentPeriodEnd,
            }
          : null,
        note: "Passwords and PINs are stored only as one-way hashes and cannot be exported.",
      },
      null,
      2,
    ),
  };
}
