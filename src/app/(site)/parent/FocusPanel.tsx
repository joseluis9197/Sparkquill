"use client";

import { useActionState } from "react";
import {
  clearPracticeFocus,
  setPracticeFocus,
  type FocusState,
} from "@/app/actions/focus";
import { FOCUS_DAYS, type StrandOption } from "@/lib/focus-shared";

/**
 * Pointing a child's practice at one topic for a few days.
 *
 * This is the escape valve for the adaptive selector. It exists because the
 * commonest reason a family opens a study app on a weeknight is a test on
 * Thursday, and until now there was no way to say so — an algorithm its user
 * cannot correct is one they can only cancel.
 *
 * It sits on the parent's dashboard rather than on the child's practice
 * screen, and that placement is the design. A child given a topic menu picks
 * what they can already do, which is the exact behaviour the mastery bands
 * exist to push against; the person who knows about Thursday is the parent.
 *
 * What the copy has to make clear, because otherwise it reads as a
 * restriction: reviews still come through, and it runs out on its own.
 */
export default function FocusPanel({
  studentId,
  childName,
  options,
  current,
}: {
  studentId: string;
  childName: string;
  options: StrandOption[];
  current: { label: string; until: Date } | null;
}) {
  const [state, action, pending] = useActionState<FocusState, FormData>(
    setPracticeFocus,
    {},
  );
  const [, clearAction, clearing] = useActionState<FocusState, FormData>(
    clearPracticeFocus,
    {},
  );

  if (options.length === 0) return null;

  const bySubject = {
    math: options.filter((o) => o.subject === "math"),
    ela: options.filter((o) => o.subject === "ela"),
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
        Focus for a few days
      </h3>

      {current ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-tile)] border border-[var(--brand)] bg-[var(--surface-2)] px-4 py-3">
          <p className="text-[15px]">
            Leaning towards <strong>{current.label}</strong> until{" "}
            {current.until.toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            .
          </p>
          <form action={clearAction}>
            <input type="hidden" name="studentId" value={studentId} />
            <button
              type="submit"
              disabled={clearing}
              className="compact rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface)] disabled:opacity-50"
            >
              {clearing ? "Stopping…" : "Stop early"}
            </button>
          </form>
        </div>
      ) : (
        <p className="mt-2 max-w-prose text-[15px] text-[var(--text-muted)]">
          If {childName} has a test coming up, you can point practice at one
          topic. Anything already due for review still comes through, and the
          focus runs out on its own.
        </p>
      )}

      <form action={action} className="mt-3 flex flex-wrap items-end gap-3">
        <input type="hidden" name="studentId" value={studentId} />

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Topic</span>
          <select
            name="strandCode"
            defaultValue=""
            className="min-w-56 rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 transition focus:border-[var(--brand)]"
          >
            <option value="" disabled>
              Choose a topic
            </option>
            {(["math", "ela"] as const).map((subject) =>
              bySubject[subject].length === 0 ? null : (
                <optgroup
                  key={subject}
                  label={subject === "math" ? "Mathematics" : "Reading"}
                >
                  {bySubject[subject].map((o) => (
                    <option key={o.code} value={o.code}>
                      {/* The count is here so a parent can see they are not
                          asking for something with two questions in it. */}
                      {o.name} ({o.skillCount}{" "}
                      {o.skillCount === 1 ? "skill" : "skills"})
                    </option>
                  ))}
                </optgroup>
              ),
            )}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">For</span>
          <select
            name="days"
            defaultValue={7}
            className="rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 transition focus:border-[var(--brand)]"
          >
            {FOCUS_DAYS.map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[var(--brand)] px-6 text-sm font-bold text-[var(--brand-contrast)] leading-[44px] transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : current ? "Change focus" : "Set focus"}
        </button>
      </form>

      {state.error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-[var(--color-ember-500)]">
          {state.error}
        </p>
      )}
      {state.ok && !state.error && (
        <p role="status" className="mt-2 text-sm font-semibold text-[var(--color-grow-500)]">
          Saved. {childName}&rsquo;s next session will lean that way.
        </p>
      )}
    </div>
  );
}
