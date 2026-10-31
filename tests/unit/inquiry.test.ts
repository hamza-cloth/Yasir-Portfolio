import { describe, expect, it } from "vitest";

import { BUDGET_RANGES, HIRE_FAQ, HIRE_SERVICES, whatsappUrl } from "@/lib/hire";
import { checkInquiry } from "@/lib/inquiry-rules";
import { inquirySchema, normaliseIndianPhone } from "@/lib/validation/inquiry";

const valid = {
  name: "Priya Sharma",
  email: "priya@example.com",
  phone: "98765 43210",
  projectType: "Business Website",
  budget: "",
  timeline: "Flexible",
  details: "A five-page site for my clinic, with a booking form.",
};

describe("project inquiry", () => {
  it("accepts Indian mobile numbers with or without +91, 91 or 0", () => {
    for (const input of ["9876543210", "+91 98765 43210", "91-9876543210", "09876543210"]) {
      expect(normaliseIndianPhone(input), input).toBe("+919876543210");
    }
  });

  it("rejects numbers that are not Indian mobiles", () => {
    for (const input of ["12345", "5876543210", "98765432101", "+1 415 555 0100", ""]) {
      expect(normaliseIndianPhone(input), input).toBeNull();
    }
  });

  it("parses a valid inquiry and treats empty optional choices as unanswered", () => {
    const parsed = inquirySchema.parse(valid);
    expect(parsed.phone).toBe("+919876543210");
    expect(parsed.budget).toBeUndefined();
    expect(parsed.timeline).toBe("Flexible");
  });

  it("names the field that is wrong", () => {
    const result = inquirySchema.safeParse({
      ...valid,
      phone: "12",
      projectType: "Spaceship",
      details: "short",
    });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["phone", "projectType", "details"]));
  });

  it("only accepts budgets from the configured list", () => {
    expect(inquirySchema.safeParse({ ...valid, budget: BUDGET_RANGES[0] }).success).toBe(true);
    expect(inquirySchema.safeParse({ ...valid, budget: "₹5" }).success).toBe(false);
  });
});

describe("browser and server checks agree", () => {
  const cases: Record<string, string>[] = [
    valid,
    { ...valid, name: "A" },
    { ...valid, email: "not-an-email" },
    { ...valid, phone: "12345" },
    { ...valid, projectType: "" },
    { ...valid, details: "too short" },
    { ...valid, name: "", phone: "", details: "" },
  ];

  it.each(cases)("flags the same fields: %o", (values) => {
    const browser = Object.keys(checkInquiry(values)).sort();
    const result = inquirySchema.safeParse(values);
    const server = result.success
      ? []
      : [...new Set(result.error.issues.map((issue) => String(issue.path[0])))].sort();
    expect(browser).toEqual(server);
  });
});

describe("hire content", () => {
  it("never ships a placeholder as a price or an FAQ answer", () => {
    for (const service of HIRE_SERVICES) expect(service.startingPrice ?? "").not.toMatch(/[[\]]/);
    for (const item of HIRE_FAQ) expect(item.answer ?? "").not.toMatch(/[[\]]/);
  });

  it("hides WhatsApp until a number is configured", () => {
    expect(whatsappUrl()).toBeNull();
  });
});
