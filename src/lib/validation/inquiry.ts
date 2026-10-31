import { z } from "zod";

import { BUDGET_RANGES, PROJECT_TYPES, TIMELINES } from "@/lib/hire";
import {
  DETAILS_MAX,
  DETAILS_MIN,
  INQUIRY_MESSAGES,
  normaliseIndianPhone,
  type InquiryField,
} from "@/lib/inquiry-rules";

export { normaliseIndianPhone, type InquiryField };

const optionalChoice = <T extends readonly [string, ...string[]]>(options: T) =>
  z
    .union([z.enum(options), z.literal("")])
    .optional()
    .transform((value) => value || undefined);

// The server's check of a project inquiry. Same rules and messages as checkInquiry() in the browser.
export const inquirySchema = z.object({
  name: z.string().trim().min(2, INQUIRY_MESSAGES.name).max(80, INQUIRY_MESSAGES.nameLong),
  email: z.email(INQUIRY_MESSAGES.email).trim().max(160),
  phone: z
    .string()
    .trim()
    .refine((value) => normaliseIndianPhone(value) !== null, { message: INQUIRY_MESSAGES.phone })
    .transform((value) => normaliseIndianPhone(value) ?? value),
  projectType: z.enum(PROJECT_TYPES, { error: INQUIRY_MESSAGES.projectType }),
  budget: optionalChoice(BUDGET_RANGES),
  timeline: optionalChoice(TIMELINES),
  details: z
    .string()
    .trim()
    .min(DETAILS_MIN, INQUIRY_MESSAGES.details)
    .max(DETAILS_MAX, INQUIRY_MESSAGES.detailsLong),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
