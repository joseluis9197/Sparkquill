import type { Metadata } from "next";
import Link from "next/link";
import { checkResetToken } from "@/lib/auth/reset-tokens";
import ResetPasswordForm from "./ResetPasswordForm";

// Neutral, because this route also renders the "link is dead" state.
export const metadata: Metadata = { title: "Reset your password" };

/**
 * The token is validated here as well as on submit.
 *
 * Checking on load means an expired link says so immediately, instead of after
 * the parent has typed a new password twice.
 */
export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await props.searchParams;

  if (!token) {
    return <Invalid message="This link is missing its code." />;
  }

  const check = await checkResetToken(token);
  if (!check.valid) {
    return (
      <Invalid
        message={
          check.reason === "expired"
            ? "This link has expired. They last an hour."
            : check.reason === "used"
              ? "This link has already been used."
              : "This link is not valid."
        }
      />
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl">Choose a new password</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        Pick something you have not used elsewhere. At least 10 characters.
      </p>
      <div className="mt-8">
        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}

function Invalid({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      <span className="text-5xl" aria-hidden>
        🔑
      </span>
      <h1 className="mt-4 text-3xl">That link will not work</h1>
      <p className="mt-3 text-[var(--text-muted)]">{message}</p>
      <Link
        href="/forgot-password"
        className="mt-8 inline-block rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px]"
      >
        Send me a new one
      </Link>
    </main>
  );
}
