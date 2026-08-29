/**
 * Number helpers shared by the mathematics generators.
 *
 * Word form matters twice over: it is the answer to a whole family of
 * benchmarks (MA.2.NSO.1.1 and friends), and it is what the narrator has to
 * say out loud, since "305" must be read as "three hundred five".
 */

const ONES = [
  "zero",
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
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/**
 * Florida reads 305 as "three hundred five", with no "and". The clarification
 * on MA.2.NSO.1.1 is explicit about this, and getting it wrong would teach a
 * child the wrong answer.
 */
export function numberToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`numberToWords: expected a non-negative integer, got ${n}`);
  }
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return rest === 0
      ? `${ONES[h]} hundred`
      : `${ONES[h]} hundred ${numberToWords(rest)}`;
  }
  if (n < 1_000_000) {
    const th = Math.floor(n / 1000);
    const rest = n % 1000;
    return rest === 0
      ? `${numberToWords(th)} thousand`
      : `${numberToWords(th)} thousand ${numberToWords(rest)}`;
  }
  const m = Math.floor(n / 1_000_000);
  const rest = n % 1_000_000;
  return rest === 0
    ? `${numberToWords(m)} million`
    : `${numberToWords(m)} million ${numberToWords(rest)}`;
}

/** 342 -> "300 + 40 + 2". Zero places are omitted, per the standard. */
export function expandedForm(n: number): string {
  const parts: number[] = [];
  let place = 1;
  let rest = n;
  while (rest > 0) {
    const digit = rest % 10;
    if (digit !== 0) parts.push(digit * place);
    rest = Math.floor(rest / 10);
    place *= 10;
  }
  if (parts.length === 0) return "0";
  return parts.reverse().join(" + ");
}

/** 342 -> { hundreds: 3, tens: 4, ones: 2 } */
export function placeValueParts(n: number) {
  return {
    thousands: Math.floor(n / 1000) % 10,
    hundreds: Math.floor(n / 100) % 10,
    tens: Math.floor(n / 10) % 10,
    ones: n % 10,
  };
}

export function roundTo(n: number, place: number): number {
  return Math.round(n / place) * place;
}

/** Rounds away from the correct direction — a deliberate distractor. */
export function roundWrongDirection(n: number, place: number): number {
  const correct = roundTo(n, place);
  const down = Math.floor(n / place) * place;
  const up = Math.ceil(n / place) * place;
  if (down === up) return correct + place; // already exact; nudge it
  return correct === down ? up : down;
}

/**
 * Does adding these two numbers require carrying? Drives both difficulty
 * selection and whether the `no_regrouping` distractor is meaningful.
 */
export function requiresRegrouping(a: number, b: number): boolean {
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    if ((x % 10) + (y % 10) >= 10) return true;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return false;
}

/** The answer a child gets when they never carry: 47 + 25 -> 62. */
export function addWithoutRegrouping(a: number, b: number): number {
  let result = 0;
  let place = 1;
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    result += ((x % 10) + (y % 10)) % 10 * place;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
    place *= 10;
  }
  return result;
}

/** The answer a child gets treating each column as independent: 47 + 25 -> 612. */
export function addColumnsIndependently(a: number, b: number): number {
  const digits: number[] = [];
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    digits.push((x % 10) + (y % 10));
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return Number(digits.reverse().join("")) || 0;
}

/** Borrowing failure: subtracts the smaller digit from the larger in each column. */
export function subtractWithoutBorrowing(a: number, b: number): number {
  let result = 0;
  let place = 1;
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    result += Math.abs((x % 10) - (y % 10)) * place;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
    place *= 10;
  }
  return result;
}

