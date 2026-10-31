"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

type LogoMarkProps = {
  className?: string;
  // Decorative by default; give it a title only where the mark stands alone as an image.
  title?: string;
};

// The "YA" monogram: a sharp A frame with a gold Y inside. The A follows the text colour, so it
// is ivory on dark looks and ink on light ones; the Y uses --logo-y. The clip path id is unique
// per instance, so several marks on one page never share (and break) one definition.
export function LogoMark({ className, title }: LogoMarkProps) {
  const clipId = `ya-clip-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;

  return (
    <svg
      viewBox="10 0 80 92"
      className={cn("h-9 w-auto flex-none", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="100" height="88" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`} fill="none" strokeLinejoin="miter" strokeMiterlimit={4}>
        <path d="M38.9 44 L50 60 L61.1 44 M50 60 L50 100" stroke="var(--logo-y)" strokeWidth={7} />
        <path d="M14.9 100 L50 18 L85.1 100" stroke="currentColor" strokeWidth={11} />
      </g>
    </svg>
  );
}
