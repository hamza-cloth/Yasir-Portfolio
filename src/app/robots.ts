import type { MetadataRoute } from "next";

import { getSeoSettings } from "@/lib/data/settings";
import { SITE_URL } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings();
  return {
    rules: seo.indexable
      ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }
      : { userAgent: "*", disallow: "/" },
    ...(seo.sitemap ? { sitemap: `${SITE_URL}/sitemap.xml` } : {}),
  };
}
