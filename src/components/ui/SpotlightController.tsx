"use client";

import { useEffect } from "react";

import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";

// .tilt-3d cards lean towards the cursor by up to MAX_TILT degrees; wider cards lean less
// (TILT_WIDTH / width), so their edges never swing far out of their column.
const MAX_TILT = 6;
const TILT_WIDTH = 2400;
// While tracking, transform follows quickly; the card's own hover transitions keep running.
const TRACK_TRANSITION =
  "transform 150ms ease-out, translate 500ms var(--easing-entrance), border-color 500ms var(--easing-entrance)";
const SETTLE_MS = 600;

// One pointer listener for the whole site, instead of a client component per card: the
// .spotlight glow on tiles and the .tilt-3d lean. Mouse only; the lean is off with reduced motion.
export function SpotlightController() {
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!finePointer) return;
    let frame = 0;
    let spot: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;
    let x = 0;
    let y = 0;

    // Ease a card back flat, then hand its transitions back to the stylesheet. The transform
    // is inline, so it overrides nothing in CSS and leaves no trace once cleared.
    function release(element: HTMLElement | null) {
      if (!element) return;
      element.style.transition = `transform ${SETTLE_MS}ms var(--easing-entrance)`;
      element.style.transform = "";
      window.setTimeout(() => {
        if (element !== tilt) element.style.transition = "";
      }, SETTLE_MS);
    }

    function apply() {
      frame = 0;
      if (spot) {
        const rect = spot.getBoundingClientRect();
        spot.style.setProperty("--spot-x", `${x - rect.left}px`);
        spot.style.setProperty("--spot-y", `${y - rect.top}px`);
      }
      if (tilt) {
        const rect = tilt.getBoundingClientRect();
        const max = Math.min(MAX_TILT, TILT_WIDTH / rect.width);
        const rotateX = ((y - rect.top) / rect.height - 0.5) * -2 * max;
        const rotateY = ((x - rect.left) / rect.width - 0.5) * 2 * max;
        tilt.style.transition = TRACK_TRANSITION;
        tilt.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      }
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const element = event.target as Element | null;
      spot = element?.closest?.<HTMLElement>(".spotlight") ?? null;
      const nextTilt = reducedMotion ? null : (element?.closest?.<HTMLElement>(".tilt-3d") ?? null);
      if (nextTilt !== tilt) {
        release(tilt);
        tilt = nextTilt;
      }
      if (!spot && !tilt) return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(apply);
    }

    function onLeave() {
      release(tilt);
      tilt = null;
    }

    const root = document.documentElement;
    document.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
      onLeave();
    };
  }, [finePointer, reducedMotion]);

  return null;
}
