/**
 * Reading a benchmark code without asking the database.
 *
 * Florida encodes the subject and grade in the code itself: MA.2.NSO.1.1 is
 * second grade mathematics, ELA.5.R.2.2 is fifth grade reading. Anywhere the
 * grade is needed on the client — where there is no database and no session —
 * this is how it is known.
 *
 * The server does not use this. It joins to the benchmarks table, which is
 * the authority; this is a parser for the one place that cannot.
 */
export interface BenchmarkParts {
  subject: "math" | "ela";
  grade: number;
}

export function parseBenchmark(code: string): BenchmarkParts | null {
  const parts = code.split(".");
  if (parts.length < 3) return null;
  const subject = parts[0] === "MA" ? "math" : parts[0] === "ELA" ? "ela" : null;
  const grade = Number(parts[1]);
  if (!subject || !Number.isInteger(grade) || grade < 1 || grade > 12) return null;
  return { subject, grade };
}
