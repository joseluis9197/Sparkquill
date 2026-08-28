"use client";

import { useCallback, useRef, useState } from "react";
import {
  angleFromPoint,
  digitalTime,
  handAngles,
  minuteFromAngle,
  polar,
  spokenTime,
} from "@/lib/geometry/clock";
import { speak } from "@/lib/audio/speak";
import { cn } from "@/lib/utils";

export interface InteractiveClockProps {
  hour: number;
  minute: number;
  /** When false the clock is a reading task: the child reads, never sets. */
  interactive?: boolean;
  /** Hidden during reading tasks so the digital display cannot give it away. */
  showDigital?: boolean;
  audio?: boolean;
  onChange?: (hour: number, minute: number) => void;
  className?: string;
}

const HOUR_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * Analogue clock for MA.1.M.2.1 and MA.2.M.2.1.
 *
 * The hour hand moves continuously with the minutes, which is the whole
 * difficulty of "quarter to": at 3:45 the short hand is nearly at the 4, and a
 * clock that snapped it to the 3 would teach the misreading the test is
 * checking for.
 *
 * In reading mode the widget says nothing about what time it shows — not in
 * text, not in the accessible label, not through the audio button. All three
 * would be handing over the answer to the question it is illustrating.
 */
export default function InteractiveClock({
  hour,
  minute,
  interactive = true,
  showDigital = true,
  audio = true,
  onChange,
  className,
}: InteractiveClockProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [localHour, setLocalHour] = useState(hour);
  const [localMinute, setLocalMinute] = useState(minute);
  const [dragging, setDragging] = useState(false);

  // Reading tasks are driven entirely by props; only the interactive mode
  // keeps its own state.
  const h = interactive ? localHour : hour;
  const m = interactive ? localMinute : minute;
  const angles = handAngles(h, m);

  const set = useCallback(
    (nextHour: number, nextMinute: number) => {
      setLocalHour(nextHour);
      setLocalMinute(nextMinute);
      onChange?.(nextHour, nextMinute);
    },
    [onChange],
  );

  /** Converts a pointer event into dial coordinates in the 0-100 viewBox. */
  const pointToDial = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!interactive) return;
      const p = pointToDial(clientX, clientY);
      if (!p) return;
      const nextMinute = minuteFromAngle(angleFromPoint(p.x, p.y));
      // Dragging past twelve rolls the hour, the way a real clock behaves.
      let nextHour = localHour;
      if (localMinute >= 45 && nextMinute <= 15) nextHour = localHour === 12 ? 1 : localHour + 1;
      else if (localMinute <= 15 && nextMinute >= 45) nextHour = localHour === 1 ? 12 : localHour - 1;
      set(nextHour, nextMinute);
    },
    [interactive, localHour, localMinute, pointToDial, set],
  );

  const step = useCallback(
    (deltaMinutes: number) => {
      const total = (h * 60 + m + deltaMinutes + 720) % 720;
      const nh = Math.floor(total / 60) === 0 ? 12 : Math.floor(total / 60);
      set(nh, total % 60);
    },
    [h, m, set],
  );

  const minuteTip = polar(angles.minute, 36);
  const hourTip = polar(angles.hour, 24);

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-4",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className={cn(
            "h-56 w-56 touch-none select-none",
            interactive && "cursor-pointer",
          )}
          role="img"
          aria-label={
            interactive
              ? `Clock showing ${spokenTime(h, m)}`
              : "Clock face. Read the time from the hands."
          }
          onPointerDown={(e) => {
            if (!interactive) return;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setDragging(true);
            handleDrag(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (dragging) handleDrag(e.clientX, e.clientY);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            className="fill-[var(--surface)] stroke-[var(--color-ink-300)]"
            strokeWidth="2"
          />

          {/* Minute ticks: the fives are longer, because counting by fives is
              the skill the benchmark is actually after. */}
          {Array.from({ length: 60 }, (_, i) => {
            const isFive = i % 5 === 0;
            const outer = polar(i * 6, 45);
            const inner = polar(i * 6, isFive ? 39 : 42);
            return (
              <line
                key={i}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                className={
                  isFive
                    ? "stroke-[var(--color-ink-600)]"
                    : "stroke-[var(--color-ink-300)]"
                }
                strokeWidth={isFive ? 1.4 : 0.6}
                strokeLinecap="round"
              />
            );
          })}

          {HOUR_NUMBERS.map((n) => {
            const p = polar(n * 30, 32);
            return (
              <text
                key={n}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-[var(--color-ink-800)] font-bold"
                style={{ fontSize: 9 }}
              >
                {n}
              </text>
            );
          })}

          {/* Hour hand: short and thick */}
          <line
            x1="50"
            y1="50"
            x2={hourTip.x}
            y2={hourTip.y}
            className="stroke-[var(--color-tide-700)]"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Minute hand: long and thin, and the one that is draggable */}
          <line
            x1="50"
            y1="50"
            x2={minuteTip.x}
            y2={minuteTip.y}
            className="stroke-[var(--color-spark-600)]"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {interactive && (
            <circle
              cx={minuteTip.x}
              cy={minuteTip.y}
              r="4"
              className="fill-[var(--color-spark-500)]"
            />
          )}
          <circle cx="50" cy="50" r="3" className="fill-[var(--color-ink-800)]" />
        </svg>

        {showDigital && (
          <p className="font-mono text-2xl font-medium tabular-nums">
            {digitalTime(h, m)}
          </p>
        )}

        {/* In a reading task the time in words is the answer, so it is only
            shown once the child is free to move the hands themselves. */}
        {interactive && (
          <p aria-live="polite" className="text-sm text-[var(--text-muted)]">
            {spokenTime(h, m)}
          </p>
        )}

        {interactive && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Keyboard-reachable twin of dragging the hand. */}
            <ClockButton onClick={() => step(-60)} label="Back one hour">
              −1 h
            </ClockButton>
            <ClockButton onClick={() => step(-5)} label="Back five minutes">
              −5 m
            </ClockButton>
            <ClockButton onClick={() => step(5)} label="Forward five minutes">
              +5 m
            </ClockButton>
            <ClockButton onClick={() => step(60)} label="Forward one hour">
              +1 h
            </ClockButton>
          </div>
        )}

        {audio && interactive && (
          <button
            type="button"
            onClick={() => speak(`It is ${spokenTime(h, m)}.`)}
            className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-3)]"
          >
            Say the time
          </button>
        )}
      </div>
    </div>
  );
}

function ClockButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="compact rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-bold tabular-nums transition hover:border-[var(--brand)]"
    >
      {children}
    </button>
  );
}
