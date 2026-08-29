import type { Reveal } from "@/lib/items/public";

/**
 * Styling shared by every option a student can pick.
 *
 * Colour is never the only signal: a right answer is also the one still at
 * full opacity with a heavier border, so the panel reads for a child who
 * cannot distinguish the green from the red.
 */
export function optionClasses(opts: {
  answered: boolean;
  chosen: boolean;
  correct: boolean;
}): string {
  const { answered, chosen, correct } = opts;
  if (!answered) {
    return "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:bg-[var(--surface-2)]";
  }
  if (correct) {
    return "border-[var(--color-grow-500)] bg-[var(--color-grow-100)] text-[var(--color-ink-900)]";
  }
  if (chosen) {
    return "border-[var(--color-ember-500)] bg-[var(--color-ember-100)] text-[var(--color-ink-900)]";
  }
  return "border-[var(--border)] opacity-45";
}

/** The ids the server said were right, or an empty set before it has said. */
export function revealedIds(reveal: Reveal | null): Set<string> {
  if (reveal?.kind === "ids") return new Set(reveal.ids);
  return new Set();
}
