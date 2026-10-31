"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/Icon";
import {
  CATEGORIES,
  DELIVERY,
  DESIGN_LEVELS,
  FEATURE_GROUPS,
  FEATURES,
  LEGAL_NOTE,
  PLATFORMS,
  PROJECT_TYPES,
  SCALES,
  type CategoryId,
  type Choice,
  type FeatureId,
  type PlatformId,
  type ProjectType,
} from "@/config/pricing";
import { cn } from "@/lib/cn";

import { CategoryIcon, PlatformIcon } from "./icons";

// No step shows a price: the cost appears only after the review, as one analysed report.

function CheckBadge() {
  return (
    <span aria-hidden="true" className="est-check">
      <Icon name="check" size={12} />
    </span>
  );
}

function StepHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="label-mono text-c1-text">{eyebrow}</p>
      <h2 className="est-legend">{title}</h2>
      {children ? <p className="max-w-2xl text-muted">{children}</p> : null}
    </div>
  );
}

// ---- Step 1: project type ----
export function StepProjectType({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (type: ProjectType) => void;
}) {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = PROJECT_TYPES.filter(
    (type) =>
      (category === "all" || type.category === category) &&
      (!needle || `${type.label} ${type.description}`.toLowerCase().includes(needle)),
  );

  return (
    <fieldset className="flex flex-col gap-6">
      <legend className="sr-only">What do you want to build?</legend>
      <StepHead eyebrow="Step 1 · Project" title="What do you want to build?">
        Pick the closest match. The features it usually needs are ticked for you on the next steps.
      </StepHead>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {[{ id: "all" as const, label: "All" }, ...CATEGORIES].map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
              className="est-tab"
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative block lg:w-64">
          <span className="sr-only">Search project types</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search, e.g. CRM"
            className="min-h-11 w-full rounded-field border border-line bg-surface-solid px-4 text-fg outline-none placeholder:text-faint focus:border-c1"
          />
        </label>
      </div>
      {visible.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-6 text-muted">
          Nothing matches “{query}”. Try another word, or pick “Something Else / Custom Idea”.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((type) => (
            <label key={type.id} className="est-card" data-selected={value === type.id}>
              <input
                type="radio"
                name="project-type"
                value={type.id}
                checked={value === type.id}
                onChange={() => onChange(type)}
                className="sr-only"
              />
              <CheckBadge />
              <span className="est-icon">
                <CategoryIcon category={type.category} />
              </span>
              <span className="text-[1.05rem] leading-snug font-semibold text-fg">
                {type.label}
              </span>
              <span className="text-sm text-muted">{type.description}</span>
              <span className="label-mono mt-auto text-faint">
                {type.recommended.length > 0
                  ? `${type.recommended.length} core features included`
                  : "Scoped together with you"}
              </span>
              {type.legalNote ? <span className="text-xs text-faint">{LEGAL_NOTE}</span> : null}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

// ---- Step 2: devices ----
export function StepDevices({
  value,
  onChange,
}: {
  value: PlatformId[];
  onChange: (platforms: PlatformId[]) => void;
}) {
  function toggle(id: PlatformId) {
    let next = value.includes(id) ? value.filter((item) => item !== id) : [...value, id];
    // A PWA is built on the website: removing the website removes the PWA too.
    if (!next.includes("web")) next = next.filter((item) => item !== "pwa");
    onChange(next);
  }
  const crossPlatform = value.includes("android") && value.includes("ios");

  return (
    <fieldset className="flex flex-col gap-6">
      <legend className="sr-only">Where should it run?</legend>
      <StepHead eyebrow="Step 2 · Platforms" title="Where should it run?">
        Pick one or more. Every website works on phones too.
      </StepHead>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const disabled = platform.id === "pwa" && !value.includes("web");
          return (
            <label
              key={platform.id}
              className="est-card est-card--row"
              data-selected={value.includes(platform.id)}
              data-disabled={disabled}
            >
              <input
                type="checkbox"
                checked={value.includes(platform.id)}
                disabled={disabled}
                onChange={() => toggle(platform.id)}
                className="sr-only"
              />
              <CheckBadge />
              <span className="est-icon flex-none">
                <PlatformIcon platform={platform.id} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold text-fg">{platform.label}</span>
                <span className="text-sm text-muted">{platform.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      {crossPlatform ? (
        <p className="inline-flex w-fit items-center gap-2 rounded-pill border border-c1 px-3 py-1.5 text-sm text-c1-text">
          <Icon name="check" size={14} />
          Android + iOS share one cross-platform codebase, which keeps the cost down
        </p>
      ) : null}
    </fieldset>
  );
}

// ---- Step 3: features ----
export function StepFeatures({
  value,
  recommended,
  onChange,
}: {
  value: FeatureId[];
  recommended: FeatureId[];
  onChange: (features: FeatureId[]) => void;
}) {
  function toggle(id: FeatureId) {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  }
  const groups = FEATURE_GROUPS.filter((group) => group.id !== "services");
  const selected = value.filter(
    (id) => FEATURES.find((feature) => feature.id === id)?.group !== "services",
  ).length;
  const missingRecommended = recommended.filter((id) => !value.includes(id));

  return (
    <div className="flex flex-col gap-7">
      <StepHead eyebrow="Step 3 · Features" title="Which features do you need?">
        Recommended ones for your project are already ticked. Add or remove anything; the analysis
        prices exactly what you choose.
      </StepHead>
      <div className="flex flex-wrap items-center gap-3">
        <span className="label-mono rounded-pill bg-c1-soft px-3 py-1.5 text-c1-text">
          {selected} selected
        </span>
        {missingRecommended.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([...value, ...missingRecommended])}
            className="text-sm font-semibold text-c1-text underline-offset-4 hover:underline"
          >
            Add the {missingRecommended.length} recommended again
          </button>
        ) : null}
      </div>
      {groups.map((group) => (
        <fieldset key={group.id} className="flex flex-col gap-3">
          <legend className="label-mono mb-3 text-faint">{group.label}</legend>
          <div className="flex flex-wrap gap-2.5">
            {FEATURES.filter((feature) => feature.group === group.id).map((feature) => (
              <label
                key={feature.id}
                className="est-chip"
                data-selected={value.includes(feature.id)}
              >
                <input
                  type="checkbox"
                  checked={value.includes(feature.id)}
                  onChange={() => toggle(feature.id)}
                  className="sr-only"
                />
                <span aria-hidden="true" className="est-chip-box">
                  <Icon name="check" size={12} />
                </span>
                <span className="text-fg">
                  {feature.label}
                  {recommended.includes(feature.id) ? (
                    <span className="est-recommended">Recommended</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

// ---- Step 4: design & scale ----
function Segmented<T extends string>({
  legend,
  name,
  choices,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="label-mono mb-3 text-faint">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {choices.map((choice) => (
          <label
            key={choice.id}
            className="est-card est-card--compact"
            data-selected={value === choice.id}
          >
            <input
              type="radio"
              name={name}
              value={choice.id}
              checked={value === choice.id}
              onChange={() => onChange(choice.id)}
              className="sr-only"
            />
            <CheckBadge />
            <span className="font-semibold text-fg">{choice.label}</span>
            <span className="text-sm text-muted">{choice.description}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function StepDesign({
  design,
  scale,
  delivery,
  onChange,
}: {
  design: (typeof DESIGN_LEVELS)[number]["id"];
  scale: (typeof SCALES)[number]["id"];
  delivery: (typeof DELIVERY)[number]["id"];
  onChange: (
    patch: Partial<{ design: typeof design; scale: typeof scale; delivery: typeof delivery }>,
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <StepHead eyebrow="Step 4 · Design & scale" title="Look, size and speed" />
      <Segmented
        legend="Design level"
        name="design"
        choices={DESIGN_LEVELS}
        value={design}
        onChange={(id) => onChange({ design: id })}
      />
      <Segmented
        legend="Expected users"
        name="scale"
        choices={SCALES}
        value={scale}
        onChange={(id) => onChange({ scale: id })}
      />
      <Segmented
        legend="Delivery speed"
        name="delivery"
        choices={DELIVERY}
        value={delivery}
        onChange={(id) => onChange({ delivery: id })}
      />
    </div>
  );
}

// ---- Step 5: extra services ----
export function StepExtras({
  value,
  onChange,
}: {
  value: FeatureId[];
  onChange: (features: FeatureId[]) => void;
}) {
  const services = FEATURES.filter((feature) => feature.group === "services");
  return (
    <fieldset className="flex flex-col gap-6">
      <legend className="sr-only">Anything else you need help with?</legend>
      <StepHead eyebrow="Step 5 · Extras" title="Anything else you need help with?">
        Optional. Skip this step if you already have these covered.
      </StepHead>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <label
            key={service.id}
            className="est-card est-card--compact"
            data-selected={value.includes(service.id)}
          >
            <input
              type="checkbox"
              checked={value.includes(service.id)}
              onChange={() =>
                onChange(
                  value.includes(service.id)
                    ? value.filter((id) => id !== service.id)
                    : [...value, service.id],
                )
              }
              className="sr-only"
            />
            <CheckBadge />
            <span className="font-semibold text-fg">{service.label}</span>
            {service.description ? (
              <span className="text-sm text-muted">{service.description}</span>
            ) : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// ---- Step 6: review ----
export type ReviewRow = { label: string; value: string; step: number };

export function StepReview({
  rows,
  onEdit,
  onAnalyse,
}: {
  rows: ReviewRow[];
  onEdit: (step: number) => void;
  onAnalyse: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <StepHead eyebrow="Step 6 · Review" title="Check your requirements">
        Everything look right? The analysis plans the build module by module and works out the cost
        and timeline from exactly these answers.
      </StepHead>
      <dl className="surface divide-y divide-line rounded-tile border border-line px-5">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3.5">
            <dt className="label-mono w-full text-faint sm:w-36 sm:flex-none">{row.label}</dt>
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
      <div className="est-analyse-cta">
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-fg">Ready for your project report</p>
          <p className="text-sm text-muted">
            Cost per module, tech stack, phases and payment plan. Free, instant, no sign-up.
          </p>
        </div>
        <button type="button" onClick={onAnalyse} className="est-analyse-button">
          <Icon name="sparkle" size={18} />
          Analyse my project
        </button>
      </div>
    </div>
  );
}

export function StepHint({ children, className }: { children: string; className?: string }) {
  return (
    <p role="status" className={cn("text-sm text-amber", className)}>
      {children}
    </p>
  );
}
