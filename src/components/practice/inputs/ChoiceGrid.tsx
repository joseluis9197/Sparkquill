"use client";

import { useState } from "react";
import type { PublicItem } from "@/lib/items/public";
import type { ItemResponse } from "@/lib/items/types";
import type { Reveal } from "@/lib/items/public";
import { cn } from "@/lib/utils";
import { optionClasses, optionStatus, revealedIds } from "./shared";

/**
 * One answer from four. The plain case, and still the commonest.
 *
 * The chosen option is remembered here rather than passed down, because it is
 * the only component that needs it: after answering, a child has to see both
 * which one was right *and* which one they picked. Showing only the right
 * answer teaches nothing about the mistake.
 */
export default function ChoiceGrid({
  item,
  reveal,
  onSubmit,
}: {
  item: Extract<PublicItem, { type: "multiple_choice" }>;
  reveal: Reveal | null;
  onSubmit: (r: ItemResponse) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const answered = reveal !== null;
  const right = revealedIds(reveal);

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {item.choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          // aria-disabled rather than disabled: a disabled button leaves the
          // tab order, so a screen reader user could never move back over the
          // options to hear which one was right.
          aria-disabled={answered}
          aria-pressed={chosen === choice.id}
          onClick={() => {
            if (answered) return;
            setChosen(choice.id);
            onSubmit({ type: "multiple_choice", choiceId: choice.id });
          }}
          className={cn(
            "rounded-[var(--radius-tile)] border-2 px-5 py-4 text-left text-xl font-bold tabular-nums transition",
            !answered && chosen === choice.id && "border-[var(--brand)]",
            optionClasses({
              answered,
              chosen: chosen === choice.id,
              correct: right.has(choice.id),
            }),
          )}
        >
          {choice.label}
          {(() => {
            const status = optionStatus({
              answered,
              chosen: chosen === choice.id,
              correct: right.has(choice.id),
            });
            return status ? <span className="sr-only"> — {status}</span> : null;
          })()}
        </button>
      ))}
    </div>
  );
}
