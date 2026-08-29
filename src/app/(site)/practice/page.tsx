import type { Metadata } from "next";
import Link from "next/link";
import PracticeSession from "@/components/practice/PracticeSession";
import { GRADES, ordinal } from "@/lib/utils";
import { demoSeed } from "@/lib/demo-seed";

export const metadata: Metadata = {
  title: "Try it",
  description:
    "Try Sparkquill without an account: real questions from the Florida B.E.S.T. curriculum, any grade, maths or reading.",
};

/**
 * The no-account demo.
 *
 * Runs the real engine, the real generators and the real manipulatives, with
 * nothing saved. It exists so a parent can find out in ninety seconds whether
 * this is any good, without handing over an email address first.
 *
 * The one thing it cannot do is score on the server, so it holds the answer
 * key in the browser — the one place the signed-in product deliberately never
 * puts it. That is acceptable here precisely because nothing is recorded:
 * there is no mastery to game and no report to distort.
 */
const SUBJECTS = {
  math: { label: "Mathematics", emoji: "\u{1F522}" },
  ela: { label: "Reading", emoji: "\u{1F4D6}" },
} as const;

type Subject = keyof typeof SUBJECTS;

function parse(raw: string | string[] | undefined) {
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function PracticePage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.searchParams;
  const rawGrade = Number(parse(params.grade));
  const rawSubject = parse(params.subject);

  const grade = (GRADES as readonly number[]).includes(rawGrade) ? rawGrade : null;
  const subject: Subject | null =
    rawSubject === "math" || rawSubject === "maths"
      ? "math"
      : rawSubject === "ela" || rawSubject === "reading"
        ? "ela"
        : null;

  if (grade === null || subject === null) {
    return <Chooser grade={grade} />;
  }

  const startSeed = await demoSeed();

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--brand)]">
          {ordinal(grade)} grade · {SUBJECTS[subject].label}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl">Let&rsquo;s practise</h1>
          <Link href="/practice" className="text-sm font-semibold text-[var(--brand)]">
            Change grade
          </Link>
        </div>
      </header>

      <PracticeSession grade={grade} subject={subject} startSeed={startSeed} />

      <div className="mt-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-5 text-center">
        <p className="text-[15px]">
          These are the real questions. What an account adds is the part a
          practice page cannot do on its own: it remembers what your child
          found hard and comes back to it, and it tells you what it found.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-block rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90"
        >
          Start the free trial
        </Link>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Nothing on this page is saved.
        </p>
      </div>
    </main>
  );
}

function Chooser({ grade }: { grade: number | null }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="text-center text-3xl sm:text-4xl">Try it, no account</h1>
      <p className="mx-auto mt-3 max-w-prose text-center text-[var(--text-muted)]">
        Real questions from the Florida B.E.S.T. curriculum, with the same
        manipulatives and the same explanations your child would get. Nothing
        is saved.
      </p>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
        Which grade?
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {GRADES.map((g) => (
          <Link
            key={g}
            href={`/practice?grade=${g}`}
            className={
              g === grade
                ? "rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-[var(--brand-contrast)]"
                : "rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--brand)] hover:bg-[var(--surface-2)]"
            }
          >
            {ordinal(g)}
          </Link>
        ))}
      </div>

      {grade !== null && (
        <>
          <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Which subject?
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {(Object.keys(SUBJECTS) as Subject[]).map((s) => (
              <Link
                key={s}
                href={`/practice?grade=${grade}&subject=${s}`}
                className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-6 py-8 transition hover:border-[var(--brand)] hover:bg-[var(--surface-2)]"
              >
                <span className="text-4xl" aria-hidden>
                  {SUBJECTS[s].emoji}
                </span>
                <span className="text-lg font-bold">{SUBJECTS[s].label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
