"use client";

import { useMemo, useRef, type PointerEvent } from "react";

import { useCanvasLoop } from "@/hooks/useCanvasLoop";
import { useLook } from "@/hooks/useLook";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { fibonacciSphere, latLonToVector } from "@/lib/canvas/globe";
import { drawGlobeFrame, type GlobeColors, type GlobeScene } from "@/lib/canvas/globe-draw";
import { cn } from "@/lib/cn";
import { readCssVar } from "@/lib/css-vars";
import { DESTINATIONS, HUB } from "@/lib/globe-cities";

const DEG = Math.PI / 180;
const POINT_COUNT = 1300;
// Fewer dots on small screens and low-core devices, where every frame costs more.
const LIGHT_POINT_COUNT = 700;

function pointCount(): number {
  const small = window.matchMedia("(max-width: 767px)").matches;
  const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4;
  return small || lowEnd ? LIGHT_POINT_COUNT : POINT_COUNT;
}
const AUTO_SPIN = 0.12;
const DRAG_YAW = 0.006;
const DRAG_PITCH = 0.004;
const MAX_PITCH = 1.1;

type Motion = {
  yaw: number;
  pitch: number;
  velocity: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
  lastTime: number;
};

export function DotGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<GlobeColors | null>(null);
  const motionRef = useRef<Motion>({
    yaw: -HUB.lon * DEG,
    pitch: HUB.lat * DEG * 0.7,
    velocity: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
  });
  const reducedMotion = useReducedMotion();
  const look = useLook();

  const scene = useMemo<GlobeScene>(
    () => ({
      points: fibonacciSphere(pointCount()),
      hub: latLonToVector(HUB.lat, HUB.lon),
      hubLabel: HUB.name,
      destinations: DESTINATIONS.map((city) => latLonToVector(city.lat, city.lon)),
    }),
    [],
  );

  useCanvasLoop(
    canvasRef,
    ({ context, width, height, time }) => {
      const motion = motionRef.current;
      const delta = Math.min(0.05, Math.max(0, time - motion.lastTime));
      motion.lastTime = time;
      if (!motion.dragging) {
        motion.yaw += (AUTO_SPIN + motion.velocity) * delta;
        motion.velocity *= Math.pow(0.04, delta);
      }
      if (colorsRef.current) {
        drawGlobeFrame(context, scene, {
          width,
          height,
          time,
          yaw: motion.yaw,
          pitch: motion.pitch,
          colors: colorsRef.current,
        });
      }
    },
    {
      animate: !reducedMotion,
      redrawKey: look,
      onSetup: () => {
        colorsRef.current = {
          dot: readCssVar("--c1"),
          arcs: [
            readCssVar("--c1"),
            readCssVar("--amber"),
            readCssVar("--ok"),
            readCssVar("--tint-lilac-ink"),
            readCssVar("--tint-butter-ink"),
          ],
          hub: readCssVar("--amber"),
          label: readCssVar("--fg"),
          labelFont: `500 12px ${readCssVar("--ff-mono")}`,
        };
      },
    },
  );

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const motion = motionRef.current;
    motion.dragging = true;
    motion.velocity = 0;
    motion.lastX = event.clientX;
    motion.lastY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const motion = motionRef.current;
    if (!motion.dragging) return;
    const dx = event.clientX - motion.lastX;
    const dy = event.clientY - motion.lastY;
    motion.lastX = event.clientX;
    motion.lastY = event.clientY;
    motion.yaw += dx * DRAG_YAW;
    motion.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, motion.pitch + dy * DRAG_PITCH));
    motion.velocity = dx * DRAG_YAW * 30;
  }

  function handlePointerUp(event: PointerEvent<HTMLCanvasElement>) {
    motionRef.current.dragging = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Dot globe with arcs from ${HUB.name} to ${DESTINATIONS.map((city) => city.name).join(", ")}`}
      data-cursor="Drag"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn("absolute inset-0 size-full touch-pan-y", className)}
    />
  );
}
