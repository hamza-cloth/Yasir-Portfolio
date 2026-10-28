import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export function chipClassName(selected: boolean, className?: string): string {
  return cn(
    "label-mono inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 transition-colors duration-300",
    selected
      ? "border-fg bg-fg text-bg terminal:border-c1 terminal:bg-surface-2 terminal:text-fg"
      : "border-line-2 text-muted hover:border-fg/30 hover:text-fg",
    className,
  );
}

type ChipProps = Omit<ComponentProps<"button">, "type"> & {
  selected?: boolean;
};

export function Chip({ selected = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={chipClassName(selected, className)}
      {...props}
    />
  );
}
