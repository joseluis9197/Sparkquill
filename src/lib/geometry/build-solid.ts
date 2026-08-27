import type { SolidKey } from "./solids";

export type Vec3 = readonly [number, number, number];

export interface SolidMesh {
  /** Shared vertex positions. */
  vertices: Vec3[];
  /** Each face as an ordered ring of vertex indices. */
  faces: number[][];
  /** Undirected edges as index pairs, deduplicated. */
  edges: [number, number][];
}

/**
 * Explicit polyhedron topology.
 *
 * Built by hand rather than pulled from three.js primitives because the child
 * has to be able to tap one face and have exactly that face light up. A
 * BoxGeometry is a soup of triangles with no notion of "the top face", so
 * counting and highlighting would both be wrong.
 *
 * Winding is counter-clockwise seen from outside, so face normals point
 * outward and lighting behaves.
 */

function prismTopology(sides: number): { faces: number[][] } {
  // Vertices are laid out as [bottom 0..n-1, top n..2n-1].
  const faces: number[][] = [];
  const bottom = Array.from({ length: sides }, (_, i) => i);
  const top = Array.from({ length: sides }, (_, i) => i + sides);

  // regularPolygon winds counter-clockwise in the x/z plane, and x̂ × ẑ = -ŷ,
  // so that ring already faces downward — the bottom keeps it and the top
  // reverses it.
  faces.push([...bottom]);
  faces.push([...top].reverse());

  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    faces.push([bottom[j], bottom[i], top[i], top[j]]);
  }
  return { faces };
}

function edgesFromFaces(faces: number[][]): [number, number][] {
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  for (const face of faces) {
    for (let i = 0; i < face.length; i++) {
      const a = face[i];
      const b = face[(i + 1) % face.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push(a < b ? [a, b] : [b, a]);
    }
  }
  return edges;
}

function regularPolygon(sides: number, radius: number, y: number): Vec3[] {
  return Array.from({ length: sides }, (_, i) => {
    // Start at -90° so a square prism sits axis-aligned rather than diamond-on.
    const angle = (i / sides) * Math.PI * 2 + Math.PI / 4;
    return [
      Number((Math.cos(angle) * radius).toFixed(6)),
      y,
      Number((Math.sin(angle) * radius).toFixed(6)),
    ] as Vec3;
  });
}

function boxMesh(w: number, h: number, d: number): SolidMesh {
  const x = w / 2;
  const y = h / 2;
  const z = d / 2;
  const vertices: Vec3[] = [
    [-x, -y, z],
    [x, -y, z],
    [x, -y, -z],
    [-x, -y, -z],
    [-x, y, z],
    [x, y, z],
    [x, y, -z],
    [-x, y, -z],
  ];
  const faces: number[][] = [
    [0, 1, 2, 3].reverse(), // bottom
    [4, 5, 6, 7], // top
    [0, 1, 5, 4], // front
    [1, 2, 6, 5], // right
    [2, 3, 7, 6], // back
    [3, 0, 4, 7], // left
  ];
  return { vertices, faces, edges: edgesFromFaces(faces) };
}

function triangularPrismMesh(): SolidMesh {
  const r = 0.72;
  const h = 0.6;
  const bottom = regularPolygon(3, r, -h);
  const top = regularPolygon(3, r, h);
  const vertices = [...bottom, ...top];
  const { faces } = prismTopology(3);
  return { vertices, faces, edges: edgesFromFaces(faces) };
}

function pyramidMesh(baseSides: number): SolidMesh {
  const r = baseSides === 4 ? 0.78 : 0.85;
  const base = regularPolygon(baseSides, r, -0.5);
  const apex: Vec3 = [0, 0.75, 0];
  const vertices = [...base, apex];
  const apexIndex = baseSides;

  const faces: number[][] = [];
  // Same winding rule as the prism base: the generated ring already faces
  // downward, which is what a pyramid's base needs.
  faces.push(Array.from({ length: baseSides }, (_, i) => i));
  for (let i = 0; i < baseSides; i++) {
    const j = (i + 1) % baseSides;
    faces.push([j, i, apexIndex]);
  }
  return { vertices, faces, edges: edgesFromFaces(faces) };
}

function tetrahedronMesh(): SolidMesh {
  // A regular tetrahedron, not a triangular pyramid with a distinct base —
  // grade 5 names it as one of the pyramids, and all four faces are alike.
  const s = 0.85;
  const vertices: Vec3[] = [
    [s, s, s],
    [s, -s, -s],
    [-s, s, -s],
    [-s, -s, s],
  ];
  const faces: number[][] = [
    [0, 1, 2],
    [0, 3, 1],
    [0, 2, 3],
    [1, 3, 2],
  ];
  return { vertices, faces, edges: edgesFromFaces(faces) };
}

/**
 * Flat-faced solids get exact topology. Curved solids return null: they are
 * rendered with a smooth parametric mesh instead, because "tap a face" is not
 * a meaningful interaction on a sphere.
 */
export function buildSolidMesh(key: SolidKey): SolidMesh | null {
  switch (key) {
    case "cube":
      return boxMesh(1.3, 1.3, 1.3);
    case "rectangular-prism":
      return boxMesh(1.7, 1.0, 1.2);
    case "triangular-prism":
      return triangularPrismMesh();
    case "square-pyramid":
      return pyramidMesh(4);
    case "triangular-pyramid":
      return tetrahedronMesh();
    case "cylinder":
    case "cone":
    case "sphere":
      return null;
  }
}

/** Triangulates a convex face ring into a flat triangle list for rendering. */
export function triangulateFace(face: number[]): [number, number, number][] {
  const tris: [number, number, number][] = [];
  for (let i = 1; i < face.length - 1; i++) {
    tris.push([face[0], face[i], face[i + 1]]);
  }
  return tris;
}

/** Centroid of a face, used to place the tap target and the count label. */
export function faceCentroid(mesh: SolidMesh, faceIndex: number): Vec3 {
  const face = mesh.faces[faceIndex];
  let x = 0;
  let y = 0;
  let z = 0;
  for (const i of face) {
    x += mesh.vertices[i][0];
    y += mesh.vertices[i][1];
    z += mesh.vertices[i][2];
  }
  const n = face.length;
  return [x / n, y / n, z / n];
}

/** Outward normal of a face, from its first three vertices. */
export function faceNormal(mesh: SolidMesh, faceIndex: number): Vec3 {
  const [ia, ib, ic] = mesh.faces[faceIndex];
  const a = mesh.vertices[ia];
  const b = mesh.vertices[ib];
  const c = mesh.vertices[ic];
  const u: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n: Vec3 = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  const len = Math.hypot(n[0], n[1], n[2]) || 1;
  return [n[0] / len, n[1] / len, n[2] / len];
}
