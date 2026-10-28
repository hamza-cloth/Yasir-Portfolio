"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

const EASE = 0.16;
const OFFSET = 24;
const WIDTH = 360;
const HEIGHT = 270;

type PreviewCardProps = {
  active: string | null;
  previews: Record<string, ReactNode>;
  pointer: RefObject<{ x: number; y: number }>;
};

// Follows the cursor with a little lag, and flips to the other side near the viewport edge.
export function PreviewCard({ active, previews, pointer }: PreviewCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const position = { ...pointer.current };
    let frame = 0;

    function tick() {
      const target = pointer.current;
      const flipX = target.x + OFFSET + WIDTH > window.innerWidth;
      const flipY = target.y + OFFSET + HEIGHT > window.innerHeight;
      const x = flipX ? target.x - OFFSET - WIDTH : target.x + OFFSET;
      const y = flipY ? target.y - OFFSET - HEIGHT : target.y + OFFSET;
      position.x += (x - position.x) * EASE;
      position.y += (y - position.y) * EASE;
      ref.current?.style.setProperty("--preview-x", `${position.x.toFixed(1)}px`);
      ref.current?.style.setProperty("--preview-y", `${position.y.toFixed(1)}px`);
      frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, pointer]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-visible={active !== null}
      className="preview-card pointer-events-none fixed top-0 left-0 z-(--z-preview) w-[360px]"
    >
      <div className="preview-card-inner">
        {Object.entries(previews).map(([slug, preview]) => (
          <div key={slug} hidden={slug !== active}>
            {preview}
          </div>
        ))}
      </div>
    </div>
  );
}
