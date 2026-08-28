"use client";

import { useActionState, useState } from "react";
import {
  deleteStudent,
  type ManageState,
} from "@/app/actions/account-management";

/**
 * Deleting a child's profile.
 *
 * Typing the name is deliberate friction. This removes a practice history
 * permanently and there is no undo, so a single mis-click must not be enough —
 * and the wording says plainly what goes, rather than hiding it behind "are
 * you sure?".
 */
export default function DeleteStudent({
  studentId,
  firstName,
  attemptCount,
}: {
  studentId: string;
  firstName: string;
  attemptCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [state, formAction, pending] = useActionState<ManageState, FormData>(
    deleteStudent,
    {},
  );

  if (state.success) {
    return (
      <p
        role="status"
        className="mt-4 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-grow-500)] bg-[var(--color-grow-100)] px-4 py-3 text-sm text-[var(--color-ink-900)]"
      >
        {state.success}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="compact mt-4 text-sm font-semibold text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--color-ember-500)]"
      >
        Delete {firstName}&rsquo;s profile
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-4 rounded-[var(--radius-tile)] border border-[var(--color-ember-500)] bg-[var(--color-ember-100)] p-4"
    >
      <input type="hidden" name="studentId" value={studentId} />

      <p className="text-sm font-bold text-[var(--color-ink-900)]">
        Delete {firstName}&rsquo;s profile
      </p>
      <p className="mt-1 text-sm text-[var(--color-ink-800)]">
        This removes their profile and{" "}
        {attemptCount > 0
          ? `all ${attemptCount} questions they have answered`
          : "their practice history"}
        , permanently. It cannot be undone, and their seat is freed for another
        child.
      </p>

      <label className="mt-3 block">
        <span className="text-sm text-[var(--color-ink-800)]">
          Type <strong>{firstName}</strong> to confirm
        </span>
        <input
          name="confirmName"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          className="mt-1 w-full max-w-xs rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--color-ember-500)]"
        />
      </label>

      {state.error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-[var(--color-ember-500)]">
          {state.error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={
            pending || typed.trim().toLowerCase() !== firstName.toLowerCase()
          }
          className="compact rounded-full bg-[var(--color-ember-500)] px-5 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Deleting…" : "Delete permanently"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setTyped("");
          }}
          className="compact rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-semibold transition"
        >
          Keep it
        </button>
      </div>
    </form>
  );
}
