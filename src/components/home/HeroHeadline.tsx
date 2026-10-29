import type { ReactNode } from "react";

import { cssVars } from "@/lib/css-vars";
import type { Look } from "@/lib/look";

function Scribble({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap text-c1-text">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 300 18"
        preserveAspectRatio="none"
        className="absolute -bottom-[0.14em] left-0 h-[0.26em] w-full overflow-visible"
      >
        <path
          d="M3 12 C 60 4, 140 3, 200 7 S 280 11, 297 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          className="scribble-draw opacity-60"
          pathLength={1}
        />
      </svg>
    </span>
  );
}

// One headline per look, all in the HTML; CSS shows only the active look's line, so the text
// never swaps after load. Every line restates facts from the rest of the site.
const HEADLINES: Record<Look, ReactNode> = {
  porcelain: (
    <>
      I keep <Scribble>networks running</Scribble> and build software people rely on.
    </>
  ),
  "midnight-ops": (
    <>
      From the cable <Scribble>to the app,</Scribble> every layer in working order.
    </>
  ),
  "sunset-fibre": (
    <>
      Calm on support, careful on networks, <Scribble>quick to ship.</Scribble>
    </>
  ),
  aurora: (
    <>
      Where software <Scribble>meets the network.</Scribble>
    </>
  ),
};

export function HeroHeadline() {
  return (
    <h1
      id="hero-title"
      className="intro-lcp hero-name hero-name--split max-w-[16ch] text-fg"
      style={cssVars({ "--i": 1 })}
    >
      {(Object.keys(HEADLINES) as Look[]).map((look) => (
        <span key={look} className={`headline headline-${look}`}>
          {HEADLINES[look]}
        </span>
      ))}
    </h1>
  );
}
