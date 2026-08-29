"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ArrayBuilderProps {
  rows: number;
  cols: number;
  /** "groups" shows rows as equal groups; "area" shows a tiled rectangle. */
  mode?: "groups" | "area";
  /** Splits the columns to show the distributive property. */
  split?: number;
  /** Off by default: the total is the answer to most questions using this. */
  revealTotal?: boolean;
  className?: string;
}

/**
 * An array of dots or squares.
 *
 * Multiplication is repeated groups before it is a fact to recall, and this is
 * the picture that says so. The `split` mode is the distributive property made
 * visible: 7 x 13 is hard, but the same rectangle cut into 7 x 10 and 7 x 3 is
 * two facts a child already knows.
 *
 * The total is hidden unless asked for, because the total is usually the
 * answer to the question the array is illustrating.
 */
export default function ArrayBuilder({
  rows,
  cols,
  mode = "groups",
  split,
  revealTotal = false,
  className,
}: ArrayBuilderProps) {
  const [shown, setShown] = useState(revealTotal);
  const total = rows * cols;
  const hasSplit = split !== undefined && split > 0 && split < cols;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="img"
        aria-label={`${rows} rows of ${cols}`}
      >
        {Array.from({ length: rows * cols }, (_, i) => {
          const col = i % cols;
          const inFirst = hasSplit && col < split!;
          return (
            <span
              key={i}
              className={cn(
                mode === "area"
                  ? "h-6 w-6 rounded-[3px] border border-[var(--border)]"
                  : "h-5 w-5 rounded-full",
                hasSplit
                  ? inFirst
                    ? "bg-[var(--brand)]"
                    : "bg-[var(--color-grow-500)]"
                  : "bg-[var(--brand)]",
                // A visible gutter at the split, so the two parts read as two.
                hasSplit && col === split! ? "ml-2" : "",
              )}
            />
          );
        })}
      </div>

      {hasSplit ? (
        <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
          {rows} × {split} and {rows} × {cols - split!} — the same rectangle,
          split in two.
        </p>
      ) : (
        <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
          {rows} {mode === "area" ? "rows" : "groups"} of {cols}
        </p>
      )}

      {!shown ? (
        <button
          type="button"
          onClick={() => setShown(true)}
          className="compact mt-2 rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-semibold transition hover:bg-[var(--surface-2)]"
        >
          Count them for me
        </button>
      ) : (
        <p className="mt-2 font-mono text-sm font-bold tabular-nums" aria-live="polite">
          {hasSplit
            ? `${rows * split!} + ${rows * (cols - split!)} = ${total}`
            : `${total} altogether`}
        </p>
      )}
    </div>
  );
}
