import type { Metadata } from "next";

import { getSeoSettings } from "@/lib/data/settings";
import { OG_IMAGE, SITE_TITLE } from "@/lib/site";

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

  // A page's openGraph replaces the layout's, so the share image is set here every time: the
  // one uploaded in the admin, or the brand card.
  const image = seo.ogImageUrl ? { url: seo.ogImageUrl } : OG_IMAGE;
  // Shared links read like the tab: "Page — Yasir Abdullah | Software & Network Engineer".
  const shareTitle = finalTitle === SITE_TITLE ? finalTitle : `${finalTitle} — ${SITE_TITLE}`;

  return {
    title: finalTitle,
    description: finalDescription,
    alternates: { canonical: path },
    robots: seo.indexable ? undefined : { index: false, follow: false },
    openGraph: {
      title: shareTitle,
      description: finalDescription,
      url: path,
      type: "website",
      siteName: "Yasir Abdullah",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: finalDescription,
      images: [image.url],
    },
  };
}
