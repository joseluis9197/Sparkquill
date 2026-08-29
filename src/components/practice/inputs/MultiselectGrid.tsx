"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { PublicItem } from "@/lib/items/public";
import type { ItemResponse } from "@/lib/items/types";
import type { Reveal } from "@/lib/items/public";
import { cn } from "@/lib/utils";
import { optionClasses, optionStatus, revealedIds } from "./shared";

/**
 * "Select the TWO that…" — a FAST staple.
 *
 * How many to pick is stated, because the real test states it. Guessing the
 * number as well as the answers would make this harder than the exam in a way
 * that has nothing to do with the skill.
 *
 * The submit button stays disabled until exactly that many are chosen. A
 * student who submits three when two were asked for has made a reading
 * mistake, not a mathematics one, and the interface should not let it happen.
 */
export default function MultiselectGrid({
  item,
  reveal,
  onSubmit,
}: {
  item: Extract<PublicItem, { type: "multiselect" }>;
  reveal: Reveal | null;
  onSubmit: (r: ItemResponse) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const answered = reveal !== null;
  const right = revealedIds(reveal);
  const ready = picked.length === item.selectCount;

  return (
    <div className="mt-6">
      <p className="mb-3 text-sm font-semibold text-[var(--text-muted)]">
        Choose {item.selectCount}.
        <span className="ml-2 tabular-nums">
          {picked.length} of {item.selectCount} chosen
        </span>
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {item.choices.map((choice) => {
          const isPicked = picked.includes(choice.id);
          return (
            <button
              key={choice.id}
              type="button"
              // aria-disabled, not disabled: see optionStatus. A disabled
              // button is skipped by the tab key, so the review is unreachable.
              aria-disabled={answered}
              aria-pressed={isPicked}
              onClick={() =>
                answered
                  ? undefined
                  : setPicked((prev) =>
                    prev.includes(choice.id)
                      ? prev.filter((id) => id !== choice.id)
                      : prev.length >= item.selectCount
                        ? prev
                        : [...prev, choice.id],
                    )
              }
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-tile)] border-2 px-5 py-4 text-left text-lg font-bold transition",
                !answered && isPicked && "border-[var(--brand)] bg-[var(--surface-2)]",
                optionClasses({ answered, chosen: isPicked, correct: right.has(choice.id) }),
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 flex-none items-center justify-center rounded-md border-2",
                  isPicked
                    ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-contrast)]"
                    : "border-[var(--border)]",
                )}
                aria-hidden
              >
                {isPicked && <Check className="h-4 w-4" />}
              </span>
              <span className="flex-1">
                {choice.label}
                {(() => {
                  const status = optionStatus({
                    answered,
                    chosen: isPicked,
                    correct: right.has(choice.id),
                  });
                  return status ? (
                    <span className="sr-only"> — {status}</span>
                  ) : null;
                })()}
              </span>
            </button>
          );
        })}
      </div>

      {!answered && (
        <button
          type="button"
          disabled={!ready}
          onClick={() => onSubmit({ type: "multiselect", choiceIds: picked })}
          className="mt-5 w-full rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90 disabled:opacity-40 sm:w-auto sm:px-10"
        >
          {ready ? "Check my answer" : `Choose ${item.selectCount - picked.length} more`}
        </button>
      )}
    </div>
  );
}
