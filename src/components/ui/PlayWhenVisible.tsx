"use client";

import { useRef, type ReactNode } from "react";

import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

type PlayWhenVisibleProps = {
  children: ReactNode;
  className?: string;
};

// Pauses every CSS animation inside while the block is off-screen (see [data-playing] in home.css).
export function PlayWhenVisible({ children, className }: PlayWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { rootMargin: "120px" });

  return (
    <div ref={ref} data-playing={inView} className={cn("min-w-0", className)}>
      {children}
    </div>
  );
}
