"use client";

import { useState, type CSSProperties } from "react";

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

import { CategoryIcon, PlatformIcon, SearchIcon, ServiceIcon } from "./icons";

// No step shows a price: the cost appears only after the review, as one analysed report.

// The stagger index for a card's entrance animation.
const order = (index: number) => ({ "--i": index }) as CSSProperties;

function CheckBadge() {
  return (
    <span aria-hidden="true" className="est-check">
      <Icon name="check" size={12} />
    </span>
  );
}

function StepHead({
  step,
  eyebrow,
  title,
  children,
}: {
  step: number;
  eyebrow: string;
  title: string;
  children?: string;
}) {
  return (
    <div className="est-head">
      <span aria-hidden="true" className="est-head-num">
        {String(step).padStart(2, "0")}
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="label-mono text-c1-text">{eyebrow}</p>
        <h2 className="est-legend">{title}</h2>
        {children ? <p className="max-w-2xl text-muted">{children}</p> : null}
      </div>
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
  const tabs = [{ id: "all" as const, label: "All" }, ...CATEGORIES].map((item) => ({
    ...item,
    count:
      item.id === "all"
        ? PROJECT_TYPES.length
        : PROJECT_TYPES.filter((type) => type.category === item.id).length,
  }));

  return (
    <fieldset className="flex min-w-0 flex-col gap-7">
      <legend className="sr-only">What do you want to build?</legend>
      <StepHead step={1} eyebrow="Project" title="What do you want to build?">
        Pick the closest match. The features it usually needs are ticked for you on the next steps.
      </StepHead>
      <div className="flex flex-col gap-4">
        <label className="est-search lg:max-w-sm">
          <span className="sr-only">Search project types</span>
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search, e.g. CRM or store"
          />
        </label>
        <div className="est-tabs" role="group" aria-label="Filter by category">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
              className="est-tab"
            >
              {item.label}
              <span className="est-tab-count" aria-hidden="true">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="rounded-card border border-dashed border-line-2 p-6 text-muted">
          Nothing matches “{query}”. Try another word, or pick “Something Else / Custom Idea”.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((type, index) => (
            <label
              key={type.id}
              className="est-card est-stagger"
              style={order(index)}
              data-selected={value === type.id}
            >
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
              <span className="pr-6 text-[1.05rem] leading-snug font-semibold text-fg">
                {type.label}
              </span>
              <span className="text-sm text-muted">{type.description}</span>
              {type.legalNote ? <span className="text-xs text-faint">{LEGAL_NOTE}</span> : null}
              <span className="est-card-foot">
                <span className="label-mono text-faint">
                  {type.recommended.length > 0
                    ? `${type.recommended.length} core features`
                    : "Scoped with you"}
                </span>
                <span aria-hidden="true" className="est-card-arrow">
                  <Icon name="arrow-right" size={14} />
                </span>
              </span>
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
    <fieldset className="flex min-w-0 flex-col gap-7">
      <legend className="sr-only">Where should it run?</legend>
      <StepHead step={2} eyebrow="Platforms" title="Where should it run?">
        Pick one or more. Every website works on phones too.
      </StepHead>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PLATFORMS.map((platform, index) => {
          const disabled = platform.id === "pwa" && !value.includes("web");
          return (
            <label
              key={platform.id}
              className="est-card est-stagger"
              style={order(index)}
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
              <span className="est-icon">
                <PlatformIcon platform={platform.id} size={24} />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[1.05rem] font-semibold text-fg">{platform.label}</span>
                <span className="text-sm text-muted">{platform.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      {crossPlatform ? (
        <p className="est-note">
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
  let index = 0;

  return (
    <div className="flex flex-col gap-8">
      <StepHead step={3} eyebrow="Features" title="Which features do you need?">
        Recommended ones for your project are already on. Switch anything on or off; the analysis
        prices exactly what you choose.
      </StepHead>
      <div className="flex flex-wrap items-center gap-3">
        <span className="est-pill">
          <Icon name="check" size={13} />
          {selected} selected
        </span>
        {missingRecommended.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([...value, ...missingRecommended])}
            className="min-h-11 text-sm font-semibold text-c1-text underline-offset-4 hover:underline"
          >
            Add the {missingRecommended.length} recommended again
          </button>
        ) : null}
      </div>
      {groups.map((group) => {
        const items = FEATURES.filter((feature) => feature.group === group.id);
        const on = items.filter((feature) => value.includes(feature.id)).length;
        return (
          <fieldset key={group.id} className="flex flex-col gap-3">
            <legend className="sr-only">{group.label}</legend>
            <div aria-hidden="true" className="est-group-head">
              <span className="label-mono text-fg">{group.label}</span>
              <span className="label-mono text-faint">
                {on}/{items.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((feature) => (
                <label
                  key={feature.id}
                  className="est-chip est-stagger"
                  style={order(index++)}
                  data-selected={value.includes(feature.id)}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(feature.id)}
                    onChange={() => toggle(feature.id)}
                    className="sr-only"
                  />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="leading-snug text-fg">{feature.label}</span>
                    {recommended.includes(feature.id) ? (
                      <span className="est-recommended">
                        <Icon name="sparkle" size={10} />
                        Recommended
                      </span>
                    ) : null}
                  </span>
                  <span aria-hidden="true" className="est-switch" />
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

// ---- Step 4: design & scale ----
function Segmented<T extends string>({
  legend,
  name,
  choices,
  value,
  offset,
  onChange,
}: {
  legend: string;
  name: string;
  choices: Choice<T>[];
  value: T;
  offset: number;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="label-mono mb-3 text-fg">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {choices.map((choice, index) => (
          <label
            key={choice.id}
            className="est-card est-card--compact est-stagger"
            style={order(offset + index)}
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
            <span aria-hidden="true" className="est-meter mb-1">
              {[0, 1, 2].map((bar) => (
                <span
                  key={bar}
                  data-on={bar <= Math.round((index * 2) / Math.max(1, choices.length - 1))}
                />
              ))}
            </span>
            <span className="text-[1.05rem] font-semibold text-fg">{choice.label}</span>
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
      <StepHead step={4} eyebrow="Design & scale" title="Look, size and speed">
        How polished it should feel, how many people will use it, and how soon you need it.
      </StepHead>
      <Segmented
        legend="Design level"
        name="design"
        choices={DESIGN_LEVELS}
        value={design}
        offset={0}
        onChange={(id) => onChange({ design: id })}
      />
      <Segmented
        legend="Expected users"
        name="scale"
        choices={SCALES}
        value={scale}
        offset={3}
        onChange={(id) => onChange({ scale: id })}
      />
      <Segmented
        legend="Delivery speed"
        name="delivery"
        choices={DELIVERY}
        value={delivery}
        offset={6}
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
    <fieldset className="flex min-w-0 flex-col gap-7">
      <legend className="sr-only">Anything else you need help with?</legend>
      <StepHead step={5} eyebrow="Extras" title="Anything else you need help with?">
        Optional. Skip this step if you already have these covered.
      </StepHead>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service, index) => (
          <label
            key={service.id}
            className="est-card est-card--row est-stagger"
            style={order(index)}
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
            <span className="est-icon">
              <ServiceIcon id={service.id} />
            </span>
            <span className="flex min-w-0 flex-col gap-1 pr-6">
              <span className="font-semibold text-fg">{service.label}</span>
              {service.description ? (
                <span className="text-sm text-muted">{service.description}</span>
              ) : null}
            </span>
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
    <div className="flex flex-col gap-7">
      <StepHead step={6} eyebrow="Review" title="Check your requirements">
        Everything look right? The analysis plans the build module by module and works out the cost
        and timeline from exactly these answers.
      </StepHead>
      <ul className="grid gap-3 md:grid-cols-2">
        {rows.map((row, index) => (
          <li
            key={row.label}
            className={cn(
              "est-review-row est-stagger",
              row.label === "Features" && "md:col-span-2",
            )}
            style={order(index)}
          >
            <span aria-hidden="true" className="est-review-index">
              {String(row.step).padStart(2, "0")}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="label-mono text-faint">{row.label}</span>
              <span className="text-fg">{row.value}</span>
            </span>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="min-h-11 flex-none rounded-pill px-3 text-sm font-semibold text-c1-text hover:bg-c1-soft"
            >
              Edit<span className="sr-only"> {row.label.toLowerCase()}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="est-analyse-cta">
        <div className="flex max-w-md flex-col gap-1">
          <p className="font-display text-lg font-semibold text-fg">
            Ready for your project report
          </p>
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
