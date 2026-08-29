import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { parents, verificationTokens } from "@/db/schema";

/**
 * Confirming that a parent owns the address they signed up with.
 *
 * Two problems this solves, and both are real rather than theoretical:
 *
 *   1. A typo in an email address creates an account nobody can recover. The
 *      reset link goes to an address the parent does not own, so the only
 *      route back into their own account is a support conversation — and this
 *      product has no support team.
 *   2. Anyone can sign up with somebody else's address. With a card and a
 *      child's name attached, that is worse than the usual case.
 *
 * ## What verification does not do here
 *
 * It does not gate access. A parent who has just paid can use the product
 * immediately; blocking them at the door over an unread email would be a
 * self-inflicted wound at the exact moment they are deciding whether this was
 * worth it. What it gates is anything that depends on the address being
 * theirs — and there is a standing reminder until it is done.
 *
 * Tokens are stored hashed, for the same reason reset tokens are: a database
 * leak that hands out working links is a worse outcome than the leak itself.
 */

export const VERIFY_TTL_HOURS = 48;

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface IssuedVerification {
  token: string;
  expires: Date;
}

/**
 * Issues a fresh link, invalidating any earlier one.
 *
 * Older links stop working the moment a new one is requested, so a forwarded
 * or intercepted email from last week is dead.
 */
export async function issueVerification(
  email: string,
): Promise<IssuedVerification> {
  const identifier = email.toLowerCase();
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, identifier));

  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + VERIFY_TTL_HOURS * 3_600_000);

  await db.insert(verificationTokens).values({
    identifier,
    token: hash(token),
    expires,
  });

  return { token, expires };
}

export type VerifyOutcome =
  | { ok: true; email: string; alreadyDone: boolean }
  | { ok: false; reason: "unknown" | "expired" };

/**
 * Consumes a link and marks the address verified.
 *
 * The token is deleted and the parent updated in one transaction: a failure
 * between the two would either spend a link without verifying anything, or
 * leave a spent link working.
 */
export async function consumeVerification(
  token: string,
): Promise<VerifyOutcome> {
  const tokenHash = hash(token);

  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, tokenHash))
    .limit(1);

  if (!row) return { ok: false, reason: "unknown" };
  if (row.expires.getTime() <= Date.now()) {
    // Cleared rather than left to rot: an expired row is only useful to
    // somebody enumerating the table.
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, tokenHash));
    return { ok: false, reason: "expired" };
  }

  return db.transaction(async (tx) => {
    const [parent] = await tx
      .select({ id: parents.id, verified: parents.emailVerified })
      .from(parents)
      .where(eq(parents.email, row.identifier))
      .limit(1);

    await tx
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, tokenHash));

    if (!parent) return { ok: false as const, reason: "unknown" as const };

    if (!parent.verified) {
      await tx
        .update(parents)
        .set({ emailVerified: new Date() })
        .where(eq(parents.id, parent.id));
    }

    return {
      ok: true as const,
      email: row.identifier,
      // A link clicked twice — from an email client that prefetches, or a
      // parent who was not sure it worked — is a success, not an error.
      alreadyDone: Boolean(parent.verified),
    };
  });
}

/** Whether this address still has an unexpired link outstanding. */
export async function hasPendingVerification(email: string): Promise<boolean> {
  const [row] = await db
    .select({ token: verificationTokens.token })
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, email.toLowerCase()),
        gt(verificationTokens.expires, new Date()),
      ),
    )
    .limit(1);
  return Boolean(row);
}
