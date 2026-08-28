import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";

/**
 * Proves that deleting a child really removes their practice history.
 *
 * The privacy notice promises a parent can delete a child's profile and
 * everything recorded about them. That promise is only as good as the foreign
 * key cascades, and a cascade that was declared but not applied to the live
 * schema would leave orphaned rows while the interface claimed otherwise.
 *
 * Creates a throwaway parent, child and attempt, deletes the child, and checks
 * what survives. Rolls the whole thing back either way.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1 });

  try {
    await sql.begin(async (tx) => {
      const [parent] = await tx`
        insert into parents (email, name, password_hash)
        values (${`cascade-test-${Date.now()}@example.invalid`}, 'Cascade Test', 'x')
        returning id`;

      const [student] = await tx`
        insert into students (parent_id, first_name, grade, pin_hash)
        values (${parent.id}, 'Testchild', 2, 'x')
        returning id`;

      const [skill] = await tx`select id from skills limit 1`;
      if (!skill) throw new Error("No skills seeded; run the skills seed first.");

      const [session] = await tx`
        insert into practice_sessions (student_id, subject)
        values (${student.id}, 'math') returning id`;

      await tx`
        insert into attempts
          (student_id, session_id, template_key, seed, skill_id, response,
           correct, item_difficulty, time_ms)
        values
          (${student.id}, ${session.id}, 'test.key', 1, ${skill.id},
           ${sql.json({ type: "multiple_choice", choiceId: "c" })}, true, 1000, 500)`;

      await tx`
        insert into skill_mastery (student_id, skill_id, rating, level)
        values (${student.id}, ${skill.id}, 1000, 'learning')`;

      const before = await counts(tx, student.id);
      console.log("Before deleting the child:");
      report(before);

      await tx`delete from students where id = ${student.id}`;

      const after = await counts(tx, student.id);
      console.log("\nAfter deleting the child:");
      report(after);

      const leftovers = Object.entries(after).filter(([, n]) => n > 0);
      if (leftovers.length > 0) {
        throw new Error(
          `PROMISE BROKEN: these rows survived the deletion: ${leftovers
            .map(([k, n]) => `${k}=${n}`)
            .join(", ")}`,
        );
      }
      console.log(
        "\nNothing survived. The privacy notice's deletion promise holds.",
      );

      // Everything above was a fixture; leave the database as it was found.
      throw new Rollback();
    });
  } catch (err) {
    if (!(err instanceof Rollback)) throw err;
    console.log("Test data rolled back.");
  }

  await sql.end();
}

class Rollback extends Error {}

// `begin` is overloaded, so inferring the callback parameter yields never.
type Tx = postgres.TransactionSql<Record<string, never>>;

async function counts(tx: Tx, studentId: string) {
  const one = async (table: string) => {
    const [row] = await tx.unsafe(
      `select count(*)::int as n from ${table} where student_id = $1`,
      [studentId],
    );
    return Number(row.n);
  };
  return {
    attempts: await one("attempts"),
    skill_mastery: await one("skill_mastery"),
    practice_sessions: await one("practice_sessions"),
    student_seats: await one("student_seats"),
  };
}

function report(c: Record<string, number>) {
  for (const [k, n] of Object.entries(c)) {
    console.log(`  ${k.padEnd(18)} ${n}`);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
