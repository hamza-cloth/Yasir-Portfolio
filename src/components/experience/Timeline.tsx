"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { REDUCED_MOTION_QUERY } from "@/lib/motion";

// Fills the line as the list scrolls past the middle of the screen and lights each dot it reaches.
export function Timeline({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      list.style.setProperty("--timeline-progress", "1");
      list
        .querySelectorAll<HTMLElement>(".timeline-dot")
        .forEach((dot) => (dot.dataset.lit = "true"));
      return;
    }

    let frame = 0;
    function update() {
      frame = 0;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const reach = window.innerHeight * 0.6 - rect.top;
      const progress = Math.min(1, Math.max(0, reach / rect.height));
      list.style.setProperty("--timeline-progress", progress.toFixed(4));
      list.querySelectorAll<HTMLElement>(".timeline-dot").forEach((dot) => {
        const offset = dot.getBoundingClientRect().top - rect.top;
        dot.dataset.lit = String(offset <= reach);
      });
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ol ref={ref} className="relative flex flex-col gap-10 pl-10 sm:pl-14">
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[7px] w-px bg-line sm:left-[11px]"
      />
      <span
        aria-hidden="true"
        className="timeline-fill absolute top-2 bottom-2 left-[7px] w-px sm:left-[11px]"
      />
      {children}
    </ol>
  );
}
