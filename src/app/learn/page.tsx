import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireActiveStudent } from "@/lib/data/students";
import { nextQuestion } from "@/app/actions/practice";
import { entitlementFor } from "@/lib/data/subscriptions";
import { billingConfigured } from "@/lib/stripe";
import { ordinal } from "@/lib/utils";
import LearnSession from "./LearnSession";

export const metadata: Metadata = { title: "Practice" };

export default async function LearnPage() {
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
    if (entitlement.state !== "active") {
      return <Locked state={entitlement.state} name={active.student.firstName} />;
    }
  }

  // The first question is rendered on the server so the child sees a question
  // immediately rather than a spinner.
  const first = await nextQuestion([]);

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--brand)]">
          {active.student.firstName} · {ordinal(active.student.grade)} grade ·
          Mathematics
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Let&rsquo;s practise</h1>
      </header>

      <LearnSession
        firstQuestion={first}
        studentName={active.student.firstName}
        audio={active.student.autoplayAudio}
      />
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
