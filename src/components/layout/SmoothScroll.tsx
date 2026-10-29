"use client";

import { useEffect } from "react";

import { useReducedMotion } from "@/hooks/useMediaQuery";
import { setActiveLenis } from "@/lib/smooth-scroll";

export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    // Smooth scrolling is a nicety: its code loads once the page is idle, off the first load.
    let lenis: { destroy: () => void } | null = null;
    let cancelled = false;
    const start = () =>
      void import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;
        const instance = new Lenis({
          autoRaf: true,
          anchors: true,
          lerp: 0.12,
          prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
        });
        lenis = instance;
        setActiveLenis(instance);
      });
    const idle =
      window.requestIdleCallback?.(start, { timeout: 2500 }) ?? window.setTimeout(start, 1200);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
      setActiveLenis(null);
      lenis?.destroy();
    };
  }, [reducedMotion]);

  return null;
}
