"use client";

import { useMemo, useState } from "react";
import { getGenerator } from "@/lib/items/registry";
import { scoreItem } from "@/lib/items/build";
import { revealFor, toPublicItem, type Reveal } from "@/lib/items/public";
import type { Item, ItemResponse, ScoreResult } from "@/lib/items/types";
import ItemCard from "@/components/practice/ItemCard";

/**
 * One example of each format, generated live.
 *
 * Scored in the browser, which the real session never does. That is fine
 * here and nowhere else: nothing on this page is recorded, and the point is
 * to look at the interface rather than to measure a child.
 */
const EXAMPLES: { key: string; label: string; note: string; seed: number }[] = [
  {
    key: "g2.add.within100",
    label: "Multiple choice",
    note: "Four options, one right. Still the commonest format, and the one every distractor in this codebase was written for.",
    seed: 42,
  },
  {
    key: "g3.mul.typed",
    label: "Equation editor",
    note: "Typed, with nothing to eliminate. A student who can pick 24 from four options has not necessarily worked out 24.",
    seed: 7,
  },
  {
    key: "g4.factors.multi",
    label: "Multiselect",
    note: "Several answers are right. How many to pick is stated, because the real test states it.",
    seed: 13,
  },
  {
    key: "g4.prime.table",
    label: "Table item",
    note: "Several small judgements sharing one context. Four separate questions would lose the connection between them.",
    seed: 5,
  },
  {
    key: "ela.g5.evidence-hot-text",
    label: "Hot text",
    note: "The evidence stays where it was written. Finding the sentence is a different act from picking it out of a list.",
    seed: 11,
  },
  {
    key: "ela.g5.central-idea-ebsr",
    label: "Two-part (EBSR)",
    note: "Claim, then the evidence for it. Florida gives no credit unless both are right — a claim you cannot point to is a guess that landed.",
    seed: 3,
  },
];

export default function FormatGallery() {
  return (
    <div className="mt-10 space-y-14">
      {EXAMPLES.map((e) => (
        <section key={e.key}>
          <h2 className="text-xl font-bold">{e.label}</h2>
          <p className="mt-1 mb-4 max-w-prose text-sm text-[var(--text-muted)]">
            {e.note}
          </p>
          <LiveItem generatorKey={e.key} seed={e.seed} />
        </section>
      ))}
    </div>
  );
}

function LiveItem({ generatorKey, seed }: { generatorKey: string; seed: number }) {
  const [nonce, setNonce] = useState(0);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);

  const item = useMemo<Item | null>(() => {
    try {
      return getGenerator(generatorKey).generate({
        seed: seed + nonce * 101,
        difficulty: "core",
      });
    } catch {
      return null;
    }
  }, [generatorKey, seed, nonce]);

  if (!item) {
    return (
      <p className="rounded-[var(--radius-tile)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)]">
        No generator registered under {generatorKey}.
      </p>
    );
  }

  return (
    <ItemCard
      key={`${generatorKey}-${nonce}`}
      item={toPublicItem(item)}
      reveal={reveal}
      explanation={reveal ? item.explanation : ""}
      correct={result?.correct ?? null}
      onAnswer={(response: ItemResponse) => {
        if (item.type !== response.type) return;
        setResult(scoreItem(item, response));
        setReveal(revealFor(item));
      }}
      onNext={() => {
        setReveal(null);
        setResult(null);
        setNonce((n) => n + 1);
      }}
      audio={false}
    />
  );
}
