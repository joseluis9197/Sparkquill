"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import type { PublicItem } from "@/lib/items/public";
import type { ItemResponse } from "@/lib/items/types";
import type { Reveal } from "@/lib/items/public";
import { speak } from "@/lib/audio/speak";
import { cn } from "@/lib/utils";
import WidgetHost from "./WidgetHost";
import ChoiceGrid from "./inputs/ChoiceGrid";
import MultiselectGrid from "./inputs/MultiselectGrid";
import EquationEditor from "./inputs/EquationEditor";
import HotText from "./inputs/HotText";
import TableMatch from "./inputs/TableMatch";
import Ebsr from "./inputs/Ebsr";

/**
 * Renders one question of any type, and collects one answer.
 *
 * The chrome — passage, stem, manipulative, hints, the verdict panel, the
 * next button — is identical whatever the item is, so it lives here once. The
 * part that differs is how an answer is given, and each of those is a small
 * component under `inputs/`.
 *
 * Nothing here decides whether an answer is right. The child's response goes
 * to the server, which regenerates the item from its seed and scores it, and
 * only then sends back the answer key. Until that reply arrives the page does
 * not contain the answer in any form.
 */
function renderStem(stem: string) {
  return stem.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-[var(--brand)]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/**
 * Splits a passage into paragraphs (prose) or stanzas (poetry).
 *
 * A blank line is the separator in both cases; single newlines inside a
 * stanza are kept, because a line break in a poem is part of the poem.
 */
function splitBlocks(text: string): string[] {
  return text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
}

export interface ItemCardProps {
  item: PublicItem;
  /** The answer key, sent by the server only after an answer was submitted. */
  reveal: Reveal | null;
  explanation: string;
  correct: boolean | null;
  onAnswer: (response: ItemResponse, timeMs: number) => void;
  onNext: () => void;
  audio: boolean;
  /**
   * Withholds the hints. Set during a mock test: a hint is teaching, and a
   * test that teaches while it measures reports a score for a student who
   * had help — which is not the student who will sit the real one.
   */
  hideHints?: boolean;
}

export default function ItemCard({
  item,
  reveal,
  explanation,
  correct,
  onAnswer,
  onNext,
  audio,
  hideHints = false,
}: ItemCardProps) {
  const [startedAt] = useState(() => Date.now());
  const [hintsShown, setHintsShown] = useState(0);
  const answered = reveal !== null;

  const submit = (response: ItemResponse) => {
    if (answered) return;
    onAnswer(response, Date.now() - startedAt);
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      {item.passage && (
        <article
          // Scrolls inside itself so a long passage never pushes the question
          // and the options off the screen. A student has to be able to look
          // at both, which is what re-reading a passage actually means.
          className="mb-6 max-h-[22rem] overflow-y-auto rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface-2)] p-5"
          aria-label={`Passage: ${item.passage.title}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {/*
                h2, not h3. The passage sits beside the question rather than
                inside it, and both hang off the page's h1 — so h3 here made
                the heading order jump h1, h3, h2. Somebody navigating by
                headings, which is how a screen reader user skims a page, was
                being told the passage was part of a section that did not
                exist. The size is set by the class either way.
              */}
              <h2 className="font-sans text-lg font-bold">{item.passage.title}</h2>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {item.passage.genre === "informational"
                  ? "Informational text"
                  : item.passage.genre === "poetry"
                    ? "Poem"
                    : "Story"}
              </p>
            </div>
            {audio && (
              <button
                type="button"
                onClick={() =>
                  speak(item.passage!.text, { clipUrl: item.passage!.clipUrl })
                }
                aria-label="Read the passage out loud"
                className="compact flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[var(--border)] transition hover:bg-[var(--surface)]"
              >
                <Volume2 className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
          <div className="mt-3 space-y-3 text-[0.975rem] leading-relaxed">
            {splitBlocks(item.passage.text).map((para, i) => (
              <p
                key={i}
                className={item.passage!.genre === "poetry" ? "whitespace-pre-line" : ""}
              >
                {para}
              </p>
            ))}
          </div>
        </article>
      )}

      <div className="flex items-start gap-3">
        <h2
          className={cn(
            "flex-1 font-sans font-bold leading-snug whitespace-pre-line",
            item.passage ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
          )}
        >
          {renderStem(item.stem)}
        </h2>
        {audio && (
          <button
            type="button"
            onClick={() => speak(item.audioText)}
            aria-label="Read the question out loud"
            className="compact flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[var(--border)] transition hover:bg-[var(--surface-2)]"
          >
            <Volume2 className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>

      <WidgetHost widget={item.widget} audio={audio} />

      {item.type === "multiple_choice" && (
        <ChoiceGrid item={item} reveal={reveal} onSubmit={submit} />
      )}
      {item.type === "multiselect" && (
        <MultiselectGrid item={item} reveal={reveal} onSubmit={submit} />
      )}
      {item.type === "equation_editor" && (
        <EquationEditor item={item} reveal={reveal} correct={correct} onSubmit={submit} />
      )}
      {item.type === "hot_text" && (
        <HotText item={item} reveal={reveal} onSubmit={submit} />
      )}
      {item.type === "table_match" && (
        <TableMatch item={item} reveal={reveal} onSubmit={submit} />
      )}
      {item.type === "ebsr" && (
        <Ebsr item={item} reveal={reveal} onSubmit={submit} />
      )}

      {/* Hints: available before answering, never after, never on a test. */}
      {!answered && !hideHints && item.hints.length > 0 && (
        <div className="mt-5">
          {hintsShown < item.hints.length ? (
            <button
              type="button"
              onClick={() => setHintsShown((n) => n + 1)}
              // Not compact: this is the control a stuck child reaches for,
              // and it keeps the full finger-sized target.
              className="inline-flex items-center px-1 text-sm font-semibold text-[var(--brand)] underline underline-offset-4"
            >
              {hintsShown === 0 ? "Give me a hint" : "Another hint"}
            </button>
          ) : null}
          <ul className="mt-3 space-y-2">
            {item.hints.slice(0, hintsShown).map((hint, i) => (
              <li
                key={i}
                className="rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-4 py-3 text-[15px]"
              >
                {hint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {answered && (
        <div
          aria-live="polite"
          className={cn(
            "mt-6 rounded-[var(--radius-tile)] border-l-4 px-5 py-4",
            correct
              ? "border-[var(--color-grow-500)] bg-[var(--color-grow-100)]"
              : "border-[var(--color-ember-500)] bg-[var(--color-ember-100)]",
          )}
        >
          <p className="font-bold text-[var(--color-ink-900)]">
            {correct ? "That's right." : "Not quite."}
          </p>
          <p className="mt-1 text-[15px] text-[var(--color-ink-800)]">{explanation}</p>
        </div>
      )}

      {answered && (
        <button
          type="button"
          onClick={onNext}
          autoFocus
          className="mt-6 w-full rounded-full bg-[var(--brand)] px-8 text-lg font-bold text-[var(--brand-contrast)] leading-[52px] transition hover:opacity-90 sm:w-auto sm:px-12"
        >
          Next question
        </button>
      )}
    </div>
  );
}
