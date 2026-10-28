"use client";

import { useEffect, useRef } from "react";

import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";

const RING_EASE = 0.18;
const INTERACTIVE = "a[href], button, [role='button'], [data-cursor], label, summary";

export function CustomCursor() {
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!enabled || !dot || !ring || !label) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const target = { x: -100, y: -100 };
    const ringPosition = { x: -100, y: -100 };
    let frame = 0;

    function tick() {
      ringPosition.x += (target.x - ringPosition.x) * RING_EASE;
      ringPosition.y += (target.y - ringPosition.y) * RING_EASE;
      ring?.style.setProperty("--ring-x", `${ringPosition.x.toFixed(1)}px`);
      ring?.style.setProperty("--ring-y", `${ringPosition.y.toFixed(1)}px`);
      const settled =
        Math.abs(target.x - ringPosition.x) < 0.1 && Math.abs(target.y - ringPosition.y) < 0.1;
      frame = settled ? 0 : window.requestAnimationFrame(tick);
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      dot?.style.setProperty("--dot-x", `${target.x}px`);
      dot?.style.setProperty("--dot-y", `${target.y}px`);
      dot?.removeAttribute("data-hidden");
      ring?.removeAttribute("data-hidden");
      if (!frame) frame = window.requestAnimationFrame(tick);
    }

    function handlePointerOver(event: PointerEvent) {
      if (!ring || !label) return;
      const element = (event.target as Element | null)?.closest<HTMLElement>(INTERACTIVE);
      const text = element?.dataset.cursor ?? "";
      label.textContent = text;
      ring.dataset.state = text ? "label" : element ? "link" : "idle";
    }

    function handleLeave() {
      dot?.setAttribute("data-hidden", "true");
      ring?.setAttribute("data-hidden", "true");
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} aria-hidden="true" className="cursor-ring" data-hidden="true">
        <span className="cursor-ring-inner">
          <span ref={labelRef} className="cursor-label" />
        </span>
      </div>
      <div ref={dotRef} aria-hidden="true" className="cursor-dot" data-hidden="true" />
    </>
  );
}
