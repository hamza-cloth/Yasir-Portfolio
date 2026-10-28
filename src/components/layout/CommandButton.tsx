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
        "label-mono inline-flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-pill border border-line-2 bg-surface/50 px-3 text-muted backdrop-blur-md transition-colors hover:border-fg/25 hover:text-fg",
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
