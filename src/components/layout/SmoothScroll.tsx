"use client";

import { useEffect } from "react";

import Lenis from "lenis";

import { useReducedMotion } from "@/hooks/useMediaQuery";
import { setActiveLenis } from "@/lib/smooth-scroll";

export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.12,
      prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
    });
    setActiveLenis(lenis);

    return () => {
      setActiveLenis(null);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return null;
}
