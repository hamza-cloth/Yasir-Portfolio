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

// One headline for every look; only its colours change.
export function HeroHeadline() {
  return (
    <h1
      id="hero-title"
      className="intro-lcp hero-name hero-name--split max-w-[14ch] text-fg"
      style={cssVars({ "--i": 1 })}
    >
      Networks that stay up. <Scribble>Software that works.</Scribble>
    </h1>
  );
}
