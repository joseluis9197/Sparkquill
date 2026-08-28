"use client";

import { useState } from "react";
import { SHAPES, type ShapeKey } from "@/lib/geometry/shapes-2d";
import { cn } from "@/lib/utils";

export interface ShapeViewerProps {
  shape: ShapeKey;
  /** What the question is about. Drives which parts can be tapped. */
  highlight?: "sides" | "vertices" | "symmetry";
  className?: string;
}

/**
 * A 2D figure the child can count on.
 *
 * Tapping a side or a vertex marks it, which is the whole point: counting
 * round a closed figure is where children lose track and count the starting
 * corner twice. Marking them removes the memory problem and leaves the actual
 * skill.
 *
 * Deliberately does not print the total. The question asks for it.
 */
export default function ShapeViewer({
  shape,
  highlight = "sides",
  className,
}: ShapeViewerProps) {
  const info = SHAPES[shape];
  const [marked, setMarked] = useState<Set<number>>(new Set());

  const points = info.points
    ? info.points.split(" ").map((p) => {
        const [x, y] = p.split(",").map(Number);
        return { x, y };
      })
    : [];

  const toggle = (i: number) =>
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const countable = highlight !== "symmetry" && points.length > 0;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-4",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className="mx-auto h-52 w-52 touch-none select-none"
        role="img"
        aria-label={`A ${info.name}`}
      >
        {info.points ? (
          <polygon
            points={info.points}
            className="fill-[var(--color-tide-200)] stroke-[var(--color-tide-700)]"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        ) : shape === "circle" ? (
          <circle
            cx="50"
            cy="50"
            r="40"
            className="fill-[var(--color-tide-200)] stroke-[var(--color-tide-700)]"
            strokeWidth="1.5"
          />
        ) : (
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="28"
            className="fill-[var(--color-tide-200)] stroke-[var(--color-tide-700)]"
            strokeWidth="1.5"
          />
        )}

        {/* Lines of symmetry, drawn only when that is the question. */}
        {highlight === "symmetry" &&
          info.linesOfSymmetry > 0 &&
          points.length > 0 && (
            <g className="stroke-[var(--color-spark-500)]" strokeWidth="0.9" strokeDasharray="3 2">
              {symmetryLines(points, info.linesOfSymmetry).map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
              ))}
            </g>
          )}

        {/* Tappable sides */}
        {countable &&
          highlight === "sides" &&
          points.map((p, i) => {
            const q = points[(i + 1) % points.length];
            return (
              <line
                key={i}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                onClick={() => toggle(i)}
                className={cn(
                  "cursor-pointer",
                  marked.has(i)
                    ? "stroke-[var(--color-spark-500)]"
                    : "stroke-transparent",
                )}
                strokeWidth="4"
                strokeLinecap="round"
              />
            );
          })}

        {/* Tappable vertices */}
        {countable &&
          highlight === "vertices" &&
          points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              onClick={() => toggle(i)}
              className={cn(
                "cursor-pointer",
                marked.has(i)
                  ? "fill-[var(--color-spark-500)]"
                  : "fill-[var(--color-tide-700)]",
              )}
            />
          ))}
      </svg>

      {countable && (
        <div className="mt-2 text-center">
          <p aria-live="polite" className="text-sm text-[var(--text-muted)]">
            {marked.size === 0
              ? `Tap each ${highlight === "sides" ? "side" : "corner"} to keep count.`
              : `Marked ${marked.size} so far.`}
          </p>
          {marked.size > 0 && (
            <button
              type="button"
              onClick={() => setMarked(new Set())}
              className="compact mt-2 rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-3)]"
            >
              Start again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Lines of symmetry for a regular polygon drawn from its vertices.
 *
 * Through each vertex for an odd number of sides; alternating vertex and
 * side-midpoint for an even number. Only used for the regular figures, which
 * is why the trapezoid and rectangle are handled by their own entries in the
 * shape table rather than derived here.
 */
function symmetryLines(
  points: { x: number; y: number }[],
  count: number,
): { x1: number; y1: number; x2: number; y2: number }[] {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const cx = 50;
  const cy = 50;
  for (let i = 0; i < Math.min(count, points.length); i++) {
    const p = points[i];
    // Extend from the vertex through the centre and out the other side.
    lines.push({
      x1: p.x,
      y1: p.y,
      x2: Math.round((2 * cx - p.x) * 100) / 100,
      y2: Math.round((2 * cy - p.y) * 100) / 100,
    });
  }
  return lines;
}
