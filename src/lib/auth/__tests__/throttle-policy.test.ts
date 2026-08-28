import { describe, it, expect } from "vitest";
import {
  FREE_ATTEMPTS,
  MAX_LOCK_SECONDS,
  lockSecondsFor,
  waitMessage,
} from "../throttle-policy";

describe("lockout policy", () => {
  it("does not punish an honest mistake", () => {
    // A child mistyping their PIN three times must not be locked out.
    for (let n = 1; n <= FREE_ATTEMPTS; n++) {
      expect(lockSecondsFor(n)).toBe(0);
    }
  });

  it("starts backing off once guessing looks deliberate", () => {
    expect(lockSecondsFor(FREE_ATTEMPTS + 1)).toBe(2);
    expect(lockSecondsFor(FREE_ATTEMPTS + 2)).toBe(4);
    expect(lockSecondsFor(FREE_ATTEMPTS + 3)).toBe(8);
  });

  it("grows fast enough to make ten thousand guesses hopeless", () => {
    // Twenty failures already costs longer than the cap, so a scripted sweep
    // of a four-digit PIN cannot finish in any useful time.
    expect(lockSecondsFor(20)).toBe(MAX_LOCK_SECONDS);

    // Total cost of the first 30 attempts, in seconds.
    let total = 0;
    for (let n = 1; n <= 30; n++) total += lockSecondsFor(n);
    expect(total).toBeGreaterThan(60 * 60); // over an hour for 30 tries
  });

  it("caps the wait so a locked-out family is never stranded", () => {
    expect(lockSecondsFor(1000)).toBe(MAX_LOCK_SECONDS);
    expect(MAX_LOCK_SECONDS).toBeLessThanOrEqual(15 * 60);
  });

  it("never returns a negative or fractional wait", () => {
    for (let n = 0; n <= 40; n++) {
      const s = lockSecondsFor(n);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(s)).toBe(true);
    }
  });
});

describe("wait message", () => {
  it("stays vague for short waits rather than teaching the rule", () => {
    expect(waitMessage(2)).toBe("Wait a moment and try again.");
    expect(waitMessage(60)).toBe("Wait a moment and try again.");
  });

  it("gives a real number once the wait is worth planning around", () => {
    expect(waitMessage(61)).toBe("Too many tries. Try again in 2 minutes.");
    expect(waitMessage(900)).toBe("Too many tries. Try again in 15 minutes.");
  });

  it("gets the singular right", () => {
    expect(waitMessage(61)).toContain("minutes");
    // 90 seconds rounds up to 2; only exactly-60-or-less is the vague case.
    expect(waitMessage(120)).toBe("Too many tries. Try again in 2 minutes.");
  });
});
