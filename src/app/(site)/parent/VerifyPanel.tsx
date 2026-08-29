"use client";

import { useActionState } from "react";
import { resendVerification, type VerifyState } from "@/app/actions/verify-email";

/**
 * The standing reminder for an unconfirmed address.
 *
 * Deliberately a notice rather than a block. The account works, the child can
 * practise, and the card has been taken — stopping any of that over an unread
 * email would punish the parent for something that costs them nothing until
 * the day it costs them everything.
 *
 * What it does say is the actual consequence, once, in plain terms: if the
 * address is wrong, the password reset link goes somewhere you cannot read.
 * "Please verify your email" tells a parent nothing about why they should
 * care, and gets dismissed.
 */
export default function VerifyPanel({ email }: { email: string }) {
  const [state, action, pending] = useActionState<VerifyState, FormData>(
    resendVerification,
    {},
  );

  return (
    <div className="mt-6 rounded-[var(--radius-tile)] border-l-4 border-[var(--accent)] bg-[var(--surface-2)] px-5 py-4">
      <p className="font-bold">Confirm your email address</p>
      <p className="mt-1 max-w-prose text-[15px] text-[var(--text-muted)]">
        We sent a link to <span className="font-semibold">{email}</span>. Until
        it is confirmed we cannot be sure the address is right — and if it is
        not, the &ldquo;forgot password&rdquo; link would go somewhere you
        cannot read, with no way back into your account.
      </p>

      {state.sent && (
        <p role="status" className="mt-3 text-sm font-semibold text-[var(--color-grow-500)]">
          Sent. Check your inbox, and your spam folder.
        </p>
      )}
      {state.error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-[var(--color-ember-500)]">
          {state.error}
        </p>
      )}
      {state.unavailable && (
        <p role="alert" className="mt-3 text-sm text-[var(--text-muted)]">
          Email is not configured on this deployment, so nothing can be sent.
        </p>
      )}

      <form action={action} className="mt-3">
        <button
          type="submit"
          disabled={pending}
          className="compact rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-semibold transition hover:bg-[var(--surface-2)] disabled:opacity-60"
        >
          {pending ? "Sending…" : "Resend confirmation"}
        </button>
      </form>
    </div>
  );
}
