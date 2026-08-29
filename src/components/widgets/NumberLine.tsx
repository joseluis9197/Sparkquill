"use client";

import { useMemo } from "react";
import { roundTo } from "@/lib/items/numbers";
import { speak } from "@/lib/audio/speak";
import { cn } from "@/lib/utils";

export interface NumberLineProps {
  /** A single value to place, typically for a rounding question. */
  value?: number;
  /** Two or more values to compare. */
  marks?: number[];
  /** Rounding place: 10 or 100. Draws the two neighbours and the midpoint. */
  place?: number;
  audio?: boolean;
  className?: string;
}

/**
 * Number line for MA.2.NSO.1.3 and MA.2.NSO.1.4.
 *
 * Rounding is taught as a rule ("five or more, round up") that children apply
 * without meaning. Drawn on a line, the answer is just which end the number is
 * nearer to, and the halfway case is visibly halfway — which is why it needs a
 * rule at all.
 *
 * It deliberately stops short of naming the answer. An earlier version printed
 * "47 is nearer to 50", which is the question, and a child quickly learns to
 * read the caption instead of the line.
 */
export default function NumberLine({
  value,
  marks,
  place,
  audio = true,
  className,
}: NumberLineProps) {
  const { lo, hi, mid, points } = useMemo(() => {
    if (value !== undefined && place) {
      const low = Math.floor(value / place) * place;
      return {
        lo: low,
        hi: low + place,
        mid: low + place / 2,
        points: [value],
      };
    }
    const all = marks ?? (value !== undefined ? [value] : [0]);
    const min = Math.min(...all);
    const max = Math.max(...all);
    // Pad the range so the marks never sit on the very ends.
    const pad = Math.max(1, Math.round((max - min) * 0.25)) || 5;
    return { lo: min - pad, hi: max + pad, mid: null as number | null, points: all };
  }, [value, marks, place]);

  const span = hi - lo || 1;
  const pos = (n: number) => ((n - lo) / span) * 100;

  const rounded = value !== undefined && place ? roundTo(value, place) : null;
  const isHalfway = value !== undefined && place ? value % place === place / 2 : false;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-5",
        className,
      )}
    >
      <div className="relative h-24">
        {/* The line itself */}
        <div className="absolute left-0 right-0 top-12 h-0.5 bg-[var(--color-ink-400)]" />

        {/* Endpoints, and the midpoint when rounding */}
        {[lo, ...(mid !== null ? [mid] : []), hi].map((n) => (
          <div
            key={n}
            className="absolute top-12 -translate-x-1/2"
            style={{ left: `${pos(n)}%` }}
          >
            <div
              className={cn(
                "mx-auto w-0.5 bg-[var(--color-ink-500)]",
                n === mid ? "h-3 opacity-60" : "h-5",
              )}
            />
            <span
              className={cn(
                "mt-1 block whitespace-nowrap text-center text-xs tabular-nums",
                n === mid
                  ? "text-[var(--text-muted)]"
                  : "font-bold text-[var(--text)]",
              )}
            >
              {n}
            </span>
          </div>
        ))}

        {/* The value(s) being placed */}
        {points.map((n, i) => (
          <div
            key={`${n}-${i}`}
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `${pos(n)}%` }}
          >
            {/*
              Dark text, not white. White on the accent orange measures
              2.78:1 — well under the 4.5:1 small text needs — and these
              pills carry the numbers the whole widget is about. Ink reads
              5.95:1 on the light accent and 9.41:1 on the dark-mode one,
              so the same choice works in both themes.
            */}
            <span className="block whitespace-nowrap rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--color-ink-900)]">
              {n}
            </span>
            <div className="mx-auto mt-1 h-6 w-0.5 bg-[var(--accent)]" />
          </div>
        ))}
      </div>

      {rounded !== null && (
        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          {isHalfway ? (
            <>
              <strong>{value}</strong> sits exactly halfway between the two.
            </>
          ) : (
            <>Which end is <strong>{value}</strong> closer to?</>
          )}
        </p>
      )}

      {marks && marks.length > 1 && (
        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          Numbers get bigger as you move to the right.
        </p>
      )}

      {audio && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() =>
              speak(
                rounded !== null
                  ? `Where does ${value} sit between ${lo} and ${hi}?`
                  : `The numbers are ${points.join(" and ")}.`,
              )
            }
            className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-3)]"
          >
            Say it
          </button>
        </div>
      )}
    </div>
  );
}
