"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";
import {
  abandonMock,
  answerMock,
  finishMock,
  mockQuestion,
  startMock,
  type MockReport,
  type MockSession,
} from "@/app/actions/mock";
import type { PublicItem } from "@/lib/items/public";
import type { ItemResponse } from "@/lib/items/types";
import ItemCard from "@/components/practice/ItemCard";
import { cn } from "@/lib/utils";

/**
 * Runs a mock test.
 *
 * The important behaviours here are the ones that make it a test rather than
 * a longer practice session:
 *
 *   - No verdict, ever, until the end. ItemCard is given a null reveal
 *     throughout, so it has nothing to colour and nothing to explain.
 *   - The clock is server-anchored. It is seeded from how long the session
 *     has actually been open, so closing the tab does not stop it and
 *     reopening does not reset it.
 *   - Questions are fetched by index from the stored paper, so navigating
 *     back and forth returns the same question rather than a new one.
 */
export default function MockRunner({
  subject,
  studentName,
  audio,
}: {
  subject: "math" | "ela";
  studentName: string;
  audio: boolean;
}) {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null>(null);
  const [index, setIndex] = useState(0);
  /*
   * The question is stored with the index it belongs to rather than being
   * cleared when the index changes. Clearing meant a setState inside the
   * effect that starts the fetch, which React can cascade — and it briefly
   * showed the previous question under the new question number.
   */
  const [loaded, setLoaded] = useState<{ index: number; item: PublicItem } | null>(
    null,
  );
  const [report, setReport] = useState<MockReport | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const startedAt = useRef<number>(0);

  const item = loaded?.index === index ? loaded.item : null;
  const answeredHere = answeredIndex === index;

  // Start or resume, once.
  useEffect(() => {
    let cancelled = false;
    startMock(subject).then((s) => {
      if (cancelled || !s) return;
      setSession(s);
      setIndex(s.answered);
      setElapsed(s.elapsedMs);
    });
    return () => {
      cancelled = true;
    };
  }, [subject]);

  // Load the question at the current index.
  useEffect(() => {
    if (!session || report) return;
    let cancelled = false;
    startedAt.current = Date.now();
    mockQuestion(session.sessionId, index).then((q) => {
      if (!cancelled && q) setLoaded({ index, item: q.item });
    });
    return () => {
      cancelled = true;
    };
  }, [session, index, report]);

  // The clock. Anchored to the server's start time rather than to when this
  // component mounted, so it survives a reload.
  useEffect(() => {
    if (!session || report) return;
    const base = session.elapsedMs;
    const mounted = Date.now();
    const id = setInterval(() => setElapsed(base + (Date.now() - mounted)), 1000);
    return () => clearInterval(id);
  }, [session, report]);

  const limitMs = (session?.minutesAllowed ?? 0) * 60_000;
  const remaining = Math.max(0, limitMs - elapsed);
  const outOfTime = session !== null && remaining === 0;

  const finish = useCallback(() => {
    if (!session) return;
    startTransition(async () => {
      const r = await finishMock(session.sessionId);
      setReport(r);
    });
  }, [session]);

  // Time is up: end it rather than letting a student work on past the limit.
  useEffect(() => {
    if (outOfTime && !report) finish();
  }, [outOfTime, report, finish]);

  const submit = useCallback(
    (response: ItemResponse, timeMs: number) => {
      if (!session || !item || answeredHere) return;
      setAnsweredIndex(index);
      startTransition(async () => {
        await answerMock({
          sessionId: session.sessionId,
          index,
          templateKey: item.templateKey,
          seed: item.seed,
          response: response as unknown as Record<string, unknown>,
          timeMs,
        });
        if (index + 1 >= session.total) {
          const r = await finishMock(session.sessionId);
          setReport(r);
        } else {
          setIndex((i) => i + 1);
        }
      });
    },
    [session, item, index, answeredHere],
  );

  if (report) return <Report report={report} name={studentName} />;

  if (!session) {
    return (
      <p className="rounded-[var(--radius-card)] border border-[var(--border)] p-8 text-center text-[var(--text-muted)]">
        Setting up your test…
      </p>
    );
  }

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const low = remaining < 5 * 60_000;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--brand)]">
          Practice test · {subject === "math" ? "Mathematics" : "Reading"}
        </span>
        <span
          className={cn(
            "flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums",
            low ? "text-[var(--color-ember-500)]" : "text-[var(--text-muted)]",
          )}
          aria-live="off"
        >
          <Clock className="h-4 w-4" aria-hidden />
          {mins}:{String(secs).padStart(2, "0")}
        </span>
      </div>

      <div
        className="mb-6 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]"
        role="progressbar"
        aria-valuenow={index}
        aria-valuemin={0}
        aria-valuemax={session.total}
        aria-label="Test progress"
      >
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-300"
          style={{ width: `${(index / session.total) * 100}%` }}
        />
      </div>

      {/*
        An h1, not a paragraph. While the test is running this was the only
        page in the product with no top-level heading at all: the question
        itself is an h2, so it hung under nothing, and a student navigating by
        headings had no way to get back to the top of the page. The line was
        already saying what the page was about — it just was not saying it as
        a heading. The styling is unchanged.
      */}
      <h1 className="mb-4 font-mono text-xs font-normal tracking-normal text-[var(--text-muted)]">
        Question {index + 1} of {session.total}
      </h1>

      {item ? (
        <ItemCard
          key={`${item.id}-${index}`}
          item={item}
          // Null throughout: on a test nothing is revealed until the end.
          reveal={null}
          explanation=""
          correct={null}
          onAnswer={submit}
          onNext={() => {}}
          audio={audio}
          hideHints
        />
      ) : (
        <p className="rounded-[var(--radius-card)] border border-[var(--border)] p-8 text-center text-[var(--text-muted)]">
          {pending ? "Saving…" : "Loading the next question…"}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (session) abandonMock(session.sessionId);
            router.push("/learn");
          }}
          className="compact text-sm font-semibold text-[var(--text-muted)] underline underline-offset-4"
        >
          Stop the test
        </button>
        <button
          type="button"
          onClick={finish}
          className="compact rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
        >
          Finish and see my score
        </button>
      </div>
    </div>
  );
}

