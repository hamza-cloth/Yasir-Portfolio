"use client";

import { useEffect, useRef, useState } from "react";

import { REDUCED_MOTION_QUERY } from "@/lib/motion";

// Eases a number from its last value to the new one (300ms by default); jumps at once when the
// visitor prefers reduced motion.
export function useAnimatedNumber(target: number, duration = 300): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    fromRef.current = target;
    if (from === target) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      const frame = window.requestAnimationFrame(() => setValue(target));
      return () => window.cancelAnimationFrame(frame);
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(from + (target - from) * eased);
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
