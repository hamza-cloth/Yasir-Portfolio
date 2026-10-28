import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type CardProps = Omit<ComponentProps<"div">, "ref"> & {
  as?: "div" | "article";
  interactive?: boolean;
};

export function Card({ as: Tag = "div", interactive = false, className, ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        "relative min-w-0 rounded-card border border-line bg-surface-solid p-6",
        interactive && "glow-hover focus-within:border-line-2 hover:border-line-2",
        className,
      )}
      {...props}
    />
  );
}
