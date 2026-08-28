"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState } from "@/app/actions/accounts";

export default function AuthForm({
  action,
  mode,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "signup" | "login";
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {},
  );
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="space-y-4">
      {isSignup && (
        <Field
          label="Your name"
          name="name"
          type="text"
          autoComplete="name"
          required
        />
      )}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
        required
        hint={isSignup ? "At least 10 characters." : undefined}
      />

      {!isSignup && (
        <p className="-mt-2 text-right text-sm">
          <Link
            href="/forgot-password"
            className="font-semibold text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--brand)]"
          >
            Forgotten your password?
          </Link>
        </p>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded-[var(--radius-tile)] border-l-4 border-[var(--color-ember-500)] bg-[var(--color-ember-100)] px-4 py-3 text-sm text-[var(--color-ink-900)]"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--brand)] px-6 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90 disabled:opacity-60"
      >
        {pending
          ? "One moment…"
          : isSignup
            ? "Create account"
            : "Sign in"}
      </button>

      <p className="pt-2 text-center text-sm text-[var(--text-muted)]">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--brand)]">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-[var(--brand)]">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base outline-none transition focus:border-[var(--brand)]"
      />
      {hint && (
        <span className="mt-1 block text-xs text-[var(--text-muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}
