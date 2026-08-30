import { execFileSync } from "node:child_process";
import { config } from "dotenv";
import postgres from "postgres";
import {
  assertDisposable,
  databaseName,
  maintenanceUrl,
  testDatabaseUrl,
} from "./database";

// Same precedence as the app and the CLI tools: .env.local wins over .env.
config({ path: ".env.local" });
config({ path: ".env" });

/**
 * Builds the database the integration tests run against, once per run.
 *
 * It is created from nothing every time: dropped if it exists, created,
 * migrated with the real migrations, and seeded with the real seed scripts.
 * That is slower than keeping one around and it is the right trade, because
 * it means the harness also proves something the unit tests cannot — that the
 * migrations apply cleanly to an empty database and the seeds run on top of
 * them. A schema drift between `schema.ts` and the migration files would show
 * up here as a failure rather than as a surprise on the next deploy.
 *
 * The seed scripts are invoked as child processes rather than imported. They
 * open their own connections and call process.exit, which is fine for a CLI
 * and hostile inside a test runner; and running them exactly as the deploy
 * does means this exercises the real path rather than a copy of it.
 */
export default async function setup(): Promise<void> {
  const url = testDatabaseUrl();
  assertDisposable(url);
  const name = databaseName(url);

  const admin = postgres(maintenanceUrl(url), { max: 1 });
  try {
    // Terminate anything left connected from a previous interrupted run,
    // otherwise DROP DATABASE fails with "database is being accessed".
    await admin`
      select pg_terminate_backend(pid) from pg_stat_activity
      where datname = ${name} and pid <> pg_backend_pid()
    `;
    // client_min_messages so "database does not exist, skipping" does not
    // print a stack-shaped NOTICE object on the first ever run.
    await admin.unsafe(`set client_min_messages to warning`);
    await admin.unsafe(`drop database if exists "${name}"`);
    await admin.unsafe(`create database "${name}"`);
  } finally {
    await admin.end();
  }

  const env = { ...process.env, DATABASE_URL: url };

  /*
   * Node is invoked directly on each tool's entry point rather than through
   * npx. Two reasons, both found the hard way: on Windows `npx` is a .cmd,
   * which execFile cannot spawn without a shell, and passing arguments
   * through a shell concatenates rather than escapes them — which breaks on
   * the first path containing a space. Resolving the entry point ourselves
   * has neither problem and skips npx's own startup.
   */
  const DRIZZLE_KIT = "node_modules/drizzle-kit/bin.cjs";
  const TSX = "node_modules/tsx/dist/cli.mjs";
  const run = (args: string[]) =>
    execFileSync(process.execPath, args, { env, stdio: "pipe" });

  run([DRIZZLE_KIT, "migrate"]);
  run([TSX, "scripts/seed-curriculum.ts"]);
  run([TSX, "scripts/seed-skills.ts"]);
  run([TSX, "--tsconfig", "tsconfig.scripts.json", "scripts/seed-prerequisites.ts"]);
}
