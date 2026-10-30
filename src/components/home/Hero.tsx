import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { Icon } from "@/components/ui/Icon";
import { Magnetic } from "@/components/ui/Magnetic";
import { cssVars } from "@/lib/css-vars";
import type { ProfilePhoto } from "@/lib/profile-photo";

import { HeroArt } from "./HeroArt";
import { HeroGlobe } from "./HeroGlobe";
import { HeroHeadline } from "./HeroHeadline";
import { LookPicker } from "./LookPicker";

export type HeroStat = {
  value: number | string;
  label: string;
};

type HeroProps = {
  name: string;
  roleLine: string;
  photo: ProfilePhoto | null;
  openToWork: boolean;
  stats: HeroStat[];
};

export function Hero({ name, roleLine, photo, openToWork, stats }: HeroProps) {
  const role = roleLine.split(" · ")[0] ?? roleLine;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-clip pt-[calc(var(--header-h)+32px)] pb-14 md:flex md:min-h-svh md:flex-col md:justify-center md:pt-[calc(var(--header-h)+16px)] md:pb-10"
    >
      <HeroArt />
      <Container>
        <div className="grid items-center gap-14 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <div
              className="intro flex items-center gap-3.5 rounded-pill border border-line bg-surface/70 py-1.5 pr-5 pl-1.5 shadow-(--shadow-soft) backdrop-blur-md"
              style={cssVars({ "--i": 0 })}
            >
              <Avatar photo={photo} size={52} sizes="52px" preload ring online={openToWork} />
              <div className="flex flex-col leading-tight">
                <p className="font-bold tracking-[-0.02em] text-fg">Hi, I’m {name}</p>
                <p className="flex items-center gap-2 text-sm text-muted">
                  {openToWork ? <span aria-hidden="true" className="status-dot" /> : null}
                  {openToWork ? `Open to work · ${role}` : role}
                </p>
              </div>
            </div>

            <HeroHeadline />

            <p
              className="intro max-w-lg text-lg leading-relaxed text-muted sm:text-[1.15rem]"
              style={cssVars({ "--i": 2 })}
            >
              A CCNA-trained Software &amp; Network Engineer from India. Technical support for cloud
              business software and hosting, and three products in development.
            </p>

            <div
              className="intro flex flex-wrap items-center gap-3 pt-1"
              style={cssVars({ "--i": 3 })}
            >
              <Magnetic>
                <Button href="/work" variant="accent" size="lg">
                  See my work
                  <Icon name="arrow-right" />
                </Button>
              </Magnetic>
              <Button href="/contact" variant="line" size="lg">
                Get in touch
              </Button>
            </div>

            {stats.length > 0 ? (
              <dl
                className="intro grid w-full max-w-xl grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 sm:grid-cols-4"
                style={cssVars({ "--i": 4 })}
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <dd className="order-1 font-display text-[clamp(1.6rem,2.4vw,2rem)] leading-none text-fg">
                      {typeof stat.value === "number" ? (
                        <CountUp value={stat.value} immediateDelayMs={700} />
                      ) : (
                        stat.value
                      )}
                    </dd>
                    <dt className="order-2 text-sm text-muted">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="intro" style={cssVars({ "--i": 5 })}>
              <LookPicker />
            </div>
          </div>

          <div className="intro-side min-w-0 px-6 sm:px-10 md:px-0" style={cssVars({ "--i": 2 })}>
            <HeroGlobe className="max-w-[min(580px,68svh)]" />
          </div>
        </div>
      </Container>
    </section>
  );
}
