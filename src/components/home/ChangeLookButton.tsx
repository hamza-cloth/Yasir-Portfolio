"use client";

import { cycleLook, LOOK_LABELS, LOOKS } from "@/lib/look";

// Switches the whole site to the next enabled look, with a View Transition where supported.
export function ChangeLookButton() {
  return (
    <button
      type="button"
      onClick={() => cycleLook()}
      className="group inline-flex min-h-11 items-center gap-2.5 rounded-pill pr-1 text-sm font-semibold text-muted transition-colors hover:text-fg"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-full border border-line-2 bg-surface-solid transition-transform duration-500 ease-entrance group-hover:rotate-180"
      >
        ↻
      </span>
      Change look
      <span className="label-mono rounded-pill bg-c1-soft px-2 py-1 text-c1-text">
        {LOOKS.map((look) => (
          <span key={look} className="look-label" data-look-label={look}>
            {LOOK_LABELS[look]}
          </span>
        ))}
      </span>
    </button>
  );
}
