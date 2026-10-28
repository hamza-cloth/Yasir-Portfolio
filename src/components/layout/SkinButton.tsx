"use client";

import { cn } from "@/lib/cn";
import { cycleSkin, SKIN_LABELS, SKINS } from "@/lib/skin";

// The visible label is chosen by CSS from <html data-skin>, so it is right before hydration too.
export function SkinButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => cycleSkin()}
      className={cn(
        "label-mono inline-flex min-h-11 min-w-10 items-center justify-center gap-2 rounded-pill px-3 text-fg transition-colors hover:bg-fg/5",
        className,
      )}
    >
      <span aria-hidden="true" className="signal-dot" />
      <span className="sr-only">Skin: </span>
      {SKINS.map((skin) => (
        <span key={skin} className="skin-label" data-skin-label={skin}>
          {SKIN_LABELS[skin]}
        </span>
      ))}
      <span className="sr-only">. Activate to switch skin.</span>
    </button>
  );
}
