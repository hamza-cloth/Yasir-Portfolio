"use client";

import { useEffect } from "react";

import { getActiveLenis } from "@/lib/smooth-scroll";

export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    getActiveLenis()?.stop();

    return () => {
      root.style.overflow = previousOverflow;
      getActiveLenis()?.start();
    };
  }, [locked]);
}
