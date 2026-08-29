import type { Metadata } from "next";
import { db } from "@/db";
import { benchmarks, skills } from "@/db/schema";
import { sql, eq, isNotNull, and } from "drizzle-orm";
import { GRADES, assessmentName, hasBlueprint, ordinal } from "@/lib/utils";
import { NOT_PRACTISED } from "@/lib/curriculum/not-practised";

export const metadata: Metadata = {
  title: "What's covered",
  description:
    "Every B.E.S.T. benchmark Sparkquill covers, by grade and subject, and which of them Florida actually assesses.",
};

export const revalidate = 3600;

/**
 * The curriculum, straight from the database.
 *
 * Counted rather than claimed. If a benchmark is not seeded, it does not
 * appear here — which means this page cannot drift into advertising coverage
 * the product does not have.
 */
export default async function CurriculumPage() {
  const counts = await db
    .select({
      grade: benchmarks.grade,
      subject: benchmarks.subject,
      total: sql<number>`count(*)::int`,
      assessed: sql<number>`count(*) filter (where ${benchmarks.reportingCategory} is not null)::int`,
    })
    .from(benchmarks)
    .groupBy(benchmarks.grade, benchmarks.subject)
    .orderBy(benchmarks.grade);

  const withPractice = await db
    .select({
      grade: benchmarks.grade,
      n: sql<number>`count(distinct ${skills.id})::int`,
    })
    .from(skills)
    .innerJoin(benchmarks, eq(skills.benchmarkCode, benchmarks.code))
    .groupBy(benchmarks.grade);

  const practiceByGrade = new Map(withPractice.map((r) => [r.grade, r.n]));

  const categories = await db
    .select({
      grade: benchmarks.grade,
      subject: benchmarks.subject,
      category: benchmarks.reportingCategory,
      n: sql<number>`count(*)::int`,
    })
    .from(benchmarks)
    .where(isNotNull(benchmarks.reportingCategory))
    .groupBy(benchmarks.grade, benchmarks.subject, benchmarks.reportingCategory)
    .orderBy(benchmarks.grade);

  const totalBenchmarks = counts.reduce((n, c) => n + c.total, 0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl">What&rsquo;s covered</h1>
      <p className="mt-4 max-w-prose text-lg text-[var(--text-muted)]">
        All {totalBenchmarks} B.E.S.T. benchmarks for grades 1 through 6, in
        reading and mathematics, taken from the Florida Department of Education
        standards documents.
      </p>

      <div className="mt-10 space-y-8">
        {GRADES.map((grade) => {
          const math = counts.find(
            (c) => c.grade === grade && c.subject === "math",
          );
          const ela = counts.find(
            (c) => c.grade === grade && c.subject === "ela",
          );
          const practice = practiceByGrade.get(grade) ?? 0;

          return (
            <section
              key={grade}
              className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-2xl">{ordinal(grade)} grade</h2>
                <p className="font-mono text-xs text-[var(--text-muted)]">
                  {assessmentName(grade, "ela")} · {assessmentName(grade, "math")}
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SubjectCard
                  label="Mathematics"
                  total={math?.total ?? 0}
                  assessed={math?.assessed ?? 0}
                  blueprint={hasBlueprint(grade)}
                />
                <SubjectCard
                  label="Reading"
                  total={ela?.total ?? 0}
                  assessed={ela?.assessed ?? 0}
                  blueprint={hasBlueprint(grade)}
                />
              </div>

              {hasBlueprint(grade) ? (
                <div className="mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    What the test is made of
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {categories
                      .filter((c) => c.grade === grade)
                      .map((c) => (
                        <li
                          key={`${c.subject}-${c.category}`}
                          className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs"
                        >
                          {c.category}
                          <span className="ml-1.5 tabular-nums text-[var(--text-muted)]">
                            {c.n}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-muted)]">
                  {ordinal(grade)} grade sits the Renaissance Star assessments,
                  which report a percentile and skill domains rather than
                  benchmark categories. We teach the full B.E.S.T. curriculum for
                  this grade, and report progress by skill — we do not predict a
                  FAST level, because Florida publishes no blueprint that would
                  make one meaningful.
                </p>
              )}

              <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
                {practice > 0
                  ? `${practice} skill${practice === 1 ? "" : "s"} with interactive practice available today.`
                  : "Interactive practice for this grade is in production."}
              </p>
            </section>
          );
        })}
      </div>

      <section className="mt-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-2xl">What we deliberately leave to the classroom</h2>
        <p className="mt-3 max-w-prose text-[var(--text-muted)]">
          Twelve of Florida&rsquo;s English Language Arts standards, across
          every grade, ask a child to <em>do</em> something rather than choose
          an answer. Florida does not assess them with test questions either —
          a teacher watches the child do the thing. We could generate four
          options for &ldquo;print all upper- and lowercase letters&rdquo;, and
          the number it produced on your child&rsquo;s report would mean
          nothing.
        </p>
        <ul className="mt-5 space-y-3">
          {NOT_PRACTISED.map((n) => (
            <li key={n.suffix} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <span className="font-mono text-xs text-[var(--text-muted)] sm:w-16 sm:flex-none sm:pt-1">
                {n.suffix}
              </span>
              <span>
                <span className="font-semibold">{n.what}</span>
                <span className="block text-sm text-[var(--text-muted)]">
                  {n.why}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-[var(--border)] pt-4 text-sm text-[var(--text-muted)]">
          Everything else &mdash; every reading, vocabulary, grammar and
          mathematics benchmark from grade 1 to grade 6 &mdash; has practice
          behind it.
        </p>
      </section>

      <p className="mt-10 text-xs text-[var(--text-muted)]">
        Counts come straight from the curriculum in our database, so this page
        cannot claim coverage the product does not have.
      </p>
    </main>
  );
}

function SubjectCard({
  label,
  total,
  assessed,
  blueprint,
}: {
  label: string;
  total: number;
  assessed: number;
  blueprint: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-4 py-3">
      <p className="text-sm font-bold">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
        {total}
        <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">
          benchmarks
        </span>
      </p>
      {blueprint && (
        <p className="text-xs text-[var(--text-muted)]">
          {assessed} of them appear on the test
        </p>
      )}
    </div>
  );
}

export { and };
