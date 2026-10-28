import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export function chipClassName(selected: boolean, className?: string): string {
  return cn(
    "glow-hover label-mono inline-flex min-h-11 items-center gap-2 rounded-chip border px-3.5",
    selected ? "border-c1 bg-surface-2 text-fg" : "border-line-2 text-muted hover:text-fg",
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
