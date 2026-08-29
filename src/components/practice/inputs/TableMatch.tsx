"use client";

import { useState } from "react";
import type { PublicItem } from "@/lib/items/public";
import type { ItemResponse } from "@/lib/items/types";
import type { Reveal } from "@/lib/items/public";
import { cn } from "@/lib/utils";

/**
 * A grid of radio buttons, one row per statement — FAST's Table Item.
 *
 * Used where several small judgements share one context: sort six numbers as
 * prime or composite, mark each statement true or false about a passage. Six
 * separate questions would say the same thing, but each would carry its own
 * stem and the connection between them would be lost.
 *
 * Rendered as a real table with row and column headers rather than a grid of
 * unlabelled buttons, so a screen reader announces "Prime, 17" rather than
 * "button, button, button".
 */
export default function TableMatch({
  item,
  reveal,
  onSubmit,
}: {
  item: Extract<PublicItem, { type: "table_match" }>;
  reveal: Reveal | null;
  onSubmit: (r: ItemResponse) => void;
}) {
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const answered = reveal !== null;
  const answer = reveal?.kind === "pairs" ? reveal.pairs : null;
  const ready = item.rows.every((r) => pairs[r.id]);

  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1.5 text-left">
          <thead>
            <tr>
              <th className="pb-1" />
              {item.columns.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className="px-2 pb-1 text-center text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.rows.map((row) => {
              const correctCol = answer?.[row.id];
              const chosenCol = pairs[row.id];
              const rowRight = answered && chosenCol === correctCol;

              return (
                <tr key={row.id}>
                  <th
                    scope="row"
                    className={cn(
                      "rounded-l-[var(--radius-tile)] py-3 pl-4 pr-3 font-bold",
                      answered &&
                        (rowRight
                          ? "bg-[var(--color-grow-100)]"
                          : "bg-[var(--color-ember-100)]"),
                    )}
                  >
                    {row.label}
                  </th>
                  {item.columns.map((col, i) => {
                    const picked = chosenCol === col.id;
                    const isAnswer = correctCol === col.id;
                    return (
                      <td
                        key={col.id}
                        className={cn(
                          "px-2 py-3 text-center",
                          i === item.columns.length - 1 &&
                            "rounded-r-[var(--radius-tile)]",
                          answered &&
                            (rowRight
                              ? "bg-[var(--color-grow-100)]"
                              : "bg-[var(--color-ember-100)]"),
                        )}
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={picked}
                          aria-label={`${row.label}: ${col.label}`}
                          disabled={answered}
                          onClick={() =>
                            setPairs((prev) => ({ ...prev, [row.id]: col.id }))
                          }
                          className={cn(
                            "mx-auto flex h-7 w-7 items-center justify-center rounded-full border-2 transition",
                            picked
                              ? "border-[var(--brand)] bg-[var(--brand)]"
                              : "border-[var(--border)] hover:border-[var(--brand)]",
                            answered &&
                              isAnswer &&
                              "border-[var(--color-grow-500)] bg-[var(--color-grow-500)]",
                          )}
                        >
                          {(picked || (answered && isAnswer)) && (
                            <span className="h-2.5 w-2.5 rounded-full bg-white" aria-hidden />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!answered && (
        <button
          type="button"
          disabled={!ready}
          onClick={() => onSubmit({ type: "table_match", pairs })}
          className="mt-5 w-full rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90 disabled:opacity-40 sm:w-auto sm:px-10"
        >
          {ready ? "Check my answers" : "Answer every row"}
        </button>
      )}
    </div>
  );
}
