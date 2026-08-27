/**
 * The solids the curriculum names, with the counts children are asked for.
 *
 * Shared deliberately between the item generators and the 3D widget: if the
 * question says a triangular prism has 5 faces, the thing the child rotates
 * on screen had better have 5 faces. Keeping one source of truth is what
 * prevents that class of bug entirely.
 *
 * Curved solids are the subtle case. A cylinder is conventionally described
 * at this level as having 2 faces and 0 vertices, and a cone 1 face and 1
 * apex; Florida's grade 1-2 expectations use the informal counting, so
 * `curved` flags them for the widget to label carefully rather than let a
 * child over-generalise Euler's formula.
 */

export type SolidKey =
  | "cube"
  | "rectangular-prism"
  | "triangular-prism"
  | "square-pyramid"
  | "triangular-pyramid"
  | "cylinder"
  | "cone"
  | "sphere";

export interface Solid {
  key: SolidKey;
  name: string;
  /** Plural used in prompts: "How many faces does a cube have?" */
  article: "a" | "an";
  faces: number;
  edges: number;
  vertices: number;
  curved: boolean;
  /** Whether a flat net exists and can be unfolded in the widget. */
  hasNet: boolean;
  /** Everyday objects, used in MA.1.GR.1.4 style prompts. */
  realWorld: string[];
  /** Benchmarks this solid is used for. */
  benchmarks: string[];
}

export const SOLIDS: Record<SolidKey, Solid> = {
  cube: {
    key: "cube",
    name: "cube",
    article: "a",
    faces: 6,
    edges: 12,
    vertices: 8,
    curved: false,
    hasNet: true,
    realWorld: ["a dice", "a sugar cube", "a building block"],
    benchmarks: ["MA.1.GR.1.1", "MA.2.GR.1.2", "MA.5.GR.1.2"],
  },
  "rectangular-prism": {
    key: "rectangular-prism",
    name: "rectangular prism",
    article: "a",
    faces: 6,
    edges: 12,
    vertices: 8,
    curved: false,
    hasNet: true,
    realWorld: ["a cereal box", "a brick", "a shoebox"],
    benchmarks: ["MA.1.GR.1.1", "MA.5.GR.1.2", "MA.6.GR.2.4"],
  },
  "triangular-prism": {
    key: "triangular-prism",
    name: "triangular prism",
    article: "a",
    faces: 5,
    edges: 9,
    vertices: 6,
    curved: false,
    hasNet: true,
    realWorld: ["a tent", "a chocolate bar box"],
    benchmarks: ["MA.5.GR.1.2", "MA.6.GR.2.4"],
  },
  "square-pyramid": {
    key: "square-pyramid",
    name: "square pyramid",
    article: "a",
    faces: 5,
    edges: 8,
    vertices: 5,
    curved: false,
    hasNet: true,
    realWorld: ["the Great Pyramid", "a tent top"],
    benchmarks: ["MA.5.GR.1.2", "MA.6.GR.2.4"],
  },
  "triangular-pyramid": {
    key: "triangular-pyramid",
    name: "triangular pyramid",
    article: "a",
    faces: 4,
    edges: 6,
    vertices: 4,
    curved: false,
    hasNet: true,
    realWorld: ["a tetrahedron dice"],
    benchmarks: ["MA.5.GR.1.2"],
  },
  cylinder: {
    key: "cylinder",
    name: "cylinder",
    article: "a",
    faces: 2,
    edges: 0,
    vertices: 0,
    curved: true,
    hasNet: true,
    realWorld: ["a can of soup", "a drum", "a roll of tape"],
    benchmarks: ["MA.1.GR.1.1", "MA.5.GR.1.2"],
  },
  cone: {
    key: "cone",
    name: "cone",
    article: "a",
    faces: 1,
    edges: 0,
    vertices: 1,
    curved: true,
    hasNet: true,
    realWorld: ["an ice cream cone", "a traffic cone", "a party hat"],
    benchmarks: ["MA.1.GR.1.1", "MA.5.GR.1.2"],
  },
  sphere: {
    key: "sphere",
    name: "sphere",
    article: "a",
    faces: 0,
    edges: 0,
    vertices: 0,
    curved: true,
    hasNet: false,
    realWorld: ["a basketball", "a globe", "an orange"],
    benchmarks: ["MA.1.GR.1.1", "MA.5.GR.1.2"],
  },
};

export const SOLID_KEYS = Object.keys(SOLIDS) as SolidKey[];

/** The flat-faced solids, the only ones where face/edge/vertex counting is safe. */
export const POLYHEDRA = SOLID_KEYS.filter((k) => !SOLIDS[k].curved);

/** Solids introduced by grade, so a generator never shows a 6th grade solid to a 2nd grader. */
export const SOLIDS_BY_GRADE: Record<number, SolidKey[]> = {
  1: ["cube", "rectangular-prism", "cylinder", "cone", "sphere"],
  2: ["cube", "rectangular-prism", "cylinder", "cone", "sphere"],
  3: ["cube", "rectangular-prism", "cylinder", "cone", "sphere"],
  4: ["cube", "rectangular-prism", "triangular-prism", "cylinder", "cone", "sphere"],
  5: SOLID_KEYS,
  6: SOLID_KEYS,
};

export type SolidAttribute = "faces" | "edges" | "vertices";

export const ATTRIBUTE_LABEL: Record<SolidAttribute, { one: string; many: string }> = {
  faces: { one: "face", many: "faces" },
  edges: { one: "edge", many: "edges" },
  vertices: { one: "vertex", many: "vertices" },
};

/**
 * Euler's formula, used as an internal consistency check rather than as
 * content. Any polyhedron we ship must satisfy V - E + F = 2; if one does
 * not, the data is wrong and children would be taught a false fact.
 */
export function satisfiesEuler(solid: Solid): boolean {
  if (solid.curved) return true; // formula does not apply
  return solid.vertices - solid.edges + solid.faces === 2;
}
