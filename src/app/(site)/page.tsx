import Link from "next/link";
import { GRADES, ordinal } from "@/lib/utils";

const FEATURES = [
  {
    title: "Turn it, don't memorise it",
    body: "Rotate a solid with your finger and the faces count themselves. Unfold it into a net and fold it back. Geometry stops being a diagram to remember.",
  },
  {
    title: "Every question is read aloud",
    body: "A first grader who cannot read fluently yet can still practise mathematics. Every question, instruction and answer choice can be spoken aloud on demand.",
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
              href="/curriculum"
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

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl">One subscription for the family</h2>
        <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
          $10 per child each month, on one invoice with one renewal date. Seven
          days free to start, and cancelling takes one click.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
              Monthly
            </p>
            <p className="mt-1 font-display text-4xl font-semibold">$10</p>
            <p className="text-sm text-[var(--text-muted)]">per child, per month</p>
          </div>
          <div className="rounded-[var(--radius-card)] border-2 border-[var(--brand)] bg-[var(--surface-2)] p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
              Yearly
            </p>
            <p className="mt-1 font-display text-4xl font-semibold">$100</p>
            <p className="text-sm text-[var(--text-muted)]">
              per child, per year — two months free
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-sm text-[var(--text-muted)]">
          Adding a child is prorated so they can start the same day. Removing
          one is not refunded, and their seat keeps working until the period you
          already paid for ends.
        </p>

        <Link
          href="/signup"
          className="mt-7 inline-flex items-center rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90"
        >
          Start a 7-day trial
        </Link>
      </section>
    </main>
  );
}
