"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

import { LogoMark } from "@/components/brand/LogoMark";
import { buttonClassName } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import {
  DELIVERY,
  DESIGN_LEVELS,
  DISCLAIMER,
  FEATURES,
  NOT_INCLUDED,
  PLATFORMS,
  PRICING,
  SCALES,
  SUPPORT_EXCLUDED,
  SUPPORT_INCLUDED,
  type ProjectType,
} from "@/config/pricing";
import {
  budgetRangeFor,
  estimateInputToParams,
  formatInr,
  roundTo,
  type Analysis,
  type Estimate,
  type EstimateInput,
} from "@/lib/estimate";
import { whatsappUrl } from "@/lib/hire";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

// The GST note, unless it is still an unconfirmed placeholder in a production build.
const gstPending = PRICING.gstNoteText.startsWith("[");
export const GST_NOTE =
  PRICING.showGstNote && !(gstPending && process.env.NODE_ENV === "production")
    ? ` ${PRICING.gstNoteText}`
    : "";

type ReportProps = {
  estimate: Estimate;
  analysis: Analysis;
  input: EstimateInput;
  type: ProjectType;
  onEdit: () => void;
  onPrint: () => void;
};

export function labelsFor(input: EstimateInput) {
  const chosen = FEATURES.filter((item) => input.features.includes(item.id));
  return {
    devices: PLATFORMS.filter((item) => input.platforms.includes(item.id)).map(
      (item) => item.label,
    ),
    features: chosen.filter((item) => item.group !== "services").map((item) => item.label),
    services: chosen.filter((item) => item.group === "services").map((item) => item.label),
    design: DESIGN_LEVELS.find((item) => item.id === input.design)?.label ?? "",
    scale: SCALES.find((item) => item.id === input.scale)?.description ?? "",
    delivery: DELIVERY.find((item) => item.id === input.delivery)?.label ?? "",
  };
}

// A module's share of the range, rounded to ₹500.
function moduleRange(amount: number): string {
  return `${formatInr(roundTo(amount * PRICING.rangeLow, 500))} – ${formatInr(roundTo(amount * PRICING.rangeHigh, 500))}`;
}

const weeksText = (weeks: number) => `${weeks} ${weeks === 1 ? "week" : "weeks"}`;

// The selection travels too (as "estimate"), so the inquiry is saved with a matching estimate.
export function quoteHref(estimate: Estimate, type: ProjectType, input: EstimateInput): string {
  const params = new URLSearchParams({
    projectType: type.inquiryType,
    budget: budgetRangeFor(estimate.low, estimate.high),
    details: `From the cost calculator:\n${estimate.summaryText}`,
    estimate: estimateInputToParams(input).toString(),
  });
  return `/hire?${params.toString()}#inquiry`;
}

// Counts the range up from zero when the report appears; the real values are rendered first.
function PriceCountUp({ low, high }: { low: number; high: number }) {
  const lowRef = useRef<HTMLSpanElement>(null);
  const highRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const write = (share: number) => {
      if (lowRef.current) lowRef.current.textContent = formatInr(roundTo(low * share, 500));
      if (highRef.current) highRef.current.textContent = formatInr(roundTo(high * share, 500));
    };
    write(0);
    let frame = 0;
    const start = performance.now() + 250;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / 1300));
      write(1 - Math.pow(1 - progress, 4));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
      else write(1);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      write(1);
    };
  }, [low, high]);

  return (
    <p className="est-range">
      <span ref={lowRef}>{formatInr(low)}</span> – <span ref={highRef}>{formatInr(high)}</span>
    </p>
  );
}

// Complexity out of 10 as a ring.
function Gauge({ score }: { score: number }) {
  const radius = 26;
  const length = 2 * Math.PI * radius;
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShown(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return (
    <span className="est-ring" aria-hidden="true">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle className="est-ring-track" cx="32" cy="32" r={radius} strokeWidth="5" />
        <circle
          className="est-ring-value"
          cx="32"
          cy="32"
          r={radius}
          strokeWidth="5"
          strokeDasharray={length}
          strokeDashoffset={shown ? length * (1 - score / 10) : length}
          style={{ transitionDuration: "1400ms", transitionDelay: "400ms" }}
        />
      </svg>
      <span className="est-ring-label text-base">{score}</span>
    </span>
  );
}

// Marks every [data-est-reveal] panel as shown once it scrolls into view.
function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const panels = [...(root.current?.querySelectorAll<HTMLElement>("[data-est-reveal]") ?? [])];
    const show = (element: Element) => element.setAttribute("data-shown", "");
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches || !("IntersectionObserver" in window)) {
      panels.forEach(show);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );
    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, [root]);
}

