"use client";

import { useState } from "react";
import type { PublicItem } from "@/lib/items/public";
import type { ItemResponse } from "@/lib/items/types";
import type { Reveal } from "@/lib/items/public";
import { cn } from "@/lib/utils";
import { optionStatus, revealedIds } from "./shared";

/**
 * Select words or sentences inside a text — FAST's Hot Text item.
 *
 * This is the one reading item type that cannot be reduced to four options,
 * because the evidence stays where it was written. "Which sentence shows how
 * the character felt" is a different question when you have to find the
 * sentence than when you are handed four and asked to pick.
 *
 * Only the tokens the item marks selectable respond. The rest of the text is
 * still there to be read, which is the whole point: the answer sits in
 * context rather than in a list.
 */
export default function HotText({
  item,
  reveal,
  onSubmit,
}: {
  item: Extract<PublicItem, { type: "hot_text" }>;
  reveal: Reveal | null;
  onSubmit: (r: ItemResponse) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const answered = reveal !== null;
  const right = revealedIds(reveal);
  const want = item.selectCount ?? 1;
  const ready = picked.length === want;

  return (
    <div className="mt-6">
      {!answered && (
        <p className="mb-3 text-sm font-semibold text-[var(--text-muted)]">
          Tap {want === 1 ? "the sentence" : `${want} sentences`} in the text
          below.
        </p>
      )}

      <div className="rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface-2)] p-5 text-[1.02rem] leading-relaxed">
        {item.tokens.map((token) =>
          token.selectable ? (
            <button
              key={token.id}
              type="button"
              // aria-disabled, not disabled: see optionStatus. The sentence
              // a child picked, and the one that was right, have to stay
              // reachable by keyboard once the answer is shown.
              aria-disabled={answered}
              aria-pressed={picked.includes(token.id)}
              onClick={() => {
                if (answered) return;
                setPicked((prev) =>
                  prev.includes(token.id)
                    ? prev.filter((id) => id !== token.id)
                    : prev.length >= want
                      ? prev
                      : [...prev, token.id],
                );
              }}
              className={cn(
                "mr-1 rounded-[4px] px-1 text-left transition",
                !answered &&
                  (picked.includes(token.id)
                    ? "bg-[var(--brand)] text-[var(--brand-contrast)]"
                    : "bg-[var(--surface)] hover:bg-[var(--border)]"),
                answered &&
                  right.has(token.id) &&
                  "bg-[var(--color-grow-100)] font-semibold underline decoration-[var(--color-grow-500)] decoration-2 underline-offset-2",
                answered &&
                  !right.has(token.id) &&
                  picked.includes(token.id) &&
                  "bg-[var(--color-ember-100)] line-through",
              )}
            >
              {token.text}
              {(() => {
                const status = optionStatus({
                  answered,
                  chosen: picked.includes(token.id),
                  correct: right.has(token.id),
                });
                return status ? (
                  <span className="sr-only"> ({status}) </span>
                ) : null;
              })()}
            </button>
          ) : (
            <span key={token.id} className="mr-1">
              {token.text}
            </span>
          ),
        )}
      </div>

      {!answered && (
        <button
          type="button"
          disabled={!ready}
          onClick={() => onSubmit({ type: "hot_text", tokenIds: picked })}
          className="mt-5 w-full rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90 disabled:opacity-40 sm:w-auto sm:px-10"
        >
          {ready ? "Check my answer" : `Choose ${want - picked.length} more`}
        </button>
      )}
    </div>
  );
}
