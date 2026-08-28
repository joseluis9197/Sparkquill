import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next reads .env.local first and falls back to .env; the CLI tools have to
// follow the same order or they end up pointed at a different database than
// the app.
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
