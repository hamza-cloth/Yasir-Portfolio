"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

type MagneticProps = {
  children: ReactNode;
  strength?: number;
  className?: string;
};

// Pulls its child gently toward the cursor. Inert on touch screens and with reduced motion.
export function Magnetic({ children, strength = 0.28, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    const element = ref.current;
    if (!enabled || !element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * strength;
    const y = (event.clientY - rect.top - rect.height / 2) * strength;
    element.style.setProperty("--magnet-x", `${x.toFixed(1)}px`);
    element.style.setProperty("--magnet-y", `${y.toFixed(1)}px`);
  }

  function handlePointerLeave() {
    ref.current?.style.setProperty("--magnet-x", "0px");
    ref.current?.style.setProperty("--magnet-y", "0px");
  }

  return (
    <span
      ref={ref}
      className={cn("magnetic inline-flex", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </span>
  );
}
