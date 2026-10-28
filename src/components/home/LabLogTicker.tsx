"use client";

import { useEffect, useRef, useState } from "react";

import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { SYSLOG_MESSAGES, syslogLine } from "@/lib/syslog";

const VISIBLE_LINES = 3;
const CHARS_PER_STEP = 2;
const STEP_MS = 18;
const PAUSE_MS = 1500;

type Typing = { text: string; length: number };

// Server-rendered with the first messages, so the log reads fine without JavaScript.
export function LabLogTicker() {
  const ref = useRef<HTMLDivElement>(null);
  const nextIndexRef = useRef(VISIBLE_LINES);
  const [lines, setLines] = useState<string[]>(() => SYSLOG_MESSAGES.slice(0, VISIBLE_LINES));
  const [typing, setTyping] = useState<Typing | null>(null);
  const inView = useInView(ref);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || reducedMotion) return;
    let timer = 0;

    function typeNext() {
      const message = SYSLOG_MESSAGES[nextIndexRef.current % SYSLOG_MESSAGES.length] ?? "";
      nextIndexRef.current += 1;
      const text = syslogLine(new Date(), message);
      let length = 0;

      function step() {
        if (document.hidden) {
          timer = window.setTimeout(step, PAUSE_MS);
          return;
        }
        length = Math.min(text.length, length + CHARS_PER_STEP);
        setTyping({ text, length });
        if (length < text.length) {
          timer = window.setTimeout(step, STEP_MS);
          return;
        }
        setTyping(null);
        setLines((current) => [...current.slice(1 - VISIBLE_LINES), text]);
        timer = window.setTimeout(typeNext, PAUSE_MS);
      }
      step();
    }

    timer = window.setTimeout(typeNext, PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [inView, reducedMotion]);

  const rows = typing
    ? [...lines.slice(1 - VISIBLE_LINES), typing.text.slice(0, typing.length)]
    : lines.slice(-VISIBLE_LINES);

  return (
    <div ref={ref} className="glass min-w-0 rounded-card px-5 py-4">
      <p className="label-mono mb-2 flex items-center gap-2.5 text-muted">
        <span aria-hidden="true" className="signal-dot" />
        R1 · lab log
      </p>
      <ol aria-label="Lab router log" className="font-mono text-[0.78rem] leading-6 text-muted">
        {rows.map((row, index) => (
          <li
            key={`${index}-${row.slice(0, 24)}`}
            className={cn("truncate", index === rows.length - 1 && "text-fg")}
          >
            {row}
            {typing && index === rows.length - 1 ? (
              <span aria-hidden="true" className="caret" />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
