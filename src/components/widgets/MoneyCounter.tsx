"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface MoneyCounterProps {
  coins: { value: number; count: number }[];
  className?: string;
}

const COIN = {
  1: { name: "penny", plural: "pennies", size: 32, tint: "#b5744a" },
  5: { name: "nickel", plural: "nickels", size: 38, tint: "#9aa2a8" },
  10: { name: "dime", plural: "dimes", size: 28, tint: "#a8b0b6" },
  25: { name: "quarter", plural: "quarters", size: 44, tint: "#8f979d" },
} as const;

/**
 * Coins, drawn at their real relative sizes.
 *
 * The sizes matter. A dime is smaller than a nickel and worth twice as much,
 * and that is genuinely confusing to a six-year-old who has been told all year
 * that bigger means more. Drawing them to scale puts the contradiction in
 * front of the child instead of leaving it as an abstract fact.
 *
 * Coins are clickable, and the running total appears only as they are chosen,
 * so counting on from the largest coin is something a child does rather than
 * something they are told to do.
 */
export default function MoneyCounter({ coins, className }: MoneyCounterProps) {
  const flat = coins.flatMap((c) =>
    Array.from({ length: c.count }, (_, i) => ({ value: c.value, id: `${c.value}-${i}` })),
  );
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const total = flat
    .filter((c) => picked.has(c.id))
    .reduce((sum, c) => sum + c.value, 0);

  return (
    <div className={cn("", className)}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {flat.map((c) => {
          const meta = COIN[c.value as keyof typeof COIN];
          const on = picked.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-label={`${meta.name}, ${c.value} cents${on ? ", counted" : ""}`}
              aria-pressed={on}
              onClick={() =>
                setPicked((prev) => {
                  const next = new Set(prev);
                  if (next.has(c.id)) next.delete(c.id);
                  else next.add(c.id);
                  return next;
                })
              }
              style={{ width: meta.size, height: meta.size, background: meta.tint }}
              className={cn(
                "flex items-center justify-center rounded-full font-mono text-[10px] font-bold text-white transition",
                on
                  ? "ring-[3px] ring-[var(--brand)] ring-offset-2 ring-offset-[var(--surface)]"
                  : "opacity-80 hover:opacity-100",
              )}
            >
              {c.value}¢
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-sm" aria-live="polite">
        {picked.size === 0 ? (
          <span className="text-[var(--text-muted)]">
            Tap the coins to count them up.
          </span>
        ) : (
          <span className="font-mono font-bold tabular-nums">
            {total}¢ counted so far
          </span>
        )}
      </p>
    </div>
  );
}
