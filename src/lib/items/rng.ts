/**
 * Seeded pseudo-random number generator.
 *
 * Determinism is a product requirement, not a nicety: the same (template,
 * seed) pair must always produce byte-identical items so a parent can be
 * shown exactly what their child saw, and so item statistics accumulate
 * against a stable question rather than a moving target.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    // mulberry32 — small, fast, good enough distribution for item generation
    this.state = seed >>> 0;
  }

  /** Float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max], inclusive. */
  int(min: number, max: number): number {
    if (max < min) throw new Error(`Rng.int: max ${max} < min ${min}`);
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Uniform pick. */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error("Rng.pick: empty array");
    return items[this.int(0, items.length - 1)];
  }

  /** Fisher-Yates, returning a new array. */
  shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  /** Picks `count` distinct values from a range, useful for distractors. */
  distinctInts(count: number, min: number, max: number): number[] {
    const span = max - min + 1;
    if (count > span) {
      throw new Error(`Rng.distinctInts: cannot pick ${count} from ${span}`);
    }
    const seen = new Set<number>();
    while (seen.size < count) seen.add(this.int(min, max));
    return [...seen];
  }
}

/**
 * Deterministic id for a generated item, so the same seed yields the same id
 * without a database round-trip.
 */
export function itemId(templateKey: string, seed: number): string {
  return `${templateKey}#${seed}`;
}
