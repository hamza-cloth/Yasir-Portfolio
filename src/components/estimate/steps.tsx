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
import { formatInr } from "@/lib/estimate";

import { CategoryIcon, PlatformIcon } from "./icons";

function CheckBadge() {
  return (
    <span aria-hidden="true" className="est-check">
      <Icon name="check" size={12} />
    </span>
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
      <legend className="est-legend">What do you want to build?</legend>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((type) => (
            <label key={type.id} className="est-card tilt-3d" data-selected={value === type.id}>
              <input
                type="radio"
                name="project-type"
                value={type.id}
                checked={value === type.id}
                onChange={() => onChange(type)}
                className="sr-only"
              />
              <CheckBadge />
              <span className="grid size-12 place-items-center rounded-xl border border-c1 text-c1-text">
                <CategoryIcon category={type.category} />
              </span>
              <span className="text-[1.05rem] leading-snug font-semibold text-fg">
                {type.label}
              </span>
              <span className="text-sm text-muted">{type.description}</span>
              <span className="mt-auto font-mono text-sm text-c1-text">
                from {formatInr(type.base)}
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
      <legend className="est-legend">Where should it run?</legend>
      <p className="-mt-3 text-muted">Pick one or more. Every website works on phones too.</p>
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
              <span className="grid size-12 flex-none place-items-center rounded-xl border border-c1 text-c1-text">
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
          Cross-platform build — saves cost
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

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h2 className="est-legend">Which features do you need?</h2>
        <p className="text-muted">
          The ones marked Recommended are already ticked for your project type. Change anything.
        </p>
      </div>
      {FEATURE_GROUPS.map((group) => (
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
                <span className="flex flex-col">
                  <span className="text-fg">
                    {feature.label}
                    {recommended.includes(feature.id) ? (
                      <span className="est-recommended">Recommended</span>
                    ) : null}
                  </span>
                  <span className="est-chip-price">+{formatInr(feature.price)}</span>
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
      <h2 className="est-legend">Design, size and speed</h2>
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

export function StepHint({ children, className }: { children: string; className?: string }) {
  return (
    <p role="status" className={cn("text-sm text-amber", className)}>
      {children}
    </p>
  );
}
