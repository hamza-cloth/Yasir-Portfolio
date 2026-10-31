"use client";

import { useSyncExternalStore } from "react";

import { useLook } from "@/hooks/useLook";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import { getEnabledLooks, isLook, LOOK_LABELS, LOOK_SWATCHES, LOOKS, setLook } from "@/lib/look";

// The enabled list is fixed by the pre-paint script, so it never changes after load.
const subscribe = () => () => {};
const enabledSnapshot = () => getEnabledLooks().join(",");
const serverSnapshot = () => LOOKS.join(",");

// One swatch per look, so a visitor can pick a palette directly. The active ring comes from CSS
// on <html data-look>, so it is right before hydration; aria-pressed follows once hydrated.
// labelClassName: extra classes for the "Look" label, e.g. to hide it on phones.
export function LookPicker({ labelClassName }: { labelClassName?: string } = {}) {
  const current = useLook();
  const enabled = useSyncExternalStore(subscribe, enabledSnapshot, serverSnapshot)
    .split(",")
    .filter(isLook);

  if (enabled.length < 2) return null;

  return (
    <div
      role="group"
      aria-label="Colour look"
      className="flex flex-wrap items-center justify-center gap-3 laptop:justify-start"
    >
      <span className={cn("label-mono text-faint", labelClassName)}>Look</span>
      <ul className="flex items-center gap-1.5 rounded-pill border border-line bg-surface/70 p-1 backdrop-blur-md">
        {enabled.map((look) => {
          const [bg, , accent] = LOOK_SWATCHES[look];
          return (
            <li key={look}>
              <button
                type="button"
                data-swatch={look}
                aria-pressed={current === look}
                title={LOOK_LABELS[look]}
                onClick={() => setLook(look)}
                className="look-swatch grid size-11 place-items-center rounded-full sm:size-9"
                style={cssVars({ "--swatch-bg": bg, "--swatch-accent": accent })}
              >
                <span aria-hidden="true" className="look-swatch-dot size-6 rounded-full" />
                <span className="sr-only">{LOOK_LABELS[look]}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {/* The name repeats the active swatch; phones drop it so the picker stays on one line. */}
      <span className="label-mono text-muted max-sm:hidden" aria-hidden="true">
        {LOOKS.map((look) => (
          <span key={look} className="look-label" data-look-label={look}>
            {LOOK_LABELS[look]}
          </span>
        ))}
      </span>
    </div>
  );
}
