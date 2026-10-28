"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";

import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";

import { PreviewCard } from "./PreviewCard";

type WorkListProps = {
  children: ReactNode;
  previews: Record<string, ReactNode>;
};

// Rows are server-rendered; this only tracks which row the cursor is over for the preview card.
export function WorkList({ children, previews }: WorkListProps) {
  const [active, setActive] = useState<string | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  function handlePointerMove(event: PointerEvent<HTMLOListElement>) {
    pointer.current = { x: event.clientX, y: event.clientY };
    const row = (event.target as Element).closest<HTMLElement>("[data-preview]");
    setActive(row?.dataset.preview ?? null);
  }

  return (
    <>
      <ol
        className="border-t border-line"
        onPointerMove={enabled ? handlePointerMove : undefined}
        onPointerLeave={() => setActive(null)}
      >
        {children}
      </ol>
      {enabled ? <PreviewCard active={active} previews={previews} pointer={pointer} /> : null}
    </>
  );
}
