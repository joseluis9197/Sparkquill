/**
 * Where the integration tests are allowed to point, and nowhere else.
 *
 * Everything in this directory writes to a real Postgres, truncates tables
 * between tests, and drops rows without asking. The single most important
 * property of the whole harness is therefore that it can only ever be aimed
 * at a database whose name says it is disposable — a mis-set environment
 * variable must fail loudly rather than quietly emptying somebody's
 * development data, or worse.
 *
 * Hence `assertDisposable`. It is called before the first connection is made,
 * from the global setup, and again from the per-test reset. Two checks for one
 * rule is deliberate: the second one costs nothing and covers the case where a
 * test file is run in isolation without the global setup.
 */

/** Every database this harness may touch must be named like this. */
const REQUIRED_SUFFIX = "_test";

export function assertDisposable(url: string): void {
  let name: string;
  try {
    // The path is "/dbname"; a query string may follow it.
    name = new URL(url).pathname.replace(/^\//, "");
  } catch {
    throw new Error("The test database URL is not a valid URL.");
  }

  if (!name) {
    throw new Error("The test database URL names no database.");
  }
  if (!name.endsWith(REQUIRED_SUFFIX)) {
    throw new Error(
      `Refusing to run integration tests against "${name}". ` +
        `These tests truncate tables, so the database name must end in ` +
        `"${REQUIRED_SUFFIX}". Set TEST_DATABASE_URL to a disposable database.`,
    );
  }
}

/**
 * The disposable cluster `scripts/test-db.mjs` creates, on a port of its own.
 *
 * 5434 rather than 5433, which is where this project's development database
 * answers — and that one is an SSH tunnel to the production server.
 */
const LOCAL_CLUSTER = "postgresql://postgres@127.0.0.1:5434/sparkquill_test";

/**
 * The URL the tests use.
 *
 * TEST_DATABASE_URL when it is set, and otherwise the local cluster this
 * repository knows how to create. Deliberately *not* derived from
 * DATABASE_URL: on this project that variable points down an SSH tunnel to
 * the machine running production, and a harness that truncates tables should
 * not be one environment variable away from aiming there. A default that is
 * wrong fails to connect; a default that is derived might succeed.
 */
export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL ?? LOCAL_CLUSTER;
  assertDisposable(url);
  return url;
}

/** The same server, but the maintenance database, for CREATE DATABASE. */
export function maintenanceUrl(testUrl: string): string {
  const url = new URL(testUrl);
  url.pathname = "/postgres";
  return url.toString();
}

/** The bare database name, for CREATE DATABASE and error messages. */
export function databaseName(url: string): string {
  return new URL(url).pathname.replace(/^\//, "");
}
