"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface VolumeCubesProps {
  l: number;
  w: number;
  h: number;
  className?: string;
}

/**
 * A rectangular prism packed with unit cubes, drawn one layer at a time.
 *
 * Volume is taught as length × width × height and then applied without a
 * picture, which is how a student ends up multiplying two of the three. Built
 * up layer by layer, the formula stops being three numbers and becomes what it
 * is: the cubes in one layer, repeated for every layer.
 *
 * Drawn in isometric projection rather than 3D, deliberately. This is a
 * counting task, and a rotating model invites a child to spin it instead of
 * counting it. The solid explorer already exists for questions about faces
 * and edges, where turning it over is the point.
 */
export default function VolumeCubes({ l, w, h, className }: VolumeCubesProps) {
  const [layers, setLayers] = useState(h);
  const cube = 15;
  const dx = cube * 0.5;
  const dy = cube * 0.28;

  const width = l * cube + w * dx + 40;
  const height = h * cube + w * dy + 40;
  const originX = 20;
  const originY = height - 20 - w * dy;

  const faces: React.ReactElement[] = [];
  // Painter's order: back rows and lower layers first, so nearer cubes cover
  // the ones behind them.
  for (let layer = 0; layer < layers; layer++) {
    for (let row = w - 1; row >= 0; row--) {
      for (let col = 0; col < l; col++) {
        const x = originX + col * cube + row * dx;
        const y = originY - layer * cube - row * dy;
        faces.push(
          <g key={`${layer}-${row}-${col}`}>
            {/* top */}
            <polygon
              points={`${x},${y} ${x + cube},${y} ${x + cube + dx},${y - dy} ${x + dx},${y - dy}`}
              className="fill-[var(--brand)]"
              stroke="var(--surface)"
              strokeWidth={0.8}
            />
            {/* front */}
            <polygon
              points={`${x},${y} ${x + cube},${y} ${x + cube},${y + cube} ${x},${y + cube}`}
              className="fill-[var(--brand)]/70"
              stroke="var(--surface)"
              strokeWidth={0.8}
            />
            {/* side */}
            <polygon
              points={`${x + cube},${y} ${x + cube + dx},${y - dy} ${x + cube + dx},${y + cube - dy} ${x + cube},${y + cube}`}
              className="fill-[var(--brand)]/45"
              stroke="var(--surface)"
              strokeWidth={0.8}
            />
          </g>,
        );
      }
    }
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="max-h-56 w-full max-w-xs"
        role="img"
        aria-label={`A box ${l} by ${w} by ${h}, showing ${layers} of ${h} layers`}
      >
        {faces}
      </svg>

      <div className="mt-2 flex items-center gap-3">
        <label className="text-xs font-semibold text-[var(--text-muted)]">
          Layers
        </label>
        <input
          type="range"
          min={1}
          max={h}
          value={layers}
          onChange={(e) => setLayers(Number(e.target.value))}
          className="w-36 accent-[var(--brand)]"
          aria-label="How many layers to show"
        />
        <span className="font-mono text-sm font-bold tabular-nums">
          {layers} / {h}
        </span>
      </div>
      <p className="mt-1 text-center text-xs text-[var(--text-muted)]" aria-live="polite">
        Each layer holds {l} × {w} = {l * w} cubes.
      </p>
    </div>
  );
}
