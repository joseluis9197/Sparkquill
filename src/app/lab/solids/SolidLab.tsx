"use client";

import { useState } from "react";
import SolidExplorer from "@/components/widgets/solid-explorer/SolidExplorer";
import {
  SOLIDS,
  SOLID_KEYS,
  type SolidAttribute,
  type SolidKey,
} from "@/lib/geometry/solids";
import { cn } from "@/lib/utils";

const ATTRIBUTES: SolidAttribute[] = ["faces", "edges", "vertices"];

export default function SolidLab() {
  const [solid, setSolid] = useState<SolidKey>("cube");
  const [highlight, setHighlight] = useState<SolidAttribute>("faces");

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
          Shape
        </h2>
        <div className="flex flex-wrap gap-2">
          {SOLID_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSolid(key)}
              aria-pressed={solid === key}
              className={cn(
                "compact rounded-full border px-4 py-1.5 text-sm font-semibold capitalize transition",
                solid === key
                  ? "border-transparent bg-[var(--brand)] text-[var(--brand-contrast)]"
                  : "border-[var(--border)] hover:bg-[var(--surface-3)]",
              )}
            >
              {SOLIDS[key].name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
          Question is about
        </h2>
        <div className="flex flex-wrap gap-2">
          {ATTRIBUTES.map((attr) => (
            <button
              key={attr}
              type="button"
              onClick={() => setHighlight(attr)}
              aria-pressed={highlight === attr}
              className={cn(
                "compact rounded-full border px-4 py-1.5 text-sm font-semibold capitalize transition",
                highlight === attr
                  ? "border-transparent bg-[var(--accent)] text-white"
                  : "border-[var(--border)] hover:bg-[var(--surface-3)]",
              )}
            >
              {attr}
            </button>
          ))}
        </div>
      </div>

      <SolidExplorer
        key={solid}
        solid={solid}
        highlight={highlight}
        countable={!SOLIDS[solid].curved}
      />

      {SOLIDS[solid].curved && (
        <p className="rounded-[var(--radius-tile)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-muted)]">
          Curved solids are for identifying, not for counting faces. Tapping is
          switched off here on purpose — asking a child to count the faces of a
          sphere teaches a rule that does not hold.
        </p>
      )}
    </div>
  );
}
