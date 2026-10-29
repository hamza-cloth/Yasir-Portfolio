"use client";

import { useEffect } from "react";

import { useFinePointer } from "@/hooks/useMediaQuery";

// One pointer listener for every .spotlight tile, instead of a client component per tile.
export function SpotlightController() {
  const finePointer = useFinePointer();

  useEffect(() => {
    if (!finePointer) return;
    let frame = 0;
    let target: HTMLElement | null = null;
    let x = 0;
    let y = 0;

    function apply() {
      frame = 0;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--spot-x", `${x - rect.left}px`);
      target.style.setProperty("--spot-y", `${y - rect.top}px`);
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      target = (event.target as Element | null)?.closest?.<HTMLElement>(".spotlight") ?? null;
      if (!target) return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(apply);
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [finePointer]);

  return null;
}
