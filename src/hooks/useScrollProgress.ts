"use client";

import { useEffect, type RefObject } from "react";

// Writes page scroll progress (0 to 1) into --progress on the element, without re-rendering.
export function useScrollProgress(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const element = ref.current;
      if (!element) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      element.style.setProperty("--progress", progress.toFixed(4));
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ref]);
}
