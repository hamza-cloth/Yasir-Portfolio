import { BUILD_NODES } from "@/lib/hire";

// Where each node sits in the flat diagram, as percentages of the square box: an ellipse, so the
// still version reads as the same tilted ring the 3D scene shows. Node 0 is at the top.
export const STATIC_NODE_POSITIONS = BUILD_NODES.map((_, index) => {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / BUILD_NODES.length;
  return { x: 50 + 37 * Math.cos(angle), y: 50 + 30 * Math.sin(angle) };
});
