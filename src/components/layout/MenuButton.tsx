import type { Ref } from "react";

import { cn } from "@/lib/cn";

type MenuButtonProps = {
  open: boolean;
  onToggle: () => void;
  controls: string;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
};

// Three lines that fold into a cross; open, the button becomes an accent pill reading "Close".
export function MenuButton({ open, onToggle, controls, ref, className }: MenuButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      data-open={open}
      className={cn("menu-toggle", className)}
    >
      <span aria-hidden="true" className="menu-toggle-icon">
        <span className="menu-line" />
        <span className="menu-line" />
        <span className="menu-line" />
      </span>
      <span aria-hidden="true" className="menu-toggle-label">
        Close
      </span>
      <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
    </button>
  );
}
