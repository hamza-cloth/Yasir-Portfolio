"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { useReducedMotion } from "@/hooks/useMediaQuery";

const STAGES = [
  "Reading your requirements",
  "Planning the architecture",
  "Sizing every module",
  "Working out timeline & cost",
];

// The short "analysis" between the review and the report. It is honest theatre: the maths is
// instant, but a beat here makes clear the price was worked out from the answers, not picked.
export function Analysing({ onDone }: { onDone: () => void }) {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState(0);
  const stepMs = reducedMotion ? 150 : 650;

  useEffect(() => {
    if (stage >= STAGES.length) {
      const timer = window.setTimeout(onDone, reducedMotion ? 50 : 300);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setStage((current) => current + 1), stepMs);
    return () => window.clearTimeout(timer);
  }, [stage, stepMs, onDone, reducedMotion]);

  const progress = Math.min(1, stage / STAGES.length);

  return (
    <div className="est-analysing" role="status" aria-live="polite">
      <div aria-hidden="true" className="est-orbit">
        <span />
        <span />
        <Icon name="sparkle" size={26} />
      </div>
      <p className="font-display text-xl font-semibold text-fg">Analysing your project…</p>
      <div className="est-bar-track w-full max-w-sm" aria-hidden="true">
        <span style={{ width: `${progress * 100}%` }} />
      </div>
      <ol className="flex w-full max-w-sm flex-col gap-2 text-left text-sm">
        {STAGES.map((label, index) => (
          <li
            key={label}
            className="flex items-center gap-2.5"
            data-state={index < stage ? "done" : index === stage ? "active" : "waiting"}
          >
            <span className="est-stage-dot">
              {index < stage ? <Icon name="check" size={11} /> : null}
            </span>
            <span className={index <= stage ? "text-fg" : "text-faint"}>{label}</span>
          </li>
        ))}
      </ol>
      <span className="sr-only">{STAGES[Math.min(stage, STAGES.length - 1)]}</span>
    </div>
  );
}
