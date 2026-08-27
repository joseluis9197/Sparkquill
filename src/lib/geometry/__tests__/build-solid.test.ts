import { describe, it, expect } from "vitest";
import { SOLIDS, SOLID_KEYS, POLYHEDRA } from "../solids";
import {
  buildSolidMesh,
  faceCentroid,
  faceNormal,
  triangulateFace,
} from "../build-solid";

describe("solid meshes", () => {
  it("builds a mesh whose counts match the data table exactly", () => {
    // This is the check that matters most in the whole geometry module: the
    // question says a triangular prism has 5 faces, so the object the child
    // rotates and taps must have exactly 5 tappable faces. Two sources of
    // truth would drift; this test forbids it.
    for (const key of POLYHEDRA) {
      const mesh = buildSolidMesh(key);
      expect(mesh, `${key} should have an exact mesh`).not.toBeNull();
      const solid = SOLIDS[key];
      expect(mesh!.faces.length, `${key} faces`).toBe(solid.faces);
      expect(mesh!.edges.length, `${key} edges`).toBe(solid.edges);
      expect(mesh!.vertices.length, `${key} vertices`).toBe(solid.vertices);
    }
  });

  it("returns no mesh for curved solids", () => {
    for (const key of SOLID_KEYS) {
      if (!SOLIDS[key].curved) continue;
      expect(buildSolidMesh(key)).toBeNull();
    }
  });

  it("gives every face at least three distinct vertices", () => {
    for (const key of POLYHEDRA) {
      const mesh = buildSolidMesh(key)!;
      for (const [i, face] of mesh.faces.entries()) {
        expect(face.length, `${key} face ${i}`).toBeGreaterThanOrEqual(3);
        expect(new Set(face).size, `${key} face ${i} repeats a vertex`).toBe(
          face.length,
        );
        for (const idx of face) {
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThan(mesh.vertices.length);
        }
      }
    }
  });

  it("uses every vertex in at least three faces", () => {
    // A vertex touched by fewer than three faces would be a dangling point,
    // which means the topology is broken.
    for (const key of POLYHEDRA) {
      const mesh = buildSolidMesh(key)!;
      const uses = new Array(mesh.vertices.length).fill(0);
      for (const face of mesh.faces) for (const i of face) uses[i]++;
      for (const [i, count] of uses.entries()) {
        expect(count, `${key} vertex ${i} used ${count} times`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("shares every edge between exactly two faces", () => {
    // The defining property of a closed solid. If an edge belongs to one
    // face, there is a hole.
    for (const key of POLYHEDRA) {
      const mesh = buildSolidMesh(key)!;
      const counts = new Map<string, number>();
      for (const face of mesh.faces) {
        for (let i = 0; i < face.length; i++) {
          const a = face[i];
          const b = face[(i + 1) % face.length];
          const k = a < b ? `${a}-${b}` : `${b}-${a}`;
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
      }
      for (const [edge, count] of counts) {
        expect(count, `${key} edge ${edge} borders ${count} faces`).toBe(2);
      }
    }
  });

  it("points every face normal away from the centre", () => {
    // Outward winding, so lighting and back-face culling behave and a tapped
    // face is the one the child is looking at.
    for (const key of POLYHEDRA) {
      const mesh = buildSolidMesh(key)!;
      for (let i = 0; i < mesh.faces.length; i++) {
        const c = faceCentroid(mesh, i);
        const n = faceNormal(mesh, i);
        const dot = c[0] * n[0] + c[1] * n[1] + c[2] * n[2];
        expect(
          dot,
          `${key} face ${i} is wound inward (dot ${dot.toFixed(3)})`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("triangulates an n-gon into n-2 triangles", () => {
    expect(triangulateFace([0, 1, 2])).toHaveLength(1);
    expect(triangulateFace([0, 1, 2, 3])).toHaveLength(2);
    expect(triangulateFace([0, 1, 2, 3, 4])).toHaveLength(3);
  });

  it("keeps every solid inside a sane bounding box", () => {
    // The camera framing assumes roughly unit scale; a solid that escapes it
    // would render clipped or tiny.
    for (const key of POLYHEDRA) {
      const mesh = buildSolidMesh(key)!;
      for (const v of mesh.vertices) {
        for (const component of v) {
          expect(Math.abs(component)).toBeLessThanOrEqual(1.2);
        }
      }
    }
  });
});
