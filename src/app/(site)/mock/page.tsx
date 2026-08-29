import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireActiveStudent } from "@/lib/data/students";
import { gradeCoverage } from "@/lib/data/progress";
import { entitlementFor } from "@/lib/data/subscriptions";
import { grantsPractice } from "@/lib/billing/rules";
import { billingConfigured } from "@/lib/stripe";
import { ordinal, hasBlueprint } from "@/lib/utils";
import { paperLength, paperMinutes } from "@/lib/mock/paper";
import MockRunner from "./MockRunner";

export const metadata: Metadata = { title: "Practice test" };

const SUBJECTS = {
  math: { label: "Mathematics", emoji: "\u{1F522}" },
  ela: { label: "Reading", emoji: "\u{1F4D6}" },
} as const;

type Subject = keyof typeof SUBJECTS;

function parseSubject(raw: string | string[] | undefined): Subject | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "math" || v === "maths") return "math";
  if (v === "ela" || v === "reading") return "ela";
  return null;
}

export default async function MockPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const active = await requireActiveStudent();
  if (!active) redirect("/students");

  if (billingConfigured()) {
    const entitlement = await entitlementFor(active.parentId);
    if (!grantsPractice(entitlement.state)) redirect("/learn");
  }

  const grade = active.student.grade;
  const coverage = await gradeCoverage(grade);
  const available = (Object.keys(SUBJECTS) as Subject[]).filter(
    (s) => coverage[s] > 0,
  );
  if (available.length === 0) redirect("/learn");

  const { subject: raw } = await props.searchParams;
  const asked = parseSubject(raw);
  const subject = asked && available.includes(asked) ? asked : null;

  if (subject) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
        <MockRunner
          subject={subject}
          studentName={active.student.firstName}
          audio={active.student.autoplayAudio}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <p className="text-center font-mono text-xs uppercase tracking-[0.14em] text-[var(--brand)]">
        {active.student.firstName} · {ordinal(grade)} grade
      </p>
      <h1 className="mt-2 text-center text-3xl sm:text-4xl">Take a practice test</h1>

      <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-5 text-[15px]">
        <p className="font-bold">This one is different from practising.</p>
        <ul className="mt-3 space-y-2 text-[var(--text-muted)]">
          <li>
            <span className="font-semibold text-[var(--text)]">
              {paperLength(grade)} questions, {paperMinutes(grade)} minutes.
            </span>{" "}
            The clock keeps running if you leave and come back.
          </li>
          <li>
            <span className="font-semibold text-[var(--text)]">No hints,</span> and
            you will not be told whether an answer was right until the end.
          </li>
          <li>
            <span className="font-semibold text-[var(--text)]">
              The questions are set at the start.
            </span>{" "}
            Refreshing the page gives you the same test back, not an easier one.
          </li>
          <li>
            {hasBlueprint(grade) ? (
              <>
                The mix of topics follows{" "}
                <span className="font-semibold text-[var(--text)]">
                  Florida&rsquo;s published blueprint
                </span>{" "}
                for {ordinal(grade)} grade, not what you find hard.
              </>
            ) : (
              <>
                Florida publishes no blueprint for {ordinal(grade)} grade, so the
                questions are spread evenly across the whole year rather than
                weighted.
              </>
            )}
          </li>
        </ul>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {available.map((s) => (
          <Link
            key={s}
            href={`/mock?subject=${s}`}
            className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-6 py-8 transition hover:border-[var(--brand)] hover:bg-[var(--surface-2)]"
          >
            <span className="text-4xl" aria-hidden>
              {SUBJECTS[s].emoji}
            </span>
            <span className="text-lg font-bold">{SUBJECTS[s].label}</span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center">
        <Link href="/learn" className="text-sm font-semibold text-[var(--text-muted)]">
          Back to practice
        </Link>
      </p>
    </main>
  );
}
