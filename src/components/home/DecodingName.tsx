"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import { decodeFrame, type DecodeCell } from "@/lib/decode";

const DURATION_MS = 1000;

type DecodingNameProps = {
  name: string;
  id?: string;
  className?: string;
};

function splitName(name: string): [string, string] {
  const [first = name, ...rest] = name.split(" ");
  return [first, rest.join(" ")];
}

// The real letters always hold their place; scrambled glyphs sit on top, so the line never reflows.
// Only the first (sans) line scrambles, on hover; serif glyphs read as noise when scrambled.
export function DecodingName({ name, id, className }: DecodingNameProps) {
  const lines = useMemo(() => splitName(name), [name]);
  const total = lines[0].length;
  const [frames, setFrames] = useState<DecodeCell[][] | null>(null);
  const runningRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();

  const decode = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      setFrames(
        progress >= 1 ? null : [decodeFrame(lines[0], progress, Math.random, { offset: 0, total })],
      );
      if (progress < 1) window.requestAnimationFrame(tick);
      else runningRef.current = false;
    }

    window.requestAnimationFrame(tick);
  }, [lines, total]);

  return (
    <h1
      id={id}
      aria-label={name}
      onPointerEnter={finePointer && !reducedMotion ? decode : undefined}
      className={cn("hero-name min-w-0", className)}
    >
      {lines.map((line, lineIndex) => (
        <span
          key={line}
          aria-hidden="true"
          style={cssVars({ "--i": lineIndex + 1 })}
          className={cn(
            "intro block whitespace-nowrap",
            lineIndex === 1 &&
              "text-gradient shimmer-text text-serif-accent -mt-[0.04em] pr-[0.08em] pb-[0.06em]",
          )}
        >
          {[...line].map((char, charIndex) => {
            const cell = frames?.[lineIndex]?.[charIndex];
            const scrambling = cell ? !cell.settled : false;
            return (
              <span key={charIndex} className="decode-char" data-scrambling={scrambling}>
                <span className="decode-real">{char}</span>
                {scrambling ? <span className="decode-glyph">{cell?.char}</span> : null}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
