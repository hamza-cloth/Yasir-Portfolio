"use client";

import { useState } from "react";

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

type ResultCardProps = {
  estimate: Estimate;
  input: EstimateInput;
  type: ProjectType;
  onEdit: (step: number) => void;
  onPrint: () => void;
};

function labelsFor(input: EstimateInput) {
  return {
    devices: PLATFORMS.filter((item) => input.platforms.includes(item.id)).map(
      (item) => item.label,
    ),
    features: FEATURES.filter((item) => input.features.includes(item.id)).map((item) => item.label),
    design: DESIGN_LEVELS.find((item) => item.id === input.design)?.label ?? "",
    scale: SCALES.find((item) => item.id === input.scale)?.description ?? "",
    delivery: DELIVERY.find((item) => item.id === input.delivery)?.label ?? "",
  };
}

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

export function ResultCard({ estimate, input, type, onEdit, onPrint }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const labels = labelsFor(input);
  const whatsapp = whatsappUrl(`Hi Yasir, I used your cost calculator:\n${estimate.summaryText}`);

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this link:", window.location.href);
    }
  }

  const rows: { label: string; value: string; step: number }[] = [
    { label: "Project type", value: type.label, step: 1 },
    { label: "Devices", value: labels.devices.join(", "), step: 2 },
    { label: "Features", value: labels.features.join(", ") || "None selected", step: 3 },
    { label: "Design", value: labels.design, step: 4 },
    { label: "Expected users", value: labels.scale, step: 4 },
    { label: "Delivery", value: labels.delivery, step: 4 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="est-result">
        <div aria-hidden="true" className="est-result-glow" />
        {type.discussFirst ? (
          <p className="mb-3 font-semibold text-c1-text">
            Final price after discussion — let&apos;s talk
          </p>
        ) : null}
        <p className="label-mono text-faint">Estimated Cost (Approx.)</p>
        <p className="est-range">
          {formatInr(estimate.low)} – {formatInr(estimate.high)}
        </p>
        <p className="text-lg text-fg">
          Estimated timeline: approx. {estimate.weeksMin} – {estimate.weeksMax} weeks
        </p>

        <details className="est-support group mt-5">
          <summary className="flex cursor-pointer list-none items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-pill border border-c1 px-3.5 py-1.5 font-semibold text-c1-text">
              <Icon name="shield" size={16} />
              {estimate.supportMonths} Months Support — FREE
            </span>
            <span className="text-sm text-muted underline-offset-4 group-open:underline">
              What&apos;s included
            </span>
          </summary>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {SUPPORT_INCLUDED.map((item) => (
              <li key={item} className="flex items-center gap-2 text-fg">
                <Icon name="check" size={14} className="text-ok" />
                {item}
              </li>
            ))}
            <li className="flex items-center gap-2 text-muted sm:col-span-2">
              <Icon name="close" size={14} className="text-red" />
              Not included: {SUPPORT_EXCLUDED}
            </li>
          </ul>
        </details>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={quoteHref(estimate, type, input)} className={buttonClassName("accent", "lg")}>
            Get Exact Quote
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
            Download Estimate (PDF)
          </button>
          <button type="button" onClick={share} className={buttonClassName("line", "lg")}>
            <Icon name="copy" />
            Share link
          </button>
        </div>
        <p aria-live="polite" className="mt-2 min-h-5 text-sm text-ok">
          {copied ? "Copied — the link opens this exact estimate." : ""}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {DISCLAIMER}
          {GST_NOTE}
        </p>
      </div>

      <section
        aria-labelledby="est-selections"
        className="surface rounded-tile border border-line p-6"
      >
        <h3 id="est-selections" className="mb-4 text-lg">
          Your selections
        </h3>
        <dl className="divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
              <dt className="label-mono w-32 flex-none text-faint">{row.label}</dt>
              <dd className="min-w-0 flex-1 text-fg">{row.value}</dd>
              <dd>
                <button
                  type="button"
                  onClick={() => onEdit(row.step)}
                  className="min-h-11 text-sm font-semibold text-c1-text underline-offset-4 hover:underline"
                >
                  Edit<span className="sr-only"> {row.label.toLowerCase()}</span>
                </button>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <details className="surface rounded-tile border border-line p-6">
        <summary className="cursor-pointer text-lg font-semibold">View cost breakdown</summary>
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">Cost breakdown before the range is applied</caption>
          <tbody className="divide-y divide-line">
            {estimate.breakdown.map((line) => (
              <tr key={line.label}>
                <th scope="row" className="py-2.5 pr-4 text-left font-normal text-muted">
                  {line.label}
                </th>
                <td className="py-2.5 text-right font-mono text-fg">{formatInr(line.amount)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row" className="py-2.5 pr-4 text-left font-semibold text-fg">
                Subtotal (before the ±range)
              </th>
              <td className="py-2.5 text-right font-mono font-semibold text-c1-text">
                {formatInr(estimate.subtotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </details>

      <section
        aria-labelledby="est-excluded"
        className="rounded-tile border border-dashed border-line p-6"
      >
        <h3 id="est-excluded" className="mb-3 text-lg">
          Not included in the estimate
        </h3>
        <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
          {NOT_INCLUDED.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true">·</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// The printed (PDF) version of the estimate: shown only when printing.
export function EstimatePrint({
  estimate,
  input,
  type,
  meta,
  contact,
}: {
  estimate: Estimate;
  input: EstimateInput;
  type: ProjectType;
  meta: { id: string; date: string } | null;
  contact: { email: string; location: string; whatsapp: string | null; site: string };
}) {
  const labels = labelsFor(input);
  return (
    <div className="estimate-print hidden print:block">
      <header className="flex items-start justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 text-[#0e1220]" />
          <div>
            <p className="text-xl font-semibold">Yasir Abdullah</p>
            <p className="text-sm text-muted">Software &amp; Network Engineer</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-mono">{meta?.id}</p>
          <p className="text-muted">{meta?.date}</p>
        </div>
      </header>
      <h1 className="mt-6 text-2xl">Project cost estimate</h1>
      {type.discussFirst ? (
        <p className="mt-1 font-semibold">Final price after discussion.</p>
      ) : null}
      <p className="mt-4 text-3xl font-semibold">
        {formatInr(estimate.low)} – {formatInr(estimate.high)}{" "}
        <span className="text-base">(approx.)</span>
      </p>
      <p className="mt-1">
        Timeline: approx. {estimate.weeksMin} – {estimate.weeksMax} weeks · {estimate.supportMonths}{" "}
        months support free
      </p>
      <table className="mt-6 w-full text-sm">
        <tbody>
          <tr>
            <th className="py-1 pr-4 text-left">Project type</th>
            <td>{type.label}</td>
          </tr>
          <tr>
            <th className="py-1 pr-4 text-left">Devices</th>
            <td>{labels.devices.join(", ")}</td>
          </tr>
          <tr>
            <th className="py-1 pr-4 text-left">Features</th>
            <td>{labels.features.join(", ") || "None selected"}</td>
          </tr>
          <tr>
            <th className="py-1 pr-4 text-left">Design</th>
            <td>{labels.design}</td>
          </tr>
          <tr>
            <th className="py-1 pr-4 text-left">Expected users</th>
            <td>{labels.scale}</td>
          </tr>
          <tr>
            <th className="py-1 pr-4 text-left">Delivery</th>
            <td>{labels.delivery}</td>
          </tr>
        </tbody>
      </table>
      <h2 className="mt-6 text-lg">Support included ({estimate.supportMonths} months, free)</h2>
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
