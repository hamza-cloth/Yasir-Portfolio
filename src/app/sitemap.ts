import type { MetadataRoute } from "next";

import { getNoteSlugs } from "@/lib/data/notes";
import { getProjectSlugs } from "@/lib/data/projects";
import { getSeoSettings } from "@/lib/data/settings";
import { SEO_PAGES } from "@/lib/seo-pages";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seo, projects, notes] = await Promise.all([
    getSeoSettings(),
    getProjectSlugs(),
    getNoteSlugs(),
  ]);
  if (!seo.sitemap || !seo.indexable) return [];

  return [
    ...SEO_PAGES.map((page) => ({ url: `${SITE_URL}${page.path === "/" ? "" : page.path}` })),
    ...projects.map((slug) => ({ url: `${SITE_URL}/work/${slug}` })),
    ...notes.map((slug) => ({ url: `${SITE_URL}/notes/${slug}` })),
  ];
}
