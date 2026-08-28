"use client";

import { useState } from "react";
import { placeValueParts } from "@/lib/items/numbers";
import { speak } from "@/lib/audio/speak";
import { cn } from "@/lib/utils";

export interface BaseTenBlocksProps {
  a: number;
  b?: number;
  operation?: "add" | "subtract" | "show";
  audio?: boolean;
  className?: string;
}

/**
 * Base-ten blocks for MA.2.NSO.2.3 and the place-value benchmarks.
 *
 * Deliberately does not compute the answer. The two numbers are shown as
 * separate piles; the child chooses to combine them, and then chooses to trade
 * ten ones for a rod. At no point does the widget state the total — a
 * manipulative that prints "that makes 72" has done the question instead of
 * teaching it, and the child learns to look at the caption rather than the
 * blocks.
 *
 * What it does make visible is the carry: ten loose ones becoming one rod is
 * the thing children repeat as a rule without ever having seen it happen.
 */
export default function BaseTenBlocks({
  a,
  b,
  operation = "show",
  audio = true,
  className,
}: BaseTenBlocksProps) {
  const [combined, setCombined] = useState(false);
  const [traded, setTraded] = useState(false);

  const twoNumbers = operation !== "show" && b !== undefined;
  const aParts = placeValueParts(a);
  const bParts = b !== undefined ? placeValueParts(b) : null;

  if (!twoNumbers) {
    return (
      <Frame className={className}>
        <Piles parts={aParts} />
        <Caption>{a}</Caption>
      </Frame>
    );
  }

  // Combined but not yet traded: the ones column deliberately holds more than
  // nine, because that pile is the problem the child has to resolve.
  const looseOnes = aParts.ones + bParts!.ones;
  const needsTrade = operation === "add" && looseOnes >= 10;

  const merged = traded
    ? {
        hundreds: aParts.hundreds + bParts!.hundreds,
        tens: aParts.tens + bParts!.tens + Math.floor(looseOnes / 10),
        ones: looseOnes % 10,
      }
    : {
        hundreds: aParts.hundreds + bParts!.hundreds,
        tens: aParts.tens + bParts!.tens,
        ones: looseOnes,
      };

  return (
    <Frame className={className}>
      {!combined ? (
        <div className="space-y-3">
          <Labelled label={String(a)}>
            <Piles parts={aParts} />
          </Labelled>
          <Labelled label={String(b)}>
            <Piles parts={bParts!} />
          </Labelled>
          {operation === "add" && (
            <button
              type="button"
              onClick={() => setCombined(true)}
              className="w-full rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-[var(--brand-contrast)] transition hover:opacity-90"
            >
              Put them together
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Piles parts={merged} highlightExtraOnes={needsTrade && !traded} />
          {needsTrade && !traded && (
            <div className="rounded-[var(--radius-tile)] bg-[var(--surface)] p-3">
              <p className="text-sm">
                There are more than ten ones now. Ten of them can be traded for
                one rod.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTraded(true);
                  if (audio) speak("Ten ones become one ten.");
                }}
                className="mt-3 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
              >
                Trade ten ones for one ten
              </button>
            </div>
          )}
          {traded && (
            <p aria-live="polite" className="text-sm font-semibold text-[var(--brand)]">
              Ten ones became one rod. Now count what is left.
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setCombined(false);
              setTraded(false);
            }}
            className="compact w-full rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold transition hover:bg-[var(--surface-3)]"
          >
            Start again
          </button>
        </div>
      )}

      <Caption>
        {a} {operation === "add" ? "+" : "−"} {b}
      </Caption>
    </Frame>
  );
}

function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Labelled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-tile)] bg-[var(--surface)] p-2">
      <p className="mb-1 text-center font-mono text-xs font-medium text-[var(--text-muted)]">
        {label}
      </p>
      {children}
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-center font-mono text-sm text-[var(--text-muted)]">
      {children}
    </p>
  );
}

function Piles({
  parts,
  highlightExtraOnes,
}: {
  parts: { hundreds: number; tens: number; ones: number };
  highlightExtraOnes?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Column label="Hundreds">
        {Array.from({ length: parts.hundreds }, (_, i) => (
          <Flat key={i} />
        ))}
      </Column>
      <Column label="Tens">
        {Array.from({ length: parts.tens }, (_, i) => (
          <Rod key={i} />
        ))}
      </Column>
      <Column label="Ones">
        {Array.from({ length: parts.ones }, (_, i) => (
          <Unit key={i} highlight={highlightExtraOnes && i >= 10} />
        ))}
      </Column>
    </div>
  );
}

function Column({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </p>
      <div className="flex min-h-16 flex-wrap content-start justify-center gap-1 rounded-[var(--radius-tile)] bg-[var(--surface-3)] p-1.5">
        {children}
      </div>
    </div>
  );
}

/** A hundred-flat drawn as a real 10x10 grid, not an undifferentiated square. */
function Flat() {
  return (
    <svg viewBox="0 0 20 20" className="h-9 w-9" aria-hidden>
      <rect width="20" height="20" className="fill-[var(--color-tide-200)]" />
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <line x1={i * 2} y1="0" x2={i * 2} y2="20" className="stroke-[var(--color-tide-600)]" strokeWidth="0.3" />
          <line x1="0" y1={i * 2} x2="20" y2={i * 2} className="stroke-[var(--color-tide-600)]" strokeWidth="0.3" />
        </g>
      ))}
    </svg>
  );
}

function Rod() {
  return (
    <svg viewBox="0 0 4 20" className="h-9 w-2" aria-hidden>
      <rect width="4" height="20" className="fill-[var(--color-tide-300)]" />
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={i}
          x1="0"
          y1={i * 2}
          x2="4"
          y2={i * 2}
          className="stroke-[var(--color-tide-700)]"
          strokeWidth="0.25"
        />
      ))}
    </svg>
  );
}

function Unit({ highlight }: { highlight?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-2.5 w-2.5 rounded-[2px]",
        highlight ? "bg-[var(--color-spark-400)]" : "bg-[var(--color-tide-400)]",
      )}
    />
  );
}