export function requiresBorrowing(a: number, b: number): boolean {
  let x = a;
  let y = b;
  while (y > 0) {
    if (x % 10 < y % 10) return true;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return false;
}

/* ------------------------------------------------------------------ *
 * Fractions
 *
 * Kept as a plain pair rather than a class. Generators need to reason about
 * the numerator and denominator separately in order to build the distractors
 * that matter — a child who answers 2/8 for 1/4 + 1/4 has added the
 * denominators, and that is only expressible if the parts stay visible.
 * ------------------------------------------------------------------ */

export interface Fraction {
  n: number;
  d: number;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function simplify({ n, d }: Fraction): Fraction {
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export function addFractions(a: Fraction, b: Fraction): Fraction {
  return simplify({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
}

export function subFractions(a: Fraction, b: Fraction): Fraction {
  return simplify({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
}

export function mulFractions(a: Fraction, b: Fraction): Fraction {
  return simplify({ n: a.n * b.n, d: a.d * b.d });
}

/** "3/4", or "5" when it divides exactly, or "1 1/2" for an improper value. */
export function fractionText(f: Fraction, mixed = false): string {
  const { n, d } = simplify(f);
  if (d === 1) return String(n);
  if (!mixed || n < d) return `${n}/${d}`;
  const whole = Math.floor(n / d);
  const rest = n - whole * d;
  return rest === 0 ? String(whole) : `${whole} ${rest}/${d}`;
}

const ORDINAL_DENOMINATORS: Record<number, string> = {
  2: "half",
  3: "third",
  4: "fourth",
  5: "fifth",
  6: "sixth",
  8: "eighth",
  10: "tenth",
  12: "twelfth",
  100: "hundredth",
  1000: "thousandth",
};

/**
 * How the narrator says a fraction: "three fourths", not "three slash four".
 *
 * Florida's own wording for fraction word form, which is also what a child
 * hears in class. Unknown denominators fall back to "n over d" rather than
 * inventing an ordinal that may not be a real word.
 */
export function fractionToWords({ n, d }: Fraction): string {
  const name = ORDINAL_DENOMINATORS[d];
  if (!name) return `${numberToWords(n)} over ${numberToWords(d)}`;
  const plural = n === 1 ? name : `${name}s`;
  return `${numberToWords(n)} ${plural}`;
}

/* ------------------------------------------------------------------ *
 * Decimals
 * ------------------------------------------------------------------ */

/**
 * Rounds away the binary floating-point residue.
 *
 * 0.1 + 0.2 is 0.30000000000000004, and a question whose answer reads like
 * that is worse than no question at all. Every decimal a generator produces
 * goes through here.
 */
export function round(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round((n + Number.EPSILON) * f) / f;
}

/** Fixed-width decimal text: 0.5 at hundredths is "0.50". */
export function decimalText(n: number, places: number): string {
  return round(n, places).toFixed(places);
}

/**
 * Word form for decimals, the way Florida states it: the fractional part is
 * read as a whole number followed by its place. 3.42 is "three and forty-two
 * hundredths", never "three point four two".
 */
export function decimalToWords(n: number, places: number): string {
  const whole = Math.trunc(n);
  const frac = Math.round((round(n, places) - whole) * 10 ** places);
  if (frac === 0) return numberToWords(whole);
  const place = { 1: "tenth", 2: "hundredth", 3: "thousandth" }[places] ?? "";
  const unit = frac === 1 ? place : `${place}s`;
  return whole === 0
    ? `${numberToWords(frac)} ${unit}`
    : `${numberToWords(whole)} and ${numberToWords(frac)} ${unit}`;
}

/** Prime factors with multiplicity: 60 -> [2, 2, 3, 5]. */
export function primeFactors(n: number): number[] {
  const out: number[] = [];
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    while (rest % p === 0) {
      out.push(p);
      rest /= p;
    }
  }
  if (rest > 1) out.push(rest);
  return out;
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
}

export function factorPairs(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 1; a * a <= n; a++) if (n % a === 0) out.push([a, n / a]);
  return out;
}

/* ------------------------------------------------------------------ *
 * Statistics, for the data strands
 * ------------------------------------------------------------------ */

export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** The most common value, or null when nothing repeats more than the rest. */
export function mode(xs: number[]): number | null {
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  let best: number | null = null;
  let bestN = 0;
  let ties = 0;
  for (const [v, c] of counts) {
    if (c > bestN) {
      best = v;
      bestN = c;
      ties = 1;
    } else if (c === bestN) ties++;
  }
  return bestN > 1 && ties === 1 ? best : null;
}

export function range(xs: number[]): number {
  return Math.max(...xs) - Math.min(...xs);
}

/** Quartiles by the exclusive method Florida uses for box plots. */
export function fiveNumberSummary(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  const lower = s.slice(0, mid);
  const upper = s.length % 2 ? s.slice(mid + 1) : s.slice(mid);
  return {
    min: s[0],
    q1: median(lower),
    median: median(s),
    q3: median(upper),
    max: s[s.length - 1],
  };
}
