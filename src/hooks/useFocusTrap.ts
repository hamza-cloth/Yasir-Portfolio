"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type FocusTrapOptions = {
  active: boolean;
  // Every region Tab may move through, in DOM order. The first focusable in `initialFocus` gets focus.
  regions: RefObject<HTMLElement | null>[];
  initialFocus: RefObject<HTMLElement | null>;
  returnFocus: RefObject<HTMLElement | null>;
  onEscape: () => void;
};

function focusablesIn(regions: RefObject<HTMLElement | null>[]): HTMLElement[] {
  return regions.flatMap((region) =>
    region.current ? Array.from(region.current.querySelectorAll<HTMLElement>(FOCUSABLE)) : [],
  );
}

export function useFocusTrap({
  active,
  regions,
  initialFocus,
  returnFocus,
  onEscape,
}: FocusTrapOptions): void {
  const handleEscape = useEffectEvent(onEscape);
  const getRegions = useEffectEvent(() => regions);

  useEffect(() => {
    if (!active) return;

    const returnTarget = returnFocus.current;
    const frame = window.requestAnimationFrame(() => {
      initialFocus.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleEscape();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = focusablesIn(getRegions());
      const first = focusables[0];
      const last = focusables.at(-1);
      if (!first || !last) return;

      const current = document.activeElement;
      const outside = !focusables.includes(current as HTMLElement);
      if (event.shiftKey && (current === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      returnTarget?.focus();
    };
  }, [active, initialFocus, returnFocus]);
}
