"use client";

import { useEffect, useRef } from "react";

import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

// A faint grid revealed in a circle around the cursor. Static (centre-right) on touch screens.
export function GridSpotlight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || !finePointer || reducedMotion) return;
    let frame = 0;
    let x = 0;
    let y = 0;

    function apply() {
      frame = 0;
      element?.style.setProperty("--grid-x", `${x}px`);
      element?.style.setProperty("--grid-y", `${y}px`);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = element?.getBoundingClientRect();
      if (!rect) return;
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (!frame) frame = window.requestAnimationFrame(apply);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [finePointer, reducedMotion]);

  return <div ref={ref} aria-hidden="true" className={cn("grid-spotlight", className)} />;
}
