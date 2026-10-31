// The project inquiry rules, free of zod so the browser can check a form without loading the
// validator (zod's eval probe also trips the site's CSP). The server schema in
// validation/inquiry.ts uses the same helpers and messages, so both sides always agree.
import { PROJECT_TYPES } from "@/lib/hire";

export type InquiryField =
  "name" | "email" | "phone" | "projectType" | "budget" | "timeline" | "details";

export const INQUIRY_MESSAGES = {
  name: "Please enter your name.",
  nameLong: "That name is too long.",
  email: "Please enter a valid email address.",
  phone: "Enter a 10-digit Indian mobile number (with or without +91).",
  projectType: "Please pick a project type.",
  details: "A little more detail helps: at least 20 characters.",
  detailsLong: "Please keep it under 3,000 characters.",
} as const;

export const DETAILS_MIN = 20;
export const DETAILS_MAX = 3000;

// An Indian mobile number: 10 digits starting 6–9, optionally written with +91, 91 or 0 in front,
// and with spaces or dashes. Normalised to +91XXXXXXXXXX.
export function normaliseIndianPhone(value: string): string | null {
  const digits = value.replace(/[\s()-]/g, "").replace(/^\+/, "");
  const local = digits.replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(local) ? `+91${local}` : null;
}

// The browser-side check: the first problem per field, or an empty object when the form is fine.
export function checkInquiry(
  values: Record<string, string>,
): Partial<Record<InquiryField, string>> {
  const errors: Partial<Record<InquiryField, string>> = {};
  const name = (values.name ?? "").trim();
  const email = (values.email ?? "").trim();
  const details = (values.details ?? "").trim();

  if (name.length < 2) errors.name = INQUIRY_MESSAGES.name;
  else if (name.length > 80) errors.name = INQUIRY_MESSAGES.nameLong;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    errors.email = INQUIRY_MESSAGES.email;
  }
  if (normaliseIndianPhone(values.phone ?? "") === null) errors.phone = INQUIRY_MESSAGES.phone;
  if (!(PROJECT_TYPES as readonly string[]).includes(values.projectType ?? "")) {
    errors.projectType = INQUIRY_MESSAGES.projectType;
  }
  if (details.length < DETAILS_MIN) errors.details = INQUIRY_MESSAGES.details;
  else if (details.length > DETAILS_MAX) errors.details = INQUIRY_MESSAGES.detailsLong;
  return errors;
}