function Panel({
  id,
  title,
  icon,
  children,
  className = "",
}: {
  id: string;
  title: string;
  icon: IconName;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} data-est-reveal="" className={`est-report-panel ${className}`}>
      <h3 id={id} className="est-panel-title">
        <span aria-hidden="true" className="est-panel-icon">
          <Icon name={icon} size={17} />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

const order = (index: number) => ({ "--i": index }) as CSSProperties;

export function ProjectReport({ estimate, analysis, input, type, onEdit, onPrint }: ReportProps) {
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);
  const labels = labelsFor(input);
  const whatsapp = whatsappUrl(`Hi Yasir, I used your cost calculator:\n${estimate.summaryText}`);
  const totalPhaseWeeks = analysis.phases.reduce((sum, phase) => sum + phase.weeks, 0);
  const axisWeeks = Math.max(1, Math.ceil(totalPhaseWeeks));
  const quote = quoteHref(estimate, type, input);
  // Where each phase starts on the shared week axis.
  const phaseStarts = analysis.phases.map((_, index) =>
    analysis.phases.slice(0, index).reduce((sum, phase) => sum + phase.weeks, 0),
  );

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this link:", window.location.href);
    }
  }

  const stats = [
    {
      label: "Timeline",
      value: `${estimate.weeksMin} – ${estimate.weeksMax} wk`,
      note: "Discovery to launch",
    },
    { label: "Screens", value: `≈ ${analysis.screens}`, note: "Designed & built" },
    {
      label: "Support",
      value: `${estimate.supportMonths} months`,
      note: "Free after launch",
    },
  ];

  return (
    <div ref={rootRef} className="flex flex-col gap-6">
      <div className="est-result">
        <div className="est-result-grid">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="label-mono text-c1-text">Project report</p>
              {estimate.standard ? (
                <span className="est-badge est-badge--fill">
                  <Icon name="sparkle" size={12} />
                  Launch pricing applied
                </span>
              ) : null}
            </div>
            <h2 className="mt-3 text-[clamp(1.5rem,2.8vw,2.1rem)] leading-tight tracking-[-0.03em]">
              {type.label}
            </h2>
            <p className="mt-1 text-muted">
              {labels.devices.join(" + ")} · {labels.features.length} features · full stack
            </p>
            {type.discussFirst ? (
              <p className="mt-4 font-semibold text-c1-text">
                Final price after discussion — let&apos;s talk
              </p>
            ) : null}
            <p className="label-mono mt-6 text-faint">Estimated cost (approx.)</p>
            <PriceCountUp low={estimate.low} high={estimate.high} />
            {estimate.standard ? (
              <p className="text-sm text-muted">
                Standard rate{" "}
                <span className="est-was">
                  {formatInr(estimate.standard.low)} – {formatInr(estimate.standard.high)}
                </span>
                . Your full scope is held at launch pricing.
              </p>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
              <a href={quote} className={buttonClassName("accent", "lg")}>
                Get exact quote
                <Icon name="arrow-right" />
              </a>
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener"
                  className={buttonClassName("line", "lg")}
                >
                  <Icon name="whatsapp" />
                  WhatsApp
                </a>
              ) : null}
              <button type="button" onClick={onPrint} className={buttonClassName("line", "lg")}>
                <Icon name="download" />
                PDF
              </button>
              <button type="button" onClick={share} className={buttonClassName("line", "lg")}>
                <Icon name="copy" />
                Share
              </button>
            </div>
            <p aria-live="polite" className="mt-2 min-h-5 text-sm text-ok">
              {copied ? "Copied — the link opens this exact report." : ""}
            </p>
          </div>

          <div className="est-stat-grid">
            <div className="est-stat col-span-2 flex-row! items-center gap-4!" style={order(0)}>
              <Gauge score={analysis.complexity.score} />
              <span className="flex flex-col">
                <span className="label-mono text-faint">Complexity</span>
                <strong>
                  {analysis.complexity.label}{" "}
                  <span className="font-mono text-sm text-muted">
                    {analysis.complexity.score}/10
                  </span>
                </strong>
              </span>
            </div>
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`est-stat ${index === 0 ? "col-span-2" : ""}`}
                style={order(index + 1)}
              >
                <span className="label-mono text-faint">{stat.label}</span>
                <strong>{stat.value}</strong>
                <span className="text-xs text-muted">{stat.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Panel id="est-modules" title="Cost by module" icon="database">
        <p className="-mt-2 text-sm text-muted">
          How the estimate splits across a full-stack build. Every selected feature is counted in
          the module that builds it.
        </p>
        <ul className="flex flex-col gap-1">
          {analysis.modules.map((module, index) => (
            <li key={module.id} className="est-module flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-semibold text-fg">
                  {module.label}
                  <span className="ml-2 font-mono text-xs text-faint">
                    {Math.round(module.share * 100)}%
                  </span>
                </span>
                <span className="font-mono text-sm text-fg">{moduleRange(module.amount)}</span>
              </div>
              <div className="est-bar-track" aria-hidden="true">
                <span style={{ width: `${Math.max(2, module.share * 100)}%`, ...order(index) }} />
              </div>
              <p className="text-sm text-muted">{module.items.join(" · ") || module.description}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Panel id="est-phases" title="Timeline by phase" icon="clock">
          <div className="est-gantt">
            {analysis.phases.map((phase, index) => {
              const left = ((phaseStarts[index] ?? 0) / axisWeeks) * 100;
              const width = (phase.weeks / axisWeeks) * 100;
              return (
                <div key={phase.label} className="est-gantt-row">
                  <span className="text-fg">{phase.label}</span>
                  <span
                    className="est-gantt-track"
                    style={{ "--weeks": axisWeeks } as CSSProperties}
                  >
                    <span
                      className="est-gantt-bar"
                      style={{ left: `${left}%`, width: `${width}%`, ...order(index) }}
                    >
                      {phase.weeks}w
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          <p className="flex justify-between font-mono text-xs text-faint">
            <span>Week 1</span>
            <span>≈ {weeksText(axisWeeks)} in all</span>
          </p>
        </Panel>

        <Panel id="est-stack" title="Recommended tech stack" icon="list">
          <div className="est-stack">
            {analysis.stack.map((row) => (
              <div key={row.layer}>
                <p className="label-mono text-c1-text">{row.layer}</p>
                <p className="mt-1 text-sm text-fg">{row.tech}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel id="est-payments" title="Payment plan" icon="shield">
        <ol className="est-pay">
          {analysis.milestones.map((milestone, index) => (
            <li key={milestone.label}>
              <span className="est-pay-node">{Math.round(milestone.share * 100)}%</span>
              <p className="label-mono mt-2 text-faint">Milestone {index + 1}</p>
              <p className="font-semibold text-fg">{milestone.label}</p>
              <p className="font-mono text-sm text-c1-text">
                {formatInr(milestone.low)} – {formatInr(milestone.high)}
              </p>
            </li>
          ))}
        </ol>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          id="est-support"
          title={`${estimate.supportMonths} months support — free`}
          icon="check"
        >
          <ul className="grid gap-2.5 text-sm">
            {SUPPORT_INCLUDED.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-fg">
                <Icon name="check" size={14} className="flex-none text-ok" />
                {item}
              </li>
            ))}
            <li className="flex items-center gap-2.5 text-muted">
              <Icon name="close" size={14} className="flex-none text-red" />
              Not included: {SUPPORT_EXCLUDED}
            </li>
          </ul>
        </Panel>
        <Panel id="est-excluded" title="Not in the estimate" icon="alert">
          <ul className="grid gap-2.5 text-sm text-muted">
            {NOT_INCLUDED.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden="true" className="text-faint">
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="est-cta-band" data-est-reveal="">
        <div className="flex max-w-xl flex-col gap-1.5">
          <p className="font-display text-[clamp(1.35rem,2.4vw,1.8rem)] leading-tight font-semibold">
            Like the plan? Let&apos;s make it exact.
          </p>
          <p className="opacity-85">Send it over and get a written quote after a free call.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={quote} className="est-cta-primary">
            Get exact quote
            <Icon name="arrow-right" size={16} />
          </a>
          <button type="button" onClick={onEdit} className="est-cta-secondary">
            <Icon name="arrow-right" size={16} className="rotate-180" />
            Change requirements
          </button>
        </div>
      </div>

      <p className="max-w-3xl text-[13px] leading-relaxed text-muted">
        {DISCLAIMER}
        {GST_NOTE}
      </p>
    </div>
  );
}

// The printed (PDF) version of the report: shown only when printing.
export function EstimatePrint({
  estimate,
  analysis,
  input,
  type,
  meta,
  contact,
}: {
  estimate: Estimate;
  analysis: Analysis;
  input: EstimateInput;
  type: ProjectType;
  meta: { id: string; date: string } | null;
  contact: { email: string; location: string; whatsapp: string | null; site: string };
}) {
  const labels = labelsFor(input);
  const rows: [string, string][] = [
    ["Project type", type.label],
    ["Platforms", labels.devices.join(", ")],
    ["Features", labels.features.join(", ") || "None selected"],
    ["Extra services", labels.services.join(", ") || "None"],
    ["Design", labels.design],
    ["Expected users", labels.scale],
    ["Delivery", labels.delivery],
  ];
  return (
    <div className="estimate-print hidden print:block">
      <header className="flex items-start justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 text-[#0e1220]" />
          <div>
            <p className="text-xl font-semibold">Yasir Abdullah</p>
            <p className="text-sm text-muted">Full-stack Software &amp; Network Engineer</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-mono">{meta?.id}</p>
          <p className="text-muted">{meta?.date}</p>
        </div>
      </header>
      <h1 className="mt-6 text-2xl">Project report &amp; cost estimate</h1>
      {type.discussFirst ? (
        <p className="mt-1 font-semibold">Final price after discussion.</p>
      ) : null}
      <p className="mt-4 text-3xl font-semibold">
        {formatInr(estimate.low)} – {formatInr(estimate.high)}{" "}
        <span className="text-base">(approx.)</span>
      </p>
      {estimate.standard ? (
        <p className="mt-1 text-sm">
          Launch pricing applied · standard rate {formatInr(estimate.standard.low)} –{" "}
          {formatInr(estimate.standard.high)}
        </p>
      ) : null}
      <p className="mt-1">
        Timeline: approx. {estimate.weeksMin} – {estimate.weeksMax} weeks · Complexity{" "}
        {analysis.complexity.score}/10 · {estimate.supportMonths} months support free
      </p>
      <table className="mt-6 w-full text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th className="py-1 pr-4 text-left">{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mt-6 text-lg">Cost by module</h2>
      <table className="mt-2 w-full text-sm">
        <tbody>
          {analysis.modules.map((module) => (
            <tr key={module.id}>
              <th className="py-1 pr-4 text-left">{module.label}</th>
              <td>
                {moduleRange(module.amount)} ({Math.round(module.share * 100)}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mt-5 text-lg">Tech stack</h2>
      <p className="text-sm">
        {analysis.stack.map((row) => `${row.layer}: ${row.tech}`).join(" · ")}
      </p>
      <h2 className="mt-4 text-lg">Phases</h2>
      <p className="text-sm">
        {analysis.phases.map((phase) => `${phase.label} ≈ ${weeksText(phase.weeks)}`).join(" · ")}
      </p>
      <h2 className="mt-4 text-lg">Payment plan</h2>
      <p className="text-sm">
        {analysis.milestones
          .map(
            (milestone) =>
              `${Math.round(milestone.share * 100)}% ${milestone.label.toLowerCase()} (${formatInr(milestone.low)} – ${formatInr(milestone.high)})`,
          )
          .join(" · ")}
      </p>
      <h2 className="mt-4 text-lg">Support included ({estimate.supportMonths} months, free)</h2>
      <p className="text-sm">
        {SUPPORT_INCLUDED.join(" · ")}. Not included: {SUPPORT_EXCLUDED}.
      </p>
      <h2 className="mt-4 text-lg">Not included in the estimate</h2>
      <p className="text-sm">{NOT_INCLUDED.join(" · ")}.</p>
      <p className="mt-6 text-xs">
        {DISCLAIMER}
        {GST_NOTE}
      </p>
      <footer className="mt-6 border-t border-line pt-3 text-sm">
        {contact.email} · {contact.whatsapp ? `WhatsApp ${contact.whatsapp} · ` : ""}
        {contact.location} · {contact.site}
      </footer>
    </div>
  );
}
