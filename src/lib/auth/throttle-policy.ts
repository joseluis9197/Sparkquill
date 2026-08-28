/**
 * Lockout policy.
 *
 * Pure, and separate from the database code that applies it, so the numbers
 * can be tested directly. These decide how hard a four-digit PIN is to guess,
 * which is worth being able to check rather than infer.
 */

/** Failures allowed before any waiting starts. */
export const FREE_ATTEMPTS = 4;

/** Longest a family can ever be locked out. */
export const MAX_LOCK_SECONDS = 15 * 60;

/** Failures older than this are forgotten, so an honest user starts fresh. */
export const WINDOW_MS = 60 * 60 * 1000;

/**
 * How long to wait after `failures` consecutive failures.
 *
 * Zero for the first few, so a child mistyping their PIN is not punished, then
 * doubling — which makes a sweep of all ten thousand PINs take longer than
 * anyone will wait, without ever stranding a family for more than the cap.
 */
export function lockSecondsFor(failures: number): number {
  if (failures <= FREE_ATTEMPTS) return 0;
  const seconds = 2 ** (failures - FREE_ATTEMPTS);
  return Math.min(seconds, MAX_LOCK_SECONDS);
}

/**
 * Phrasing a child can act on.
 *
 * Short waits stay vague rather than teaching the attacker the rule; longer
 * ones give a real number, because "wait a moment" is useless advice when the
 * moment is a quarter of an hour.
 */
export function waitMessage(retryAfter: number): string {
  if (retryAfter <= 60) return "Wait a moment and try again.";
  const minutes = Math.ceil(retryAfter / 60);
  return `Too many tries. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}
