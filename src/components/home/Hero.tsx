import { Aurora } from "@/components/canvas/Aurora";
import { FibreCanvas } from "@/components/canvas/FibreCanvas";
import { GridSpotlight } from "@/components/canvas/GridSpotlight";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Icon } from "@/components/ui/Icon";
import { Magnetic } from "@/components/ui/Magnetic";

import { DecodingName } from "./DecodingName";
import { LabLogTicker } from "./LabLogTicker";
import { RoleTyper } from "./RoleTyper";
import { StatusPanel, type StatusRow } from "./StatusPanel";

const ROLES = [
  "Software & Network Engineer",
  "Technical Support Engineer",
  "CCNA-trained Network Engineer",
  "Full-Stack Developer",
] as const;

type HeroProps = {
  name: string;
  statusRows: StatusRow[];
};

export function Hero({ name, statusRows }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pt-[calc(var(--header-h)+48px)] pb-12 md:flex md:min-h-svh md:flex-col md:justify-center"
    >
      <Aurora className="-z-10" />
      <GridSpotlight className="-z-10" />
      <FibreCanvas className="-z-10" />

      <Container className="flex flex-col gap-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] md:items-center">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <p className="glass label-mono inline-flex items-center gap-2.5 rounded-pill px-3.5 py-2 text-fg">
              <span aria-hidden="true" className="status-dot" />
              Open to work
            </p>
            <DecodingName id="hero-title" name={name} className="hero-name--split" />
            <RoleTyper roles={ROLES} />
            <p className="max-w-xl text-lg text-muted sm:text-xl">
              <Highlight>Technical support</Highlight> for cloud business software and hosting,
              CCNA-trained on routing and switching, and three products in development. I work{" "}
              <Highlight>from the cable to the app</Highlight>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Magnetic>
                <Button href="/work" variant="cyan" size="lg">
                  See the work
                  <Icon name="arrow-right" />
                </Button>
              </Magnetic>
              <Button href="/contact" variant="line" size="lg">
                Let’s talk
              </Button>
            </div>
          </div>
          <StatusPanel rows={statusRows} />
        </div>
        <LabLogTicker />
      </Container>
    </section>
  );
}
