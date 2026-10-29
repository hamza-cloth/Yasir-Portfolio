import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { DEFAULT_SITE_SETTINGS, type SiteSettingsData } from "@/lib/content/site-settings";
import { getDb } from "@/lib/db";
import { DEFAULT_LOOK_CONFIG, normaliseLookConfig, type LookConfig } from "@/lib/look";
import { principlesSchema } from "@/lib/validation/settings";

export async function getSiteSettings(): Promise<SiteSettingsData> {
  "use cache";
  cacheTag(CACHE_TAGS.settings);
  cacheLife("max");

  const db = getDb();
  if (!db) return DEFAULT_SITE_SETTINGS;

  const row = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!row) return DEFAULT_SITE_SETTINGS;

  const principles = principlesSchema.safeParse(row.principles);

  return {
    name: row.name,
    roleLine: row.roleLine,
    email: row.email,
    location: row.location,
    availability: row.availability,
    linkedinUrl: row.linkedinUrl || null,
    githubUrl: row.githubUrl || null,
    photoUrl: row.photoUrl || null,
    aboutStory: row.aboutStory,
    principles: principles.success ? principles.data : [],
    nowItems: row.nowItems,
    nowUpdatedAt: row.nowUpdatedAt,
    openToWork: row.openToWork,
  };
}

// Read by the root layout's pre-paint script; saving looks in /admin refreshes this tag.
export async function getLookConfig(): Promise<LookConfig> {
  "use cache";
  cacheTag(CACHE_TAGS.settings);
  cacheLife("max");

  const db = getDb();
  if (!db) return DEFAULT_LOOK_CONFIG;

  const row = await db.siteSettings.findUnique({
    where: { id: 1 },
    select: { looksEnabled: true, looksMode: true, looksFixed: true },
  });
  if (!row) return DEFAULT_LOOK_CONFIG;

  return normaliseLookConfig({
    enabled: row.looksEnabled as LookConfig["enabled"],
    mode: row.looksMode as LookConfig["mode"],
    fixed: row.looksFixed as LookConfig["fixed"],
  });
}

export type SeoSettings = {
  pages: Record<string, { title?: string; description?: string }>;
  indexable: boolean;
  sitemap: boolean;
  ogImageUrl: string | null;
};

const DEFAULT_SEO: SeoSettings = { pages: {}, indexable: true, sitemap: true, ogImageUrl: null };

export async function getSeoSettings(): Promise<SeoSettings> {
  "use cache";
  cacheTag(CACHE_TAGS.settings);
  cacheLife("max");

  const db = getDb();
  if (!db) return DEFAULT_SEO;
  const row = await db.siteSettings.findUnique({
    where: { id: 1 },
    select: { seo: true, indexable: true, sitemap: true, ogImageUrl: true },
  });
  if (!row) return DEFAULT_SEO;

  const pages = row.seo && typeof row.seo === "object" && !Array.isArray(row.seo) ? row.seo : {};
  return {
    pages: pages as SeoSettings["pages"],
    indexable: row.indexable,
    sitemap: row.sitemap,
    ogImageUrl: row.ogImageUrl,
  };
}

// The résumé PDF marked active in /admin/resume, linked from the public résumé page.
export async function getActiveResume(): Promise<{ url: string; label: string } | null> {
  "use cache";
  cacheTag(CACHE_TAGS.settings);
  cacheLife("max");

  const db = getDb();
  if (!db) return null;
  return db.resumeVersion.findFirst({
    where: { active: true },
    select: { url: true, label: true },
  });
}
