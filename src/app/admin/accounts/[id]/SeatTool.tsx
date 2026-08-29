"use client";

import { useActionState } from "react";
import { adminChangeSeats, type AdminState } from "@/app/actions/admin";

/**
 * Changing how many seats a family pays for, from support.
 *
 * The change is sent to Stripe and nothing is written locally: the webhook
 * records the new quantity, so the panel and the invoice cannot end up
 * disagreeing about what happened.
 */
export default function SeatTool({
  parentId,
  current,
}: {
  parentId: string;
  current: number;
}) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    adminChangeSeats,
    {},
  );

  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-end gap-2">
      <input type="hidden" name="parentId" value={parentId} />
      <label className="text-xs font-semibold">
        <span className="mb-1 block text-[var(--text-muted)]">Seats</span>
        <select
          name="seats"
          defaultValue={String(current)}
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm focus:border-[var(--brand)]"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-2)] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Change in Stripe"}
      </button>
      {state.success && (
        <span className="text-xs text-[var(--color-grow-500)]">
          {state.success}
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
