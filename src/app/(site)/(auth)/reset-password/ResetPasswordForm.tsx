"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPassword, type ResetState } from "@/app/actions/password-reset";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    async (prev, fd) => {
      const result = await resetPassword(prev, fd);
      // No error means the password changed; send them to sign in with it.
      if (!result.error) router.push("/login?reset=done");
      return result;
    },
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">New password</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          autoFocus
          className="w-full rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base transition focus:border-[var(--brand)]"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">
          Type it again
        </span>
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
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
        {pending ? "Saving…" : "Save and sign in"}
      </button>

      <p className="pt-2 text-center text-sm text-[var(--text-muted)]">
        <Link href="/login" className="font-semibold text-[var(--brand)]">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
