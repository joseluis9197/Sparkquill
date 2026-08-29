"use client";

import { useCallback, useRef, useState } from "react";
import { Flame, Sparkles } from "lucide-react";
import { GENERATORS } from "@/lib/items/registry";
import type { Item, ItemResponse, ScoreResult } from "@/lib/items/types";
import { scoreItem } from "@/lib/items/build";
import { revealFor, toPublicItem, type Reveal } from "@/lib/items/public";
import {
  applyAttempt,
  initialSkillState,
  type SkillState,
} from "@/lib/adaptive/mastery";
import { bandForStudent } from "@/lib/adaptive/elo";
import { selectNextSkill, type SkillCandidate } from "@/lib/adaptive/select";
import ItemCard from "./ItemCard";

/**
 * A practice session driven entirely in the browser.
 *
 * This runs the real adaptive engine against the real generators with no
 * database behind it, so the loop can be used and judged before accounts and
 * persistence exist. Progress lives for the length of the session only, which
 * is stated plainly in the UI rather than quietly lost.
 */

const SESSION_LENGTH = 10;

interface Attempt {
  skillSlug: string;
  correct: boolean;
  misconception?: string;
  timeMs: number;
}

interface CurrentQuestion {
  item: Item;
  skillSlug: string;
  reason: string;
}

type SkillStates = Map<string, SkillState>;

function buildCandidates(states: SkillStates): SkillCandidate[] {
  const bySkill = new Map<string, string>();
  for (const g of GENERATORS) {
    if (!bySkill.has(g.skillSlug)) bySkill.set(g.skillSlug, g.benchmark);
  }
  return [...bySkill.entries()].map(([slug, benchmark]) => ({
    skillId: slug,
    skillSlug: slug,
    benchmark,
    // Grades 1-2 have no published blueprint, so there is no reporting
    // category to weight by here. See docs/plan.html §01.
    reportingCategory: null,
    prerequisiteIds: [],
    state: states.get(slug) ?? initialSkillState(),
  }));
}

/**
 * Picks the next question.
 *
 * Called only when the session advances — never during render. Deriving the
 * question from mastery state inside a memo looked tidy but was wrong:
 * answering updates that state, which regenerated the question underneath the
 * feedback, so the child was shown an explanation for a different question
 * than the one they had just answered.
 */
function pickQuestion(
  states: SkillStates,
  served: string[],
  seedCounter: number,
): CurrentQuestion | null {
  const selection = selectNextSkill({
    candidates: buildCandidates(states),
    categoryWeights: [],
    now: new Date(),
    recentlyServed: served.slice(-2),
  });
  if (!selection) return null;

  const skillSlug = selection.candidate.skillSlug;
  const generators = GENERATORS.filter((g) => g.skillSlug === skillSlug);
  if (generators.length === 0) return null;

  const state = states.get(skillSlug) ?? initialSkillState();
  const band = bandForStudent(state.rating);

  // 7919 is prime, so consecutive counters land far apart in the generator's
  // parameter space and the same question does not recur within a session.
  const seed = seedCounter * 7919 + skillSlug.length;
  const generator = generators[seed % generators.length];

  // The full item is kept, not just its public shape. This demo has no
  // server to score against, so it holds the answer key in the browser — the
  // one place the real product deliberately never puts it. Nothing is saved
  // from this page, which is what makes that acceptable here and nowhere else.
  return {
    item: generator.generate({ seed, difficulty: band }),
    skillSlug,
    reason: selection.explanation,
  };
}

