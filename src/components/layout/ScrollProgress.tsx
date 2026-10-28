"use client";

import { useRef } from "react";

import { useScrollProgress } from "@/hooks/useScrollProgress";

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-(--z-header) h-0.5"
    />
  );
}
