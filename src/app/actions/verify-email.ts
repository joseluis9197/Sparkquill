"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { parents } from "@/db/schema";
import { auth } from "@/auth";
import { emailConfigured, sendEmail, verifyEmailMessage } from "@/lib/email/send";
import { checkThrottle, recordFailure, waitMessage } from "@/lib/auth/throttle";
import { issueVerification, VERIFY_TTL_HOURS } from "@/lib/auth/verification";
import { appUrl } from "@/lib/app-url";

/**
 * Sending the confirmation email.
 *
 * Used at sign-up and from the "resend" control on the dashboard. Both go
 * through here so the rate limit and the failure handling cannot diverge.
 */

export interface VerifyState {
  sent?: boolean;
  error?: string;
  unavailable?: boolean;
}

/**
 * Sends the link for an address, if there is an account on it.
 *
 * Returns quietly when there is no such account. This is called from a signed
 * -in page and from sign-up, so it is not an address-enumeration surface in
 * practice — but answering differently would make it one the first time
 * somebody wires it to a public form.
 */
export async function sendVerificationEmail(
  email: string,
): Promise<VerifyState> {
  const address = email.trim().toLowerCase();
  if (!z.string().email().safeParse(address).success) {
    return { error: "That does not look like an email address." };
  }

  if (!emailConfigured() && process.env.NODE_ENV === "production") {
    return { unavailable: true };
  }

  // One link per address per window. Without this the resend button is a
  // way to send somebody a hundred emails.
  const key = `verify:${address}`;
  const throttle = await checkThrottle(key);
  if (!throttle.allowed) return { error: waitMessage(throttle.retryAfter) };
  await recordFailure(key);

  const [parent] = await db
    .select({ name: parents.name, verified: parents.emailVerified })
    .from(parents)
    .where(eq(parents.email, address))
    .limit(1);

  // Nothing to do, and nothing to say. Sending a confirmation link to an
  // address that is already confirmed just trains people to click links.
  if (!parent || parent.verified) return { sent: true };

  const { token } = await issueVerification(address);
  const url = `${appUrl()}/verify?token=${encodeURIComponent(token)}`;
  const message = verifyEmailMessage({
    name: parent.name,
    url,
    hours: VERIFY_TTL_HOURS,
  });

  const result = await sendEmail({ to: address, ...message });
  if (!result.sent && !result.previewOnly) {
    return { error: "We could not send the email just now. Please try again." };
  }
  return { sent: true };
}

/** The resend control on the parent dashboard. */
export async function resendVerification(
  _prev: VerifyState,
  _formData: FormData,
): Promise<VerifyState> {
  const session = await auth();
  // Deliberately the signed-in address rather than one submitted with the
  // form: a form field here would let anyone signed in send mail to any
  // address they liked.
  if (!session?.user?.email) return { error: "Please sign in again." };
  return sendVerificationEmail(session.user.email);
}
