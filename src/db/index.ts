import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Lazily created, pooled client.
 *
 * The connection is opened on first query rather than at module load. Next
 * imports this module while collecting page data at build time, where no
 * DATABASE_URL exists and none is needed — connecting eagerly turned a
 * perfectly static page into a build failure.
 *
 * The instance is cached on globalThis so a hot reload in development reuses
 * it instead of exhausting connections on every file save.
 */
const globalForDb = globalThis as unknown as {
  sparkquillSql?: ReturnType<typeof postgres>;
  sparkquillDb?: PostgresJsDatabase<typeof schema>;
};

function connect(): PostgresJsDatabase<typeof schema> {
  if (globalForDb.sparkquillDb) return globalForDb.sparkquillDb;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  globalForDb.sparkquillSql ??= postgres(url, {
    max: process.env.NODE_ENV === "production" ? 10 : 3,
    prepare: false, // required for pgbouncer-style poolers (Neon, Supabase)
  });
  globalForDb.sparkquillDb = drizzle(globalForDb.sparkquillSql, { schema });
  return globalForDb.sparkquillDb;
}

/**
 * Proxy so callers can keep writing `db.select(...)` while the underlying
 * connection is still deferred to the first actual use.
 */
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(connect(), prop, receiver);
  },
});

export { schema };
