import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";

/**
 * Checks that staff-granted free access actually unlocks practice.
 *
 * The rule lives in two places that have to agree: a column on the parent, and
 * the predicate the practice page calls. Reading the code proves nothing here —
 * a grant can look right in the admin panel and unlock nothing. So this drives
 * the column for real and asserts what the app would decide.
 *
 * Whatever the account had before is put back exactly, including an existing
 * grant. A verification script that quietly revokes a real family's free access
 * would be a worse bug than the one it is looking for.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1 });

  const { entitlementFor } = await import("../src/lib/data/subscriptions");
  const { grantsPractice } = await import("../src/lib/billing/rules");

  const [parent] = await sql`
    select id, email, complimentary_until, complimentary_reason
    from parents
    order by created_at
    limit 1
  `;
  if (!parent) {
    console.log("No accounts to test against.");
    await sql.end();
    return;
  }

  const restore = async () => {
    await sql`
      update parents
      set complimentary_until = ${parent.complimentary_until},
          complimentary_reason = ${parent.complimentary_reason}
      where id = ${parent.id}
    `;
  };

  try {
    console.log(`Testing with ${parent.email}\n`);

    const set = async (until: Date | null, reason: string | null) => {
      await sql`
        update parents
        set complimentary_until = ${until}, complimentary_reason = ${reason}
        where id = ${parent.id}
      `;
      return entitlementFor(parent.id as string);
    };

    const line = (label: string, state: string) =>
      console.log(
        `  ${label.padEnd(16)}-> ${state.padEnd(14)} practice: ${grantsPractice(
          state as never,
        )}`,
      );

    // Baseline: no grant at all.
    const before = await set(null, null);
    line("no grant", before.state);

    // Granted, ending in the future.
    const granted = await set(
      new Date(Date.now() + 90 * 86_400_000),
      "verification run",
    );
    line("granted 90 days", granted.state);

    // An expired grant must stop working on its own, with nobody revoking it.
    const expired = await set(new Date(Date.now() - 86_400_000), "verification run");
    line("expired", expired.state);

    const ok =
      !grantsPractice(before.state) &&
      granted.state === "complimentary" &&
      grantsPractice(granted.state) &&
      !grantsPractice(expired.state);

    await restore();
    const after = await entitlementFor(parent.id as string);
    console.log(`\n  restored        -> ${after.state}`);

    console.log(
      ok
        ? "\nFree access unlocks practice, and stops when it expires."
        : "\nFAILED: the grant did not behave as intended.",
    );

    await sql.end();
    // The app's own connection pool is opened by entitlementFor and has no
    // shutdown hook, because nothing in a web server ever wants one. Exiting
    // explicitly is what stops this script from hanging on it forever.
    process.exit(ok ? 0 : 1);
  } catch (err) {
    await restore();
    await sql.end();
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
