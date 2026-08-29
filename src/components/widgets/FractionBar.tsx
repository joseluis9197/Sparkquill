"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FractionBarProps {
  /** Single fraction: how many parts, and how many are shaded. */
  denominator?: number;
  shaded?: number;
  shape?: "circle" | "rectangle" | "strip";
  /** Two fractions drawn on equal-width bars, for comparison. */
  compare?: { n: number; d: number }[];
  className?: string;
}

/**
 * Fraction bars and circles.
 *
 * The point of drawing two fractions on bars of the *same width* is that it
 * makes the size of a piece visible. A child who believes 1/8 is bigger than
 * 1/4 because 8 is bigger has never had a reason to doubt it; two bars of
 * equal length settle the question without an argument.
 *
 * The pieces are clickable so a child can shade and unshade them. Nothing is
 * scored — the point is to let them count, and to let them discover that
 * shading four eighths reaches the same place as one half.
 */
export default function FractionBar({
  denominator,
  shaded = 0,
  shape = "rectangle",
  compare,
  className,
}: FractionBarProps) {
  if (compare && compare.length >= 2) {
    return (
      <div className={cn("space-y-3", className)}>
        {compare.slice(0, 2).map((f, i) => (
          <ComparisonBar key={i} n={f.n} d={f.d} />
        ))}
        <p className="text-center text-xs text-[var(--text-muted)]">
          Both bars are the same length, so you are comparing the shaded amount.
        </p>
      </div>
    );
  }

  if (!denominator) return null;

  return shape === "circle" ? (
    <FractionCircle d={denominator} initial={shaded} className={className} />
  ) : (
    <InteractiveBar d={denominator} initial={shaded} className={className} />
  );
}

/** Non-interactive, because a comparison the child can change is not one. */
function ComparisonBar({ n, d }: { n: number; d: number }) {
  return (
    <div>
      <div className="flex h-11 w-full overflow-hidden rounded-[var(--radius-tile)] border-2 border-[var(--border)]">
        {Array.from({ length: d }, (_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 border-r border-[var(--border)] last:border-r-0",
              i < n ? "bg-[var(--brand)]" : "bg-[var(--surface-2)]",
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-center font-mono text-sm font-bold tabular-nums">
        {n}/{d}
      </p>
    </div>
  );
}

function InteractiveBar({
  d,
  initial,
  className,
}: {
  d: number;
  initial: number;
  className?: string;
}) {
  const [on, setOn] = useState<boolean[]>(() =>
    Array.from({ length: d }, (_, i) => i < initial),
  );
  const count = on.filter(Boolean).length;

  return (
    <div className={cn("", className)}>
      <div className="flex h-14 w-full overflow-hidden rounded-[var(--radius-tile)] border-2 border-[var(--border)]">
        {on.map((isOn, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Piece ${i + 1} of ${d}, ${isOn ? "shaded" : "not shaded"}`}
            aria-pressed={isOn}
            onClick={() =>
              setOn((prev) => prev.map((v, j) => (j === i ? !v : v)))
            }
            className={cn(
              "flex-1 border-r border-[var(--border)] transition last:border-r-0",
              isOn
                ? "bg-[var(--brand)]"
                : "bg-[var(--surface-2)] hover:bg-[var(--surface)]",
            )}
          />
        ))}
      </div>
      <p
        className="mt-2 text-center text-sm text-[var(--text-muted)]"
        aria-live="polite"
      >
        {count} of {d} {count === 1 ? "piece" : "pieces"} shaded
      </p>
    </div>
  );
}

function FractionCircle({
  d,
  initial,
  className,
}: {
  d: number;
  initial: number;
  className?: string;
}) {
  const [on, setOn] = useState<boolean[]>(() =>
    Array.from({ length: d }, (_, i) => i < initial),
  );
  const count = on.filter(Boolean).length;
  const r = 62;
  const cx = 70;
  const cy = 70;

  // Rounded so the server and the browser produce identical markup. Full
  // precision trigonometry serialises differently in the two, which React
  // reports as a hydration mismatch.
  const point = (i: number) => {
    const a = (i / d) * Math.PI * 2 - Math.PI / 2;
    return [
      Math.round((cx + r * Math.cos(a)) * 1000) / 1000,
      Math.round((cy + r * Math.sin(a)) * 1000) / 1000,
    ];
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg viewBox="0 0 140 140" className="h-40 w-40" role="img" aria-label={`Circle in ${d} equal parts, ${count} shaded`}>
        {on.map((isOn, i) => {
          const [x1, y1] = point(i);
          const [x2, y2] = point(i + 1);
          const large = 1 / d > 0.5 ? 1 : 0;
          return (
            <path
              key={i}
              d={d === 1
                ? `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`
                : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              className={cn(
                "cursor-pointer transition",
                isOn ? "fill-[var(--brand)]" : "fill-[var(--surface-2)]",
              )}
              stroke="var(--border)"
              strokeWidth={2}
              onClick={() =>
                setOn((prev) => prev.map((v, j) => (j === i ? !v : v)))
              }
            />
          );
        })}
      </svg>
      <p className="mt-1 text-sm text-[var(--text-muted)]" aria-live="polite">
        {count} of {d} shaded
      </p>
    </div>
  );
}
