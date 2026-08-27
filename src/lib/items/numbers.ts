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
