// The cost calculator's arithmetic: pure, no UI. Factors and texts come from
// src/config/pricing.ts; base and feature prices come from a PriceTable (the config's defaults
// with the admin's overrides applied).
import {
  BASE_SPLIT,
  DEFAULTS,
  DELIVERY,
  DESIGN_LEVELS,
  FEATURES,
  MILESTONES,
  MODULES,
  PHASES,
  PLATFORMS,
  PRICING,
  PROJECT_TYPES,
  SCALES,
  type Choice,
  type DeliveryId,
  type DesignId,
  type FeatureId,
  type ModuleId,
  type PlatformId,
  type ProjectType,
  type ScaleId,
} from "@/config/pricing";

// Base price per project type id, price per feature id, and the launch-pricing ceiling
// (0 = none).
export type PriceTable = {
  base: Record<string, number>;
  feature: Record<string, number>;
  cap: number;
};

export const DEFAULT_PRICES: PriceTable = {
  base: Object.fromEntries(PROJECT_TYPES.map((type) => [type.id, type.base])),
  feature: Object.fromEntries(FEATURES.map((feature) => [feature.id, feature.price])),
  cap: PRICING.maxPrice,
};

// The defaults with any valid override on top; unknown ids and bad numbers are ignored.
export function priceTableWith(
  overrides:
    | { base?: Record<string, unknown>; feature?: Record<string, unknown>; cap?: unknown }
    | null
    | undefined,
): PriceTable {
  const valid = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100_000_000;
  const merge = (defaults: Record<string, number>, extra: Record<string, unknown> = {}) =>
    Object.fromEntries(
      Object.entries(defaults).map(([id, price]) => {
        const override = extra[id];
        return [id, valid(override) ? override : price];
      }),
    );
  return {
    base: merge(DEFAULT_PRICES.base, overrides?.base),
    feature: merge(DEFAULT_PRICES.feature, overrides?.feature),
    cap: valid(overrides?.cap) ? overrides.cap : DEFAULT_PRICES.cap,
  };
}

export type EstimateInput = {
  type: string;
  platforms: PlatformId[];
  features: FeatureId[];
  design: DesignId;
  scale: ScaleId;
  delivery: DeliveryId;
};

export type BreakdownLine = { label: string; amount: number; module?: ModuleId };

export type Estimate = {
  low: number;
  high: number;
  weeksMin: number;
  weeksMax: number;
  platformFactor: number;
  subtotal: number;
  // The range the scope prices at before the launch-pricing ceiling; null when under it.
  standard: { low: number; high: number; subtotal: number } | null;
  breakdown: BreakdownLine[];
  supportMonths: number;
  summaryText: string;
};

export class EstimateInputError extends Error {}

export const LAUNCH_PRICING_LABEL = "Launch pricing";

