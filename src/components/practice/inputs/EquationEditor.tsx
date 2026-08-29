"use client";

import { useState } from "react";
import type { PublicItem } from "@/lib/items/public";
import type { ItemResponse } from "@/lib/items/types";
import type { Reveal } from "@/lib/items/public";
import { cn } from "@/lib/utils";

const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "/"];

/**
 * Typed numeric entry, the way FAST's Equation Editor works.
 *
 * There are no options to eliminate and nothing to guess between, which is
 * exactly the point: a student who can pick 24 out of four choices has not
 * necessarily worked out 24. This is the item type that tells them apart, and
 * practising only multiple choice is how a child arrives on test day fluent
 * at elimination and unpractised at arithmetic.
 *
 * The on-screen pad exists because a child on a tablet has no number row, and
 * because it keeps an answer to digits, a point and a slash — the characters
 * an answer can contain. A physical keyboard still works for anyone with one.
 */
export default function EquationEditor({
  item,
  reveal,
  correct,
  onSubmit,
}: {
  item: Extract<PublicItem, { type: "equation_editor" }>;
  reveal: Reveal | null;
  correct: boolean | null;
  onSubmit: (r: ItemResponse) => void;
}) {
  const [value, setValue] = useState("");
  const answered = reveal !== null;
  const answer = reveal?.kind === "value" ? reveal.value : null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          disabled={answered}
          onChange={(e) =>
            setValue(e.target.value.replace(/[^0-9./-]/g, "").slice(0, 12))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim() && !answered) {
              onSubmit({ type: "equation_editor", value });
            }
          }}
          aria-label="Your answer"
          placeholder="?"
          className={cn(
            "w-44 rounded-[var(--radius-tile)] border-2 px-4 py-3 text-center font-mono text-3xl font-bold tabular-nums outline-none",
            !answered && "border-[var(--border)] focus:border-[var(--brand)]",
            answered &&
              correct &&
              "border-[var(--color-grow-500)] bg-[var(--color-grow-100)]",
            answered &&
              !correct &&
              "border-[var(--color-ember-500)] bg-[var(--color-ember-100)]",
          )}
        />
        {item.unit && (
          <span className="text-xl font-semibold text-[var(--text-muted)]">
            {item.unit}
          </span>
        )}
      </div>

      {answered && !correct && answer !== null && (
        <p className="mt-3 text-center text-[15px]">
          The answer was <span className="font-mono font-bold">{answer}</span>
          {item.unit ? ` ${item.unit}` : ""}.
        </p>
      )}

      {!answered && (
        <>
          <div className="mx-auto mt-5 grid max-w-[15rem] grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setValue((v) => (v.length < 12 ? v + k : v))}
                className="compact rounded-[var(--radius-tile)] border border-[var(--border)] py-3 font-mono text-xl font-bold transition hover:bg-[var(--surface-2)]"
              >
                {k}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setValue((v) => v.slice(0, -1))}
              aria-label="Delete the last character"
              className="compact col-span-3 rounded-[var(--radius-tile)] border border-[var(--border)] py-2.5 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
            >
              Delete
            </button>
          </div>

          <button
            type="button"
            disabled={!value.trim()}
            onClick={() => onSubmit({ type: "equation_editor", value })}
            className="mt-5 w-full rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90 disabled:opacity-40 sm:w-auto sm:px-10"
          >
            Check my answer
          </button>
        </>
      )}
    </div>
  );
}
