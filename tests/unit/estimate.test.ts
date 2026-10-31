import { describe, expect, it } from "vitest";

import { FEATURES, PROJECT_TYPES } from "@/config/pricing";
import {
  budgetRangeFor,
  calculateEstimate,
  EstimateInputError,
  formatInr,
  platformFactorFor,
  roundTo,
  validateEstimateInput,
  type EstimateInput,
} from "@/lib/estimate";

function input(overrides: Partial<EstimateInput>): EstimateInput {
  const type = PROJECT_TYPES.find((item) => item.id === (overrides.type ?? "portfolio"));
  return {
    type: "portfolio",
    platforms: ["web"],
    features: type?.recommended ?? [],
    design: "custom",
    scale: "small",
    delivery: "standard",
    ...overrides,
  };
}

const sum = (amounts: number[]) => amounts.reduce((total, amount) => total + amount, 0);

describe("calculateEstimate", () => {
  it("prices a web-only portfolio with its recommended features", () => {
    // (12,000 base + 8,000 SEO + 3,000 contact form) × 1 = 23,000
    const estimate = calculateEstimate(input({ type: "portfolio" }));
    expect(estimate.subtotal).toBe(23_000);
    expect(estimate.low).toBe(20_000); // 19,550 rounded
    expect(estimate.high).toBe(28_000); // 27,600 rounded
    expect([estimate.weeksMin, estimate.weeksMax]).toEqual([3, 4]); // 2.5 weeks
    expect(estimate.supportMonths).toBe(6);
  });

  it("applies the cross-platform discount for e-commerce on web, Android and iOS", () => {
    // factor 1 + 0.8 + 0.8 − 0.4 = 2.2; (60,000 + 70,000 features) × 2.2 = 2,86,000
    const estimate = calculateEstimate(
      input({ type: "ecommerce", platforms: ["web", "android", "ios"] }),
    );
    expect(estimate.platformFactor).toBeCloseTo(2.2);
    expect(estimate.subtotal).toBeCloseTo(286_000);
    expect(estimate.low).toBe(243_000);
    expect(estimate.high).toBe(343_000);
    expect([estimate.weeksMin, estimate.weeksMax]).toEqual([11, 14]); // 7.5 × 1.42 = 10.65
  });

  it("adds premium design to a web CRM, in price and in time", () => {
    // (1,20,000 + 53,000 features) × 1.3 = 2,24,900; weeks (7 + 2) + 1 = 10
    const estimate = calculateEstimate(input({ type: "crm", design: "premium" }));
    expect(estimate.subtotal).toBeCloseTo(224_900);
    expect(estimate.low).toBe(191_000);
    expect(estimate.high).toBe(270_000);
    expect([estimate.weeksMin, estimate.weeksMax]).toEqual([10, 13]);
  });

  it("prices the custom type from its base alone", () => {
    const estimate = calculateEstimate(input({ type: "custom" }));
    expect(estimate.subtotal).toBe(50_000);
    expect([estimate.low, estimate.high]).toEqual([43_000, 60_000]);
    expect(PROJECT_TYPES.find((type) => type.id === "custom")?.discussFirst).toBe(true);
  });

  it("speeds up priority delivery by a quarter and charges 25% more", () => {
    const standard = calculateEstimate(input({ type: "booking" }));
    const priority = calculateEstimate(input({ type: "booking", delivery: "priority" }));
    expect(priority.subtotal).toBeCloseTo(standard.subtotal * 1.25);
    expect(priority.weeksMin).toBeLessThan(standard.weeksMin);
  });

  it("builds a breakdown whose lines add up to the subtotal", () => {
    const estimate = calculateEstimate(
      input({
        type: "social",
        platforms: ["web", "pwa", "android", "ios", "desktop"],
        design: "premium",
        scale: "large",
        delivery: "priority",
      }),
    );
    expect(sum(estimate.breakdown.map((line) => line.amount))).toBeCloseTo(estimate.subtotal, 6);
    expect(estimate.breakdown[0]?.label).toContain("Base project");
  });

  it("writes a summary with the range, timeline and free support", () => {
    const { summaryText } = calculateEstimate(input({ type: "portfolio" }));
    expect(summaryText).toContain("Project: Portfolio / Personal Website");
    expect(summaryText).toContain("₹20,000 – ₹28,000");
    expect(summaryText).toContain("6 months free");
  });
});

describe("inputs and rounding", () => {
  it("rounds to the nearest ₹1,000 and formats in the Indian style", () => {
    expect(roundTo(1_499)).toBe(1_000);
    expect(roundTo(1_500)).toBe(2_000);
    expect(roundTo(243_100)).toBe(243_000);
    expect(formatInr(150_000)).toBe("₹1,50,000");
  });

  it("needs at least one platform", () => {
    expect(validateEstimateInput(input({ platforms: [] }))).toMatch(/at least one device/);
    expect(() => calculateEstimate(input({ platforms: [] }))).toThrow(EstimateInputError);
  });

  it("does not allow a PWA without the website", () => {
    expect(validateEstimateInput(input({ platforms: ["pwa"] }))).toMatch(/select Website/);
    expect(() => calculateEstimate(input({ platforms: ["pwa", "android"] }))).toThrow(
      EstimateInputError,
    );
    expect(platformFactorFor(["web", "pwa"])).toBeCloseTo(1.2);
  });

  it("never lets the platform factor drop below 1", () => {
    expect(platformFactorFor(["desktop"])).toBe(1);
    expect(platformFactorFor(["android", "ios"])).toBeCloseTo(1.2);
  });

  it("rejects an unknown project type", () => {
    expect(() => calculateEstimate(input({ type: "casino" }))).toThrow(EstimateInputError);
  });

  it("maps an estimate to the nearest inquiry budget", () => {
    expect(budgetRangeFor(7_000, 9_000)).toBe("Under ₹10,000");
    expect(budgetRangeFor(20_000, 28_000)).toBe("₹10,000–₹25,000"); // midpoint ₹24,000
    expect(budgetRangeFor(30_000, 42_000)).toBe("₹25,000–₹50,000");
    expect(budgetRangeFor(243_000, 343_000)).toBe("₹50,000+");
  });
});

describe("pricing config", () => {
  it("recommends only features that exist and has unique ids", () => {
    const featureIds = new Set(FEATURES.map((feature) => feature.id));
    expect(featureIds.size).toBe(FEATURES.length);
    expect(new Set(PROJECT_TYPES.map((type) => type.id)).size).toBe(PROJECT_TYPES.length);
    for (const type of PROJECT_TYPES) {
      for (const id of type.recommended) expect(featureIds.has(id), `${type.id}/${id}`).toBe(true);
    }
  });

  it("marks every gaming and earning type with the real-money note", () => {
    for (const type of PROJECT_TYPES.filter((item) =>
      ["gaming", "earning"].includes(item.category),
    )) {
      expect(type.legalNote, type.id).toBe(true);
    }
  });
});
