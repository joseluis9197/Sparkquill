"use client";

import { useActionState, useState } from "react";
import {
  changePassword,
  type ManageState,
} from "@/app/actions/account-management";

/**
 * Account settings for the parent.
 *
 * Collapsed by default: this is a dashboard about children's progress, and a
 * password form sitting open at the top of it competes with the thing the
 * parent actually came to read.
 */
export default function AccountPanel({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ManageState, FormData>(
    changePassword,
    {},
  );

  return (
    <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl">Your account</h2>
        <span className="font-mono text-xs text-[var(--text-muted)]">
          {email}
        </span>
      </div>

      {state.success && (
        <p
          role="status"
          className="mt-4 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-grow-500)] bg-[var(--color-grow-100)] px-4 py-3 text-sm text-[var(--color-ink-900)]"
        >
          {state.success}
        </p>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="compact mt-4 rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
        >
          Change password
        </button>
      ) : (
        <form action={formAction} className="mt-5 max-w-sm space-y-3">
          <Field
            label="Current password"
            name="current"
            autoComplete="current-password"
          />
          <Field
            label="New password"
            name="next"
            autoComplete="new-password"
            hint="At least 10 characters."
          />
          <Field
            label="Type the new one again"
            name="confirm"
            autoComplete="new-password"
          />

          {state.error && (
            <p
              role="alert"
              className="rounded-[var(--radius-tile)] border-l-4 border-[var(--color-ember-500)] bg-[var(--color-ember-100)] px-4 py-3 text-sm text-[var(--color-ink-900)]"
            >
              {state.error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="compact rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-[var(--brand-contrast)] transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="compact rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({
  label,
  name,
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  autoComplete: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <input
        name={name}
        type="password"
        autoComplete={autoComplete}
        required
        className="w-full rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 transition focus:border-[var(--brand)]"
      />
      {hint && (
        <span className="mt-1 block text-xs text-[var(--text-muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}
