"use client";

import { useActionState } from "react";
import {
  changeSeatCount,
  openBillingPortal,
  startCheckout,
  type BillingState,
} from "@/app/actions/billing";

export interface BillingSummary {
  configured: boolean;
  state: "active" | "grace" | "none" | "complimentary";
  seatsPaid: number;
  seatsUsed: number;
  status: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  complimentaryUntil: Date | null;
  complimentaryReason: string | null;
}

const DATE = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function BillingPanel({
  summary,
  childCount,
}: {
  summary: BillingSummary;
  childCount: number;
}) {
  // Checked before the "billing is off" notice: a family that has been given
  // free access should be told that, not told the deployment has no Stripe
  // keys. The reason they are not paying is the specific one, not the generic.
  if (summary.state === "complimentary") {
    return (
      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl">Subscription</h2>
          <span className="rounded-full bg-[var(--color-grow-100)] px-3 py-1 text-xs font-bold text-[var(--color-grow-500)]">
            Free access
          </span>
        </div>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          You have free access to Sparkquill
          {summary.complimentaryUntil
            ? ` until ${DATE.format(new Date(summary.complimentaryUntil))}`
            : ""}
          . Nothing is being charged, and there is no card on file.
        </p>
        {summary.complimentaryReason && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Reason on file: {summary.complimentaryReason}
          </p>
        )}
      </Card>
    );
  }

  if (!summary.configured) {
    return (
      <Card>
        <h2 className="text-xl">Subscription</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Billing is not switched on for this deployment yet, so everything is
          open. Nothing has been charged.
        </p>
      </Card>
    );
  }

  if (summary.state === "none") {
    return <Plans childCount={childCount} />;
  }

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl">Subscription</h2>
        <StatusPill state={summary.state} status={summary.status} />
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Detail
          label="Children paid for"
          value={`${summary.seatsPaid}`}
          note={
            summary.seatsUsed < summary.seatsPaid
              ? `${summary.seatsPaid - summary.seatsUsed} spare`
              : undefined
          }
        />
        <Detail
          label="Monthly"
          value={`$${summary.seatsPaid * 10}`}
          note="$10 per child"
        />
        <Detail
          label={summary.cancelAtPeriodEnd ? "Access until" : "Renews"}
          value={
            summary.currentPeriodEnd
              ? DATE.format(new Date(summary.currentPeriodEnd))
              : "—"
          }
        />
      </dl>

      {summary.trialEnd && new Date(summary.trialEnd) > new Date() && (
        <p className="mt-4 rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-4 py-3 text-sm">
          Free trial until {DATE.format(new Date(summary.trialEnd))}. Cancel
          before then and you will not be charged.
        </p>
      )}

      {summary.state === "grace" && (
        <p
          role="alert"
          className="mt-4 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-ember-500)] bg-[var(--color-ember-100)] px-4 py-3 text-sm text-[var(--color-ink-900)]"
        >
          The last payment did not go through, so practice is paused. Your
          children&rsquo;s progress is safe and comes straight back once the
          card is updated.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <SeatForm current={summary.seatsPaid} childCount={childCount} />
        <PortalButton />
      </div>
    </Card>
  );
}

function Plans({ childCount }: { childCount: number }) {
  const [state, formAction, pending] = useActionState<BillingState, FormData>(
    startCheckout,
    {},
  );
  const seats = Math.max(1, childCount);

  return (
    <Card>
      <h2 className="text-xl">Start practising</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        $10 per child each month. Seven days free, and one click to cancel.
      </p>

      <form action={formAction} className="mt-5 grid gap-3 sm:grid-cols-2">
        <PlanButton
          plan="monthly"
          title="Monthly"
          price={`$${seats * 10}`}
          per="per month"
          note={`${seats} ${seats === 1 ? "child" : "children"} × $10`}
          pending={pending}
        />
        <PlanButton
          plan="annual"
          title="Yearly"
          price={`$${seats * 100}`}
          per="per year"
          note="Two months free"
          pending={pending}
          highlight
        />
      </form>

      {state.error && (
        <p
          role="alert"
          className="mt-4 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-ember-500)] bg-[var(--color-ember-100)] px-4 py-3 text-sm text-[var(--color-ink-900)]"
        >
          {state.error}
        </p>
      )}
    </Card>
  );
}

function PlanButton({
  plan,
  title,
  price,
  per,
  note,
  pending,
  highlight,
}: {
  plan: string;
  title: string;
  price: string;
  per: string;
  note: string;
  pending: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      type="submit"
      name="plan"
      value={plan}
      disabled={pending}
      className={`rounded-[var(--radius-card)] border-2 p-5 text-left transition disabled:opacity-60 ${
        highlight
          ? "border-[var(--brand)] bg-[var(--surface-2)]"
          : "border-[var(--border)] hover:border-[var(--brand)]"
      }`}
    >
      <span className="block text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
        {title}
      </span>
      <span className="mt-1 block font-display text-3xl font-semibold tabular-nums">
        {price}
      </span>
      <span className="block text-sm text-[var(--text-muted)]">{per}</span>
      <span className="mt-2 block text-xs text-[var(--text-muted)]">{note}</span>
    </button>
  );
}

function SeatForm({
  current,
  childCount,
}: {
  current: number;
  childCount: number;
}) {
  const [state, formAction, pending] = useActionState<BillingState, FormData>(
    changeSeatCount,
    {},
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <label className="text-sm font-semibold" htmlFor="seats">
        Children
      </label>
      <select
        id="seats"
        name="seats"
        defaultValue={String(current)}
        className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="compact rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-2)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update"}
      </button>
      {childCount > current && (
        <span className="text-xs text-[var(--color-ember-500)]">
          {childCount} profiles, {current} paid
        </span>
      )}
      {state.error && (
        <span role="alert" className="text-xs text-[var(--color-ember-500)]">
          {state.error}
        </span>
      )}
    </form>
  );
}

function PortalButton() {
  const [state, formAction, pending] = useActionState<BillingState, FormData>(
    async () => openBillingPortal(),
    {},
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="compact rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-bold text-[var(--brand-contrast)] transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Opening…" : "Card and invoices"}
      </button>
      {state.error && (
        <span role="alert" className="ml-2 text-xs text-[var(--color-ember-500)]">
          {state.error}
        </span>
      )}
    </form>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
      {children}
    </section>
  );
}

function StatusPill({
  state,
  status,
}: {
  state: "active" | "grace" | "none" | "complimentary";
  status: string | null;
}) {
  const label =
    status === "trialing" ? "Free trial" : state === "active" ? "Active" : "Payment failed";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        state === "active"
          ? "bg-[var(--color-grow-100)] text-[var(--color-grow-500)]"
          : "bg-[var(--color-ember-100)] text-[var(--color-ember-500)]"
      }`}
    >
      {label}
    </span>
  );
}

function Detail({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-4 py-3">
      <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-0.5 font-display text-xl font-semibold tabular-nums">
        {value}
      </dd>
      {note && (
        <dd className="text-xs text-[var(--text-muted)]">{note}</dd>
      )}
    </div>
  );
}
