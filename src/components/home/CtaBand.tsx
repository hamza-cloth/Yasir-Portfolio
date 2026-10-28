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
        <div className="glass relative flex flex-col gap-10 overflow-hidden rounded-panel p-[clamp(24px,5vw,64px)] md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <h2 id="cta-title" className="max-w-3xl text-h1 leading-[1.02]">
              Need someone who can <Highlight>fix the network</Highlight> and ship the app?
            </h2>
            <p className="max-w-xl text-lg text-muted">{availability}.</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Magnetic>
                <Button href="/contact" variant="cyan" size="lg">
                  Let’s talk
                  <Icon name="arrow-right" />
                </Button>
              </Magnetic>
              <a
                href={`mailto:${email}`}
                className="inline-flex min-h-14 min-w-0 items-center gap-2 text-lg [overflow-wrap:anywhere] text-fg hover:text-c1-text"
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
