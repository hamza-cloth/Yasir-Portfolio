import { arcPoint, isOccluded, rotate, type Vec3 } from "./globe";

export type GlobeColors = {
  dot: string;
  // Arcs cycle through these, so neighbouring routes read apart.
  arcs: string[];
  hub: string;
  label: string;
  labelFont: string;
};

export type GlobeScene = {
  points: Vec3[];
  hub: Vec3;
  hubLabel: string;
  destinations: Vec3[];
};

type GlobeFrame = {
  width: number;
  height: number;
  time: number;
  yaw: number;
  pitch: number;
  colors: GlobeColors;
};

const ARC_STEPS = 40;
const ARC_LIFT = 0.12;
// Leaves room for the lifted arcs, so nothing is drawn outside the tile.
const RADIUS_RATIO = 0.4;

export function drawGlobeFrame(
  context: CanvasRenderingContext2D,
  scene: GlobeScene,
  frame: GlobeFrame,
): void {
  const { width, height, time, yaw, pitch, colors } = frame;
  const radius = Math.min(width, height) * RADIUS_RATIO;
  const cx = width / 2;
  const cy = height / 2;
  const toScreen = (v: Vec3) => ({ x: cx + v.x * radius, y: cy - v.y * radius });

  context.clearRect(0, 0, width, height);

  context.fillStyle = colors.dot;
  for (const point of scene.points) {
    const p = rotate(point, yaw, pitch);
    context.globalAlpha = p.z >= 0 ? 0.3 + p.z * 0.65 : 0.08;
    const s = toScreen(p);
    context.beginPath();
    context.arc(s.x, s.y, p.z >= 0 ? 1.15 + p.z * 0.5 : 0.8, 0, Math.PI * 2);
    context.fill();
  }

  context.lineWidth = 1.6;
  context.lineCap = "round";
  scene.destinations.forEach((destination, index) => {
    const color = colors.arcs[index % colors.arcs.length] ?? colors.hub;
    context.strokeStyle = color;
    context.globalAlpha = 0.75;
    context.beginPath();
    let drawing = false;
    for (let step = 0; step <= ARC_STEPS; step += 1) {
      const p = rotate(arcPoint(scene.hub, destination, step / ARC_STEPS, ARC_LIFT), yaw, pitch);
      if (isOccluded(p)) {
        drawing = false;
        continue;
      }
      const s = toScreen(p);
      if (drawing) context.lineTo(s.x, s.y);
      else context.moveTo(s.x, s.y);
      drawing = true;
    }
    context.stroke();

    const t = (time * 0.18 + index / scene.destinations.length) % 1;
    const pulse = rotate(arcPoint(scene.hub, destination, t, ARC_LIFT), yaw, pitch);
    if (!isOccluded(pulse)) {
      const s = toScreen(pulse);
      context.globalAlpha = 0.95;
      context.fillStyle = color;
      context.beginPath();
      context.arc(s.x, s.y, 2.4, 0, Math.PI * 2);
      context.fill();
    }
  });

  const hub = rotate(scene.hub, yaw, pitch);
  if (hub.z >= 0) {
    const s = toScreen(hub);
    const ring = (time * 0.8) % 1;
    context.strokeStyle = colors.hub;
    context.globalAlpha = 1 - ring;
    context.beginPath();
    context.arc(s.x, s.y, 4 + ring * 14, 0, Math.PI * 2);
    context.stroke();

    context.globalAlpha = 1;
    context.fillStyle = colors.hub;
    context.beginPath();
    context.arc(s.x, s.y, 3.5, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = colors.label;
    context.font = colors.labelFont;
    context.fillText(scene.hubLabel, s.x + 10, s.y - 10);
  }

  context.globalAlpha = 1;
}
