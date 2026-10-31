"use client";

import { useEffect } from "react";

import { cn } from "@/lib/cn";
import { cycleLook, followLookFromOtherTabs, LOOK_LABELS, LOOKS } from "@/lib/look";

// The visible label is chosen by CSS from <html data-look>, so it is right before hydration too.
export function LookButton({ className }: { className?: string }) {
  // The header is on every page, so this is where a look picked in another tab is followed.
  useEffect(() => followLookFromOtherTabs(), []);

  return (
    <button
      type="button"
      onClick={() => cycleLook()}
      className={cn(
        "label-mono inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-pill px-3 text-fg transition-colors hover:bg-fg/5",
        className,
      )}
    >
      <span aria-hidden="true" className="signal-dot" />
      <span className="sr-only">Look: </span>
      {LOOKS.map((look) => (
        // 1024-1200px: only the dot shows, to make room for the inline nav; the name stays for
        // screen readers.
        <span
          key={look}
          className="look-label whitespace-nowrap laptop:sr-only"
          data-look-label={look}
        >
          {LOOK_LABELS[look]}
        </span>
      ))}
      <span className="sr-only">. Activate to switch look.</span>
    </button>
  );
}
