"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Sends one anonymous view per page navigation. Honours Do Not Track.
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (navigator.doNotTrack === "1") return;
    try {
      const body = new Blob([JSON.stringify({ path: pathname, referrer: document.referrer })], {
        type: "application/json",
      });
      if (!navigator.sendBeacon?.("/api/views", body)) {
        void fetch("/api/views", { method: "POST", body, keepalive: true }).catch(() => undefined);
      }
    } catch {
      // Counting is optional; nothing visible depends on it.
    }
  }, [pathname]);

  return null;
}
