"use client";

import { useActionState, useState } from "react";
import { addStudent, selectStudent, type ActionState } from "@/app/actions/accounts";
import type { Student } from "@/lib/data/students";
import { GRADES, ordinal } from "@/lib/utils";
import { cn } from "@/lib/utils";

const AVATAR_EMOJI: Record<string, string> = {
  fox: "🦊",
  owl: "🦉",
  otter: "🦦",
  bear: "🐻",
  hare: "🐰",
  heron: "🐦",
};

export default function StudentPicker({ students }: { students: Student[] }) {
  const [chosen, setChosen] = useState<Student | null>(null);
  const [adding, setAdding] = useState(students.length === 0);

  if (chosen) {
    return <PinEntry student={chosen} onBack={() => setChosen(null)} />;
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-4">
        {students.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setChosen(s)}
            className="flex w-32 flex-col items-center gap-2 rounded-[var(--radius-card)] border-2 border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--brand)] hover:shadow-sm"
          >
            <span className="text-5xl" aria-hidden>
              {AVATAR_EMOJI[s.avatarKey] ?? "🦊"}
            </span>
            <span className="font-display text-lg font-semibold">
              {s.firstName}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {ordinal(s.grade)} grade
            </span>
          </button>
        ))}

        {!adding && students.length > 0 && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex w-32 flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border)] p-5 text-[var(--text-muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            <span className="text-4xl" aria-hidden>
              +
            </span>
            <span className="text-sm font-semibold">Add a child</span>
          </button>
        )}
      </div>

      {adding && (
        <div className="mx-auto mt-8 max-w-sm">
          <AddStudentForm onDone={() => setAdding(false)} canCancel={students.length > 0} />
        </div>
      )}
    </div>
  );
}

function AddStudentForm({
  onDone,
  canCancel,
}: {
  onDone: () => void;
  canCancel: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prev, fd) => {
      const result = await addStudent(prev, fd);
      if (!result.error) onDone();
      return result;
    },
    {},
  );

  return (
    <form
      action={formAction}
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6"
    >
      <h2 className="text-xl">Add a child</h2>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-semibold">First name</span>
        <input
          name="firstName"
          required
          maxLength={40}
          className="w-full rounded-[var(--radius-tile)] border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--brand)]"
        />
        <span className="mt-1 block text-xs text-[var(--text-muted)]">
          First name only — we do not collect surnames.
        </span>
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-semibold">Grade</span>
        <select
          name="grade"
          required
          defaultValue="2"
          className="w-full rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none focus:border-[var(--brand)]"
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {ordinal(g)} grade
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-semibold">
          A four-digit PIN
        </span>
        <input
          name="pin"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          required
          className="w-full rounded-[var(--radius-tile)] border border-[var(--border)] px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-[var(--brand)]"
        />
        <span className="mt-1 block text-xs text-[var(--text-muted)]">
          Something your child can remember and type themselves.
        </span>
      </label>

      {state.error && (
        <p
          role="alert"
          className="mt-4 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-ember-500)] bg-[var(--color-ember-100)] px-4 py-3 text-sm text-[var(--color-ink-900)]"
        >
          {state.error}
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-full bg-[var(--brand)] px-6 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add"}
        </button>
        {canCancel && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-full border border-[var(--border)] px-6 text-base font-semibold leading-[48px] transition hover:bg-[var(--surface-2)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function PinEntry({
  student,
  onBack,
}: {
  student: Student;
  onBack: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    selectStudent,
    {},
  );
  const [pin, setPin] = useState("");

  return (
    <form action={formAction} className="mx-auto max-w-xs text-center">
      <input type="hidden" name="studentId" value={student.id} />

      <span className="text-6xl" aria-hidden>
        {AVATAR_EMOJI[student.avatarKey] ?? "🦊"}
      </span>
      <h2 className="mt-3 font-display text-2xl font-semibold">
        Hello, {student.firstName}
      </h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Type your four numbers
      </p>

      <input
        name="pin"
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        autoFocus
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        className="mt-5 w-full rounded-[var(--radius-tile)] border-2 border-[var(--border)] px-4 py-4 text-center font-mono text-3xl tracking-[0.5em] outline-none focus:border-[var(--brand)]"
        aria-label="PIN"
      />

      {/* A number pad, because a young child on a tablet should not have to
          fight the on-screen keyboard. */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <PadKey key={n} onClick={() => setPin((p) => (p + n).slice(0, 4))}>
            {n}
          </PadKey>
        ))}
        <PadKey onClick={() => setPin("")}>
          <span className="text-sm">clear</span>
        </PadKey>
        <PadKey onClick={() => setPin((p) => (p + "0").slice(0, 4))}>0</PadKey>
        <PadKey onClick={() => setPin((p) => p.slice(0, -1))}>
          <span aria-hidden>←</span>
          <span className="sr-only">Delete</span>
        </PadKey>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-4 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-ember-500)] bg-[var(--color-ember-100)] px-4 py-3 text-sm text-[var(--color-ink-900)]"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || pin.length !== 4}
        className="mt-5 w-full rounded-full bg-[var(--brand)] px-6 text-lg font-bold text-[var(--brand-contrast)] leading-[52px] transition hover:opacity-90 disabled:opacity-40"
      >
        {pending ? "…" : "Let's go"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="compact mt-3 text-sm font-semibold text-[var(--text-muted)] underline underline-offset-4"
      >
        Not me
      </button>
    </form>
  );
}

function PadKey({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface)] py-3 font-display text-xl font-semibold tabular-nums transition",
        "hover:border-[var(--brand)] active:bg-[var(--surface-3)]",
      )}
    >
      {children}
    </button>
  );
}
