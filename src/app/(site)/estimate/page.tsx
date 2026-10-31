import { Suspense } from "react";

import { EstimateHero } from "@/components/estimate/EstimateHero";
import { EstimateWizard } from "@/components/estimate/EstimateWizard";
import { Container } from "@/components/ui/Container";
import { getPriceTable } from "@/lib/data/pricing";
import { getSiteSettings } from "@/lib/data/settings";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const TITLE = "Project Cost Calculator — Yasir Abdullah";
const DESCRIPTION =
  "Plan your website, app or software in six steps and get a full-stack project report: cost by module, tech stack, timeline and payment plan, with 6 months of free support.";

export async function generateMetadata() {
  const metadata = await pageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/estimate",
  });
  // The full title already names the site, so neither the template nor the share suffix repeats it.
  return {
    ...metadata,
    title: { absolute: String(metadata.title) },
    openGraph: { ...metadata.openGraph, title: String(metadata.title) },
    twitter: { ...metadata.twitter, title: String(metadata.title) },
  };
}

export default async function EstimatePage() {
  const [settings, prices] = await Promise.all([getSiteSettings(), getPriceTable()]);

  return (
    <section
      aria-labelledby="estimate-title"
      className="pt-[calc(var(--header-h)+40px)] pb-32 lg:pb-(--section-y)"
    >
      <Container className="flex flex-col gap-12 lg:gap-14">
        <EstimateHero cap={prices.cap} />
        {/* Its own boundary, so React hydrates the calculator as a separate task. */}
        <Suspense fallback={null}>
          <EstimateWizard
            email={settings.email}
            location={settings.location}
            site={SITE_URL.replace(/^https?:\/\//, "")}
            prices={prices}
          />
        </Suspense>
      </Container>
    </section>
  );
}
