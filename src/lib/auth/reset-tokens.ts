import "server-only";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { and, eq, isNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { parents, passwordResetTokens } from "@/db/schema";

/**
 * Password reset tokens.
 *
 * 32 random bytes, delivered once by email and stored only as a hash. A
 * database leak therefore yields nothing usable, and neither does a stolen
 * backup — the same reason passwords are hashed applies to anything that can
 * be exchanged for a session.
 */

export const RESET_TTL_MINUTES = 60;

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface IssuedToken {
  token: string;
  expiresAt: Date;
}

/**
 * Issues a token for an email address, if an account exists.
 *
 * Returns null when it does not. The caller must show the same message either
 * way — telling an anonymous visitor whether an address is registered turns
 * the reset form into an account-enumeration tool.
 */
export async function issueResetToken(
  email: string,
): Promise<{ issued: IssuedToken; parentId: string; name: string | null } | null> {
  const [parent] = await db
    .select({ id: parents.id, name: parents.name })
    .from(parents)
    .where(eq(parents.email, email.toLowerCase()))
    .limit(1);

  if (!parent) return null;

  // Any earlier link stops working the moment a new one is asked for, so a
  // forwarded or intercepted old email is dead.
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.parentId, parent.id),
        isNull(passwordResetTokens.usedAt),
      ),
    );

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60_000);

  await db.insert(passwordResetTokens).values({
    parentId: parent.id,
    tokenHash: hash(token),
    expiresAt,
  });

  return { issued: { token, expiresAt }, parentId: parent.id, name: parent.name };
}

export type TokenCheck =
  | { valid: true; parentId: string; tokenId: string }
  | { valid: false; reason: "unknown" | "used" | "expired" };

export async function checkResetToken(token: string): Promise<TokenCheck> {
  const candidate = hash(token);

  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, candidate))
    .limit(1);

  if (!row) return { valid: false, reason: "unknown" };

  // Constant-time comparison even though the lookup already matched: the
  // column is unique, so this is belt and braces rather than the real defence.
  const a = Buffer.from(row.tokenHash);
  const b = Buffer.from(candidate);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { valid: false, reason: "unknown" };
  }

  if (row.usedAt) return { valid: false, reason: "used" };
  if (row.expiresAt.getTime() <= Date.now()) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, parentId: row.parentId, tokenId: row.id };
}

/** Marks a token spent. Called in the same transaction as the password change. */
export async function consumeResetToken(tokenId: string) {
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, tokenId));
}

/** Housekeeping for expired rows. Safe to run from a scheduled job. */
export async function pruneResetTokens() {
  await db
    .delete(passwordResetTokens)
    .where(lt(passwordResetTokens.expiresAt, new Date(Date.now() - 86_400_000)));
}
