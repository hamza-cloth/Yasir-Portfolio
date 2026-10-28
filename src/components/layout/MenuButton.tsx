import type { Ref } from "react";

import { cn } from "@/lib/cn";

type MenuButtonProps = {
  open: boolean;
  onToggle: () => void;
  controls: string;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
};

export function MenuButton({ open, onToggle, controls, ref, className }: MenuButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      className={cn(
        "relative size-11 flex-none rounded-pill border border-line-2 bg-surface/50 text-fg backdrop-blur-md",
        className,
      )}
    >
      <span className="menu-bar" aria-hidden="true" />
      <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      <span className="menu-bar" aria-hidden="true" />
    </button>
  );
}
