"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Error boundary.
 *
 * Says what a person can do about it and nothing about what went wrong
 * internally — a stack trace or a database message on this screen is an
 * information leak, not a helpful detail.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <span className="text-5xl" aria-hidden>
        🛠️
      </span>
      <h1 className="mt-4 text-3xl">Something went wrong</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        Nothing was lost. Try again, and if it keeps happening let us know.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-[var(--border)] px-8 text-base font-semibold leading-[48px]"
        >
          Go to the start
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 font-mono text-[11px] text-[var(--text-muted)]">
          Reference {error.digest}
        </p>
      )}
    </main>
  );
}
