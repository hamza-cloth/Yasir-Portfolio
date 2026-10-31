import { z } from "zod";

// Site-wide options the admin edits, stored in the Setting table (one JSON value per key) and
// validated with these schemas on save and on read. Defaults apply when a key was never saved.

export const appearanceSchema = z.object({
  // The dot globe turning behind the hero photo.
  watermark: z.boolean(),
  // Its opacity in percent (the design default is 50).
  watermarkOpacity: z.number().int().min(10).max(100),
  // "calm" turns off the decorative motion (cursor, smooth scroll) for every visitor.
  motion: z.enum(["full", "calm"]),
});
export type Appearance = z.infer<typeof appearanceSchema>;

export const announcementSchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(160),
  href: z.union([z.string().regex(/^\/[\w\-/#?=&.]*$/), z.url(), z.literal("")]),
});
export type Announcement = z.infer<typeof announcementSchema>;

export const maintenanceSchema = z.object({
  enabled: z.boolean(),
  message: z.string().max(400),
});
export type Maintenance = z.infer<typeof maintenanceSchema>;

export const HOME_SECTIONS = [
  { id: "logos", label: "Logo strip" },
  { id: "glance", label: "At a glance" },
  { id: "services", label: "Services" },
  { id: "projects", label: "Projects" },
  { id: "process", label: "Process" },
  { id: "timeline", label: "Career timeline" },
  { id: "notes", label: "Latest notes" },
  { id: "testimonials", label: "Testimonials" },
  { id: "hire", label: "Hire me" },
  { id: "cta", label: "Closing call to action" },
] as const;
export type HomeSectionId = (typeof HOME_SECTIONS)[number]["id"];
const sectionIds = HOME_SECTIONS.map((section) => section.id) as [
  HomeSectionId,
  ...HomeSectionId[],
];

export const sectionsSchema = z.object({
  // In display order; a section missing from the list is hidden.
  home: z.array(z.enum(sectionIds)).max(HOME_SECTIONS.length),
});
export type Sections = z.infer<typeof sectionsSchema>;

export const notificationPrefsSchema = z.object({
  emailOnLead: z.boolean(),
  emailOnMessage: z.boolean(),
});
export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;

// Calculator prices the admin changed (admin → Pricing); anything missing keeps the default from
// src/config/pricing.ts.
const price = z.number().int().min(0).max(100_000_000);
export const pricingSchema = z.object({
  base: z.record(z.string().max(40), price),
  feature: z.record(z.string().max(40), price),
  // The launch-pricing ceiling, when changed from PRICING.maxPrice (0 = no ceiling).
  cap: price.optional(),
});
export type PricingOverrides = z.infer<typeof pricingSchema>;

export const SITE_CONFIG = {
  appearance: {
    schema: appearanceSchema,
    defaults: { watermark: true, watermarkOpacity: 50, motion: "full" } satisfies Appearance,
  },
  announcement: {
    schema: announcementSchema,
    defaults: { enabled: false, text: "", href: "" } satisfies Announcement,
  },
  maintenance: {
    schema: maintenanceSchema,
    defaults: {
      enabled: false,
      message: "The site is getting a quick update. Please check back in a few minutes.",
    } satisfies Maintenance,
  },
  sections: {
    schema: sectionsSchema,
    // Testimonials appear only once some are approved, even while listed here.
    defaults: { home: HOME_SECTIONS.map((section) => section.id) } satisfies Sections,
  },
  pricing: {
    schema: pricingSchema,
    defaults: { base: {}, feature: {} } satisfies PricingOverrides,
  },
  notifications: {
    schema: notificationPrefsSchema,
    defaults: { emailOnLead: true, emailOnMessage: true } satisfies NotificationPrefs,
  },
} as const;

export type SiteConfigKey = keyof typeof SITE_CONFIG;
export type SiteConfigValue<K extends SiteConfigKey> = z.infer<(typeof SITE_CONFIG)[K]["schema"]>;

export function parseSiteConfig<K extends SiteConfigKey>(
  key: K,
  value: unknown,
): SiteConfigValue<K> {
  const entry = SITE_CONFIG[key];
  const parsed = entry.schema.safeParse(value);
  return (parsed.success ? parsed.data : entry.defaults) as SiteConfigValue<K>;
}
