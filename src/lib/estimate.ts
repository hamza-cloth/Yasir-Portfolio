// The cost calculator's arithmetic: pure, no UI, every number read from src/config/pricing.ts.
import {
  DEFAULTS,
  DELIVERY,
  DESIGN_LEVELS,
  FEATURES,
  PLATFORMS,
  PRICING,
  PROJECT_TYPES,
  SCALES,
  type Choice,
  type DeliveryId,
  type DesignId,
  type FeatureId,
  type PlatformId,
  type ProjectType,
  type ScaleId,
} from "@/config/pricing";

export type EstimateInput = {
  type: string;
  platforms: PlatformId[];
  features: FeatureId[];
  design: DesignId;
  scale: ScaleId;
  delivery: DeliveryId;
};

export type BreakdownLine = { label: string; amount: number };

export type Estimate = {
  low: number;
  high: number;
  weeksMin: number;
  weeksMax: number;
  platformFactor: number;
  subtotal: number;
  breakdown: BreakdownLine[];
  supportMonths: number;
  summaryText: string;
};

export class EstimateInputError extends Error {}

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

export function calculateEstimate(input: EstimateInput): Estimate {
  const problem = validateEstimateInput(input);
  if (problem) throw new EstimateInputError(problem);
  const type = findProjectType(input.type) as ProjectType;

  const features = FEATURES.filter((feature) => input.features.includes(feature.id));
  const featuresTotal = features.reduce((total, feature) => total + feature.price, 0);
  const platformFactor = platformFactorFor(input.platforms);
  const design = choiceFactor(DESIGN_LEVELS, input.design);
  const scale = choiceFactor(SCALES, input.scale);
  const delivery = choiceFactor(DELIVERY, input.delivery);

  // Each multiplier's line is what it adds to the running total, so the lines sum to the subtotal.
  const breakdown: BreakdownLine[] = [{ label: `Base project: ${type.label}`, amount: type.base }];
  for (const feature of features) breakdown.push({ label: feature.label, amount: feature.price });
  let running = type.base + featuresTotal;
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
  const subtotal = running;

  let weeks =
    (type.baseWeeks + PRICING.weeksPerFeature * features.length) *
      (1 + PRICING.weeksPlatformStretch * (platformFactor - 1)) +
    (input.design === "premium" ? PRICING.premiumDesignExtraWeeks : 0);
  if (input.delivery === "priority") weeks *= PRICING.priorityWeeksFactor;

  const estimate = {
    low: roundTo(subtotal * PRICING.rangeLow),
    high: roundTo(subtotal * PRICING.rangeHigh),
    weeksMin: Math.ceil(weeks),
    weeksMax: Math.ceil(weeks * PRICING.weeksRangeFactor),
    platformFactor,
    subtotal,
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
    `Estimate: ${formatInr(estimate.low)} – ${formatInr(estimate.high)} (approx.)`,
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
