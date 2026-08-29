"use client";

import { useActionState, useState } from "react";
import {
  adminChangeGrade,
  adminDeleteStudent,
  adminResetPin,
  type AdminState,
} from "@/app/actions/admin";
import { GRADES, ordinal } from "@/lib/utils";

/**
 * Support actions on one child.
 *
 * Resetting a PIN is the commonest request there will ever be, so it is one
 * field and one button. Deleting sits behind a name confirmation and an owner
 * role, because it is the one action here that cannot be undone.
 */
export default function StudentTools({
  studentId,
  firstName,
  grade,
  canDelete,
}: {
  studentId: string;
  firstName: string;
  grade: number;
  canDelete: boolean;
}) {
  const [pinState, pinAction, pinPending] = useActionState<AdminState, FormData>(
    adminResetPin,
    {},
  );
  const [gradeState, gradeAction, gradePending] = useActionState<
    AdminState,
    FormData
  >(adminChangeGrade, {});
  const [delState, delAction, delPending] = useActionState<AdminState, FormData>(
    adminDeleteStudent,
    {},
  );
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  const message = pinState.success ?? gradeState.success ?? delState.success;
  const error = pinState.error ?? gradeState.error ?? delState.error;

  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4">
      {message && (
        <p
          role="status"
          className="mb-3 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-grow-500)] bg-[var(--color-grow-100)] px-4 py-2.5 text-sm text-[var(--color-ink-900)]"
        >
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-ember-500)] bg-[var(--color-ember-100)] px-4 py-2.5 text-sm text-[var(--color-ink-900)]"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <form action={pinAction} className="flex items-end gap-2">
          <input type="hidden" name="studentId" value={studentId} />
          <label className="text-xs font-semibold">
            <span className="mb-1 block text-[var(--text-muted)]">New PIN</span>
            <input
              name="pin"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              required
              className="w-24 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-center font-mono tracking-widest focus:border-[var(--brand)]"
            />
          </label>
          <button
            type="submit"
            disabled={pinPending}
            className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-2)] disabled:opacity-60"
          >
            {pinPending ? "…" : "Reset PIN"}
          </button>
        </form>

        <form action={gradeAction} className="flex items-end gap-2">
          <input type="hidden" name="studentId" value={studentId} />
          <label className="text-xs font-semibold">
            <span className="mb-1 block text-[var(--text-muted)]">Grade</span>
            <select
              name="grade"
              defaultValue={String(grade)}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm focus:border-[var(--brand)]"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {ordinal(g)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={gradePending}
            className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-2)] disabled:opacity-60"
          >
            {gradePending ? "…" : "Move"}
          </button>
        </form>
      </div>

      {canDelete && (
        <div className="mt-4">
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="compact text-xs font-semibold text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--color-ember-500)]"
            >
              Delete at the parent&rsquo;s request
            </button>
          ) : (
            <form
              action={delAction}
              className="rounded-[var(--radius-tile)] border border-[var(--color-ember-500)] bg-[var(--color-ember-100)] p-3"
            >
              <input type="hidden" name="studentId" value={studentId} />
              <p className="text-xs text-[var(--color-ink-800)]">
                Deletes {firstName} and every question they have answered.
                Permanent. Type <strong>{firstName}</strong> to confirm.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  name="confirmName"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  className="w-40 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={
                    delPending ||
                    typed.trim().toLowerCase() !== firstName.toLowerCase()
                  }
                  className="compact rounded-full bg-[var(--color-ember-500)] px-4 py-1.5 text-sm font-bold text-white disabled:opacity-40"
                >
                  {delPending ? "…" : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setTyped("");
                  }}
                  className="compact rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
