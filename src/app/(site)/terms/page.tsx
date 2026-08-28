import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms of using Sparkquill.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-4xl">Terms</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        Last updated 28 August 2026
      </p>

      <Section title="What this is">
        <p>
          Sparkquill is a study tool for the Florida B.E.S.T. standards. It is
          run by Prospero LLC and is not affiliated with, sponsored by, or
          endorsed by the Florida Department of Education or Cambium Assessment.
        </p>
        <p>
          Practising here does not guarantee any result on any test. We build
          the content against the published standards and the published test
          blueprints, and we say plainly where the state publishes nothing —
          for grades 1 and 2 in particular, we do not predict an achievement
          level, because Florida does not publish the blueprint that would make
          such a number meaningful.
        </p>
      </Section>

      <Section title="Accounts">
        <p>
          You must be an adult to open an account, and you are responsible for
          what happens under it, including your children&rsquo;s profiles. Keep
          your password to yourself; a child&rsquo;s PIN is for choosing their
          own profile, not for reaching your account.
        </p>
      </Section>

      <Section title="Subscriptions">
        <p>
          Sparkquill costs $10 per child each month, or $100 per child each
          year. One subscription covers the whole family, with a seat for each
          child.
        </p>
        <p>
          New accounts get seven days free. Cancel before the trial ends and
          nothing is charged. After that, the subscription renews automatically
          until cancelled, which you can do at any time from the dashboard.
        </p>
        <p>
          <strong>Adding a child</strong> is charged immediately, prorated to
          the rest of the current period, so they can start the same day.{" "}
          <strong>Removing a child</strong> is not refunded, and their seat keeps
          working until the period you already paid for ends.
        </p>
        <p>
          If a payment fails, practice pauses but nothing is deleted. Your
          children&rsquo;s progress stays exactly where it was and comes back as
          soon as the card is updated.
        </p>
      </Section>

      <Section title="Your children's data">
        <p>
          Covered separately and in plain language on the{" "}
          <Link href="/privacy" className="font-semibold text-[var(--brand)]">
            privacy page
          </Link>
          . The short version: children have no accounts, we collect a first
          name and a grade and nothing else identifying, and you can delete all
          of it whenever you like.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          Use it for your own family. Do not resell access, scrape the question
          bank, or attempt to reach other families&rsquo; data. We may suspend
          an account that does.
        </p>
      </Section>

      <Section title="Content">
        <p>
          The questions, passages, explanations and interactive models are ours.
          The standards themselves are published by the State of Florida and are
          quoted here descriptively.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If these terms change in a way that affects what you pay or what we
          collect, we will email you before it takes effect.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          <a href="mailto:support@prosperollc.com" className="font-semibold">
            support@prosperollc.com
          </a>
        </p>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[var(--text-muted)] [&_strong]:text-[var(--text)]">
        {children}
      </div>
    </section>
  );
}
