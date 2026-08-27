import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Single pooled client, reused across hot reloads in development so we don't
 * exhaust connections on every file save.
 */
const globalForDb = globalThis as unknown as {
  sparkquillSql?: ReturnType<typeof postgres>;
};

function client() {
  if (!globalForDb.sparkquillSql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    globalForDb.sparkquillSql = postgres(url, {
      max: process.env.NODE_ENV === "production" ? 10 : 3,
      prepare: false, // required for pgbouncer-style poolers (Neon, Supabase)
    });
  }
  return globalForDb.sparkquillSql;
}

export const db = drizzle(client(), { schema });
export { schema };
