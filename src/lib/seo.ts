import type { Metadata } from "next";

import { getSeoSettings } from "@/lib/data/settings";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

// Page metadata with the admin's overrides from SEO & settings applied on top of the defaults.
export async function pageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Promise<Metadata> {
  const seo = await getSeoSettings();
  const override = seo.pages[path];
  const finalTitle = override?.title || title;
  const finalDescription = override?.description || description;

  return {
    title: finalTitle,
    description: finalDescription,
    alternates: { canonical: path },
    robots: seo.indexable ? undefined : { index: false, follow: false },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: path,
      type: "website",
      ...(seo.ogImageUrl ? { images: [{ url: seo.ogImageUrl }] } : {}),
    },
  };
}
