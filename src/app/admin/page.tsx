import { redirect } from "next/navigation";
import Link from "next/link";
import { currentAdmin } from "@/lib/admin/session";
import { metrics } from "@/lib/data/admin-queries";
import { emailTransport } from "@/lib/email/send";
import { billingConfigured } from "@/lib/stripe";

export default async function AdminOverview() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  const m = await metrics();
  const money = (cents: number) =>
    `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl">Overview</h1>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
          Money
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Stat value={money(m.mrrCents)} label="Monthly recurring" note="Active subscriptions only; trials excluded" />
          <Stat value={String(m.activeSubscriptions)} label="Paying families" />
          <Stat value={String(m.trialing)} label="On trial" />
          <Stat
            value={String(m.pastDue)}
            label="Payment failed"
            tone={m.pastDue > 0 ? "warn" : undefined}
            note={m.pastDue > 0 ? "Practice paused for these" : undefined}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
          People
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Stat value={String(m.parents)} label="Accounts" />
          <Stat value={String(m.students)} label="Children" />
          <Stat value={String(m.seatsPaid)} label="Seats paid for" />
          <Stat
            value={String(m.neverPractised)}
            label="Never practised"
            tone={m.neverPractised > 0 ? "warn" : undefined}
            note="Signed up, no child has answered anything"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
          Use
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Stat value={String(m.attemptsToday)} label="Questions answered today" />
          <Stat value={String(m.attempts7d)} label="Answered this week" />
          <Stat
            value={String(m.activeStudents7d)}
            label="Children practising this week"
            note={
              m.students > 0
                ? `${Math.round((m.activeStudents7d / m.students) * 100)}% of profiles`
                : undefined
            }
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
          Configuration
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Health
            label="Billing"
            ok={billingConfigured()}
            okText="Stripe configured"
            badText="No Stripe keys — paid features are open to everyone"
          />
          <Health
            label="Email"
            ok={emailTransport() !== "none"}
            okText={`Sending over ${emailTransport().toUpperCase()}`}
            badText="No transport — password resets point at support instead"
          />
        </div>
      </section>

      <p className="mt-8 text-sm">
        <Link href="/admin/accounts" className="font-semibold text-[var(--brand)]">
          Find an account
        </Link>
      </p>
    </main>
  );
}

function Stat({
  value,
  label,
  note,
  tone,
}: {
  value: string;
  label: string;
  note?: string;
  tone?: "warn";
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border bg-[var(--surface)] px-5 py-4 ${
        tone === "warn"
          ? "border-[var(--color-ember-500)]"
          : "border-[var(--border)]"
      }`}
    >
      <span className="block font-display text-3xl font-semibold tabular-nums">
        {value}
      </span>
      <span className="mt-0.5 block text-sm">{label}</span>
      {note && (
        <span className="mt-1 block text-xs leading-snug text-[var(--text-muted)]">
          {note}
        </span>
      )}
    </div>
  );
}

/** Says what is switched on, because guessing is how a deploy goes unnoticed. */
function Health({
  label,
  ok,
  okText,
  badText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  badText: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            ok ? "bg-[var(--color-grow-500)]" : "bg-[var(--color-ember-500)]"
          }`}
          aria-hidden
        />
        <span className="text-sm font-bold">{label}</span>
      </div>
      <p className="mt-1.5 text-sm text-[var(--text-muted)]">
        {ok ? okText : badText}
      </p>
    </div>
  );
}
