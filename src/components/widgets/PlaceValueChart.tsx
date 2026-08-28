"use client";

import { expandedForm, numberToWords, placeValueParts } from "@/lib/items/numbers";
import { speak } from "@/lib/audio/speak";
import { cn } from "@/lib/utils";

export interface PlaceValueChartProps {
  value: number;
  /**
   * Off by default. On an expanded-form question the expansion *is* the
   * answer, so the chart must not print it beside the options.
   */
  showExpanded?: boolean;
  /** Same reasoning: the word form is the answer on a word-form question. */
  showWords?: boolean;
  audio?: boolean;
  className?: string;
}

const COLUMNS = [
  { key: "hundreds", label: "Hundreds", worth: 100 },
  { key: "tens", label: "Tens", worth: 10 },
  { key: "ones", label: "Ones", worth: 1 },
] as const;

/**
 * Place value chart for MA.2.NSO.1.1 and MA.2.NSO.1.2.
 *
 * Shows each digit next to what it is actually worth. The classic error is
 * reading 342 as "three, four, two" rather than three hundreds, four tens and
 * two ones, and the whole chart exists to make that difference visible.
 *
 * The expanded and word forms are opt-in for a reason: on the questions that
 * ask for exactly those, printing them next to the options answers the
 * question for the child.
 */
export default function PlaceValueChart({
  value,
  showExpanded = false,
  showWords = false,
  audio = true,
  className,
}: PlaceValueChartProps) {
  const parts = placeValueParts(value);

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-4",
        className,
      )}
    >
      <div className="grid grid-cols-3 overflow-hidden rounded-[var(--radius-tile)] border border-[var(--border)]">
        {COLUMNS.map((col) => {
          const digit = parts[col.key];
          return (
            <div
              key={col.key}
              className="border-r border-[var(--border)] bg-[var(--surface)] last:border-r-0"
            >
              <p className="border-b border-[var(--border)] bg-[var(--surface-3)] py-1.5 text-center text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                {col.label}
              </p>
              <p className="py-3 text-center font-display text-4xl font-semibold tabular-nums">
                {digit}
              </p>
              <p className="border-t border-[var(--border)] py-1.5 text-center text-xs tabular-nums text-[var(--text-muted)]">
                {digit === 0 ? (
                  // A zero is a placeholder, not nothing — saying "worth 0"
                  // is what stops a child dropping it and writing 35 for 305.
                  <span>holds the place</span>
                ) : (
                  <>worth {digit * col.worth}</>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {showExpanded && (
        <p className="mt-3 text-center font-mono text-sm">{expandedForm(value)}</p>
      )}
      {showWords && (
        <p className="mt-1 text-center text-sm text-[var(--text-muted)]">
          {numberToWords(value)}
        </p>
      )}

      {audio && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => speak(numberToWords(value))}
            className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-3)]"
          >
            Say the number
          </button>
        </div>
      )}
    </div>
  );
}
