import { z } from "zod";

import {
  CredentialKind,
  CredentialStatus,
  ProjectCategory,
  ProjectVisual,
  SkillDomain,
} from "@/generated/prisma/enums";

import { decisionsSchema } from "./project";
import { principlesSchema } from "./settings";

const slug = z
  .string()
  .min(1, "A slug is required.")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, digits and dashes only.");

const url = z.union([z.url("Enter a full URL starting with https://."), z.null()]);
const order = z.number().int("Order must be a whole number.").min(0).max(999);
const year = z.number().int("Years must be whole numbers.").min(1950).max(2100).nullable();

export const settingsSchema = z.object({
  name: z.string().min(2).max(80),
  roleLine: z.string().min(2).max(160),
  email: z.email("Enter a valid email."),
  location: z.string().min(2).max(80),
  availability: z.string().min(2).max(200),
  linkedinUrl: url,
  githubUrl: url,
  aboutStory: z.string().min(10).max(6000),
  principles: principlesSchema,
  nowItems: z.array(z.string().max(160)).max(10),
  openToWork: z.boolean(),
});

const seoEntry = z.object({
  title: z.string().max(70, "Keep titles under 70 characters.").optional().default(""),
  description: z
    .string()
    .max(170, "Keep descriptions under 170 characters.")
    .optional()
    .default(""),
});

export const seoSchema = z.object({
  seo: z.record(z.string().max(80), seoEntry),
  indexable: z.boolean(),
  sitemap: z.boolean(),
});

export const projectSchema = z.object({
  slug,
  title: z.string().min(2).max(80),
  tagline: z.string().min(2).max(200),
  summary: z.string().min(2).max(800),
  statusLabel: z.string().min(2).max(40),
  categories: z.array(z.enum(ProjectCategory)).min(1, "Pick at least one category."),
  role: z.string().max(80).nullable(),
  type: z.string().max(80).nullable(),
  stack: z.array(z.string().max(40)).max(30),
  visual: z.enum(ProjectVisual),
  overview: z.string().min(10).max(12000),
  decisions: decisionsSchema,
  published: z.boolean(),
  order,
  featured: z.boolean(),
  liveUrl: z.url("The live link must be a full https:// address.").max(300).nullable(),
  githubUrl: z.url("The source link must be a full https:// address.").max(300).nullable(),
  seoTitle: z.string().max(70, "Keep the search title under 70 characters.").nullable(),
  seoDescription: z
    .string()
    .max(170, "Keep the search description under 170 characters.")
    .nullable(),
  // Images from the media library (Vercel Blob), shown on the case study.
  gallery: z
    .array(
      z
        .url()
        .regex(
          /^https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\//,
          "Gallery images must come from the media library (copy their URL there).",
        ),
    )
    .max(12, "Up to 12 gallery images."),
});

export const noteSchema = z.object({
  slug,
  title: z.string().min(2).max(120),
  excerpt: z.string().min(10).max(300),
  body: z.string().min(20).max(50000),
  tags: z.array(z.string().max(30)).max(8),
  featured: z.boolean(),
  published: z.boolean(),
  order,
});

export const experienceSchema = z.object({
  role: z.string().min(2).max(80),
  company: z.string().min(2).max(120),
  location: z.string().max(80).nullable(),
  summary: z.string().min(10).max(1200),
  highlights: z.array(z.string().max(240)).max(10),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  isCurrent: z.boolean(),
  published: z.boolean(),
  order,
});

export const credentialSchema = z.object({
  title: z.string().min(2).max(160),
  issuer: z.string().min(2).max(160),
  kind: z.enum(CredentialKind),
  status: z.enum(CredentialStatus),
  location: z.string().max(80).nullable(),
  startYear: year,
  endYear: year,
  credentialUrl: url,
  published: z.boolean(),
  order,
});

export const skillSchema = z.object({
  name: z.string().min(1).max(60),
  layer: z.number().int().min(1).max(7).nullable(),
  domain: z.enum(SkillDomain).nullable(),
  published: z.boolean(),
});

// The first issue, phrased for the admin: "Title: too short".
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Please check the form.";
  const field = issue.path.join(".");
  return field ? `${field}: ${issue.message}` : issue.message;
}
