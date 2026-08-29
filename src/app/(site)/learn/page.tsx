import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireActiveStudent } from "@/lib/data/students";
import { nextQuestion } from "@/app/actions/practice";
import { gradeCoverage } from "@/lib/data/progress";
import { entitlementFor } from "@/lib/data/subscriptions";
import { grantsPractice } from "@/lib/billing/rules";
import { billingConfigured } from "@/lib/stripe";
import { ordinal } from "@/lib/utils";
import LearnSession from "./LearnSession";

export const metadata: Metadata = { title: "Practice" };

const SUBJECTS = {
  math: { label: "Mathematics", short: "Maths", emoji: "\u{1F522}" },
  ela: { label: "Reading", short: "Reading", emoji: "\u{1F4D6}" },
} as const;

type Subject = keyof typeof SUBJECTS;

function parseSubject(raw: string | string[] | undefined): Subject | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  // "reading" is what the child sees, "ela" is what Florida calls it. Both
  // are accepted so a shared or bookmarked link keeps working either way.
  if (v === "math" || v === "maths") return "math";
  if (v === "ela" || v === "reading") return "ela";
  return null;
}

export default async function LearnPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const active = await requireActiveStudent();
  if (!active) redirect("/students");

  /*
   * Practice needs a live seat, but only once billing is actually configured.
   * On a deployment without Stripe keys the app stays fully usable rather
   * than locking every child out of a product that has no way to be paid for
   * yet.
   */
  if (billingConfigured()) {
    const entitlement = await entitlementFor(active.parentId);
    if (!grantsPractice(entitlement.state)) {
      return (
        <Locked state={entitlement.state} name={active.student.firstName} />
      );
    }
  }

  const { grade, firstName } = {
    grade: active.student.grade,
    firstName: active.student.firstName,
  };
  const coverage = await gradeCoverage(grade);
  const available = (Object.keys(SUBJECTS) as Subject[]).filter(
    (s) => coverage[s] > 0,
  );

  const { subject: rawSubject } = await props.searchParams;
  const asked = parseSubject(rawSubject);

  // Nothing at all for this grade yet. Said plainly rather than quietly
  // serving another grade's work, which would be worse than showing nothing:
  // the child would practise the wrong curriculum and the parent's report
  // would call it progress.
  if (available.length === 0) {
    return <NotReady grade={grade} name={firstName} />;
  }

  // One subject covered, or none chosen: skip a menu with a single item.
  const subject =
    asked && available.includes(asked)
      ? asked
      : available.length === 1
        ? available[0]
        : null;

  if (subject === null) {
    return <Chooser name={firstName} grade={grade} available={available} />;
  }

  // The first question is rendered on the server so the child sees a question
  // immediately rather than a spinner.
  const first = await nextQuestion(subject, []);

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--brand)]">
          {firstName} · {ordinal(grade)} grade · {SUBJECTS[subject].label}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl">Let&rsquo;s practise</h1>
          {available.length > 1 && (
            <Link
              href="/learn"
              className="text-sm font-semibold text-[var(--brand)]"
            >
              Switch subject
            </Link>
          )}
        </div>
      </header>

      <LearnSession
        firstQuestion={first}
        subject={subject}
        studentName={firstName}
        audio={active.student.autoplayAudio}
      />
    </main>
  );
}

/**
 * The subject menu.
 *
 * Deliberately two large targets with no other decision on the page. This is
 * the first screen a six-year-old meets after their PIN, and every extra
 * control here is one more thing between them and a question.
 */
function Chooser({
  name,
  grade,
  available,
}: {
  name: string;
  grade: number;
  available: Subject[];
}) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <p className="text-center font-mono text-xs uppercase tracking-[0.14em] text-[var(--brand)]">
        {name} · {ordinal(grade)} grade
      </p>
      <h1 className="mt-2 text-center text-3xl sm:text-4xl">
        What shall we practise?
      </h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {available.map((s) => (
          <Link
            key={s}
            href={`/learn?subject=${s}`}
            className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-6 py-10 transition hover:border-[var(--brand)] hover:bg-[var(--surface-2)]"
          >
            <span className="text-5xl" aria-hidden>
              {SUBJECTS[s].emoji}
            </span>
            <span className="text-xl font-bold">{SUBJECTS[s].label}</span>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center">
        <Link
          href="/students"
          className="text-sm font-semibold text-[var(--text-muted)]"
        >
          Back to profiles
        </Link>
      </p>
    </main>
  );
}

/**
 * Shown when the child's grade has no practice behind it.
 *
 * The honest screen. It exists so that adding a grade to the platform is the
 * only way to make it disappear — the alternative, falling back to whatever
 * grade happens to have content, is invisible from the outside and shows up
 * in the parent's report as mastery of work their child was never set.
 */
function NotReady({ grade, name }: { grade: number; name: string }) {
  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      <span className="text-5xl" aria-hidden>
        &#128736;
      </span>
      <h1 className="mt-4 text-3xl">Nothing here yet</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        {name}, we have not finished building the {ordinal(grade)} grade
        questions. We would rather show you nothing than give you another
        year&rsquo;s work by mistake.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/students"
          className="rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px]"
        >
          Back to profiles
        </Link>
        <Link
          href="/curriculum"
          className="rounded-full border border-[var(--border)] px-8 text-base font-semibold leading-[48px]"
        >
          See what is covered
        </Link>
      </div>
    </main>
  );
}

/**
 * Shown when practice is not available.
 *
 * Written for the child to read, with the billing detail kept for the parent.
 * A seven-year-old should not be told their family's card was declined.
 */
function Locked({
  state,
  name,
}: {
  state: "grace" | "none";
  name: string;
}) {
  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      <span className="text-5xl" aria-hidden>
        &#127793;
      </span>
      <h1 className="mt-4 text-3xl">Practice is paused</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        {name}, ask a grown-up to have a look — everything you have done so far
        is still saved.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/parent"
          className="rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px]"
        >
          {state === "grace" ? "Update payment details" : "See plans"}
        </Link>
        <Link
          href="/students"
          className="rounded-full border border-[var(--border)] px-8 text-base font-semibold leading-[48px]"
        >
          Back to profiles
        </Link>
      </div>
    </main>
  );
}
