import type { Subject } from "./data/progress";

/**
 * The parts of the practice focus that both sides need.
 *
 * Split out from `lib/data/focus.ts` because that module is `server-only` —
 * it opens the database — and the parent's form is a client component that
 * needs the list of durations to render the picker. Importing the server
 * module from the client would have thrown at build time; a type-only import
 * would have been erased and looked fine until the first value was needed.
 */

/** How long a focus lasts, in days. The parent picks one of these. */
export const FOCUS_DAYS = [3, 7, 14] as const;
export type FocusDays = (typeof FOCUS_DAYS)[number];

export interface StrandOption {
  code: string;
  name: string;
  subject: Subject;
  /** How many practisable skills sit in it, for this child's grade. */
  skillCount: number;
}
