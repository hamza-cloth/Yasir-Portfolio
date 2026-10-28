"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

// Content is visible by default (and with JavaScript off). It is only hidden, then revealed,
// when it starts below the first screen and the visitor has not asked for reduced motion.
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal min-w-0", className)}
      style={delay ? cssVars({ "--reveal-delay": `${delay}ms` }) : undefined}
    >
      {children}
    </div>
  );
}
