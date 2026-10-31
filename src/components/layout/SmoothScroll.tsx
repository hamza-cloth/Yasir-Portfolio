"use client";

import { useEffect } from "react";

import { useReducedMotion } from "@/hooks/useMediaQuery";
import { afterFirstInteraction } from "@/lib/after-interaction";
import { setActiveLenis } from "@/lib/smooth-scroll";

export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Touch screens keep native scrolling (Lenis does not smooth touch anyway), so phones never
    // pay for its animation loop.
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

    // Smooth scrolling is a nicety: its code loads after the first interaction, off the first load.
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
    const stopWaiting = afterFirstInteraction(start);

    return () => {
      cancelled = true;
      stopWaiting();
      setActiveLenis(null);
      lenis?.destroy();
    };
  }, [reducedMotion]);

  return null;
}
