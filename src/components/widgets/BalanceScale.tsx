"use client";

import { cn } from "@/lib/utils";

export interface BalanceScaleProps {
  /** What each pan reads. A `null` side is the one being solved for. */
  leftLabel: string;
  rightLabel: string;
  /**
   * The two weights, when both are known. Left undefined when one side
   * contains the unknown — the beam then stays level, because tipping it
   * would silently tell the child which way the answer goes.
   */
  left?: number;
  right?: number;
  className?: string;
}

/**
 * A pan balance for equations.
 *
 * The equals sign is read by most children as "and here comes the answer",
 * which is why 8 + 4 = ? + 5 defeats them. A balance says what it actually
 * means: the two sides weigh the same, or they do not, and you can see which
 * way it tips.
 *
 * The beam tilts by the real difference, capped so a large gap does not tip it
 * off the picture — the direction is the information, not the angle.
 */
export default function BalanceScale({
  left,
  right,
  leftLabel,
  rightLabel,
  className,
}: BalanceScaleProps) {
  const known = left !== undefined && right !== undefined;
  const diff = known ? left - right : 0;
  const tilt = known ? Math.max(-12, Math.min(12, diff * 1.5)) : 0;
  const balanced = known && diff === 0;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        viewBox="0 0 240 130"
        className="h-32 w-64"
        role="img"
        aria-label={
          !known
            ? `A balance with ${leftLabel} on one side and ${rightLabel} on the other`
            : balanced
              ? "The scale is balanced"
              : `The ${diff > 0 ? "left" : "right"} side is heavier`
        }
      >
        {/* Stand */}
        <polygon points="112,110 128,110 124,44 116,44" className="fill-[var(--border)]" />
        <rect x="96" y="110" width="48" height="6" rx="3" className="fill-[var(--border)]" />

        <g transform={`rotate(${tilt} 120 44)`}>
          <rect x="30" y="41" width="180" height="6" rx="3" className="fill-[var(--text-muted)]" />
          {/* Pans */}
          <line x1="42" y1="47" x2="42" y2="66" stroke="var(--text-muted)" strokeWidth={2} />
          <path d="M 18 66 h 48 l -8 18 h -32 Z" className="fill-[var(--surface-2)]" stroke="var(--border)" strokeWidth={2} />
          <text x="42" y="80" textAnchor="middle" className="fill-[var(--text)] text-[12px] font-bold">
            {leftLabel}
          </text>

          <line x1="198" y1="47" x2="198" y2="66" stroke="var(--text-muted)" strokeWidth={2} />
          <path d="M 174 66 h 48 l -8 18 h -32 Z" className="fill-[var(--surface-2)]" stroke="var(--border)" strokeWidth={2} />
          <text x="198" y="80" textAnchor="middle" className="fill-[var(--text)] text-[12px] font-bold">
            {rightLabel}
          </text>
        </g>
        <circle cx="120" cy="44" r="5" className="fill-[var(--brand)]" />
      </svg>

      <p className="mt-1 text-center text-sm text-[var(--text-muted)]">
        {!known
          ? "The equals sign means both pans weigh the same. What makes them match?"
          : balanced
            ? "The sides weigh the same, so the equation is true."
            : "The sides do not weigh the same, so the equation is false."}
      </p>
    </div>
  );
}
