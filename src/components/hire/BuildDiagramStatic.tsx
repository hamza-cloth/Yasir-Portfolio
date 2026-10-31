import { STATIC_NODE_POSITIONS } from "./build-layout";

// The flat version of the build diagram: the gold-edged core, spokes to six nodes and the outer
// ring that joins them. Shown while the 3D scene loads, and instead of it when WebGL is missing,
// motion is reduced or the device is low-powered. Labels are drawn by BuildDiagram on top.
export function BuildDiagramStatic() {
  const ring = STATIC_NODE_POSITIONS.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden="true">
      <polygon points={ring} fill="none" className="build-ring" />
      {STATIC_NODE_POSITIONS.map((point, index) => (
        <line key={index} x1={50} y1={50} x2={point.x} y2={point.y} className="build-spoke" />
      ))}
      {/* A flat icosahedron: a hexagon split into triangles around the centre. */}
      <g className="build-core">
        <polygon points="50,39 59.5,44.5 59.5,55.5 50,61 40.5,55.5 40.5,44.5" />
        <path d="M50 39 L50 50 M59.5 44.5 L50 50 M59.5 55.5 L50 50 M50 61 L50 50 M40.5 55.5 L50 50 M40.5 44.5 L50 50 M50 39 L59.5 55.5 L40.5 55.5 Z" />
      </g>
      {STATIC_NODE_POSITIONS.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={2.6} className="build-node" />
      ))}
    </svg>
  );
}
