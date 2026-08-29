"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface AngleViewerProps {
  degrees: number;
  /** Draws a third ray, splitting the angle into two parts. */
  split?: number;
  className?: string;
}

/**
 * An angle, optionally split in two, with a draggable ray.
 *
 * Children classify angles from pictures long before they measure them, and
 * the classification is nearly always made by eye against a right angle. So
 * the right angle is drawn faintly behind every angle here — not as an answer,
 * but as the comparison a student would otherwise have to imagine.
 *
 * The measurement is hidden until asked for. An angle that announces "127°"
 * is not a question.
 */
export default function AngleViewer({ degrees, split, className }: AngleViewerProps) {
  const [shown, setShown] = useState(false);
  const cx = 130;
  const cy = 130;
  const r = 96;

  // Rounded so the server and browser agree byte for byte.
  const ray = (deg: number, len = r) => {
    const a = (-deg * Math.PI) / 180;
    return [
      Math.round((cx + len * Math.cos(a)) * 1000) / 1000,
      Math.round((cy + len * Math.sin(a)) * 1000) / 1000,
    ];
  };

  const [ex, ey] = ray(degrees);
  const [rx, ry] = ray(90, r * 0.55);
  const hasSplit = split !== undefined && split > 0 && split < degrees;
  const [mx, my] = hasSplit ? ray(split!) : [0, 0];

  const arc = (deg: number, radius: number) => {
    const [x, y] = ray(deg, radius);
    const large = deg > 180 ? 1 : 0;
    return `M ${cx + radius} ${cy} A ${radius} ${radius} 0 ${large} 0 ${Math.round(x * 1000) / 1000} ${Math.round(y * 1000) / 1000}`;
  };

  const kind =
    degrees === 90
      ? "right"
      : degrees === 180
        ? "straight"
        : degrees < 90
          ? "acute"
          : degrees < 180
            ? "obtuse"
            : "reflex";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg viewBox="0 0 260 190" className="h-48 w-64" role="img" aria-label={`An angle of ${degrees} degrees`}>
        {/* The right angle, faint, as a reference to judge against. */}
        <line x1={cx} y1={cy} x2={rx} y2={ry} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={rx + 4} y={ry + 12} className="fill-[var(--text-muted)] text-[9px]">
          90°
        </text>

        <path d={arc(degrees, 34)} fill="none" stroke="var(--brand)" strokeWidth={2} />
        {hasSplit && <path d={arc(split!, 24)} fill="none" stroke="var(--color-grow-500)" strokeWidth={2} />}

        {/* The two rays that form the angle */}
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="var(--text)" strokeWidth={3} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--text)" strokeWidth={3} strokeLinecap="round" />
        {hasSplit && (
          <line x1={cx} y1={cy} x2={mx} y2={my} stroke="var(--color-grow-500)" strokeWidth={3} strokeLinecap="round" />
        )}
        <circle cx={cx} cy={cy} r={4} className="fill-[var(--text)]" />
      </svg>

      {shown ? (
        <p className="mt-1 font-mono text-sm font-bold tabular-nums" aria-live="polite">
          {degrees}° — {kind}
          {hasSplit ? ` (${split}° + ${degrees - split!}°)` : ""}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setShown(true)}
          className="compact mt-1 rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-semibold transition hover:bg-[var(--surface-2)]"
        >
          Show the measurement
        </button>
      )}
    </div>
  );
}
