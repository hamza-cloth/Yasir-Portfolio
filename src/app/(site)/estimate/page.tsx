import { Suspense } from "react";

import { EstimateWizard } from "@/components/estimate/EstimateWizard";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PRICING } from "@/config/pricing";
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
      className="pt-[calc(var(--header-h)+48px)] pb-32 lg:pb-(--section-y)"
    >
      <Container className="flex flex-col gap-10">
        <header className="flex max-w-3xl flex-col gap-5 print:hidden">
          <Eyebrow>Project cost calculator</Eyebrow>
          <h1 id="estimate-title" className="text-h1 leading-[1.02]">
            Plan your project, then see the real cost
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            Tell me what you need in six quick steps. Then the planner analyses your requirements
            and builds a full-stack report: cost by module, tech stack, timeline and payment plan —
            with {PRICING.supportMonths} months of support free.
          </p>
        </header>
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
