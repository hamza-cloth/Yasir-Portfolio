import { Suspense } from "react";

import { FaqAccordion } from "@/components/hire/FaqAccordion";
import { HireIntro } from "@/components/hire/HireIntro";
import { InquirySection } from "@/components/hire/InquirySection";
import { ProcessTimeline } from "@/components/hire/ProcessTimeline";
import { ServicesGrid } from "@/components/hire/ServicesGrid";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { getSiteSettings } from "@/lib/data/settings";
import { HIRE_FAQ, HIRE_SERVICES } from "@/lib/hire";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const TITLE = "Hire Me — Website & App Development | Yasir Abdullah";
const DESCRIPTION =
  "Hire Yasir Abdullah to build your website, web app or online store: custom design, mobile-first, secure hosting and support after launch. Tell me about your project.";

export async function generateMetadata() {
  const metadata = await pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/hire" });
  // The full title already names the site, so neither the layout's template nor the share
  // suffix is added again.
  return {
    ...metadata,
    title: { absolute: String(metadata.title) },
    openGraph: { ...metadata.openGraph, title: String(metadata.title) },
    twitter: { ...metadata.twitter, title: String(metadata.title) },
  };
}

// FAQ answers that are still placeholders show (marked) in development and are hidden in production.
const faq =
  process.env.NODE_ENV === "production" ? HIRE_FAQ.filter((item) => item.answer) : HIRE_FAQ;

export default async function HirePage() {
  const settings = await getSiteSettings();
  const sameAs = [settings.linkedinUrl, settings.githubUrl].filter(Boolean);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: settings.name,
      jobTitle: "Software & Network Engineer",
      url: SITE_URL,
      email: `mailto:${settings.email}`,
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: `${settings.name} — Website & App Development`,
      url: `${SITE_URL}/hire`,
      areaServed: "IN",
      address: { "@type": "PostalAddress", addressLocality: settings.location },
      provider: { "@type": "Person", name: settings.name },
      makesOffer: HIRE_SERVICES.map((service) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: service.title, description: service.description },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD must be raw JSON in the page; "<" is escaped so the content cannot end the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <HireIntro
        id="hire"
        headingLevel="h1"
        projectHref="#inquiry"
        email={settings.email}
        className="pt-[calc(var(--header-h)+48px)] pb-(--section-y)"
      />
      <ServicesGrid />
      <ProcessTimeline />
      <InquirySection email={settings.email} location={settings.location} />
      {faq.length > 0 ? (
        <section aria-labelledby="faq-title" className="section-y">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <SectionHead eyebrow="FAQ" titleId="faq-title" title="Questions, answered" />
            <Suspense fallback={null}>
              <FaqAccordion items={faq} />
            </Suspense>
          </Container>
        </section>
      ) : null}
    </>
  );
}
