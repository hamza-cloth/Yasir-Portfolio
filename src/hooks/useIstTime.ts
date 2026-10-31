"use client";

import { useSyncExternalStore } from "react";

import { formatIstTime } from "@/lib/ist-time";

// One cached reading per tick, so repeated getSnapshot calls agree even across a second boundary.
let snapshot: string | null = null;

function subscribe(onChange: () => void): () => void {
  const timer = window.setInterval(() => {
    snapshot = formatIstTime(new Date());
    onChange();
  }, 1000);
  return () => window.clearInterval(timer);
}

function getSnapshot(): string {
  snapshot ??= formatIstTime(new Date());
  return snapshot;
}

// Null on the server and during hydration, so server and client markup always match.
export function useIstTime(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
