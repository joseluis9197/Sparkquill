import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Grades the platform covers. */
export const GRADES = [1, 2, 3, 4, 5, 6] as const;
export type Grade = (typeof GRADES)[number];

export const SUBJECTS = ["math", "ela"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const SUBJECT_LABEL: Record<Subject, string> = {
  math: "Mathematics",
  ela: "Reading",
};

/**
 * Grades 1-2 sit the Renaissance Star assessments, which report percentile
 * and domains rather than benchmark-level achievement levels. Grades 3-6 sit
 * FAST proper, which publishes a blueprint and cut scores. Anything that
 * predicts an achievement level must check this first.
 */
export function hasBlueprint(grade: number): boolean {
  return grade >= 3;
}

export function assessmentName(grade: number, subject: Subject): string {
  if (grade >= 3) {
    return subject === "math" ? "FAST Mathematics" : "FAST ELA Reading";
  }
  if (subject === "math") return "FAST Star Math";
  return grade === 1 ? "FAST Star Early Literacy" : "FAST Star Reading";
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
