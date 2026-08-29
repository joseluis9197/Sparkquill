"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { fiveNumberSummary } from "@/lib/items/numbers";

export interface DataGraphProps {
  kind?: "pictograph" | "bar" | "line";
  categories: string[];
  counts: number[];
  /** How much one symbol is worth on a pictograph. */
  scale?: number;
  className?: string;
}

/**
 * Pictographs, bar charts and line graphs.
 *
 * The scaled pictograph is the one that earns its place. When each symbol
 * stands for five, a child who counts symbols instead of reading the key gets
 * a wrong answer that looks careful — and seeing the key drawn next to the
 * rows is what makes the difference visible.
 *
 * No axis label states a total. Reading the graph is the task.
 */
export default function DataGraph({
  kind = "bar",
  categories,
  counts,
  scale = 1,
  className,
}: DataGraphProps) {
  const max = Math.max(...counts, 1);

  if (kind === "pictograph") {
    return (
      <div className={cn("", className)}>
        <table className="w-full border-separate border-spacing-y-1.5">
          <tbody>
            {categories.map((c, i) => (
              <tr key={c}>
                <th
                  scope="row"
                  className="w-28 pr-3 text-right align-middle text-sm font-semibold"
                >
                  {c}
                </th>
                <td className="align-middle">
                  <span
                    className="text-lg leading-none tracking-[0.15em] text-[var(--brand)]"
                    aria-label={`${Math.round(counts[i] / scale)} symbols`}
                  >
                    {"●".repeat(Math.max(0, Math.round(counts[i] / scale)))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-3 py-2 text-center text-sm">
          <span className="font-bold">Key:</span> each &#9679; stands for{" "}
          <span className="font-bold">{scale}</span>
        </p>
      </div>
    );
  }

  if (kind === "line") {
    return <LineGraph categories={categories} counts={counts} className={className} />;
  }

  return (
    <div className={cn("", className)}>
      <div className="flex h-44 items-end gap-3 border-b-2 border-l-2 border-[var(--border)] px-3 pt-2">
        {counts.map((n, i) => (
          <div key={categories[i]} className="flex flex-1 flex-col items-center justify-end">
            <div
              className="w-full rounded-t-[4px] bg-[var(--brand)]"
              style={{ height: `${(n / max) * 100}%` }}
              role="img"
              aria-label={`${categories[i]}: ${n}`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3 px-3">
        {categories.map((c) => (
          <span key={c} className="flex-1 pt-1.5 text-center text-xs">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function LineGraph({
  categories,
  counts,
  className,
}: {
  categories: string[];
  counts: number[];
  className?: string;
}) {
  const max = Math.max(...counts, 1);
  const w = 320;
  const h = 150;
  const pad = 24;

  // Rounded, so server and client markup match exactly.
  const points = counts
    .map((n, i) => {
      const x = pad + (i / Math.max(1, counts.length - 1)) * (w - pad * 2);
      const y = h - pad - (n / max) * (h - pad * 2);
      return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
    })
    .join(" ");

  return (
    <div className={cn("", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Line graph">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--border)" strokeWidth={2} />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="var(--border)" strokeWidth={2} />
        <polyline
          points={points}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {points.split(" ").map((p, i) => {
          const [x, y] = p.split(",");
          return <circle key={i} cx={x} cy={y} r={4} className="fill-[var(--brand)]" />;
        })}
      </svg>
      <div className="flex justify-between px-5 text-xs text-[var(--text-muted)]">
        {categories.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * A box plot, drawn from the data rather than from stated quartiles.
 *
 * Deriving the five-number summary here rather than taking it as a prop means
 * the picture can never disagree with the numbers the question was built from.
 */
export function BoxPlot({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const s = useMemo(() => fiveNumberSummary(values), [values]);
  const span = s.max - s.min || 1;
  const at = (n: number) => 6 + ((n - s.min) / span) * 88;

  return (
    <div className={cn("", className)}>
      <svg viewBox="0 0 100 34" className="w-full" role="img" aria-label="Box plot">
        {/* Whiskers */}
        <line x1={at(s.min)} y1={16} x2={at(s.q1)} y2={16} stroke="var(--border)" strokeWidth={1} />
        <line x1={at(s.q3)} y1={16} x2={at(s.max)} y2={16} stroke="var(--border)" strokeWidth={1} />
        <line x1={at(s.min)} y1={9} x2={at(s.min)} y2={23} stroke="var(--border)" strokeWidth={1.4} />
        <line x1={at(s.max)} y1={9} x2={at(s.max)} y2={23} stroke="var(--border)" strokeWidth={1.4} />
        {/* Box */}
        <rect
          x={at(s.q1)}
          y={7}
          width={Math.max(0.5, at(s.q3) - at(s.q1))}
          height={18}
          className="fill-[var(--surface-2)]"
          stroke="var(--brand)"
          strokeWidth={1.4}
        />
        <line
          x1={at(s.median)}
          y1={7}
          x2={at(s.median)}
          y2={25}
          stroke="var(--brand)"
          strokeWidth={2.2}
        />
      </svg>
      <p className="mt-1 text-center text-xs text-[var(--text-muted)]">
        The box holds the middle half of the data. The line inside it is the
        median.
      </p>
    </div>
  );
}
