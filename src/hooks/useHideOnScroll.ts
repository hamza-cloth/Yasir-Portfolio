"use client";

import { useEffect, useState } from "react";

type ScrollState = {
  hidden: boolean;
  scrolled: boolean;
};

const SCROLLED_AFTER = 24;
const HIDE_AFTER = 120;
const DIRECTION_TOLERANCE = 6;

export function useHideOnScroll(): ScrollState {
  const [state, setState] = useState<ScrollState>({ hidden: false, scrolled: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < DIRECTION_TOLERANCE && y > SCROLLED_AFTER) return;

      const next = { hidden: delta > 0 && y > HIDE_AFTER, scrolled: y > SCROLLED_AFTER };
      lastY = y;
      setState((current) =>
        current.hidden === next.hidden && current.scrolled === next.scrolled ? current : next,
      );
    }

    function handleScroll() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return state;
}
