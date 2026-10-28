"use client";

import { useEffect, useRef } from "react";

import { REDUCED_MOTION_QUERY } from "@/lib/motion";

const DURATION_MS = 900;

type CountUpProps = {
  value: number;
  className?: string;
};

// Renders the real value on the server; only counts from zero when it starts off-screen.
export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.textContent = "0";
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION_MS);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(value * eased));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      element.textContent = String(value);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
