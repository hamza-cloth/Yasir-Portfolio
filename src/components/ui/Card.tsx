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
        "tilt-3d surface relative min-w-0 rounded-card border border-line p-6",
        interactive &&
          "transition-[transform,border-color,box-shadow] duration-[250ms] ease-entrance focus-within:border-line-hover hover:-translate-y-1 hover:border-line-hover hover:shadow-(--shadow-lift)",
        className,
      )}
      {...props}
    />
  );
}
