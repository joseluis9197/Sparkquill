import type { Metadata } from "next";
import FormatGallery from "./FormatGallery";

export const metadata: Metadata = {
  title: "Item format lab",
  robots: { index: false, follow: false },
};

/**
 * Every item format, side by side.
 *
 * FAST does not ask everything as multiple choice, and a student who has only
 * practised four-option questions arrives fluent at elimination. This page
 * exists so each format can be looked at, answered and argued about without
 * hunting for one in a live session — the same reason the widget lab exists.
 */
export default function FormatLabPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl">Item formats</h1>
      <p className="mt-3 max-w-prose text-[var(--text-muted)]">
        One live example of each format FAST uses. Every one is scored by the
        same engine the real session uses; nothing here is saved.
      </p>
      <FormatGallery />
    </main>
  );
}
