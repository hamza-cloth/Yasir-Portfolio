import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Icon } from "@/components/ui/Icon";
import { Magnetic } from "@/components/ui/Magnetic";

import { OpenToWorkBadge } from "./OpenToWorkBadge";

type CtaBandProps = {
  email: string;
  availability: string;
};

export function CtaBand({ email, availability }: CtaBandProps) {
  return (
    <section aria-labelledby="cta-title" className="py-24">
      <Container>
        <div className="surface relative isolate flex flex-col gap-10 overflow-hidden rounded-panel border border-line-2 p-[clamp(28px,5.5vw,72px)] shadow-(--shadow-lift) md:flex-row md:items-center md:justify-between">
          <div
            aria-hidden="true"
            className="absolute -top-1/2 left-1/2 -z-10 h-[140%] w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)] terminal:hidden"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top,#000,transparent_70%)] bg-size-[48px_48px]"
          />
          <div className="flex min-w-0 flex-col items-start gap-6">
            <h2
              id="cta-title"
              className="max-w-3xl text-[clamp(2.3rem,5.6vw,4.75rem)] leading-[1] tracking-[-0.045em]"
            >
              Need someone who can <Highlight>fix the network</Highlight> and ship the app?
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted">{availability}.</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Magnetic>
                <Button href="/contact" variant="primary" size="lg">
                  Let’s talk
                  <Icon name="arrow-right" />
                </Button>
              </Magnetic>
              <a
                href={`mailto:${email}`}
                className="inline-flex min-h-13 min-w-0 items-center gap-2 text-lg [overflow-wrap:anywhere] text-muted transition-colors hover:text-fg"
              >
                <Icon name="mail" />
                {email}
              </a>
            </div>
          </div>
          <OpenToWorkBadge />
        </div>
      </Container>
    </section>
  );
}
