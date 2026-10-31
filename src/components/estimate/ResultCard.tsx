"use client";

import { useState, type ReactNode } from "react";

import { LogoMark } from "@/components/brand/LogoMark";
import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
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

function Panel({
  id,
  title,
  children,
  className = "",
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={`est-report-panel ${className}`}>
      <h3 id={id} className="text-lg tracking-[-0.02em]">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ProjectReport({ estimate, analysis, input, type, onEdit, onPrint }: ReportProps) {
  const [copied, setCopied] = useState(false);
  const labels = labelsFor(input);
  const whatsapp = whatsappUrl(`Hi Yasir, I used your cost calculator:\n${estimate.summaryText}`);
  const totalPhaseWeeks = analysis.phases.reduce((sum, phase) => sum + phase.weeks, 0);

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this link:", window.location.href);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="est-result">
        <div aria-hidden="true" className="est-result-glow" />
        <div className="flex flex-wrap items-center gap-2">
          <p className="label-mono text-c1-text">Project report</p>
          <span className="est-badge">
            Complexity {analysis.complexity.score}/10 · {analysis.complexity.label}
          </span>
        </div>
        <h2 className="mt-3 text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight tracking-[-0.03em]">
          {type.label}
        </h2>
        <p className="mt-1 text-muted">
          {labels.devices.join(" + ")} · {labels.features.length} features · about{" "}
          {analysis.screens} screens · full stack
        </p>
        {type.discussFirst ? (
          <p className="mt-4 font-semibold text-c1-text">
            Final price after discussion — let&apos;s talk
          </p>
        ) : null}
        <div className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div>
            <p className="label-mono text-faint">Estimated cost (approx.)</p>
            <p className="est-range">
              {formatInr(estimate.low)} – {formatInr(estimate.high)}
            </p>
          </div>
          <div className="flex flex-col gap-1 sm:border-l sm:border-line sm:pl-5">
            <p className="label-mono text-faint">Timeline</p>
            <p className="font-display text-2xl font-semibold text-fg">
              {estimate.weeksMin} – {estimate.weeksMax} weeks
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm text-ok">
              <Icon name="shield" size={14} />
              {estimate.supportMonths} months support free
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <a href={quoteHref(estimate, type, input)} className={buttonClassName("accent", "lg")}>
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
              Send on WhatsApp
            </a>
          ) : null}
          <button type="button" onClick={onPrint} className={buttonClassName("line", "lg")}>
            <Icon name="download" />
            Download PDF
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

      <Panel id="est-modules" title="Cost by module">
        <p className="-mt-1 text-sm text-muted">
          How the estimate splits across a full-stack build. Every selected feature is counted in
          the module that builds it.
        </p>
        <ul className="flex flex-col gap-4">
          {analysis.modules.map((module) => (
            <li key={module.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-semibold text-fg">
                  {module.label}
                  <span className="ml-2 font-mono text-xs text-faint">
                    {Math.round(module.share * 100)}%
                  </span>
                </span>
                <span className="font-mono text-sm text-c1-text">{moduleRange(module.amount)}</span>
              </div>
              <div className="est-bar-track" aria-hidden="true">
                <span style={{ width: `${Math.max(2, module.share * 100)}%` }} />
              </div>
              <p className="text-sm text-muted">{module.items.join(" · ") || module.description}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel id="est-stack" title="Recommended tech stack">
          <dl className="flex flex-col divide-y divide-line">
            {analysis.stack.map((row) => (
              <div key={row.layer} className="flex gap-4 py-2.5 text-sm">
                <dt className="label-mono w-24 flex-none pt-0.5 text-faint">{row.layer}</dt>
                <dd className="text-fg">{row.tech}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel id="est-phases" title="Timeline by phase">
          <div className="est-phase-bar" aria-hidden="true">
            {analysis.phases.map((phase, index) => (
              <span
                key={phase.label}
                style={{ flexGrow: phase.weeks / totalPhaseWeeks, opacity: 1 - index * 0.18 }}
              />
            ))}
          </div>
          <ol className="flex flex-col gap-2.5">
            {analysis.phases.map((phase, index) => (
              <li key={phase.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2.5 text-fg">
                  <span className="est-phase-dot" style={{ opacity: 1 - index * 0.18 }} />
                  {phase.label}
                </span>
                <span className="font-mono text-muted">≈ {weeksText(phase.weeks)}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel id="est-payments" title="Payment plan">
        <ol className="grid gap-3 sm:grid-cols-3">
          {analysis.milestones.map((milestone, index) => (
            <li key={milestone.label} className="rounded-card border border-line p-4">
              <p className="label-mono text-faint">
                {index + 1} · {Math.round(milestone.share * 100)}%
              </p>
              <p className="mt-1 font-semibold text-fg">{milestone.label}</p>
              <p className="mt-1 font-mono text-sm text-c1-text">
                {formatInr(milestone.low)} – {formatInr(milestone.high)}
              </p>
            </li>
          ))}
        </ol>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel id="est-support" title={`${estimate.supportMonths} months support — free`}>
          <ul className="grid gap-2 text-sm">
            {SUPPORT_INCLUDED.map((item) => (
              <li key={item} className="flex items-center gap-2 text-fg">
                <Icon name="check" size={14} className="text-ok" />
                {item}
              </li>
            ))}
            <li className="flex items-center gap-2 text-muted">
              <Icon name="close" size={14} className="text-red" />
              Not included: {SUPPORT_EXCLUDED}
            </li>
          </ul>
        </Panel>
        <Panel id="est-excluded" title="Not in the estimate">
          <ul className="grid gap-2 text-sm text-muted">
            {NOT_INCLUDED.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true">·</span>
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl text-[13px] leading-relaxed text-muted">
          {DISCLAIMER}
          {GST_NOTE}
        </p>
        <button type="button" onClick={onEdit} className={buttonClassName("line", "md")}>
          <Icon name="arrow-right" size={16} className="rotate-180" />
          Change requirements
        </button>
      </div>
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
