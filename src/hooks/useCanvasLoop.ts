"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

export type CanvasFrame = {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
};

type CanvasLoopOptions = {
  animate: boolean;
  // Changing this redraws (and restarts) the loop, e.g. when the skin changes.
  redrawKey?: string;
  onSetup?: () => void;
};

const MAX_PIXEL_RATIO = 2;

// Sizes the canvas to its box, caps devicePixelRatio, and only runs while on-screen and the tab is visible.
export function useCanvasLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draw: (frame: CanvasFrame) => void,
  { animate, redrawKey, onSetup }: CanvasLoopOptions,
): void {
  const drawFrame = useEffectEvent(draw);
  const setup = useEffectEvent(() => onSetup?.());

  useEffect(() => {
    const canvas = canvasRef.current;
    let context: CanvasRenderingContext2D | null = null;
    try {
      context = canvas?.getContext("2d") ?? null;
    } catch {
      // No canvas support: the element simply stays empty; the page around it is unaffected.
    }
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let onScreen = false;
    const startedAt = performance.now();

    setup();

    function render(now: number) {
      if (!context || width === 0 || height === 0) return;
      drawFrame({ context, width, height, time: animate ? (now - startedAt) / 1000 : 0 });
    }

    function tick(now: number) {
      render(now);
      frame = window.requestAnimationFrame(tick);
    }

    function syncLoop() {
      const shouldRun = animate && onScreen && !document.hidden;
      if (shouldRun && !frame) frame = window.requestAnimationFrame(tick);
      if (!shouldRun && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    function resize() {
      if (!canvas || !context) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      render(performance.now());
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      syncLoop();
    });
    visibilityObserver.observe(canvas);
    document.addEventListener("visibilitychange", syncLoop);

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", syncLoop);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [canvasRef, animate, redrawKey]);
}
