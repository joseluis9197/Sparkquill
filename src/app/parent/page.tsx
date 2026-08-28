import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { listStudents } from "@/lib/data/students";
import { skillProgressFor, summaryFor } from "@/lib/data/progress";
import { hasBlueprint, ordinal } from "@/lib/utils";

export const metadata: Metadata = { title: "Parent dashboard" };

const MISCONCEPTION_LABEL: Record<string, string> = {
  no_regrouping: "Carrying and borrowing across columns",
  column_independent: "Treating each column as a separate sum",
  wrong_operation: "Reading the sign in the question",
  off_by_one: "Counting carefully",
  place_value_confusion: "What each digit is worth",
  digit_reversal: "The order of the digits",
  rounded_wrong_direction: "Which ten a number is closer to",
  rounded_wrong_place: "Rounding to the right place",
  hour_minute_swap: "Which hand is which on a clock",
  minute_by_ones: "Counting the minute hand in fives",
  counted_faces_as_vertices: "Telling faces, edges and corners apart",
  skipped_hidden_faces: "Counting the parts you cannot see",
  distractor_plausible: "Reading the question closely",
};

const LEVEL_LABEL = {
  not_started: "Not started",
  learning: "Learning",
  practicing: "Practising",
  mastered: "Mastered",
} as const;

export default async function ParentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const children = await listStudents(session.user.id);

  const reports = await Promise.all(
    children.map(async (child) => ({
      child,
      summary: await summaryFor(child.id),
      skills: await skillProgressFor(child.id),
    })),
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl">How they&rsquo;re getting on</h1>
        <Link href="/students" className="text-sm font-semibold text-[var(--brand)]">
          Back to profiles
        </Link>
      </div>

      {reports.length === 0 && (
        <p className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] p-8 text-center text-[var(--text-muted)]">
          No children on this account yet.{" "}
          <Link href="/students" className="font-semibold text-[var(--brand)]">
            Add one
          </Link>
          .
        </p>
      )}

      {reports.map(({ child, summary, skills }) => {
        const accuracy =
          summary.totalAttempts === 0
            ? null
            : Math.round((summary.totalCorrect / summary.totalAttempts) * 100);

        return (
          <section
            key={child.id}
            className="mt-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl">{child.firstName}</h2>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                {ordinal(child.grade)} grade
              </span>
            </div>

            {summary.totalAttempts === 0 ? (
              <p className="mt-4 text-[var(--text-muted)]">
                Nothing practised yet.
              </p>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat value={String(summary.totalAttempts)} label="Questions answered" />
                  <Stat value={`${accuracy}%`} label="Correct" />
                  <Stat
                    value={`${summary.skillsMastered}/${summary.skillsTotal}`}
                    label="Skills mastered"
                  />
                  <Stat
                    value={`${summary.minutesPractised}`}
                    label="Minutes practised"
                  />
                </div>

                {summary.topMisconceptions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      What to work on
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {summary.topMisconceptions.map((m) => (
                        <li
                          key={m.key}
                          className="flex items-baseline justify-between gap-3 rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-4 py-2.5 text-sm"
                        >
                          <span>{MISCONCEPTION_LABEL[m.key] ?? m.key}</span>
                          <span className="tabular-nums text-[var(--text-muted)]">
                            {m.count}×
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    Skill by skill
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {skills.map((s) => (
                      <li key={s.id}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="font-medium">{s.title}</span>
                          <span className="flex items-baseline gap-2">
                            <span className="font-mono text-[11px] text-[var(--text-muted)]">
                              {s.benchmarkCode}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">
                              {LEVEL_LABEL[s.level]}
                            </span>
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                          <div
                            className="h-full rounded-full bg-[var(--brand)]"
                            style={{ width: `${Math.round(s.fraction * 100)}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/*
              Grades 1 and 2 sit the Renaissance Star assessments, which
              publish no benchmark blueprint. Showing a predicted FAST level
              here would be inventing a number the state does not produce.
            */}
            <p className="mt-6 border-t border-[var(--border)] pt-4 text-xs text-[var(--text-muted)]">
              {hasBlueprint(child.grade)
                ? `${ordinal(child.grade)} grade sits FAST, which publishes reporting categories and achievement levels. Once there is enough practice here, this page will show an estimated level with its confidence range.`
                : `${ordinal(child.grade)} grade sits the Star assessments, which report a percentile and skill domains rather than an achievement level. We show progress by skill instead, because a predicted FAST level for this grade would be a number the state does not publish.`}
            </p>
          </section>
        );
      })}
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-4 py-3">
      <span className="block font-display text-2xl font-semibold tabular-nums">
        {value}
      </span>
      <span className="block text-xs leading-snug text-[var(--text-muted)]">
        {label}
      </span>
    </div>
  );
}
