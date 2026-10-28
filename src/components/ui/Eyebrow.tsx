import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: ReactNode;
  as?: "p" | "span";
  className?: string;
};

export function Eyebrow({ children, as: Tag = "p", className }: EyebrowProps) {
  return (
    <Tag
      className={cn(
        "label-mono inline-flex w-fit items-center gap-2.5 rounded-pill border border-line bg-surface/60 px-3 py-1.5 text-muted backdrop-blur-md",
        className,
      )}
    >
      <span aria-hidden="true" className="signal-dot" />
      {children}
    </Tag>
  );
}
