import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * The suite that needs a real database.
 *
 * Kept as a separate config, and a separate file extension, so that
 * `npm test` stays what it has always been: four and a half thousand pure
 * assertions that run in fourteen seconds and need nothing installed. Somebody
 * checking out this repository can still run the tests; these ones ask for
 * Postgres, and asking for it silently would be a bad trade for the code that
 * does not need it.
 *
 * `fileParallelism` is off because every file truncates the same tables. Tests
 * within a file still run in order, and across files they run one at a time —
 * slower, and the only honest option short of a database per worker.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.itest.ts"],
    globalSetup: ["./src/test/global-setup.ts"],
    setupFiles: ["./src/test/setup-file.ts"],
    fileParallelism: false,
    // Building the database from nothing costs a few seconds before the first
    // test runs; the default 60s hook timeout is not enough on a cold start.
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // The app's data modules import `server-only`, which exists only inside
      // the Next bundler. In plain Node it has to resolve to something, and an
      // empty module is the honest equivalent — there is no browser here to
      // keep the module away from. Same stub the CLI scripts already use.
      "server-only": fileURLToPath(
        new URL("./scripts/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
});
