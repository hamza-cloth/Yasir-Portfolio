import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: ReactNode;
  as?: "p" | "span";
  className?: string;
};

// The label above every section heading: a short gold rule, then the words in gold mono caps.
export function Eyebrow({ children, as: Tag = "p", className }: EyebrowProps) {
  return (
    <Tag className={cn("eyebrow", className)}>
      <span aria-hidden="true" className="eyebrow-rule" />
      {children}
    </Tag>
  );
}
