/**
 * Clock geometry.
 *
 * Kept as pure functions because the angles are the part that goes wrong
 * silently: an hour hand that sits on the 3 when the time is 3:45 teaches a
 * child to read the clock incorrectly, and nothing about the drawing would
 * look obviously broken.
 */

export interface HandAngles {
  /** Degrees clockwise from 12 o'clock. */
  hour: number;
  minute: number;
}

/**
 * The hour hand moves continuously: at 3:30 it sits halfway between 3 and 4,
 * not on the 3. This is exactly what "quarter to" problems depend on.
 */
export function handAngles(hour: number, minute: number): HandAngles {
  const h = ((hour % 12) + 12) % 12;
  const m = ((minute % 60) + 60) % 60;
  return {
    hour: h * 30 + m * 0.5,
    minute: m * 6,
  };
}

/**
 * Point on the dial for an angle, with 12 o'clock at the top.
 *
 * Rounded to three decimals on purpose. These coordinates are rendered into
 * SVG attributes during server rendering and recomputed on the client, and
 * full-precision floats can serialise differently on the two sides — enough to
 * trip a React hydration mismatch on every tick mark. Three decimals is far
 * finer than a 0-100 viewBox can show and makes both sides agree exactly.
 */
export function polar(
  angleDeg: number,
  radius: number,
  cx = 50,
  cy = 50,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return {
    x: round(cx + radius * Math.cos(rad)),
    y: round(cy + radius * Math.sin(rad)),
  };
}

/** Angle of a pointer position relative to the dial centre. */
export function angleFromPoint(
  x: number,
  y: number,
  cx = 50,
  cy = 50,
): number {
  const deg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
  return (deg + 360) % 360;
}

/**
 * Snaps a dragged minute hand to the nearest five minutes.
 *
 * MA.2.M.2.1 asks for time to the nearest five minutes, so free positioning
 * would let a child set 3:37 and then be marked wrong for reading it as 3:35.
 * The manipulative should only produce times the benchmark actually uses.
 */
export function minuteFromAngle(angleDeg: number, step = 5): number {
  const raw = (angleDeg / 6 + 60) % 60;
  const snapped = Math.round(raw / step) * step;
  return snapped % 60;
}

/** Hour that a dragged hour hand points at. */
export function hourFromAngle(angleDeg: number): number {
  const raw = Math.round(angleDeg / 30) % 12;
  return raw === 0 ? 12 : raw;
}

/**
 * How Florida expects the time spoken, including the landmark phrases the
 * benchmark names explicitly.
 */
export function spokenTime(hour: number, minute: number): string {
  const h = hour === 0 ? 12 : hour;
  const next = h === 12 ? 1 : h + 1;
  if (minute === 0) return `${h} o'clock`;
  if (minute === 15) return `quarter past ${h}`;
  if (minute === 30) return `half past ${h}`;
  if (minute === 45) return `quarter to ${next}`;
  if (minute < 30) return `${minute} minutes past ${h}`;
  return `${60 - minute} minutes to ${next}`;
}

export function digitalTime(hour: number, minute: number): string {
  const h = hour === 0 ? 12 : hour;
  return `${h}:${String(minute).padStart(2, "0")}`;
}
