import { sql } from "drizzle-orm";
import { db } from "@/db";
import { parents, students } from "@/db/schema";
import { assertDisposable } from "./database";

/**
 * The moving parts a test is allowed to leave behind, and how to clear them.
 *
 * Split in two on purpose. The curriculum — strands, benchmarks, skills, the
 * prerequisite graph — is built once by the global setup and never touched
 * again, because rebuilding it between tests would take longer than the tests
 * and because a test that could corrupt it would make every later test lie.
 * Everything a person creates by using the product is cleared before each
 * test, so no test can depend on another having run first.
 */
const MUTABLE_TABLES = [
  // Ordered for readability only: TRUNCATE ... CASCADE handles the graph.
  "attempts",
  "practice_sessions",
  "skill_mastery",
  "student_seats",
  "students",
  "subscriptions",
  "stripe_events",
  "password_reset_tokens",
  "verification_tokens",
  "auth_throttle",
  "auth_accounts",
  "auth_sessions",
  "audit_log",
  "admin_users",
  "parents",
] as const;

let guarded = false;

/**
 * Empties everything a test could have written.
 *
 * The disposability check runs again here, not only in the global setup. A
 * single test file run on its own — which is what anybody does while fixing
 * one failure — never reaches the global setup, and this is the last point
 * before a TRUNCATE.
 */
export async function resetData(): Promise<void> {
  if (!guarded) {
    assertDisposable(process.env.DATABASE_URL ?? "");
    guarded = true;
  }
  const list = MUTABLE_TABLES.map((t) => `"${t}"`).join(", ");
  await db.execute(sql.raw(`truncate table ${list} restart identity cascade`));
}

let counter = 0;

/** A parent with a unique address, so tests never collide on the unique index. */
export async function makeParent(
  over: Partial<typeof parents.$inferInsert> = {},
): Promise<{ id: string; email: string }> {
  counter += 1;
  const email = over.email ?? `parent${counter}@example.test`;
  const [row] = await db
    .insert(parents)
    .values({
      email,
      name: "Test Parent",
      // A real bcrypt-shaped string rather than a placeholder: nothing here
      // verifies it, but a value that could never be a hash invites a future
      // test to assert something false about it.
      passwordHash: "$2b$12$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMN",
      ...over,
    })
    .returning({ id: parents.id, email: parents.email });
  return row;
}

export async function makeStudent(
  parentId: string,
  over: Partial<typeof students.$inferInsert> = {},
): Promise<{ id: string; grade: number }> {
  counter += 1;
  const [row] = await db
    .insert(students)
    .values({
      parentId,
      firstName: `Child${counter}`,
      grade: 4,
      pinHash: "$2b$12$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMN",
      ...over,
    })
    .returning({ id: students.id, grade: students.grade });
  return row;
}
