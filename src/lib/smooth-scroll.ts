import type Lenis from "lenis";

import { REDUCED_MOTION_QUERY } from "./motion";

// A single Lenis instance is shared so overlays can pause scrolling and buttons can scroll to top.
let activeLenis: Lenis | null = null;

export function setActiveLenis(lenis: Lenis | null): void {
  activeLenis = lenis;
}

export function getActiveLenis(): Lenis | null {
  return activeLenis;
}

export function scrollToTop(): void {
  if (activeLenis) {
    activeLenis.scrollTo(0);
    return;
  }
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}
