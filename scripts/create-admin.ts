import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import postgres from "postgres";

/**
 * Creates or updates a staff account.
 *
 *   npm run admin:create -- you@example.com owner "Your Name"
 *
 * The password is generated here and printed once. There is no way to read it
 * back afterwards, which is the point: a password a script can recover later
 * is one an attacker can recover too.
 */
async function main() {
  const [email, role = "owner", name] = process.argv.slice(2);

  if (!email || !email.includes("@")) {
    console.error(
      "Usage: npm run admin:create -- <email> [support|content|owner] [name]",
    );
    process.exit(1);
  }
  if (!["support", "content", "owner"].includes(role)) {
    console.error(`Unknown role "${role}". Use support, content or owner.`);
    process.exit(1);
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1 });

  // 24 random bytes as base64url: long enough that nobody will be tempted to
  // memorise it, and it belongs in a password manager anyway.
  const password = randomBytes(24).toString("base64url");
  const hash = await bcrypt.hash(password, 12);

  const [existing] = await sql`
    select id from admin_users where email = ${email.toLowerCase()}`;

  if (existing) {
    await sql`
      update admin_users
      set password_hash = ${hash}, role = ${role}, active = true,
          name = coalesce(${name ?? null}, name)
      where id = ${existing.id}`;
    console.log(`\nUpdated the existing account for ${email}.`);
  } else {
    await sql`
      insert into admin_users (email, name, password_hash, role)
      values (${email.toLowerCase()}, ${name ?? null}, ${hash}, ${role})`;
    console.log(`\nCreated a ${role} account for ${email}.`);
  }

  console.log("\n  Password (shown once, and not recoverable):\n");
  console.log(`    ${password}\n`);
  console.log("  Sign in at /admin/login. Store this in a password manager.\n");

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
