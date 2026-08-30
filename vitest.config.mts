import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` exists only inside the Next bundler, where its whole
      // job is to fail the build if a module reaches the browser. In plain
      // Node it has to resolve to something, and there is no browser here to
      // keep anything away from. Same stub the CLI scripts use.
      "server-only": fileURLToPath(
        new URL("./scripts/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
});
