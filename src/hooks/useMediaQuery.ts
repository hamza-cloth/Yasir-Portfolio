"use client";

import { useCallback, useSyncExternalStore } from "react";

import { FINE_POINTER_QUERY, REDUCED_MOTION_QUERY } from "@/lib/motion";

export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}

export function useFinePointer(): boolean {
  return useMediaQuery(FINE_POINTER_QUERY);
}
