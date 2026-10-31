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

// Where the radar's blips light up, as [top, left] percentages.
const BLIPS = [
  [22, 64],
  [58, 18],
  [70, 72],
];

// The short "analysis" between the review and the report. It is honest theatre: the maths is
// instant, but a beat here makes clear the price was worked out from the answers, not picked.
export function Analysing({ onDone }: { onDone: () => void }) {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState(0);
  const stepMs = reducedMotion ? 150 : 700;

  useEffect(() => {
    if (stage >= STAGES.length) {
      const timer = window.setTimeout(onDone, reducedMotion ? 50 : 350);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setStage((current) => current + 1), stepMs);
    return () => window.clearTimeout(timer);
  }, [stage, stepMs, onDone, reducedMotion]);

  const progress = Math.min(1, stage / STAGES.length);

  return (
    <div className="est-analysing" role="status" aria-live="polite">
      <div aria-hidden="true" className="est-radar">
        <span />
        <span />
        <span />
        <div className="est-radar-sweep" />
        {BLIPS.map(([top, left], index) => (
          <i
            key={index}
            className="est-radar-blip"
            style={{ top: `${top}%`, left: `${left}%`, animationDelay: `${index * 0.5}s` }}
          />
        ))}
        <div className="est-radar-core">{Math.round(progress * 100)}%</div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-2xl font-semibold text-fg">Analysing your project…</p>
        <p className="text-sm text-muted">Building your full-stack report from every answer</p>
      </div>
      <div className="est-bar-track w-full max-w-sm" aria-hidden="true">
        <span style={{ width: `${progress * 100}%`, transition: "width 600ms ease" }} />
      </div>
      <ol className="est-timeline w-full max-w-sm text-left text-sm">
        {STAGES.map((label, index) => (
          <li
            key={label}
            className="relative flex items-center gap-3"
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
