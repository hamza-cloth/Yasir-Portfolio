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
        "surface relative min-w-0 rounded-card border border-line p-6",
        interactive &&
          "transition-[transform,border-color] duration-500 ease-entrance focus-within:border-line-2 hover:-translate-y-1 hover:border-line-2",
        className,
      )}
      {...props}
    />
  );
}
