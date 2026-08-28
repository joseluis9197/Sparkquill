import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy and children's data",
  description:
    "What Sparkquill collects from children, what it does not, and how a parent can see or delete it.",
};

/**
 * COPPA notice.
 *
 * The rule requires an operator collecting personal information from children
 * under 13 to say what it collects, how it is used, whether it is disclosed,
 * and how a parent can review or delete it. This page is written to be read by
 * a parent rather than by a lawyer, and every claim on it has to stay true of
 * the code — if the product starts collecting something, this page changes in
 * the same commit.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-4xl">Privacy and children&rsquo;s data</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        Last updated 28 August 2026
      </p>

      <Section title="The short version">
        <p>
          Children do not have accounts here. A parent signs up, and each child
          gets a profile with a first name, a grade and a four-digit PIN. We do
          not ask a child for an email address, a surname, a date of birth, a
          photograph, a school, or a location — not as an optional field, not
          anywhere.
        </p>
        <p>
          We do not sell data, we do not share it with advertisers, and there
          are no third-party trackers on any page a child uses.
        </p>
      </Section>

      <Section title="What we collect about a child">
        <List
          items={[
            ["First name", "So the app can greet them. No surname is stored."],
            ["Grade", "To choose which standards to practise."],
            [
              "Year of birth (optional)",
              "Only the year, and only if a parent enters it. A full date of birth is never requested.",
            ],
            [
              "A four-digit PIN",
              "Stored as a slow one-way hash. Nobody, including us, can read it back.",
            ],
            [
              "Practice records",
              "Which questions were answered, whether each was right, how long it took, and which kind of mistake was made. This is what the progress report is built from.",
            ],
          ]}
        />
      </Section>

      <Section title="What we deliberately do not collect">
        <List
          items={[
            ["Surnames", "Never requested."],
            ["A child's email address or phone number", "Never requested."],
            ["Photographs or video", "Never requested."],
            ["Location", "We do not use geolocation."],
            [
              "Voice recordings or other biometrics",
              "Where a feature listens to a child reading, the audio is processed on the device and is never transmitted or stored.",
            ],
            [
              "Advertising identifiers",
              "There is no advertising in this product and no advertising code on any page.",
            ],
          ]}
        />
      </Section>

      <Section title="What we collect about a parent">
        <p>
          Name, email address and a hashed password. If you subscribe, Stripe
          handles the payment and stores the card; we keep only the customer and
          subscription identifiers Stripe gives us. We never see or store card
          numbers.
        </p>
      </Section>

      <Section title="How consent works">
        <p>
          A parent creates the account and adds each child, which is how we know
          a responsible adult has agreed. Where a subscription is taken, the card
          transaction is one of the verifiable-consent methods the COPPA rule
          accepts.
        </p>
        <p>
          A parent can withdraw consent at any time by deleting a child&rsquo;s
          profile, which removes that child&rsquo;s practice records.
        </p>
      </Section>

      <Section title="Reviewing and deleting your child's information">
        <p>
          Everything we hold about a child is visible on the parent dashboard.
          You can delete a child&rsquo;s profile and all of their practice
          history from there, or email us and we will do it.
        </p>
        <p>
          Deleting a profile removes the practice records with it. We do not
          keep a shadow copy.
        </p>
      </Section>

      <Section title="How long we keep things">
        <p>
          Practice records are kept while the profile exists. When a
          subscription ends we keep the account for twelve months so a family
          coming back finds their progress intact, and then remove the practice
          records. A parent who asks for deletion sooner gets it sooner.
        </p>
      </Section>

      <Section title="Who else sees it">
        <p>
          Only the services needed to run the product: our own server, which
          hosts the database, and Stripe for payments. We do not disclose
          children&rsquo;s information to anyone else, and there is no
          arrangement under which anybody could buy it.
        </p>
      </Section>

      <Section title="Security">
        <p>
          Passwords and PINs are stored as slow one-way hashes. Repeated wrong
          guesses are throttled. The database is reachable only from the
          application server, never from the public internet, and traffic to the
          site is encrypted.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about your child&rsquo;s information, or a request to review
          or delete it:{" "}
          <a href="mailto:privacy@prosperollc.com" className="font-semibold">
            privacy@prosperollc.com
          </a>
          .
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

function List({ items }: { items: [string, string][] }) {
  return (
    <dl className="space-y-3">
      {items.map(([term, detail]) => (
        <div key={term}>
          <dt className="font-semibold text-[var(--text)]">{term}</dt>
          <dd className="text-[var(--text-muted)]">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}
