"use client";

import { useCallback, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SolidScene from "./SolidScene";
import {
  ATTRIBUTE_LABEL,
  SOLIDS,
  type SolidAttribute,
  type SolidKey,
} from "@/lib/geometry/solids";
import { buildSolidMesh } from "@/lib/geometry/build-solid";
import { speak } from "@/lib/audio/speak";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const ORDINAL_WORDS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

export interface SolidExplorerProps {
  solid: SolidKey;
  /** Which attribute the current question is about. */
  highlight?: SolidAttribute;
  /** Whether the child can tap faces to count them. */
  countable?: boolean;
  /** Narrate each count out loud. */
  audio?: boolean;
  className?: string;
}

/**
 * The manipulative the whole product was pitched on: a solid the child turns
 * with a finger, taps to count, and unfolds.
 *
 * Two rules shape the implementation. First, the counts come from the same
 * table the question was generated from, so the shape on screen can never
 * disagree with the answer. Second, everything reachable by pointer is also
 * reachable by keyboard — the face chips below the canvas are not a
 * consolation prize, they are the same interaction in a different modality.
 */
export default function SolidExplorer({
  solid,
  highlight = "faces",
  countable = true,
  audio = true,
  className,
}: SolidExplorerProps) {
  const info = SOLIDS[solid];
  const mesh = useMemo(() => buildSolidMesh(solid), [solid]);
  const [counted, setCounted] = useState<Set<number>>(new Set());
  const [hovered, setHovered] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const reducedMotion = useReducedMotion();

  // Reset the count when the question moves to a different shape. Adjusting
  // state during render is the supported way to do this — an effect would
  // paint the old count against the new shape for one frame first.
  const [renderedSolid, setRenderedSolid] = useState(solid);
  if (renderedSolid !== solid) {
    setRenderedSolid(solid);
    setCounted(new Set());
    setHovered(null);
  }

  const toggleFace = useCallback(
    (index: number) => {
      if (!countable) return;
      setCounted((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
          if (audio) {
            const n = next.size;
            speak(ORDINAL_WORDS[n - 1] ?? String(n));
          }
        }
        return next;
      });
    },
    [countable, audio],
  );

  const label = ATTRIBUTE_LABEL[highlight];
  const total = info[highlight];
  const allCounted = mesh !== null && counted.size === info.faces;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)]",
        className,
      )}
    >
      {/* touch-none stops the browser claiming the drag for scrolling, and
          select-none stops it turning into a text selection — without both,
          dragging the shape does nothing on a touchscreen. */}
      <div className="relative h-64 touch-none select-none sm:h-80">
        <Canvas
          camera={{ position: [2.6, 2.0, 2.6], fov: 42 }}
          dpr={[1, 1.75]}
          // Chromebook budget: no antialiasing, capped pixel ratio, and only
          // redraw when something actually changes. A solid sitting still is
          // the normal state of this widget, and repainting it 60 times a
          // second to show the same picture drains a school laptop for
          // nothing. While it is spinning we do need every frame.
          frameloop={autoRotate && !reducedMotion ? "always" : "demand"}
          gl={{ antialias: false, powerPreference: "low-power" }}
        >
          <SolidScene
            solid={solid}
            countedFaces={counted}
            hoveredFace={hovered}
            highlight={highlight}
            autoRotate={autoRotate && !reducedMotion}
            onFaceClick={toggleFace}
            onFaceHover={setHovered}
          />
          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={2.2}
            maxDistance={6}
            rotateSpeed={0.8}
          />
        </Canvas>

        <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-xs text-[var(--text-muted)]">
          Drag to turn the shape
        </p>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 border-t border-[var(--border)]">
        {(["faces", "edges", "vertices"] as SolidAttribute[]).map((attr) => (
          <div
            key={attr}
            className={cn(
              "border-r border-[var(--border)] px-3 py-3 text-center last:border-r-0",
              attr === highlight && "bg-[var(--surface-3)]",
            )}
          >
            <span className="block font-display text-2xl font-semibold tabular-nums">
              {info.curved && attr === "edges" && info.edges === 0
                ? "0"
                : info[attr]}
            </span>
            <span className="block text-xs capitalize text-[var(--text-muted)]">
              {ATTRIBUTE_LABEL[attr].many}
            </span>
          </div>
        ))}
      </div>

      {/* Counting strip — the keyboard-reachable twin of tapping a face */}
      {countable && mesh && (
        <div className="border-t border-[var(--border)] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Tap each face:
            </span>
            {mesh.faces.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleFace(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                aria-pressed={counted.has(i)}
                aria-label={`Face ${i + 1}${counted.has(i) ? ", counted" : ""}`}
                className={cn(
                  "compact h-9 w-9 rounded-full border text-sm font-bold tabular-nums transition",
                  counted.has(i)
                    ? "border-transparent bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)]",
                )}
              >
                {counted.has(i) ? "✓" : i + 1}
              </button>
            ))}
          </div>

          <p aria-live="polite" className="mt-2 text-sm">
            {counted.size === 0 ? (
              <span className="text-[var(--text-muted)]">
                Turn the shape and count every {label.one} — including the ones
                facing away.
              </span>
            ) : allCounted ? (
              <span className="font-semibold text-[var(--brand)]">
                {info.faces} faces. That is every one.
              </span>
            ) : (
              <span>
                Counted {counted.size} so far.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2 border-t border-[var(--border)] px-4 py-3">
        <button
          type="button"
          onClick={() => setCounted(new Set())}
          className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-3)]"
        >
          Start again
        </button>
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            aria-pressed={autoRotate}
            className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-3)]"
          >
            {autoRotate ? "Stop spinning" : "Spin it"}
          </button>
        )}
        {audio && (
          <button
            type="button"
            onClick={() =>
              speak(
                `${info.article === "a" ? "A" : "An"} ${info.name} has ${total} ${
                  total === 1 ? label.one : label.many
                }.`,
              )
            }
            className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-3)]"
          >
            Say it
          </button>
        )}
      </div>
    </div>
  );
}
