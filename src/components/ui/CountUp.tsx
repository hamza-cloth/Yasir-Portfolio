"use client";

import { useEffect, useRef } from "react";

import { REDUCED_MOTION_QUERY } from "@/lib/motion";

const DURATION_MS = 900;

type CountUpProps = {
  value: number;
  className?: string;
  // Count on load even when already on screen, delayed to land with the entrance animation.
  immediateDelayMs?: number;
};

// Renders the real value on the server; counts from zero when it starts off-screen,
// or straight away when immediateDelayMs is set.
export function CountUp({ value, className, immediateDelayMs }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const immediate = immediateDelayMs !== undefined;
    if (!immediate && element.getBoundingClientRect().top < window.innerHeight) return;

    element.textContent = "0";
    let frame = 0;
    let timer = 0;

    function run() {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION_MS);
        const eased = 1 - Math.pow(1 - progress, 3);
        if (element) element.textContent = String(Math.round(value * eased));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      if (immediate) timer = window.setTimeout(run, immediateDelayMs);
      else run();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      element.textContent = String(value);
    };
  }, [value, immediateDelayMs]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
