import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";

/**
 * Prints what is actually stored for each account.
 *
 * Exists because "the UI said it saved" is not evidence that it saved. Used
 * during development and for support, never wired into the app.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1 });

  const parents = await sql`select id, email, name, created_at from parents`;
  console.log(`\nParents (${parents.length}):`);
  for (const p of parents) console.log(`  ${p.email}  ${p.name ?? ""}`);

  const students =
    await sql`select id, first_name, grade, avatar_key from students`;
  console.log(`\nStudents (${students.length}):`);
  for (const s of students) {
    console.log(`  ${s.first_name}  grade ${s.grade}  ${s.avatar_key}`);
  }

  const attempts = await sql`
    select a.template_key, a.seed, a.correct, a.misconception,
           a.item_difficulty, a.time_ms, s.first_name
    from attempts a join students s on s.id = a.student_id
    order by a.created_at desc limit 20`;
  console.log(`\nAttempts (${attempts.length} most recent):`);
  for (const a of attempts) {
    console.log(
      `  ${a.first_name}  ${String(a.template_key).padEnd(22)} seed=${String(a.seed).padEnd(11)} ${
        a.correct ? "correct" : "wrong  "
      } ${a.misconception ?? ""}`,
    );
  }

  const mastery = await sql`
    select st.first_name, sk.slug, m.rating, m.level,
           m.attempt_count, m.correct_count, m.next_review_at
    from skill_mastery m
    join skills sk on sk.id = m.skill_id
    join students st on st.id = m.student_id
    order by st.first_name, sk.slug`;
  console.log(`\nMastery (${mastery.length} rows):`);
  for (const m of mastery) {
    console.log(
      `  ${m.first_name}  ${String(m.slug).padEnd(32)} rating=${Number(m.rating).toFixed(
        1,
      )}  ${m.level}  ${m.correct_count}/${m.attempt_count}`,
    );
  }

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
