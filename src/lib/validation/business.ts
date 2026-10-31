import { z } from "zod";

// Leads, clients, invoices, testimonials and the other admin-upgrade records.

export const LEAD_STAGES = ["NEW", "CONTACTED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];
export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  PROPOSAL: "Proposal sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};
export const LEAD_SOURCES = ["hire", "calculator", "contact", "manual", "referral"] as const;

export const ESTIMATE_STATUSES = ["DRAFT", "REQUESTED", "SENT", "ACCEPTED", "DECLINED"] as const;
export const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE", "VOID"] as const;
export const TESTIMONIAL_STATUSES = ["PENDING", "APPROVED", "HIDDEN"] as const;

const optionalEmail = z.union([z.email("Enter a valid email."), z.null()]);
const optionalShort = z.string().max(200).nullable();

export const leadSchema = z.object({
  name: z.string().min(2, "Name is required.").max(80),
  email: z.email("Enter a valid email."),
  phone: optionalShort,
  source: z.enum(LEAD_SOURCES),
  stage: z.enum(LEAD_STAGES),
  value: z.number().int().min(0).max(100_000_000).nullable(),
  projectType: optionalShort,
  budget: optionalShort,
  timeline: optionalShort,
  details: z.string().max(5000),
  notes: z.string().max(5000).nullable(),
  followUpAt: z.date().nullable(),
});

export const clientSchema = z.object({
  name: z.string().min(2, "Name is required.").max(120),
  email: optionalEmail,
  phone: optionalShort,
  company: optionalShort,
  gstin: z.union([
    z
      .string()
      .regex(
        /^[0-9]{2}[A-Z0-9]{10}[0-9A-Z]{3}$/,
        "A GSTIN has 15 characters, e.g. 10ABCDE1234F1Z5.",
      ),
    z.null(),
  ]),
  address: z.string().max(500).nullable(),
  notes: z.string().max(5000).nullable(),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1).max(200),
  quantity: z.number().positive().max(10_000),
  rate: z.number().int().min(0).max(100_000_000),
});
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Pick a client."),
  items: z.array(invoiceItemSchema).min(1, "Add at least one line.").max(50),
  gstRate: z.number().min(0).max(28),
  status: z.enum(INVOICE_STATUSES),
  dueAt: z.date().nullable(),
  notes: z.string().max(2000).nullable(),
});

export function invoiceTotals(items: InvoiceItem[], gstRate: number) {
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.quantity * item.rate, 0));
  const gst = Math.round((subtotal * gstRate) / 100);
  return { subtotal, gst, total: subtotal + gst };
}

// One "description | quantity | rate" per line, the plain-text way invoice lines are edited.
export function parseInvoiceLines(text: string): InvoiceItem[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [description = "", quantity = "1", rate = "0"] = line
        .split("|")
        .map((part) => part.trim());
      return {
        description,
        quantity: Number(quantity.replace(/,/g, "")) || 0,
        rate: Math.round(Number(rate.replace(/[₹,\s]/g, "")) || 0),
      };
    });
}

export function formatInvoiceLines(items: InvoiceItem[]): string {
  return items.map((item) => `${item.description} | ${item.quantity} | ${item.rate}`).join("\n");
}

export const testimonialSchema = z.object({
  name: z.string().min(2, "Name is required.").max(80),
  role: optionalShort,
  company: optionalShort,
  quote: z.string().min(10, "The quote is too short.").max(1200),
  rating: z.number().int().min(1).max(5).nullable(),
  status: z.enum(TESTIMONIAL_STATUSES),
  order: z.number().int().min(0).max(999),
});

export const redirectSchema = z.object({
  from: z
    .string()
    .regex(/^\/[\w\-/.]{0,199}$/, "Start with / and use letters, digits, dashes and slashes.")
    .refine(
      (path) => !path.startsWith("/admin") && !path.startsWith("/api"),
      "Admin and API paths cannot be redirected.",
    ),
  to: z.union([
    z.string().regex(/^\/[\w\-/.?=&#]{0,199}$/, "Use a path like /work or a full https:// URL."),
    z.url(),
  ]),
  permanent: z.boolean(),
});
