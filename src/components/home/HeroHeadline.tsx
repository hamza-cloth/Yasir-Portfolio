import type { ReactNode } from "react";

import { cssVars } from "@/lib/css-vars";

// The underlined phrase stays on one line from 720px; on phones it may wrap inside the underline.
function Scribble({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block sm:whitespace-nowrap">
      <span className="text-gradient">{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 300 18"
        preserveAspectRatio="none"
        className="absolute -bottom-[0.12em] left-0 h-[0.24em] w-full overflow-visible text-c1"
      >
        <path
          d="M3 12 C 60 4, 140 3, 200 7 S 280 11, 297 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          className="scribble-draw opacity-50"
          pathLength={1}
        />
      </svg>
    </span>
  );
}

// The promise under the name; the name itself is the page's h1.
export function HeroHeadline() {
  return (
    <p className="intro hero-tagline text-fg" style={cssVars({ "--i": 3 })}>
      {/* Two lines on purpose: each half stays whole instead of wrapping mid-phrase. */}
      <span className="block">Networks that stay up.</span>{" "}
      <Scribble>Software that works.</Scribble>
    </p>
  );
}
