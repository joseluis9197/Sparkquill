import type { Metadata } from "next";
import PracticeSession from "@/components/practice/PracticeSession";
import { ordinal } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Practice",
  robots: { index: false, follow: false },
};

/**
 * Grade 2 mathematics practice.
 *
 * This runs the real engine with no account and no database — the session is
 * playable today, which is what makes it possible to find out whether a child
 * comes back to it before months are spent on persistence and billing.
 */
export default function PracticePage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--brand)]">
          {ordinal(2)} grade · Mathematics
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Let&rsquo;s practise</h1>
      </header>

      <PracticeSession />

      <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
        Early preview. Progress is kept for this session only and is not saved
        yet.
      </p>
    </main>
  );
}
