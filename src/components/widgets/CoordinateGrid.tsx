"use client";

import { cn } from "@/lib/utils";

export interface CoordinateGridProps {
  points: { x: number; y: number }[];
  min?: number;
  max?: number;
  /** Joins the points in order, closing the shape. */
  connect?: boolean;
  className?: string;
}

/**
 * A coordinate grid, in one quadrant or all four.
 *
 * Whether the axes cross in the middle or sit at the bottom left is decided by
 * the data: a grade 5 question lives in Quadrant I, and drawing all four
 * quadrants for it would introduce negative numbers a year early.
 *
 * Points are labelled with their coordinates because the ordered pair is the
 * thing being learned — but the label is placed beside the dot rather than
 * replacing it, so a child still has to read the position.
 */
export default function CoordinateGrid({
  points,
  min = 0,
  max = 10,
  connect = false,
  className,
}: CoordinateGridProps) {
  const size = 260;
  const pad = 26;
  const span = max - min || 1;
  const step = (size - pad * 2) / span;

  const sx = (x: number) => Math.round((pad + (x - min) * step) * 100) / 100;
  const sy = (y: number) => Math.round((size - pad - (y - min) * step) * 100) / 100;

  // A tick every unit is unreadable past about twelve; thin them out.
  const every = span <= 12 ? 1 : span <= 25 ? 5 : 10;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / every) * every; v <= max; v += every) ticks.push(v);

  const originX = sx(Math.max(min, Math.min(max, 0)));
  const originY = sy(Math.max(min, Math.min(max, 0)));

  return (
    <div className={cn("flex justify-center", className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-64 w-64"
        role="img"
        aria-label={`Grid with ${points.length} point${points.length === 1 ? "" : "s"}`}
      >
        {/* Grid lines */}
        {ticks.map((v) => (
          <g key={`g${v}`}>
            <line x1={sx(v)} y1={pad} x2={sx(v)} y2={size - pad} stroke="var(--border)" strokeWidth={0.6} />
            <line x1={pad} y1={sy(v)} x2={size - pad} y2={sy(v)} stroke="var(--border)" strokeWidth={0.6} />
          </g>
        ))}

        {/* Axes, drawn through zero when zero is on the grid */}
        <line x1={pad} y1={originY} x2={size - pad} y2={originY} stroke="var(--text-muted)" strokeWidth={1.6} />
        <line x1={originX} y1={pad} x2={originX} y2={size - pad} stroke="var(--text-muted)" strokeWidth={1.6} />

        {/* Tick labels */}
        {ticks.map((v) =>
          v === 0 ? null : (
            <g key={`t${v}`}>
              <text x={sx(v)} y={originY + 12} textAnchor="middle" className="fill-[var(--text-muted)] text-[8px]">
                {v}
              </text>
              <text x={originX - 6} y={sy(v) + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px]">
                {v}
              </text>
            </g>
          ),
        )}

        {connect && points.length > 2 && (
          <polygon
            points={points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}
            className="fill-[var(--brand)]/15"
            stroke="var(--brand)"
            strokeWidth={1.8}
          />
        )}
        {connect && points.length === 2 && (
          <line
            x1={sx(points[0].x)}
            y1={sy(points[0].y)}
            x2={sx(points[1].x)}
            y2={sy(points[1].y)}
            stroke="var(--brand)"
            strokeWidth={1.8}
          />
        )}

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={4.5} className="fill-[var(--brand)]" />
            <text
              x={sx(p.x) + 7}
              y={sy(p.y) - 6}
              className="fill-[var(--text)] text-[9px] font-bold"
            >
              ({p.x}, {p.y})
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
