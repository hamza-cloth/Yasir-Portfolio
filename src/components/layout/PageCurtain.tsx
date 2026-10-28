"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { animate } from "motion";

import { useReducedMotion } from "@/hooks/useMediaQuery";
import { internalNavigationTarget } from "@/lib/internal-link";
import { EASE_WIPE } from "@/lib/motion";
import { routeLabel } from "@/lib/site-nav";

const COVER_SECONDS = 0.24;
const REVEAL_SECONDS = 0.3;
const NAVIGATION_TIMEOUT_MS = 1200;
// Hard ceiling: whatever fails (an animation, a slow route), the curtain is gone after this.
const STUCK_CURTAIN_MS = 1500;

// Total wipe time stays under 600ms: cover, navigate under the curtain, then reveal.
// With the View Transitions API the reveal is a clip-path on the new page snapshot;
// otherwise Motion wipes the curtain away.
export function PageCurtain() {
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const curtainRef = useRef<HTMLDivElement>(null);
  const arrivedRef = useRef<(() => void) | null>(null);
  const busyRef = useRef(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    arrivedRef.current?.();
    arrivedRef.current = null;
  }, [pathname]);

  const navigate = useEffectEvent(async (url: URL) => {
    const curtain = curtainRef.current;
    if (!curtain || busyRef.current) return;
    busyRef.current = true;
    setLabel(routeLabel(url.pathname));

    const arrived = new Promise<void>((resolve) => {
      arrivedRef.current = resolve;
      window.setTimeout(resolve, NAVIGATION_TIMEOUT_MS);
    });
    const go = () => router.push(`${url.pathname}${url.search}${url.hash}`);

    curtain.dataset.active = "true";
    const root = document.documentElement;
    const release = () => {
      delete curtain.dataset.active;
      delete root.dataset.transition;
      curtain.style.removeProperty("clip-path");
      busyRef.current = false;
    };
    const failsafe = window.setTimeout(release, STUCK_CURTAIN_MS);

    try {
      await animate(
        curtain,
        { clipPath: ["inset(100% 0 0 0)", "inset(0% 0 0 0)"] },
        { duration: COVER_SECONDS, ease: EASE_WIPE },
      );

      if (typeof document.startViewTransition === "function") {
        root.dataset.transition = "page";
        const transition = document.startViewTransition(async () => {
          delete curtain.dataset.active;
          go();
          await arrived;
        });
        await transition.finished.catch(() => undefined);
      } else {
        go();
        await arrived;
        await animate(
          curtain,
          { clipPath: ["inset(0 0 0% 0)", "inset(0 0 100% 0)"] },
          { duration: REVEAL_SECONDS, ease: EASE_WIPE },
        );
      }
    } catch {
      // An interrupted animation must not strand the visitor: navigate anyway.
      go();
    } finally {
      window.clearTimeout(failsafe);
      release();
    }
  });

  useEffect(() => {
    if (reducedMotion) return;

    function handleClick(event: MouseEvent) {
      const url = internalNavigationTarget(event, window.location);
      if (!url) return;
      event.preventDefault();
      void navigate(url);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [reducedMotion]);

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      className="page-curtain fixed inset-y-0 left-0 z-(--z-toast) grid h-dvh w-screen place-items-center bg-curtain text-curtain-fg"
    >
      <div className="flex w-full flex-col items-center gap-6 px-6">
        <p className="label-mono text-curtain-muted">Routing to</p>
        <p className="text-center font-display text-h2 leading-none">{label}</p>
        <div className="curtain-line w-full max-w-xl" />
      </div>
    </div>
  );
}
