"use client";

import { useSyncExternalStore } from "react";

import { formatIstTime } from "@/lib/ist-time";

function subscribe(onChange: () => void): () => void {
  const timer = window.setInterval(onChange, 1000);
  return () => window.clearInterval(timer);
}

function getSnapshot(): string {
  return formatIstTime(new Date());
}

// Null on the server and during hydration, so server and client markup always match.
export function useIstTime(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
