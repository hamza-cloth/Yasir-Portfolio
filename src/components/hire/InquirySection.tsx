import { Suspense } from "react";

import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/SectionHead";
import { RESPONSE_TIME, whatsappUrl } from "@/lib/hire";

import { ProjectInquiryForm } from "./ProjectInquiryForm";

type InquirySectionProps = {
  email: string;
  location: string;
};

const optionClass =
  "flex min-h-14 items-center gap-3 rounded-field border border-line bg-surface-solid px-4 font-semibold text-fg transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-c1";

// The direct ways in on the left, the project form on the right.
export function InquirySection({ email, location }: InquirySectionProps) {
  const whatsapp = whatsappUrl();

  return (
    <section id="inquiry" aria-labelledby="inquiry-title" className="section-y scroll-mt-24">
      <Container className="flex flex-col gap-10">
        <SectionHead
          eyebrow="Start a project"
          titleId="inquiry-title"
          title="Let's talk about it"
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
          <aside
            aria-labelledby="talk-title"
            className="surface flex flex-col gap-5 rounded-tile border border-line p-7"
          >
            <h3 id="talk-title" className="text-xl">
              Prefer to talk directly?
            </h3>
            <div className="flex flex-col gap-3">
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noopener" className={optionClass}>
                  <span className="grid size-9 place-items-center rounded-lg bg-c1 text-c1-ink">
                    <Icon name="whatsapp" />
                  </span>
                  Chat on WhatsApp
                </a>
              ) : null}
              <a href={`mailto:${email}?subject=Project%20Inquiry`} className={optionClass}>
                <span className="grid size-9 place-items-center rounded-lg border border-c1 text-c1-text">
                  <Icon name="mail" />
                </span>
                <span className="min-w-0 [overflow-wrap:anywhere]">{email}</span>
              </a>
            </div>
            <p className="text-muted">I usually reply {RESPONSE_TIME}.</p>
            <p className="flex items-center gap-2 text-sm text-muted">
              <Icon name="map-pin" size={16} />
              {location}
            </p>
          </aside>
          <div className="surface flex flex-col gap-6 rounded-tile border border-line p-[clamp(22px,4vw,40px)]">
            <h3 className="text-2xl">Tell me about your project</h3>
            {/* Its own boundary, so React hydrates the form as a separate, shorter task. */}
            <Suspense fallback={null}>
              <ProjectInquiryForm email={email} />
            </Suspense>
          </div>
        </div>
      </Container>
    </section>
  );
}
