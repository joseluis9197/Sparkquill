import "server-only";
import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { authThrottle } from "@/db/schema";
import {
  FREE_ATTEMPTS,
  MAX_LOCK_SECONDS,
  WINDOW_MS,
  lockSecondsFor,
  waitMessage,
} from "./throttle-policy";

/**
 * Rate limiting for guessable secrets.
 *
 * A four-digit PIN is ten thousand possibilities; at a thousand tries a second
 * that is over in seconds. The lockout is what turns it back into a secret.
 *
 * Backoff is exponential from the fifth failure, capped, and the counter is
 * cleared on success. The window is generous enough that a child mistyping
 * their PIN a few times is never locked out for meaningfully long, and tight
 * enough that scripted guessing is hopeless.
 */

export interface ThrottleState {
  allowed: boolean;
  /** Seconds until the next attempt is permitted. */
  retryAfter: number;
  failures: number;
}

export async function checkThrottle(key: string): Promise<ThrottleState> {
  const [row] = await db
    .select()
    .from(authThrottle)
    .where(eq(authThrottle.key, key))
    .limit(1);

  if (!row) return { allowed: true, retryAfter: 0, failures: 0 };

  // A stale record is as good as none.
  if (Date.now() - row.firstFailureAt.getTime() > WINDOW_MS) {
    await db.delete(authThrottle).where(eq(authThrottle.key, key));
    return { allowed: true, retryAfter: 0, failures: 0 };
  }

  if (row.lockedUntil && row.lockedUntil.getTime() > Date.now()) {
    return {
      allowed: false,
      retryAfter: Math.ceil((row.lockedUntil.getTime() - Date.now()) / 1000),
      failures: row.failures,
    };
  }

  return { allowed: true, retryAfter: 0, failures: row.failures };
}

export async function recordFailure(key: string): Promise<ThrottleState> {
  const now = new Date();
  const [existing] = await db
    .select()
    .from(authThrottle)
    .where(eq(authThrottle.key, key))
    .limit(1);

  const withinWindow =
    existing && now.getTime() - existing.firstFailureAt.getTime() <= WINDOW_MS;

  const failures = withinWindow ? existing.failures + 1 : 1;
  const lockSeconds = lockSecondsFor(failures);
  const lockedUntil =
    lockSeconds > 0 ? new Date(now.getTime() + lockSeconds * 1000) : null;

  await db
    .insert(authThrottle)
    .values({
      key,
      failures,
      lockedUntil,
      firstFailureAt: withinWindow ? existing.firstFailureAt : now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: authThrottle.key,
      set: {
        failures,
        lockedUntil,
        firstFailureAt: withinWindow ? existing.firstFailureAt : now,
        updatedAt: now,
      },
    });

  return { allowed: lockSeconds === 0, retryAfter: lockSeconds, failures };
}

export async function clearThrottle(key: string) {
  await db.delete(authThrottle).where(eq(authThrottle.key, key));
}

/** Housekeeping, safe to run from a scheduled job. */
export async function pruneThrottle() {
  await db
    .delete(authThrottle)
    .where(lt(authThrottle.updatedAt, new Date(Date.now() - WINDOW_MS)));
}

export { FREE_ATTEMPTS, MAX_LOCK_SECONDS, lockSecondsFor, waitMessage };
