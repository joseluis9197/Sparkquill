import type { Metadata } from "next";
import Link from "next/link";
import { consumeVerification } from "@/lib/auth/verification";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

/**
 * The page a confirmation link lands on.
 *
 * Every outcome says what happened and what to do next. An expired link is
 * the common case — people open email on Monday that arrived on Friday — and
 * telling them only "invalid link" leaves them stuck with no idea whether
 * they typed something wrong or waited too long.
 */
export default async function VerifyPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.searchParams;
  const raw = params.token;
  const token = Array.isArray(raw) ? raw[0] : raw;

  if (!token) {
    return (
      <Shell title="That link is incomplete">
        <p>
          The address seems to have been cut short — some email apps break long
          links across lines. Try opening it again from the email, or ask for a
          new one from your dashboard.
        </p>
      </Shell>
    );
  }

  const result = await consumeVerification(token);

  if (result.ok) {
    return (
      <Shell title={result.alreadyDone ? "Already confirmed" : "Email confirmed"}>
        <p>
          {result.alreadyDone
            ? `${result.email} was already confirmed. Nothing more to do.`
            : `${result.email} is confirmed. If you ever need to reset your password, the link will reach you.`}
        </p>
      </Shell>
    );
  }

  if (result.reason === "expired") {
    return (
      <Shell title="That link has expired">
        <p>
          Confirmation links last 48 hours. Sign in and use{" "}
          <strong>Resend confirmation</strong> on your dashboard for a new one —
          it takes a moment and your account has been working the whole time.
        </p>
      </Shell>
    );
  }

  return (
    <Shell title="We could not use that link">
      <p>
        It may have already been used, or replaced by a newer one. If you have
        asked for more than one confirmation email, only the most recent link
        works. Sign in and send a fresh one.
      </p>
    </Shell>
  );
}

function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="text-3xl">{title}</h1>
      <div className="mt-4 text-[var(--text-muted)]">{children}</div>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/parent"
          className="rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px]"
        >
          Go to my dashboard
        </Link>
        <Link
          href="/students"
          className="rounded-full border border-[var(--border)] px-8 text-base font-semibold leading-[48px]"
        >
          Choose a profile
        </Link>
      </div>
    </main>
  );
}
