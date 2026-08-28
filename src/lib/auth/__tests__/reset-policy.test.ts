import { describe, it, expect } from "vitest";
import { createHash, randomBytes } from "node:crypto";

/**
 * Properties the reset token scheme has to hold.
 *
 * The token-issuing code itself talks to the database, so these test the
 * primitives it is built from. What matters is that a stolen database cannot
 * be turned into a working reset link, and that guessing one is hopeless.
 */

const TOKEN_BYTES = 32;

function makeToken() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

function hash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

describe("reset token scheme", () => {
  it("gives a token far too large to guess", () => {
    // 32 bytes is 256 bits. A birthday attack on that is not a threat model,
    // it is arithmetic that does not finish.
    const token = makeToken();
    expect(TOKEN_BYTES * 8).toBeGreaterThanOrEqual(128);
    // base64url of 32 bytes is 43 characters with no padding.
    expect(token).toHaveLength(43);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("never repeats a token", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) seen.add(makeToken());
    expect(seen.size).toBe(2000);
  });

  it("is safe to put in a URL without escaping", () => {
    // base64url avoids +, / and =, so a token cannot be mangled by a mail
    // client rewriting the link.
    for (let i = 0; i < 200; i++) {
      const t = makeToken();
      expect(encodeURIComponent(t)).toBe(t);
    }
  });

  it("stores something that cannot be turned back into a link", () => {
    const token = makeToken();
    const stored = hash(token);
    expect(stored).not.toBe(token);
    expect(stored).toHaveLength(64);
    // The hash is deterministic, so a lookup works...
    expect(hash(token)).toBe(stored);
    // ...but a different token never collides into it.
    expect(hash(makeToken())).not.toBe(stored);
  });

  it("changes completely when one character of the token changes", () => {
    const token = makeToken();
    const altered = (token[0] === "a" ? "b" : "a") + token.slice(1);
    const a = hash(token);
    const b = hash(altered);
    let same = 0;
    for (let i = 0; i < a.length; i++) if (a[i] === b[i]) same++;
    // Roughly 1/16 of hex characters match by chance; anything close to a
    // full match would mean the hash leaks the token's prefix.
    expect(same).toBeLessThan(a.length / 2);
  });
});
