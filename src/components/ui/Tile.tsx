"use client";

import type { ComponentProps, PointerEvent } from "react";

import { cn } from "@/lib/cn";

// A bento tile whose glow follows the cursor via --spot-x / --spot-y.
export function Tile({ className, onPointerMove, ...props }: ComponentProps<"div">) {
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      element.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    }
    onPointerMove?.(event);
  }

  return (
    <div
      onPointerMove={handlePointerMove}
      className={cn(
        "spotlight relative isolate min-w-0 overflow-hidden rounded-tile border border-line bg-surface-solid p-6",
        className,
      )}
      {...props}
    />
  );
}