export default function PracticeSession({ audio = true }: { audio?: boolean }) {
  // Mastery state never affects what is rendered — only which question is
  // picked next — so it lives in a ref. Keeping it in state would mean
  // reading the latest value from inside a setState updater, which React may
  // run twice in development and is not a supported place for side effects.
  const statesRef = useRef<SkillStates>(new Map());
  const [served, setServed] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [sparks, setSparks] = useState(0);
  const [streak, setStreak] = useState(0);
  const [seedCounter, setSeedCounter] = useState(2);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [current, setCurrent] = useState<CurrentQuestion | null>(() =>
    pickQuestion(new Map(), [], 1),
  );

  const finished = attempts.length >= SESSION_LENGTH;
  const questionNumber = Math.min(served.length + 1, SESSION_LENGTH);

  const handleAnswer = useCallback(
    (response: ItemResponse, timeMs: number) => {
      if (!current || result) return;
      if (current.item.type !== response.type) return;

      const scored = scoreItem(current.item, response);
      setResult(scored);
      setReveal(revealFor(current.item));

      const state =
        statesRef.current.get(current.skillSlug) ?? initialSkillState();
      statesRef.current.set(
        current.skillSlug,
        applyAttempt(state, {
          correct: scored.correct,
          itemDifficulty: current.item.difficulty,
          at: new Date(),
        }).state,
      );

      setAttempts((prev) => [
        ...prev,
        {
          skillSlug: current.skillSlug,
          correct: scored.correct,
          misconception: scored.misconception,
          timeMs,
        },
      ]);

      if (scored.correct) {
        setSparks((s) => s + 10 + Math.min(streak, 5) * 2);
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
    },
    [current, result, streak],
  );

  const handleNext = useCallback(() => {
    if (!current) return;
    const nextServed = [...served, current.skillSlug];
    setServed(nextServed);
    setReveal(null);
    setResult(null);
    setSeedCounter((n) => n + 1);
    setCurrent(pickQuestion(statesRef.current, nextServed, seedCounter));
  }, [current, served, seedCounter]);

  const restart = useCallback(() => {
    statesRef.current = new Map();
    setServed([]);
    setAttempts([]);
    setSparks(0);
    setStreak(0);
    setSeedCounter(2);
    setReveal(null);
    setResult(null);
    setCurrent(pickQuestion(new Map(), [], 1));
  }, []);

  if (finished) {
    const correct = attempts.filter((a) => a.correct).length;
    // Group the wrong answers by the error behind them — this is the whole
    // reason distractors carry a misconception label.
    const errors = new Map<string, number>();
    for (const a of attempts) {
      if (a.correct || !a.misconception) continue;
      errors.set(a.misconception, (errors.get(a.misconception) ?? 0) + 1);
    }

    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <h2 className="text-3xl">Session finished</h2>
        <p className="mt-3 text-lg text-[var(--text-muted)]">
          {correct} out of {attempts.length} correct, {sparks} sparks earned.
        </p>

        {errors.size > 0 && (
          <div className="mx-auto mt-8 max-w-md text-left">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
              What to work on
            </h3>
            <ul className="mt-3 space-y-2">
              {[...errors.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([key, count]) => (
                  <li
                    key={key}
                    className="rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-4 py-3 text-sm"
                  >
                    <span className="font-semibold">
                      {MISCONCEPTION_LABEL[key] ?? key}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {" "}
                      — {count} {count === 1 ? "time" : "times"}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={restart}
          className="mt-8 rounded-full bg-[var(--brand)] px-10 text-lg font-bold text-[var(--brand-contrast)] leading-[52px] transition hover:opacity-90"
        >
          Practise again
        </button>
      </div>
    );
  }

  if (!current) {
    return (
      <p className="rounded-[var(--radius-card)] border border-[var(--border)] p-8 text-center text-[var(--text-muted)]">
        No practice available yet.
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
        item={toPublicItem(current.item)}
        reveal={reveal}
        explanation={reveal ? current.item.explanation : ""}
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

const MISCONCEPTION_LABEL: Record<string, string> = {
  no_regrouping: "Carrying and borrowing across columns",
  column_independent: "Treating each column as a separate sum",
  wrong_operation: "Reading the sign in the question",
  off_by_one: "Counting carefully",
  place_value_confusion: "What each digit is worth",
  digit_reversal: "The order of the digits",
  rounded_wrong_direction: "Which ten a number is closer to",
  rounded_wrong_place: "Rounding to the right place",
  hour_minute_swap: "Which hand is which on a clock",
  minute_by_ones: "Counting the minute hand in fives",
  counted_faces_as_vertices: "Telling faces, edges and corners apart",
  skipped_hidden_faces: "Counting the parts you cannot see",
  distractor_plausible: "Reading the question closely",
};
