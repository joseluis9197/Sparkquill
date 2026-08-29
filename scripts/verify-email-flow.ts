import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";

/**
 * Exercises email verification end to end against a real database.
 *
 * The parts worth proving are the ones that are silent when wrong: that a
 * link works exactly once, that asking for a new one kills the old, that an
 * expired link is refused, and that clicking twice reports success rather
 * than an error to a parent who did nothing wrong.
 *
 * Everything is put back afterwards, including the account's original
 * verification state.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1 });

  const { issueVerification, consumeVerification, hasPendingVerification } =
    await import("../src/lib/auth/verification");

  const [parent] = await sql`select id, email, email_verified from parents order by created_at limit 1`;
  if (!parent) {
    console.log("No accounts to test against.");
    await sql.end();
    process.exit(0);
  }

  const email = parent.email as string;
  const original = parent.email_verified as Date | null;
  const restore = async () => {
    await sql`update parents set email_verified = ${original} where id = ${parent.id}`;
    await sql`delete from verification_tokens where identifier = ${email}`;
  };

  const results: [string, boolean][] = [];

  try {
    await sql`update parents set email_verified = null where id = ${parent.id}`;
    await sql`delete from verification_tokens where identifier = ${email}`;

    // 1. A fresh link verifies.
    const first = await issueVerification(email);
    results.push(["a link is pending once issued", await hasPendingVerification(email)]);
    const used = await consumeVerification(first.token);
    results.push(["a fresh link verifies", used.ok && !used.alreadyDone]);

    const [after] = await sql`select email_verified from parents where id = ${parent.id}`;
    results.push(["the account is marked verified", after.email_verified !== null]);

    // 2. The same link a second time is refused, not reused.
    const again = await consumeVerification(first.token);
    results.push(["a spent link stops working", !again.ok]);

    // 3. Issuing a new link invalidates the previous one.
    await sql`update parents set email_verified = null where id = ${parent.id}`;
    const older = await issueVerification(email);
    const newer = await issueVerification(email);
    const oldOne = await consumeVerification(older.token);
    results.push(["a superseded link is dead", !oldOne.ok]);
    const newOne = await consumeVerification(newer.token);
    results.push(["the newest link still works", newOne.ok]);

    // 4. Clicking an already-confirmed link is a success, not an error.
    const repeat = await issueVerification(email);
    const twice = await consumeVerification(repeat.token);
    results.push([
      "confirming twice reports success",
      twice.ok && twice.alreadyDone,
    ]);

    // 5. An expired link is refused and cleaned up.
    const stale = await issueVerification(email);
    await sql`update verification_tokens set expires = now() - interval '1 hour' where identifier = ${email}`;
    const expired = await consumeVerification(stale.token);
    results.push([
      "an expired link is refused",
      !expired.ok && expired.reason === "expired",
    ]);
    results.push([
      "an expired link is deleted",
      !(await hasPendingVerification(email)),
    ]);

    // 6. A token that was never issued is refused.
    const bogus = await consumeVerification("not-a-real-token");
    results.push(["an unknown token is refused", !bogus.ok]);
  } finally {
    await restore();
  }

  for (const [name, ok] of results) {
    console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}`);
  }
  const failed = results.filter(([, ok]) => !ok).length;
  console.log(
    failed === 0
      ? `\nAll ${results.length} checks passed. Account restored.`
      : `\n${failed} of ${results.length} FAILED.`,
  );

  await sql.end();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
