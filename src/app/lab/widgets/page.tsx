import type { Metadata } from "next";
import WidgetGallery from "./WidgetGallery";

export const metadata: Metadata = {
  title: "Widget lab",
  robots: { index: false, follow: false },
};

/**
 * Internal workbench for the 2D manipulatives. Not linked from the app and not
 * indexed — it exists so each widget can be exercised on its own, without
 * having to reach it through a practice session.
 */
export default function WidgetsLabPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
        Internal · widget lab
      </p>
      <h1 className="mt-3 text-3xl">Manipulatives</h1>
      <p className="mt-3 max-w-prose text-[var(--text-muted)]">
        Each of these is attached to real questions by the generators. None of
        them states the answer: they give the child something to work with, not
        something to read off.
      </p>
      <WidgetGallery />
    </main>
  );
}
