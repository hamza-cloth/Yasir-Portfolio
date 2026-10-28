import { Aurora } from "@/components/canvas/Aurora";
import { GridSpotlight } from "@/components/canvas/GridSpotlight";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { Highlight } from "@/components/ui/Highlight";
import { Icon } from "@/components/ui/Icon";
import { Magnetic } from "@/components/ui/Magnetic";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";

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
      className="relative isolate overflow-hidden pt-[calc(var(--header-h)+40px)] pb-14 md:flex md:min-h-svh md:flex-col md:justify-center md:pt-[calc(var(--header-h)+24px)] md:pb-12"
    >
      <Aurora className="-z-10" />
      <GridSpotlight className="-z-10" />
      <div aria-hidden="true" className="hero-halo -top-[18%] -right-[14%] -z-10" />
      <div
        aria-hidden="true"
        className="orb top-[58%] left-[-8%] -z-10 size-[28rem] bg-c1/10"
        style={cssVars({ "--orb-x": "60px", "--orb-y": "-40px" })}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-b from-transparent to-bg"
      />

      <Container className="flex flex-col gap-10 md:gap-12">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)] md:items-center lg:gap-16">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <p
              className="intro glass label-mono inline-flex items-center gap-3 rounded-pill py-1.5 pr-4 pl-1.5 text-muted"
              style={cssVars({ "--i": 0 })}
            >
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
            <div className="intro" style={cssVars({ "--i": 3 })}>
              <RoleTyper roles={ROLES} />
            </div>
            <p
              className="intro max-w-xl text-lg leading-relaxed text-muted sm:text-[1.2rem]"
              style={cssVars({ "--i": 4 })}
            >
              Technical support for cloud business software and hosting, CCNA-trained on routing and
              switching, and three products in development. I work{" "}
              <Highlight>from the cable to the app</Highlight>.
            </p>
            <div className="intro flex flex-wrap gap-3 pt-1" style={cssVars({ "--i": 5 })}>
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
          <div className="intro-side min-w-0" style={cssVars({ "--i": 3 })}>
            <StatusPanel rows={statusRows} />
          </div>
        </div>

        {stats.length > 0 ? (
          <dl
            className="intro grid grid-cols-2 border-t border-line md:grid-cols-4"
            style={cssVars({ "--i": 7 })}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "group flex flex-col gap-1.5 border-line pt-5 pr-4",
                  index % 2 === 1 && "pl-6 max-md:border-l",
                  index > 0 && "md:border-l md:pl-6",
                  index > 1 && "max-md:mt-5 max-md:border-t",
                )}
              >
                <dd className="order-1 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] leading-none font-medium tracking-[-0.04em] text-fg transition-colors duration-500 group-hover:text-c1-text">
                  {typeof stat.value === "number" ? (
                    <CountUp value={stat.value} immediateDelayMs={900} />
                  ) : (
                    stat.value
                  )}
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
