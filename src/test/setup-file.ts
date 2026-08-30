import { config } from "dotenv";
import { testDatabaseUrl } from "./database";

/**
 * Points the application's own database module at the test database.
 *
 * This has to happen before anything imports `@/db`, because that module
 * caches its connection on globalThis the first time a query runs. Vitest
 * evaluates setup files before the test file, which is exactly the window
 * needed, and it is why this is a `setupFiles` entry rather than something a
 * test calls for itself.
 *
 * The point of overwriting the variable rather than passing a URL around is
 * that the tests then exercise the real `db` singleton the app uses. A harness
 * with its own separate connection would be testing a copy of the data layer
 * instead of the data layer.
 */
config({ path: ".env.local" });
config({ path: ".env" });

process.env.DATABASE_URL = testDatabaseUrl();