const money = new Intl.NumberFormat(PRICING.locale, {
  style: "currency",
  currency: PRICING.currency,
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return money.format(Math.round(amount));
}

export function roundTo(amount: number, step: number = PRICING.roundTo): number {
  return Math.round(amount / step) * step;
}

export function findProjectType(id: string): ProjectType | undefined {
  return PROJECT_TYPES.find((type) => type.id === id);
}

// Why a selection cannot be estimated yet, or null when it can.
export function validateEstimateInput(input: Partial<EstimateInput>): string | null {
  if (!input.type || !findProjectType(input.type)) return "Choose a project type to continue.";
  const platforms = input.platforms ?? [];
  if (platforms.length === 0) return "Select at least one device to continue.";
  if (platforms.includes("pwa") && !platforms.includes("web")) {
    return "A PWA is built on the website, so select Website too.";
  }
  return null;
}

// Platform factors add up; Android + iOS together share one cross-platform codebase.
export function platformFactorFor(platforms: PlatformId[]): number {
  const sum = PLATFORMS.filter((platform) => platforms.includes(platform.id)).reduce(
    (total, platform) => total + platform.factor,
    0,
  );
  const crossPlatform = platforms.includes("android") && platforms.includes("ios");
  return Math.max(1, sum + (crossPlatform ? PRICING.crossPlatformDiscount : 0));
}

function choiceFactor<T extends string>(choices: Choice<T>[], id: T) {
  const choice = choices.find((item) => item.id === id);
  if (!choice) throw new EstimateInputError(`Unknown option: ${id}`);
  return choice;
}

export function calculateEstimate(
  input: EstimateInput,
  prices: PriceTable = DEFAULT_PRICES,
): Estimate {
  const problem = validateEstimateInput(input);
  if (problem) throw new EstimateInputError(problem);
  const type = findProjectType(input.type) as ProjectType;
  const base = prices.base[type.id] ?? type.base;
  const priceOf = (id: FeatureId) =>
    prices.feature[id] ?? FEATURES.find((item) => item.id === id)?.price ?? 0;

  const features = FEATURES.filter((feature) => input.features.includes(feature.id));
  const featuresTotal = features.reduce((total, feature) => total + priceOf(feature.id), 0);
  const platformFactor = platformFactorFor(input.platforms);
  const design = choiceFactor(DESIGN_LEVELS, input.design);
  const scale = choiceFactor(SCALES, input.scale);
  const delivery = choiceFactor(DELIVERY, input.delivery);

  // Each multiplier's line is what it adds to the running total, so the lines sum to the subtotal.
  const breakdown: BreakdownLine[] = [{ label: `Base project: ${type.label}`, amount: base }];
  for (const feature of features) {
    breakdown.push({ label: feature.label, amount: priceOf(feature.id), module: feature.module });
  }
  let running = base + featuresTotal;
  const steps: [string, number][] = [
    ["Platform adjustment", platformFactor],
    [`Design level: ${design.label}`, design.factor],
    [`Scale: ${scale.label}`, scale.factor],
    [`Delivery: ${delivery.label}`, delivery.factor],
  ];
  for (const [label, factor] of steps) {
    if (factor === 1) continue;
    const next = running * factor;
    breakdown.push({ label, amount: next - running });
    running = next;
  }
  // Launch pricing: the upper end may not pass the ceiling, so the subtotal is held at
  // ceiling ÷ rangeHigh and the difference is its own (negative) line.
  const ceilingSubtotal = prices.cap > 0 ? prices.cap / PRICING.rangeHigh : Infinity;
  const subtotal = Math.min(running, ceilingSubtotal);
  const standard =
    subtotal < running
      ? {
          low: roundTo(running * PRICING.rangeLow),
          high: roundTo(running * PRICING.rangeHigh),
          subtotal: running,
        }
      : null;
  if (standard) breakdown.push({ label: LAUNCH_PRICING_LABEL, amount: subtotal - running });

  let weeks =
    (type.baseWeeks + PRICING.weeksPerFeature * features.length) *
      (1 + PRICING.weeksPlatformStretch * (platformFactor - 1)) +
    (input.design === "premium" ? PRICING.premiumDesignExtraWeeks : 0);
  if (input.delivery === "priority") weeks *= PRICING.priorityWeeksFactor;

  const estimate = {
    low: roundTo(subtotal * PRICING.rangeLow),
    high: Math.min(roundTo(subtotal * PRICING.rangeHigh), prices.cap > 0 ? prices.cap : Infinity),
    weeksMin: Math.ceil(weeks),
    weeksMax: Math.ceil(weeks * PRICING.weeksRangeFactor),
    platformFactor,
    subtotal,
    standard,
    breakdown,
    supportMonths: PRICING.supportMonths,
  };

  const platformLabels = PLATFORMS.filter((platform) => input.platforms.includes(platform.id)).map(
    (platform) => platform.label,
  );
  const summaryText = [
    `Project: ${type.label}`,
    `Devices: ${platformLabels.join(", ")}`,
    `Features: ${features.length > 0 ? features.map((feature) => feature.label).join(", ") : "None selected"}`,
    `Design: ${design.label} · Users: ${scale.description} · Delivery: ${delivery.label}`,
    `Estimate: ${formatInr(estimate.low)} – ${formatInr(estimate.high)} (approx.${standard ? ", launch pricing" : ""})`,
    `Timeline: approx. ${estimate.weeksMin} – ${estimate.weeksMax} weeks`,
    `Support: ${PRICING.supportMonths} months free`,
  ].join("\n");

  return { ...estimate, summaryText };
}

// The inquiry form's budget option nearest to an estimate, judged by its midpoint.
export function budgetRangeFor(low: number, high: number): string {
  const mid = (low + high) / 2;
  if (mid < 10_000) return "Under ₹10,000";
  if (mid < 25_000) return "₹10,000–₹25,000";
  if (mid < 50_000) return "₹25,000–₹50,000";
  return "₹50,000+";
}

const pick = <T extends string>(ids: readonly T[], value: string | null, fallback: T): T =>
  value && (ids as readonly string[]).includes(value) ? (value as T) : fallback;

// A selection as query params (the calculator's shareable link, and the quote hand-off to /hire).
export function estimateInputToParams(input: EstimateInput): URLSearchParams {
  return new URLSearchParams({
    type: input.type,
    devices: input.platforms.join(","),
    features: input.features.join(","),
    design: input.design,
    users: input.scale,
    delivery: input.delivery,
  });
}

// Reads a selection back, keeping only ids the config knows; null without a valid project type.
export function estimateInputFromParams(params: URLSearchParams): EstimateInput | null {
  const type = params.get("type");
  if (!type || !findProjectType(type)) return null;
  const list = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
  const platforms = list("devices").filter((id): id is PlatformId =>
    PLATFORMS.some((platform) => platform.id === id),
  );
  return {
    type,
    platforms: platforms.length > 0 ? platforms : DEFAULTS.platforms,
    features: list("features").filter((id): id is FeatureId =>
      FEATURES.some((feature) => feature.id === id),
    ),
    design: pick(
      DESIGN_LEVELS.map((item) => item.id),
      params.get("design"),
      DEFAULTS.design,
    ),
    scale: pick(
      SCALES.map((item) => item.id),
      params.get("users"),
      DEFAULTS.scale,
    ),
    delivery: pick(
      DELIVERY.map((item) => item.id),
      params.get("delivery"),
      DEFAULTS.delivery,
    ),
  };
}

// ---- The analysis shown with the result -------------------------------------------------------

export type ModuleCost = {
  id: ModuleId;
  label: string;
  description: string;
  amount: number;
  share: number;
  items: string[];
};

export type Analysis = {
  modules: ModuleCost[];
  stack: { layer: string; tech: string }[];
  phases: { label: string; weeks: number }[];
  milestones: { label: string; share: number; low: number; high: number }[];
  complexity: { score: number; label: "Simple" | "Moderate" | "Complex" | "Advanced" };
  screens: number;
};

// Splits the estimate into the parts of a full-stack build, picks a stack for it and lays out the
// phases and payments. Module amounts add up to the subtotal exactly.
export function analyseEstimate(input: EstimateInput, estimate: Estimate): Analysis {
  const totals = new Map<ModuleId, number>(MODULES.map((module) => [module.id, 0]));
  const items = new Map<ModuleId, string[]>(MODULES.map((module) => [module.id, []]));
  const add = (id: ModuleId, amount: number, item?: string) => {
    totals.set(id, (totals.get(id) ?? 0) + amount);
    if (item) items.get(id)?.push(item);
  };
  const spread = (amount: number, split: Partial<Record<ModuleId, number>>) => {
    for (const [id, share] of Object.entries(split) as [ModuleId, number][])
      add(id, amount * share);
  };

  const [baseLine, ...rest] = estimate.breakdown;
  spread(baseLine?.amount ?? 0, BASE_SPLIT);
  for (const line of rest) {
    if (line.module) add(line.module, line.amount, line.label);
    else if (line.label === "Platform adjustment") add("apps", line.amount);
    else if (line.label.startsWith("Design level")) {
      spread(line.amount, { discovery: 0.4, frontend: 0.6 });
    } else if (line.label.startsWith("Scale")) {
      spread(line.amount, { backend: 0.45, database: 0.25, launch: 0.3 });
    } else {
      // Priority delivery (more hands on every part) and the launch-pricing ceiling (a lower
      // price on every part) both apply in proportion.
      const before = [...totals.values()].reduce((sum, value) => sum + value, 0) || 1;
      for (const [id, value] of [...totals.entries()]) add(id, (line.amount * value) / before);
    }
  }

  const platformNames = PLATFORMS.filter(
    (platform) => input.platforms.includes(platform.id) && platform.id !== "web",
  ).map((platform) => platform.label);
  items.get("apps")?.push(...platformNames);
  items.get("discovery")?.unshift("Requirements & user flows", "Wireframes & visual design");
  items.get("frontend")?.unshift("Responsive pages", "Accessibility & speed");
  items.get("backend")?.unshift("Business logic & APIs", "Validation & security");
  items.get("database")?.unshift("Data model & migrations", "Daily backups");
  items.get("qa")?.push("Automated tests", "Phone, tablet & desktop checks");
  items.get("launch")?.push("CI/CD & hosting", "Monitoring & SSL");

  const modules = MODULES.map((module) => {
    const amount = totals.get(module.id) ?? 0;
    return {
      ...module,
      amount,
      share: amount / (estimate.subtotal || 1),
      items: items.get(module.id) ?? [],
    };
  }).filter((module) => module.amount > 0.5);

  const has = (id: FeatureId) => input.features.includes(id);
  const mobile = input.platforms.includes("android") || input.platforms.includes("ios");
  const optional = (condition: boolean, layer: string, tech: string) =>
    condition ? [{ layer, tech }] : [];
  const stack = [
    { layer: "Frontend", tech: "Next.js, React & TypeScript, Tailwind CSS" },
    {
      layer: "Backend",
      tech: `Node.js APIs on the Next.js server${has("chat") ? ", WebSockets for real time" : ""}`,
    },
    {
      layer: "Database",
      tech: `PostgreSQL with Prisma${input.scale === "large" ? ", Redis cache" : ""}`,
    },
    ...optional(mobile, "Mobile", "React Native: one codebase for Android & iOS"),
    ...optional(input.platforms.includes("desktop"), "Desktop", "Tauri / Electron"),
    ...optional(
      has("payment") || has("subscriptions"),
      "Payments",
      "Razorpay: UPI, cards, net banking",
    ),
    ...optional(has("ai"), "AI", "Claude / OpenAI APIs with guard-rails"),
    ...optional(has("maps"), "Maps", "Google Maps / Mapbox"),
    ...optional(has("media") || has("video"), "Storage", "Cloud object storage with a CDN"),
    ...optional(
      has("notifications") || has("push"),
      "Messaging",
      "Email, SMS / WhatsApp and push providers",
    ),
    {
      layer: "Hosting",
      tech:
        input.scale === "large"
          ? "Vercel / AWS with autoscaling"
          : "Vercel with a managed database",
    },
  ];

  const weeks = (estimate.weeksMin + estimate.weeksMax) / 2;
  const phases = PHASES.map((phase) => ({
    label: phase.label,
    weeks: Math.max(0.5, Math.round(weeks * phase.share * 2) / 2),
  }));
  const milestones = MILESTONES.map((milestone) => ({
    ...milestone,
    low: roundTo(estimate.low * milestone.share, 500),
    high: roundTo(estimate.high * milestone.share, 500),
  }));

  // Complexity follows the scope, so it uses the subtotal before the launch-pricing ceiling.
  const scope = estimate.standard?.subtotal ?? estimate.subtotal;
  const score = Math.min(
    10,
    Math.max(1, Math.round(Math.log2(Math.max(scope, 8_000) / 8_000) * 1.15 + 1)),
  );
  const label =
    score <= 3 ? "Simple" : score <= 5 ? "Moderate" : score <= 7 ? "Complex" : "Advanced";
  const pageFeatures = input.features.filter((id) => {
    const feature = FEATURES.find((item) => item.id === id);
    return feature && feature.group !== "services";
  });
  const screens = 3 + Math.round(pageFeatures.length * 1.5) + (has("admin") ? 4 : 0);

  return { modules, stack, phases, milestones, complexity: { score, label }, screens };
}
