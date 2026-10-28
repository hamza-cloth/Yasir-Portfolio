import { Aurora } from "@/components/canvas/Aurora";
import { GridSpotlight } from "@/components/canvas/GridSpotlight";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { Highlight } from "@/components/ui/Highlight";
import { Icon } from "@/components/ui/Icon";
import { Magnetic } from "@/components/ui/Magnetic";

import { DecodingName } from "./DecodingName";
import { RoleTyper } from "./RoleTyper";
import { StatusPanel, type StatusRow } from "./StatusPanel";

const ROLES = [
  "Software & Network Engineer",
  "Technical Support Engineer",
  "CCNA-trained Network Engineer",
  "Full-Stack Developer",
] as const;

export type HeroStat = {
  value: number | string;
  label: string;
};

type HeroProps = {
  name: string;
  location: string;
  statusRows: StatusRow[];
  stats: HeroStat[];
};

export function Hero({ name, location, statusRows, stats }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pt-[calc(var(--header-h)+56px)] pb-16 md:flex md:min-h-svh md:flex-col md:justify-center md:pb-20"
    >
      <Aurora className="-z-10" />
      <GridSpotlight className="-z-10" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-b from-transparent to-bg"
      />

      <Container className="flex flex-col gap-16">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] md:items-end">
          <div className="flex min-w-0 flex-col items-start gap-7">
            <p className="glass label-mono inline-flex items-center gap-3 rounded-pill py-1.5 pr-4 pl-1.5 text-muted">
              <span className="inline-flex items-center gap-2 rounded-pill bg-ok/12 px-2.5 py-1 text-ok">
                <span aria-hidden="true" className="status-dot" />
                Open to work
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="map-pin" size={13} />
                {location}
              </span>
            </p>
            <DecodingName id="hero-title" name={name} className="hero-name--split" />
            <RoleTyper roles={ROLES} />
            <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
              Technical support for cloud business software and hosting, CCNA-trained on routing and
              switching, and three products in development. I work{" "}
              <Highlight>from the cable to the app</Highlight>.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Magnetic>
                <Button href="/work" variant="primary" size="lg">
                  View selected work
                  <Icon name="arrow-right" />
                </Button>
              </Magnetic>
              <Button href="/contact" variant="line" size="lg">
                Get in touch
              </Button>
            </div>
          </div>
          <StatusPanel rows={statusRows} />
        </div>

        {stats.length > 0 ? (
          <dl className="grid grid-cols-2 border-t border-line md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={
                  "flex flex-col gap-1.5 border-line pt-6 pr-4 " +
                  (index % 2 === 1 ? "pl-6 max-md:border-l " : "") +
                  (index > 0 ? "md:border-l md:pl-6 " : "") +
                  (index > 1 ? "max-md:mt-6 max-md:border-t" : "")
                }
              >
                <dd className="order-1 font-display text-[clamp(1.9rem,3.4vw,2.75rem)] leading-none font-medium tracking-[-0.04em] text-fg">
                  {typeof stat.value === "number" ? <CountUp value={stat.value} /> : stat.value}
                </dd>
                <dt className="order-2 text-sm text-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}
      </Container>
    </section>
  );
}
