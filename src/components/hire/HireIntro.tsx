import { Suspense } from "react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { VALUE_POINTS, whatsappUrl } from "@/lib/hire";

import { BuildDiagram } from "./BuildDiagram";

type HireIntroProps = {
  // h1 on /hire, h2 inside the home page.
  headingLevel: "h1" | "h2";
  // Where "Start Your Project" goes: the form on this page, or the /hire page.
  projectHref: string;
  email: string;
  id?: string;
  className?: string;
};

// "Work with me": the pitch on the left, the 3D build diagram on the right.
export function HireIntro({
  headingLevel: Heading,
  projectHref,
  email,
  id,
  className,
}: HireIntroProps) {
  const whatsapp = whatsappUrl();

  return (
    <section id={id} aria-labelledby={`${id ?? "hire"}-title`} className={className}>
      <Container className="grid items-center gap-12 laptop:grid-cols-2 laptop:gap-16">
        <Reveal className="reveal-group">
          <div className="stagger flex flex-col items-start gap-6">
            <Eyebrow>Work with me</Eyebrow>
            <Heading id={`${id ?? "hire"}-title`} className="text-h2 leading-[1.05]">
              Need a Website or App? Let&apos;s <span className="text-c1-text">Build It</span>{" "}
              Together.
            </Heading>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              From idea to launch — fast, secure and modern websites, web apps and business
              software, built and supported by me.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {VALUE_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3 text-fg">
                  <span className="grid size-6 flex-none place-items-center rounded-full border border-c1 text-c1-text">
                    <Icon name="check" size={14} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button href={projectHref} variant="accent" size="lg">
                Start Your Project
                <Icon name="arrow-right" />
              </Button>
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener"
                  className="group/button inline-flex min-h-14 items-center justify-center gap-2 rounded-(--r-button) border border-line-2 bg-surface-solid px-7 font-semibold text-fg transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-c1"
                >
                  <Icon name="whatsapp" />
                  Chat on WhatsApp
                </a>
              ) : (
                <a
                  href={`mailto:${email}?subject=Project%20Inquiry`}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-(--r-button) border border-line-2 bg-surface-solid px-7 font-semibold text-fg transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-c1"
                >
                  <Icon name="mail" />
                  Email me
                </a>
              )}
            </div>
          </div>
        </Reveal>
        {/* Its own boundary, so React hydrates it as a separate, shorter task. */}
        <Suspense fallback={null}>
          <BuildDiagram />
        </Suspense>
      </Container>
    </section>
  );
}
