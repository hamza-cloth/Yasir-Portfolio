import type { CSSProperties } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";
import { PRICING } from "@/config/pricing";
import { formatInr } from "@/lib/estimate";

// The ceiling as people say it: ₹1,50,000 → "₹1.5 lakh".
function lakh(amount: number): string {
  return amount >= 100_000 ? `₹${Number((amount / 100_000).toFixed(2))} lakh` : formatInr(amount);
}

const ART_ROWS = [
  { label: "Design", width: "62%" },
  { label: "Frontend", width: "88%" },
  { label: "Backend & APIs", width: "74%" },
  { label: "Database", width: "40%" },
  { label: "Launch", width: "30%" },
];

// The planner's header: the pitch on the left, a live "project blueprint" on the right.
export function EstimateHero({ cap }: { cap: number }) {
  const facts: { icon: IconName; title: string; text: string }[] = [
    { icon: "list", title: "6 quick steps", text: "About 2 minutes, no sign-up" },
    ...(cap > 0
      ? [
          {
            icon: "sparkle" as const,
            title: `Up to ${lakh(cap)}`,
            text: "Launch pricing on every build",
          },
        ]
      : []),
    {
      icon: "shield",
      title: `${PRICING.supportMonths} months support`,
      text: "Free after launch",
    },
  ];

  return (
    <header className="est-hero print:hidden">
      <div className="flex flex-col gap-6">
        <p className="est-eyebrow">
          <span className="est-live-dot" aria-hidden="true" />
          Project planner · instant report
        </p>
        <h1 id="estimate-title" className="est-hero-title">
          Plan your build. <span className="est-gradient-text">See the real cost.</span>
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted">
          Answer six quick questions. The planner analyses your requirements and builds a full-stack
          report: cost by module, tech stack, timeline and a payment plan.
        </p>
        <ul className="est-facts">
          {facts.map((fact, index) => (
            <li key={fact.title} className="est-fact" style={{ "--i": index } as CSSProperties}>
              <span className="est-fact-icon">
                <Icon name={fact.icon} size={17} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold text-fg">{fact.title}</span>
                <span className="text-sm text-muted">{fact.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div aria-hidden="true" className="est-art max-lg:hidden">
        <span className="est-art-orbit" />
        <span className="est-art-orbit" />
        <span className="est-art-glow" />
        <div className="est-art-card">
          <div className="flex items-center justify-between">
            <span className="est-art-dots">
              <span />
              <span />
              <span />
            </span>
            <span className="label-mono text-faint">blueprint.json</span>
          </div>
          <p className="label-mono mt-5 text-c1-text">Project report</p>
          <p className="mt-1 font-display text-xl font-semibold text-fg">Custom web application</p>
          <div className="mt-5 flex flex-col gap-3">
            {ART_ROWS.map((row, index) => (
              <div key={row.label} className="est-art-row">
                <span>{row.label}</span>
                <span className="est-art-track">
                  <span style={{ "--w": row.width, "--i": index } as CSSProperties} />
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-dashed border-line-2 pt-4">
            <span className="label-mono text-faint">Complexity</span>
            <span className="flex gap-1">
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  key={index}
                  className={`block h-3 w-1.5 rounded-sm ${index < 6 ? "bg-c1" : "bg-line-2"}`}
                />
              ))}
            </span>
          </div>
        </div>
        <div className="est-art-chip est-art-chip--weeks">
          <span className="est-fact-icon">
            <Icon name="clock" size={16} />
          </span>
          <span className="flex flex-col text-left">
            <span className="label-mono text-faint">Timeline</span>
            <span className="font-semibold text-fg">6 – 8 weeks</span>
          </span>
        </div>
        {cap > 0 ? (
          <div className="est-art-chip est-art-chip--price">
            <span className="est-fact-icon">
              <Icon name="sparkle" size={16} />
            </span>
            <span className="flex flex-col text-left">
              <span className="label-mono text-faint">Launch pricing</span>
              <span className="font-semibold text-fg">Max {lakh(cap)}</span>
            </span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
