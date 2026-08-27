"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { SolidKey } from "@/lib/geometry/solids";
import { SOLIDS } from "@/lib/geometry/solids";
import {
  buildSolidMesh,
  faceCentroid,
  faceNormal,
  triangulateFace,
  type SolidMesh,
} from "@/lib/geometry/build-solid";

/** Polygon count is kept deliberately low: many Florida students are on
 *  school Chromebooks, and a smooth 30fps beats a pretty 8fps. */
const CURVE_SEGMENTS = 32;

const COLORS = {
  face: "#5fbfa8",
  faceCounted: "#e7a11a",
  faceHover: "#8ad6c3",
  edge: "#134e45",
  vertex: "#c2410c",
};

interface SolidSceneProps {
  solid: SolidKey;
  countedFaces: Set<number>;
  hoveredFace: number | null;
  highlight: "faces" | "edges" | "vertices";
  autoRotate: boolean;
  onFaceClick: (index: number) => void;
  onFaceHover: (index: number | null) => void;
}

/** One tappable face, built as its own geometry so a tap selects exactly it. */
function Face({
  mesh,
  index,
  state,
  onClick,
  onHover,
}: {
  mesh: SolidMesh;
  index: number;
  state: "idle" | "hover" | "counted";
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const tris = triangulateFace(mesh.faces[index]);
    const positions: number[] = [];
    for (const [a, b, c] of tris) {
      positions.push(...mesh.vertices[a], ...mesh.vertices[b], ...mesh.vertices[c]);
    }
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    g.computeVertexNormals();
    return g;
  }, [mesh, index]);

  const color =
    state === "counted"
      ? COLORS.faceCounted
      : state === "hover"
        ? COLORS.faceHover
        : COLORS.face;

  return (
    <mesh
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
      }}
      onPointerOut={() => onHover(false)}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.55}
        metalness={0.05}
        transparent
        opacity={state === "counted" ? 1 : 0.92}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Edges({ mesh, emphasised }: { mesh: SolidMesh; emphasised: boolean }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (const [a, b] of mesh.edges) {
      positions.push(...mesh.vertices[a], ...mesh.vertices[b]);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [mesh]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={emphasised ? COLORS.vertex : COLORS.edge}
        linewidth={2}
      />
    </lineSegments>
  );
}

function Vertices({ mesh, emphasised }: { mesh: SolidMesh; emphasised: boolean }) {
  return (
    <group>
      {mesh.vertices.map((v, i) => (
        <mesh key={i} position={v as unknown as THREE.Vector3Tuple}>
          <sphereGeometry args={[emphasised ? 0.075 : 0.045, 12, 12]} />
          <meshStandardMaterial
            color={emphasised ? COLORS.vertex : COLORS.edge}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Curved solids: no face picking, since "tap a face" means nothing here. */
function CurvedSolid({ solid }: { solid: SolidKey }) {
  const geometry = useMemo(() => {
    switch (solid) {
      case "cylinder":
        return new THREE.CylinderGeometry(0.65, 0.65, 1.3, CURVE_SEGMENTS);
      case "cone":
        return new THREE.ConeGeometry(0.72, 1.4, CURVE_SEGMENTS);
      case "sphere":
        return new THREE.SphereGeometry(0.8, CURVE_SEGMENTS, CURVE_SEGMENTS / 2);
      default:
        return new THREE.SphereGeometry(0.8, CURVE_SEGMENTS, CURVE_SEGMENTS / 2);
    }
  }, [solid]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={COLORS.face} roughness={0.5} />
    </mesh>
  );
}

export default function SolidScene({
  solid,
  countedFaces,
  hoveredFace,
  highlight,
  autoRotate,
  onFaceClick,
  onFaceHover,
}: SolidSceneProps) {
  const group = useRef<THREE.Group>(null);
  const mesh = useMemo(() => buildSolidMesh(solid), [solid]);
  const isCurved = SOLIDS[solid].curved;

  useFrame((_, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 4]} intensity={1.15} />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} />

      <group ref={group}>
        {isCurved || !mesh ? (
          <CurvedSolid solid={solid} />
        ) : (
          <>
            {mesh.faces.map((_, i) => (
              <Face
                key={i}
                mesh={mesh}
                index={i}
                state={
                  countedFaces.has(i)
                    ? "counted"
                    : hoveredFace === i
                      ? "hover"
                      : "idle"
                }
                onClick={() => onFaceClick(i)}
                onHover={(h) => onFaceHover(h ? i : null)}
              />
            ))}
            <Edges mesh={mesh} emphasised={highlight === "edges"} />
            <Vertices mesh={mesh} emphasised={highlight === "vertices"} />
          </>
        )}
      </group>
    </>
  );
}

export { faceCentroid, faceNormal };
