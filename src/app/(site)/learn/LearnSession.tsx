"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { Flame, Sparkles } from "lucide-react";
import {
  nextQuestion,
  submitAnswer,
  type NextQuestion,
} from "@/app/actions/practice";
import ItemCard from "@/components/practice/ItemCard";
import type { ItemResponse, ScoreResult } from "@/lib/items/types";
import type { Reveal } from "@/lib/items/public";

const SESSION_LENGTH = 10;

interface Attempt {
  correct: boolean;
  misconception?: string;
}

/**
 * A practice session backed by the database.
 *
 * Question selection and scoring both happen on the server: the browser holds
 * only what is needed to draw the current question. That means progress
 * survives a closed tab, and the mastery record reflects what the child
 * actually did rather than what a page told us it did.
 */
export default function LearnSession({
  firstQuestion,
  subject,
  studentName,
  audio,
}: {
  firstQuestion: NextQuestion | null;
  /** Fixed for the session; switching subject reloads the page. */
  subject: "math" | "ela";
  studentName: string;
  audio: boolean;
}) {
  const [current, setCurrent] = useState<NextQuestion | null>(firstQuestion);
  const [served, setServed] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [sparks, setSparks] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [revealed, setRevealed] = useState<{
    reveal: Reveal;
    explanation: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const finished = attempts.length >= SESSION_LENGTH;
  const questionNumber = Math.min(served.length + 1, SESSION_LENGTH);

  const handleAnswer = useCallback(
    (response: ItemResponse, timeMs: number) => {
      if (!current || result) return;

      startTransition(async () => {
        const server = await submitAnswer({
          templateKey: current.item.templateKey,
          seed: current.item.seed,
          difficulty: current.difficulty,
          response,
          timeMs,
          hintsUsed: 0,
        });

        if (server.error) {
          setError(server.error);

          return;
        }

        setRevealed({
          reveal: server.reveal,
          explanation: server.explanation,
        });
        setResult({
          correct: server.correct,
          misconception: server.misconception as ScoreResult["misconception"],
          partialCredit: server.correct ? 1 : 0,
        });
        setAttempts((prev) => [
          ...prev,
          { correct: server.correct, misconception: server.misconception },
        ]);

        if (server.correct) {
          setSparks((s) => s + 10 + Math.min(streak, 5) * 2);
          setStreak((s) => s + 1);
        } else {
          setStreak(0);
        }
      });
    },
    [current, result, streak],
  );

  const handleNext = useCallback(() => {
    if (!current) return;
    const nextServed = [...served, current.item.skillSlug];
    setServed(nextServed);
    setResult(null);
    setRevealed(null);

    startTransition(async () => {
      const q = await nextQuestion(subject, nextServed.slice(-2));
      setCurrent(q);
    });
  }, [current, served, subject]);

  if (error) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <p className="text-lg">{error}</p>
        <Link
          href="/students"
          className="mt-6 inline-block rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px]"
        >
          Choose your profile
        </Link>
      </div>
    );
  }

  if (finished) {
    const correct = attempts.filter((a) => a.correct).length;
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <h2 className="text-3xl">Well done, {studentName}</h2>
        <p className="mt-3 text-lg text-[var(--text-muted)]">
          {correct} out of {attempts.length} correct, {sparks} sparks earned.
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Your progress is saved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90"
          >
            Practise again
          </button>
          <Link
            href="/students"
            className="inline-flex items-center rounded-full border border-[var(--border)] px-8 text-base font-semibold leading-[48px] transition hover:bg-[var(--surface-2)]"
          >
            Finish
          </Link>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <p className="rounded-[var(--radius-card)] border border-[var(--border)] p-8 text-center text-[var(--text-muted)]">
        {pending ? "Getting the next question…" : "No practice available yet."}
      </p>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm font-bold">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            <span className="tabular-nums">{sparks}</span>
            <span className="sr-only">sparks</span>
          </span>
          {streak >= 2 && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--accent)]">
              <Flame className="h-4 w-4" aria-hidden />
              <span className="tabular-nums">{streak}</span>
              <span className="sr-only">in a row</span>
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-[var(--text-muted)]">
          {questionNumber} / {SESSION_LENGTH}
        </span>
      </div>

      <div
        className="mb-6 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]"
        role="progressbar"
        aria-valuenow={served.length}
        aria-valuemin={0}
        aria-valuemax={SESSION_LENGTH}
        aria-label="Session progress"
      >
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-300"
          style={{ width: `${(served.length / SESSION_LENGTH) * 100}%` }}
        />
      </div>

      <ItemCard
        key={current.item.id}
        item={current.item}
        reveal={revealed?.reveal ?? null}
        explanation={revealed?.explanation ?? ""}
        correct={result?.correct ?? null}
        onAnswer={handleAnswer}
        onNext={handleNext}
        audio={audio}
      />

      <p className="mt-4 text-center font-mono text-[11px] text-[var(--text-muted)]">
        {current.item.benchmark} · {current.reason}
      </p>
    </div>
  );
}
