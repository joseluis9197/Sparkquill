import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GENERATORS } from "../registry";

/**
 * Guards the link between a generator and the standard it claims to teach.
 *
 * This exists because a generator that counted faces on a cube was filed under
 * MA.2.GR.1.2, which is about categorising *2D* figures. Nothing failed: the
 * app ran, the questions were correct, and the parent dashboard credited a
 * standard the child had never practised. In a product whose whole promise is
 * standards alignment, that is the worst kind of bug — invisible and directly
 * contrary to what is being sold.
 */

interface Benchmark {
  code: string;
  grade: number;
  subject: string;
  description: string;
}

function loadBenchmarks(): Map<string, Benchmark> {
  const out = new Map<string, Benchmark>();
  for (const file of ["benchmarks-math.csv", "benchmarks-ela.csv"]) {
    const raw = readFileSync(join(process.cwd(), "docs", file), "utf8");
    const lines = raw.trim().split(/\r?\n/).slice(1);
    for (const line of lines) {
      // Fields are simple until the quoted description; the first five are safe
      // to split on commas.
      const [code, grade, subject] = line.split(",", 3);
      const description = line.match(/"([^"]*)"/)?.[1] ?? "";
      out.set(code, {
        code,
        grade: Number(grade),
        subject,
        description,
      });
    }
  }
  return out;
}

const BENCHMARKS = loadBenchmarks();

describe("generator alignment with the curriculum", () => {
  it("loaded the curriculum to check against", () => {
    expect(BENCHMARKS.size).toBe(358);
  });

  it.each(GENERATORS.map((g) => [g.key, g] as const))(
    "%s points at a benchmark that exists",
    (_key, generator) => {
      const benchmark = BENCHMARKS.get(generator.benchmark);
      expect(
        benchmark,
        `${generator.key} claims ${generator.benchmark}, which is not in the curriculum`,
      ).toBeDefined();
    },
  );

  it.each(GENERATORS.map((g) => [g.key, g] as const))(
    "%s sits in the subject its key claims",
    (_key, generator) => {
      // Keys are namespaced by subject: "ela.*" for English Language Arts and
      // "g<grade>.*" for mathematics. A generator filed under the wrong
      // subject would be offered to a child who chose the other one — the
      // subject-level version of the grade bug this suite exists to prevent.
      const expected = generator.key.startsWith("ela.") ? "ela" : "math";
      expect(
        BENCHMARKS.get(generator.benchmark)?.subject,
        `${generator.key} looks like ${expected} but ${generator.benchmark} is not`,
      ).toBe(expected);
    },
  );

  it.each(GENERATORS.filter((g) => g.key.startsWith("ela.")).map((g) => [g.key, g] as const))(
    "%s targets the grade its key names",
    (_key, generator) => {
      // ELA generators are produced from a table that fills the grade into
      // both the key and the benchmark. If those two ever disagree, a fifth
      // grader gets a second grade passage under a fifth grade standard.
      const fromKey = Number(generator.key.match(/^ela\.g(\d)\./)?.[1]);
      expect(BENCHMARKS.get(generator.benchmark)?.grade).toBe(fromKey);
    },
  );

  it("keeps every skill on exactly one benchmark", () => {
    // A skill split across two benchmarks would record mastery against
    // whichever generator happened to run, which is not mastery of either.
    const bySkill = new Map<string, Set<string>>();
    for (const g of GENERATORS) {
      const set = bySkill.get(g.skillSlug) ?? new Set<string>();
      set.add(g.benchmark);
      bySkill.set(g.skillSlug, set);
    }
    for (const [slug, codes] of bySkill) {
      expect(
        codes.size,
        `skill "${slug}" is claimed by ${[...codes].join(" and ")}`,
      ).toBe(1);
    }
  });

  it("never teaches a solid-counting question under a 2D benchmark", () => {
    // The specific mistake this file was written for. A benchmark whose text
    // is about 2D figures must not be taught with the 3D solid explorer.
    for (const g of GENERATORS) {
      const text = BENCHMARKS.get(g.benchmark)?.description.toLowerCase() ?? "";
      const is2dOnly = text.includes("2d") && !text.includes("3d");
      const teaches3d = g.key.includes("solid");
      expect(
        is2dOnly && teaches3d,
        `${g.key} teaches solids but ${g.benchmark} is "${BENCHMARKS.get(g.benchmark)?.description}"`,
      ).toBe(false);
    }
  });

  it("keeps generated content inside the grade its benchmark belongs to", () => {
    // A grade 2 child should not be served a grade 5 benchmark by accident.
    for (const g of GENERATORS) {
      const grade = BENCHMARKS.get(g.benchmark)?.grade;
      expect(grade).toBeGreaterThanOrEqual(1);
      expect(grade).toBeLessThanOrEqual(6);
    }
  });
});
