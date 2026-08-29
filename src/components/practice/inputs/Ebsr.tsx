"use client";

import { useState } from "react";
import type { PublicItem } from "@/lib/items/public";
import type { ItemResponse } from "@/lib/items/types";
import type { Reveal } from "@/lib/items/public";
import { cn } from "@/lib/utils";
import { optionClasses } from "./shared";

/**
 * Two-part evidence-based selected response, the item type FAST reading is
 * built around.
 *
 * Part A asks what the text means. Part B asks which line proves it. Florida
 * scores the pair as one item and gives no credit unless both are right,
 * which is not pedantry: a claim you cannot point to in the text is a guess
 * that happened to land, and the whole skill being tested is knowing the
 * difference.
 *
 * Part B is revealed only once Part A is answered. Showing both at once lets
 * a student read the evidence options and work backwards to the claim, which
 * is the exact reasoning the item exists to prevent.
 */
export default function Ebsr({
  item,
  reveal,
  onSubmit,
}: {
  item: Extract<PublicItem, { type: "ebsr" }>;
  reveal: Reveal | null;
  onSubmit: (r: ItemResponse) => void;
}) {
  const [partA, setPartA] = useState<string | null>(null);
  const [partB, setPartB] = useState<string | null>(null);
  const answered = reveal !== null;
  const key = reveal?.kind === "ebsr" ? reveal : null;

  const part = (
    label: string,
    stem: string,
    choices: { id: string; label: string }[],
    chosen: string | null,
    correctId: string | undefined,
    onPick: (id: string) => void,
    disabled: boolean,
  ) => (
    <div className={cn(disabled && !answered && "opacity-40")}>
      <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold leading-snug">{stem}</p>
      <div className="mt-3 grid gap-2.5">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={disabled || answered}
            aria-pressed={chosen === c.id}
            onClick={() => onPick(c.id)}
            className={cn(
              "rounded-[var(--radius-tile)] border-2 px-4 py-3 text-left text-[15px] font-semibold transition",
              !answered && chosen === c.id && "border-[var(--brand)] bg-[var(--surface-2)]",
              optionClasses({
                answered,
                chosen: chosen === c.id,
                correct: correctId === c.id,
              }),
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-6 space-y-6">
      {part(
        "Part A",
        item.partA.stem,
        item.partA.choices,
        partA,
        key?.partA,
        setPartA,
        false,
      )}

      {partA === null && !answered ? (
        <p className="rounded-[var(--radius-tile)] border border-dashed border-[var(--border)] px-4 py-4 text-center text-sm text-[var(--text-muted)]">
          Answer Part A first. Part B asks for the evidence behind it.
        </p>
      ) : (
        part(
          "Part B",
          item.partB.stem,
          item.partB.choices,
          partB,
          key?.partB,
          setPartB,
          false,
        )
      )}

      {!answered && (
        <>
          <button
            type="button"
            disabled={!partA || !partB}
            onClick={() =>
              onSubmit({ type: "ebsr", partA: partA!, partB: partB! })
            }
            className="w-full rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90 disabled:opacity-40 sm:w-auto sm:px-10"
          >
            Check both parts
          </button>
          <p className="text-xs text-[var(--text-muted)]">
            Both parts have to be right. Evidence without the claim is not
            credit, and neither is a claim you cannot point to.
          </p>
        </>
      )}
    </div>
  );
}
