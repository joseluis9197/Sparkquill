"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { parents, passwordResetTokens } from "@/db/schema";
import { hashPassword } from "@/auth";
import {
  RESET_TTL_MINUTES,
  checkResetToken,
  issueResetToken,
} from "@/lib/auth/reset-tokens";
import {
  checkThrottle,
  clearThrottle,
  recordFailure,
  waitMessage,
} from "@/lib/auth/throttle";
import {
  emailConfigured,
  passwordResetEmail,
  sendEmail,
} from "@/lib/email/send";

export interface ResetRequestState {
  error?: string;
  /** True once the request has been accepted, whatever the outcome. */
  done?: boolean;
  /** Set when email is not configured, so the page can say so honestly. */
  unavailable?: boolean;
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Starts a password reset.
 *
 * Always reports the same outcome whether or not the address is registered.
 * A form that says "no account with that email" is an account-enumeration
 * tool, and this one is reachable by anybody.
 */
export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) {
    return { error: "Enter the email address you signed up with." };
  }

  // Without a provider nothing can be delivered, and promising otherwise
  // leaves a locked-out parent waiting for an email that will never arrive.
  //
  // In development the flow continues and the link is logged to the server
  // console instead, so the whole path can be exercised without signing up to
  // an email service to test it.
  if (!emailConfigured() && process.env.NODE_ENV === "production") {
    return { unavailable: true };
  }

  // Rate limited per address so the form cannot be used to bombard someone's
  // inbox, or to probe which addresses exist by timing the response.
  const key = `reset:${email}`;
  const throttle = await checkThrottle(key);
  if (!throttle.allowed) {
    return { error: waitMessage(throttle.retryAfter) };
  }
  await recordFailure(key);

  const issued = await issueResetToken(email);

  if (issued) {
    const url = `${appUrl()}/reset-password?token=${encodeURIComponent(issued.issued.token)}`;
    const message = passwordResetEmail({
      name: issued.name,
      url,
      minutes: RESET_TTL_MINUTES,
    });
    const result = await sendEmail({ to: email, ...message });
    if (!result.sent && !result.previewOnly) {
      // A provider failure is ours, not the parent's, and pretending it
      // succeeded would leave them waiting.
      return { error: "We could not send the email just now. Please try again." };
    }
  }

  // Same answer either way.
  return { done: true };
}

export interface ResetState {
  error?: string;
}

const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(200, "That password is too long");

/**
 * Completes a password reset.
 *
 * The token is consumed and the password changed in one transaction, so a
 * failure cannot leave a spent token with the old password still in place.
 */
export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (password !== confirm) return { error: "The two passwords do not match." };

  const check = await checkResetToken(token);
  if (!check.valid) {
    return {
      error:
        check.reason === "expired"
          ? "That link has expired. Ask for a new one."
          : check.reason === "used"
            ? "That link has already been used. Ask for a new one."
            : "That link is not valid. Ask for a new one.",
    };
  }

  const hashed = await hashPassword(password);

  await db.transaction(async (tx) => {
    await tx
      .update(parents)
      .set({ passwordHash: hashed })
      .where(eq(parents.id, check.parentId));
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, check.tokenId));
  });

  // A successful reset clears any lockout from the failed attempts that
  // presumably led here.
  const [parent] = await db
    .select({ email: parents.email })
    .from(parents)
    .where(eq(parents.id, check.parentId))
    .limit(1);
  if (parent) {
    await clearThrottle(`login:${parent.email}`);
    await clearThrottle(`reset:${parent.email}`);
  }

  return {};
}
