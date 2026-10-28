"use client";

import { useEffect, useMemo, useRef } from "react";

import { useCanvasLoop } from "@/hooks/useCanvasLoop";
import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";
import { useSkin } from "@/hooks/useSkin";
import {
  createFibreLines,
  drawFibreFrame,
  type FibreColors,
  type FibrePointer,
} from "@/lib/canvas/fibre";
import { cn } from "@/lib/cn";
import { readCssVar } from "@/lib/css-vars";

type FibreCanvasProps = {
  className?: string;
  lineCount?: number;
};

const POINTER_EASE = 0.08;

export function FibreCanvas({ className, lineCount = 9 }: FibreCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<FibreColors>({ start: "#3be8ff", end: "#ffb020", additive: true });
  const targetRef = useRef<FibrePointer>(null);
  const pointerRef = useRef<FibrePointer>(null);
  const lines = useMemo(() => createFibreLines(lineCount), [lineCount]);
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const skin = useSkin();

  useEffect(() => {
    if (!finePointer || reducedMotion) return;

    function handlePointerMove(event: PointerEvent) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const inside = event.clientY >= rect.top && event.clientY <= rect.bottom;
      targetRef.current = inside
        ? { x: event.clientX - rect.left, y: event.clientY - rect.top }
        : null;
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [finePointer, reducedMotion]);

  useCanvasLoop(
    canvasRef,
    ({ context, width, height, time }) => {
      const target = targetRef.current;
      const current = pointerRef.current;
      if (target && current) {
        current.x += (target.x - current.x) * POINTER_EASE;
        current.y += (target.y - current.y) * POINTER_EASE;
      } else {
        pointerRef.current = target ? { ...target } : null;
      }
      drawFibreFrame(context, {
        width,
        height,
        time,
        pointer: pointerRef.current,
        lines,
        colors: colorsRef.current,
      });
    },
    {
      animate: !reducedMotion,
      redrawKey: skin,
      onSetup: () => {
        colorsRef.current = {
          start: readCssVar("--c1") || colorsRef.current.start,
          end: readCssVar("--amber") || colorsRef.current.end,
          additive: document.documentElement.dataset.theme !== "light",
        };
      },
    },
  );

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}