function Report({ report, name }: { report: MockReport; name: string }) {
  const pct = report.total === 0 ? 0 : Math.round((report.correct / report.total) * 100);

  return (
    <div>
      <h1 className="text-3xl">Test finished, {name}</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        {report.correct} out of {report.total} correct, in {report.minutes}{" "}
        minute{report.minutes === 1 ? "" : "s"}.
      </p>

      <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="font-display text-5xl font-semibold tabular-nums">{pct}%</p>
        <p className="mt-2 max-w-prose text-sm text-[var(--text-muted)]">
          This is a score on our questions, not a FAST score.{" "}
          {report.blueprint
            ? "The mix of topics follows Florida's published blueprint, so the balance is right — but we do not convert it to an achievement level, because only the state can do that."
            : "Florida publishes no blueprint for this grade, so this is a spread across the whole year rather than a weighted test."}
        </p>
      </div>

      {/*
        * Only shown where Florida publishes categories. Without a blueprint
        * every question lands in one bucket called "Other", and a breakdown
        * with a single row is not a breakdown — it is the same number again
        * with a heading over it.
        */}
      {report.blueprint && report.byCategory.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">By topic</h2>
          <ul className="mt-3 space-y-2">
            {report.byCategory.map((c) => {
              const p = c.total === 0 ? 0 : Math.round((c.correct / c.total) * 100);
              return (
                <li
                  key={c.name}
                  className="rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold">{c.name}</span>
                    <span className="font-mono text-sm tabular-nums">
                      {c.correct}/{c.total}
                      {c.weight > 0 && (
                        <span className="ml-2 text-[var(--text-muted)]">
                          {Math.round(c.weight * 100)}% of the test
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <div
                      className="h-full rounded-full bg-[var(--brand)]"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {report.weakest.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">Worth going back to</h2>
          <ul className="mt-3 space-y-1.5 text-[15px]">
            {report.weakest.map((s) => (
              <li key={s.skill} className="flex justify-between gap-4">
                <span>{s.skill}</span>
                <span className="font-mono text-sm tabular-nums text-[var(--text-muted)]">
                  {s.correct}/{s.total}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Practice already knows about these — they will come round sooner
            now.
          </p>
        </section>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/learn"
          className="rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px] transition hover:opacity-90"
        >
          Back to practice
        </Link>
        <Link
          href="/students"
          className="rounded-full border border-[var(--border)] px-8 text-base font-semibold leading-[48px]"
        >
          Choose a profile
        </Link>
      </div>
    </div>
  );
}
