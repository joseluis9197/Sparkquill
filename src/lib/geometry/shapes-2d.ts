/**
 * Two-dimensional figures for MA.2.GR.1.1, MA.2.GR.1.2 and MA.2.GR.1.3.
 *
 * The grade 2 benchmark is explicit about which attributes count: number of
 * sides, number of vertices, whether the figure is closed, and whether its
 * edges are straight or curved. Those four are the whole vocabulary, so they
 * are the fields here — and lines of symmetry, which MA.2.GR.1.3 adds.
 */

export type ShapeKey =
  | "triangle"
  | "square"
  | "rectangle"
  | "rhombus"
  | "trapezoid"
  | "pentagon"
  | "hexagon"
  | "heptagon"
  | "octagon"
  | "circle"
  | "oval";

export interface Shape2D {
  key: ShapeKey;
  name: string;
  article: "a" | "an";
  sides: number;
  vertices: number;
  straightEdges: boolean;
  /** Lines of symmetry for the regular/standard drawing used in the app. */
  linesOfSymmetry: number;
  /** SVG polygon points in a 0-100 box, or null for curved figures. */
  points: string | null;
  grade: 1 | 2;
}

/** Regular polygon points, first vertex at the top. */
function regular(sides: number, radius = 42): string {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    // Rounded so server and client render identical markup; full-precision
    // trigonometry serialises differently on the two sides.
    return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
  }).join(" ");
}

export const SHAPES: Record<ShapeKey, Shape2D> = {
  triangle: {
    key: "triangle",
    name: "triangle",
    article: "a",
    sides: 3,
    vertices: 3,
    straightEdges: true,
    linesOfSymmetry: 3,
    points: regular(3),
    grade: 1,
  },
  square: {
    key: "square",
    name: "square",
    article: "a",
    sides: 4,
    vertices: 4,
    straightEdges: true,
    linesOfSymmetry: 4,
    points: "14,14 86,14 86,86 14,86",
    grade: 1,
  },
  rectangle: {
    key: "rectangle",
    name: "rectangle",
    article: "a",
    sides: 4,
    vertices: 4,
    straightEdges: true,
    // A non-square rectangle has two: the two through opposite side midpoints.
    linesOfSymmetry: 2,
    points: "8,24 92,24 92,76 8,76",
    grade: 1,
  },
  rhombus: {
    key: "rhombus",
    name: "rhombus",
    article: "a",
    sides: 4,
    vertices: 4,
    straightEdges: true,
    linesOfSymmetry: 2,
    points: "50,8 88,50 50,92 12,50",
    grade: 2,
  },
  trapezoid: {
    key: "trapezoid",
    name: "trapezoid",
    article: "a",
    sides: 4,
    vertices: 4,
    straightEdges: true,
    // An isosceles trapezoid, which is how it is drawn here.
    linesOfSymmetry: 1,
    points: "26,26 74,26 92,76 8,76",
    grade: 2,
  },
  pentagon: {
    key: "pentagon",
    name: "pentagon",
    article: "a",
    sides: 5,
    vertices: 5,
    straightEdges: true,
    linesOfSymmetry: 5,
    points: regular(5),
    grade: 2,
  },
  hexagon: {
    key: "hexagon",
    name: "hexagon",
    article: "a",
    sides: 6,
    vertices: 6,
    straightEdges: true,
    linesOfSymmetry: 6,
    points: regular(6),
    grade: 1,
  },
  heptagon: {
    key: "heptagon",
    name: "heptagon",
    article: "a",
    sides: 7,
    vertices: 7,
    straightEdges: true,
    linesOfSymmetry: 7,
    points: regular(7),
    grade: 2,
  },
  octagon: {
    key: "octagon",
    name: "octagon",
    article: "an",
    sides: 8,
    vertices: 8,
    straightEdges: true,
    linesOfSymmetry: 8,
    points: regular(8),
    grade: 2,
  },
  circle: {
    key: "circle",
    name: "circle",
    article: "a",
    sides: 0,
    vertices: 0,
    straightEdges: false,
    // Infinite in truth; the app never asks a child to count them.
    linesOfSymmetry: -1,
    points: null,
    grade: 1,
  },
  oval: {
    key: "oval",
    name: "oval",
    article: "an",
    sides: 0,
    vertices: 0,
    straightEdges: false,
    linesOfSymmetry: 2,
    points: null,
    grade: 2,
  },
};

export const SHAPE_KEYS = Object.keys(SHAPES) as ShapeKey[];

/** Straight-edged figures, the only ones with countable sides and vertices. */
export const POLYGONS = SHAPE_KEYS.filter((k) => SHAPES[k].straightEdges);

/** MA.2.GR.1.1 names triangle through octagon explicitly. */
export const GRADE_2_POLYGONS: ShapeKey[] = [
  "triangle",
  "square",
  "rectangle",
  "rhombus",
  "trapezoid",
  "pentagon",
  "hexagon",
  "heptagon",
  "octagon",
];

export function shapesForGrade(grade: number): ShapeKey[] {
  return SHAPE_KEYS.filter((k) => SHAPES[k].grade <= Math.max(1, grade));
}
