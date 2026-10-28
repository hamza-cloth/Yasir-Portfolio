import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: ReactNode;
  as?: "p" | "span";
  className?: string;
};

export function Eyebrow({ children, as: Tag = "p", className }: EyebrowProps) {
  return (
    <Tag className={cn("label-mono inline-flex items-center gap-2.5 text-muted", className)}>
      <span aria-hidden="true" className="signal-dot" />
      {children}
    </Tag>
  );
}
