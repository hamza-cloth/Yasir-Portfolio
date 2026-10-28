import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { DEFAULT_SITE_SETTINGS, type SiteSettingsData } from "@/lib/content/site-settings";
import { getDb } from "@/lib/db";
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
  };
}
