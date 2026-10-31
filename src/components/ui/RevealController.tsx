"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { REDUCED_MOTION_QUERY } from "@/lib/motion";

// One IntersectionObserver for every .reveal on the page, instead of one component each.
// Elements already on the first screen are left alone, so nothing above the fold flickers.
export function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    // Wait until the browser is idle, so React has finished hydrating every section first;
    // marking a section before it hydrates would make the server and client HTML disagree.
    // Only sections below the fold are touched, so the short wait is never visible.
    function scan() {
      const fold = window.innerHeight;
      // Read every position first, then write, so the browser lays out once.
      const pending = Array.from(
        document.querySelectorAll<HTMLElement>(".reveal:not([data-reveal])"),
      );
      const below = pending.filter((element) => element.getBoundingClientRect().top >= fold);
      for (const element of below) {
        element.dataset.reveal = "hidden";
        observer.observe(element);
      }
    }
    const idle = window.requestIdleCallback?.(scan, { timeout: 1200 });
    const timer = idle === undefined ? window.setTimeout(scan, 600) : undefined;

    return () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
