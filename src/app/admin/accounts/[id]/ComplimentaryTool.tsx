"use client";

import { useActionState, useState } from "react";
import {
  adminGrantComplimentary,
  adminRevokeComplimentary,
  type AdminState,
} from "@/app/actions/admin";

const DATE = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const PRESETS = [
  { days: 30, label: "1 month" },
  { days: 90, label: "3 months" },
  { days: 365, label: "1 year" },
  { days: 1825, label: "5 years" },
] as const;

/**
 * Granting a family free access.
 *
 * For beta families, a school trying it out, your own household, or making
 * good after something went wrong. There is no "forever" option on purpose:
 * an end date is what stops free access piling up until nobody can say who is
 * paying. Five years is the longest, which is effectively permanent for a
 * child in grade school while still being a date somebody can review.
 */
export default function ComplimentaryTool({
  parentId,
  until,
  reason,
  active,
}: {
  parentId: string;
  until: Date | null;
  reason: string | null;
  /**
   * Whether the grant is still running, decided on the server. Comparing the
   * end date against the clock during render would give the browser a say in
   * who has access, and would disagree with the server for however long the
   * page has been open.
   */
  active: boolean;
}) {
  const [grantState, grantAction, granting] = useActionState<
    AdminState,
    FormData
  >(adminGrantComplimentary, {});
  const [revokeState, revokeAction, revoking] = useActionState<
    AdminState,
    FormData
  >(adminRevokeComplimentary, {});
  const [open, setOpen] = useState(false);

  const message = grantState.success ?? revokeState.success;
  const error = grantState.error ?? revokeState.error;

  return (
    <div className="mt-5 border-t border-[var(--border)] pt-4">
      <h3 className="text-sm font-bold">Free access</h3>

      {message && (
        <p
          role="status"
          className="mt-2 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-grow-500)] bg-[var(--color-grow-100)] px-4 py-2.5 text-sm text-[var(--color-ink-900)]"
        >
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-2 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-ember-500)] bg-[var(--color-ember-100)] px-4 py-2.5 text-sm text-[var(--color-ink-900)]"
        >
          {error}
        </p>
      )}

      {active && until ? (
        <div className="mt-2">
          <p className="text-sm">
            <span className="rounded-full bg-[var(--color-grow-100)] px-2.5 py-1 text-xs font-bold text-[var(--color-grow-500)]">
              Active
            </span>{" "}
            <span className="text-[var(--text-muted)]">
              until {DATE.format(new Date(until))}
              {reason ? ` — ${reason}` : ""}
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={revokeAction}>
              <input type="hidden" name="parentId" value={parentId} />
              <button
                type="submit"
                disabled={revoking}
                className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-2)] disabled:opacity-60"
              >
                {revoking ? "…" : "End free access"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
            >
              Extend
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          This family pays, or has no access.{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="compact font-semibold text-[var(--brand)] underline underline-offset-4"
          >
            Give them free access
          </button>
        </p>
      )}

      {open && (
        <form
          action={grantAction}
          className="mt-3 rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface-2)] p-3"
        >
          <input type="hidden" name="parentId" value={parentId} />
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold">
              <span className="mb-1 block text-[var(--text-muted)]">
                For how long
              </span>
              <select
                name="days"
                defaultValue="90"
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm focus:border-[var(--brand)]"
              >
                {PRESETS.map((p) => (
                  <option key={p.days} value={p.days}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 text-xs font-semibold">
              <span className="mb-1 block text-[var(--text-muted)]">
                Why (kept in the audit log)
              </span>
              <input
                name="reason"
                required
                minLength={3}
                maxLength={200}
                placeholder="Beta family, school pilot, goodwill after an outage…"
                className="w-full min-w-48 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm focus:border-[var(--brand)]"
              />
            </label>
            <button
              type="submit"
              disabled={granting}
              className="compact rounded-full bg-[var(--brand)] px-4 py-1.5 text-sm font-bold text-[var(--brand-contrast)] disabled:opacity-60"
            >
              {granting ? "…" : "Grant"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="compact rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            No card is taken and nothing is charged. Every child on the account
            can practise for as long as it lasts.
          </p>
        </form>
      )}
    </div>
  );
}
