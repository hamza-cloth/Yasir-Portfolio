"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { REDUCED_MOTION_QUERY } from "@/lib/motion";

// Degrees the portrait turns at the edge of its box.
const TILT_Y = 22;
const TILT_X = 16;

// The 3D stage under the hero portrait. On a mouse it turns towards the pointer and moves the
// glare; otherwise (touch, or before the pointer arrives) CSS sways it slowly. Reduced motion
// keeps it still. Everything else about the layers lives in home.css.
export function PortraitStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    const host = stage?.parentElement;
    if (!stage || !host) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    function apply() {
      frame = 0;
      if (!stage || !host) return;
      const rect = host.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (x - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (y - rect.top) / rect.height));
      stage.style.setProperty("--ry", `${((px - 0.5) * 2 * TILT_Y).toFixed(2)}deg`);
      stage.style.setProperty("--rx", `${((0.5 - py) * 2 * TILT_X).toFixed(2)}deg`);
      stage.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      stage.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !stage) return;
      x = event.clientX;
      y = event.clientY;
      stage.dataset.active = "true";
      if (!frame) frame = window.requestAnimationFrame(apply);
    }

    function onLeave() {
      if (!stage) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
      delete stage.dataset.active;
      for (const name of ["--rx", "--ry", "--gx", "--gy"]) stage.style.removeProperty(name);
    }

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="portrait-3d">
      {children}
    </div>
  );
}
