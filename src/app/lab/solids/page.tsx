import type { Metadata } from "next";
import SolidLab from "./SolidLab";

export const metadata: Metadata = {
  title: "Solid Explorer",
  robots: { index: false, follow: false },
};

/**
 * Internal workbench for the 3D manipulative. Not linked from the app and
 * not indexed — it exists so the widget can be exercised against every solid
 * without needing a student account and a live practice session.
 */
export default function SolidsLabPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
        Internal · widget lab
      </p>
      <h1 className="mt-3 text-3xl">Solid Explorer</h1>
      <p className="mt-3 max-w-prose text-[var(--text-muted)]">
        Drag to turn the shape. Tap a face to count it, or use the numbered
        buttons underneath — both do the same thing, so the manipulative works
        with a mouse, a finger or a keyboard.
      </p>
      <SolidLab />
    </main>
  );
}
