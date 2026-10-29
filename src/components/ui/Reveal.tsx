import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

// Content is visible by default (and with JavaScript off). RevealController, mounted once per
// page, hides and then reveals the ones that start below the first screen.
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <div
      className={cn("reveal min-w-0", className)}
      style={delay ? cssVars({ "--reveal-delay": `${delay}ms` }) : undefined}
    >
      {children}
    </div>
  );
}
