"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  type ResetRequestState,
} from "@/app/actions/password-reset";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<
    ResetRequestState,
    FormData
  >(requestPasswordReset, {});

  if (state.unavailable) {
    return (
      <div className="rounded-[var(--radius-card)] border-l-4 border-[var(--accent)] bg-[var(--surface-2)] px-5 py-4">
        <p className="font-semibold">Email is not switched on yet</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          We cannot send the reset link automatically at the moment, so rather
          than leave you waiting for an email that will not arrive: write to{" "}
          <a
            href="mailto:support@prosperollc.com"
            className="font-semibold text-[var(--brand)]"
          >
            support@prosperollc.com
          </a>{" "}
          and we will reset it for you.
        </p>
      </div>
    );
  }

  if (state.done) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] px-5 py-5">
        <p className="font-semibold">Check your email</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          If there is an account with that address, a link is on its way. It
          works once and expires in an hour.
        </p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Nothing arrived? Check the spam folder, then{" "}
          <Link href="/forgot-password" className="font-semibold text-[var(--brand)]">
            try again
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          className="w-full rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base transition focus:border-[var(--brand)]"
        />
      </label>

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
        {pending ? "Sending…" : "Send me a link"}
      </button>

      <p className="pt-2 text-center text-sm text-[var(--text-muted)]">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-[var(--brand)]">
          Sign in
        </Link>
      </p>
    </form>
  );
}
