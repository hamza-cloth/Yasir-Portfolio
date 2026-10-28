"use client";

import { cn } from "@/lib/cn";
import { requestCommandMenu } from "@/lib/overlay-events";

export function CommandButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={requestCommandMenu}
      aria-keyshortcuts="Meta+K Control+K /"
      className={cn(
        "glow-hover label-mono inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-pill border border-line-2 px-3 text-muted hover:text-fg",
        className,
      )}
    >
      <span className="sr-only">Open command menu</span>
      <kbd aria-hidden="true" className="font-mono">
        ⌘K
      </kbd>
    </button>
  );
}
