import { describe, it, expect } from "vitest";
import {
  POLYHEDRA,
  SOLIDS,
  SOLIDS_BY_GRADE,
  SOLID_KEYS,
  satisfiesEuler,
} from "../solids";

describe("solid data", () => {
  it("satisfies Euler's formula for every flat-faced solid", () => {
    // V - E + F = 2. If this fails, the app would be teaching a child a
    // fact that is simply false, so it is worth asserting rather than
    // trusting the table was typed correctly.
    for (const key of POLYHEDRA) {
      const solid = SOLIDS[key];
      expect(
        satisfiesEuler(solid),
        `${solid.name}: V(${solid.vertices}) - E(${solid.edges}) + F(${solid.faces}) = ${solid.vertices - solid.edges + solid.faces}, expected 2`,
      ).toBe(true);
    }
  });

  it("holds the counts the curriculum actually asks for", () => {
    expect(SOLIDS.cube).toMatchObject({ faces: 6, edges: 12, vertices: 8 });
    expect(SOLIDS["triangular-prism"]).toMatchObject({
      faces: 5,
      edges: 9,
      vertices: 6,
    });
    expect(SOLIDS["square-pyramid"]).toMatchObject({
      faces: 5,
      edges: 8,
      vertices: 5,
    });
    expect(SOLIDS["triangular-pyramid"]).toMatchObject({
      faces: 4,
      edges: 6,
      vertices: 4,
    });
  });

  it("uses the informal counts for curved solids", () => {
    expect(SOLIDS.cylinder).toMatchObject({ faces: 2, vertices: 0, curved: true });
    expect(SOLIDS.cone).toMatchObject({ faces: 1, vertices: 1, curved: true });
    expect(SOLIDS.sphere).toMatchObject({ faces: 0, vertices: 0, curved: true });
  });

  it("never introduces a solid before its grade", () => {
    // A second grader must not be shown a triangular pyramid.
    expect(SOLIDS_BY_GRADE[2]).not.toContain("triangular-pyramid");
    expect(SOLIDS_BY_GRADE[2]).not.toContain("triangular-prism");
    expect(SOLIDS_BY_GRADE[5]).toEqual(SOLID_KEYS);

    // Each grade's set must be a superset of the one before it.
    for (let grade = 2; grade <= 6; grade++) {
      for (const key of SOLIDS_BY_GRADE[grade - 1]) {
        expect(
          SOLIDS_BY_GRADE[grade],
          `grade ${grade} dropped ${key}, which grade ${grade - 1} teaches`,
        ).toContain(key);
      }
    }
  });

  it("gives every solid at least one real-world object except where none fits", () => {
    for (const key of SOLID_KEYS) {
      expect(SOLIDS[key].realWorld.length).toBeGreaterThan(0);
      expect(SOLIDS[key].benchmarks.length).toBeGreaterThan(0);
    }
  });
});
