import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import {
  parseSiteConfig,
  SITE_CONFIG,
  type SiteConfigKey,
  type SiteConfigValue,
} from "@/lib/site-config";

// One cached read per key; saving in the admin refreshes the tag.
export async function getSiteConfig<K extends SiteConfigKey>(key: K): Promise<SiteConfigValue<K>> {
  "use cache";
  cacheTag(CACHE_TAGS.config);
  cacheLife("max");

  const db = getDb();
  if (!db) return SITE_CONFIG[key].defaults as SiteConfigValue<K>;
  try {
    const row = await db.setting.findUnique({ where: { key } });
    return row
      ? parseSiteConfig(key, row.value)
      : (SITE_CONFIG[key].defaults as SiteConfigValue<K>);
  } catch {
    return SITE_CONFIG[key].defaults as SiteConfigValue<K>;
  }
}
