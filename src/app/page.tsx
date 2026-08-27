import Link from "next/link";
import { GRADES, ordinal } from "@/lib/utils";

const FEATURES = [
  {
    title: "Turn it, don't memorise it",
    body: "Rotate a solid with your finger and the faces count themselves. Unfold it into a net and fold it back. Geometry stops being a diagram to remember.",
  },
  {
    title: "Every question is read aloud",
    body: "A first grader who cannot yet read fluently can still practise mathematics. Instructions, questions and answer choices all have audio.",
  },
  {
    title: "Built on the actual standards",
    body: "358 B.E.S.T. benchmarks, grades 1 through 6, mapped to the reporting categories Florida really weights on the test.",
  },
  {
    title: "Practice that adapts",
    body: "The next question is chosen to sit at roughly a 75% chance of success — hard enough to teach, easy enough to keep going.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--brand)]">
            Grades 1–6 · Reading &amp; Mathematics
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl sm:text-6xl">
            Practice for Florida&rsquo;s tests that a child actually wants to
            open.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--text-muted)]">
            Sparkquill teaches the B.E.S.T. standards through things your child
            can pick up and turn — not another worksheet on a screen. Built for
            Florida families preparing for the FAST assessments.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full bg-[var(--brand)] px-7 text-base font-bold text-[var(--brand-contrast)] leading-[44px] transition hover:opacity-90"
            >
              Start a 7-day trial
            </Link>
            <Link
              href="/curriculum"
              className="inline-flex items-center rounded-full border border-[var(--border)] px-7 text-base font-semibold leading-[44px] transition hover:bg-[var(--surface-3)]"
            >
              See what&rsquo;s covered
            </Link>
          </div>
          <p className="mt-4 font-mono text-xs text-[var(--text-muted)]">
            $10 per student per month · cancel in one click
          </p>
        </div>
      </section>

      {/* Grade picker */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl">Pick a grade to see the plan</h2>
        <p className="mt-2 text-[var(--text-muted)]">
          Every grade has its own map, because Florida assesses them
          differently.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {GRADES.map((g) => (
            <Link
              key={g}
              href={`/curriculum/${g}`}
              className="group flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--brand)] hover:shadow-sm"
            >
              <span className="font-display text-3xl font-semibold text-[var(--brand)]">
                {ordinal(g)}
              </span>
              <span className="mt-3 text-xs leading-snug text-[var(--text-muted)]">
                {g >= 3 ? "FAST ELA + Math" : "Star Reading + Math"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-8 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <h3 className="text-xl">{f.title}</h3>
                <p className="mt-2 text-[var(--text-muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="max-w-3xl text-sm text-[var(--text-muted)]">
            Sparkquill is an independent study tool. It is not affiliated with,
            sponsored by, or endorsed by the Florida Department of Education or
            Cambium Assessment. &ldquo;FAST&rdquo; and &ldquo;B.E.S.T.&rdquo;
            are designations of the State of Florida and are used here only to
            describe what this tool helps students prepare for.
          </p>
        </div>
      </footer>
    </main>
  );
}
