import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type GlassPanelProps = Omit<ComponentProps<"div">, "ref"> & {
  as?: "div" | "section" | "aside" | "article";
};

export function GlassPanel({ as: Tag = "div", className, ...props }: GlassPanelProps) {
  return <Tag className={cn("glass relative min-w-0 rounded-panel", className)} {...props} />;
}
