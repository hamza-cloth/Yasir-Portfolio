import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Magnetic } from "@/components/ui/Magnetic";
import { cssVars } from "@/lib/css-vars";
import type { ProfilePhoto } from "@/lib/profile-photo";

import { ChangeLookButton } from "./ChangeLookButton";
import { HeroArt } from "./HeroArt";
import { HeroGlobe } from "./HeroGlobe";
import { HeroHeadline } from "./HeroHeadline";

type HeroProps = {
  name: string;
  roleLine: string;
  photo: ProfilePhoto | null;
  openToWork: boolean;
};

export function Hero({ name, roleLine, photo, openToWork }: HeroProps) {
  const role = roleLine.split(" · ")[0] ?? roleLine;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pt-[calc(var(--header-h)+32px)] pb-16 md:flex md:min-h-svh md:flex-col md:justify-center md:pt-[calc(var(--header-h)+20px)] md:pb-10"
    >
      <HeroArt />
      <Container>
        <div className="grid items-center gap-14 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <div className="intro flex items-center gap-4" style={cssVars({ "--i": 0 })}>
              <Avatar photo={photo} size={88} sizes="88px" preload ring online={openToWork} />
              <div className="flex flex-col gap-1">
                <p className="text-lg font-bold tracking-[-0.02em] text-fg">Hi, I’m {name}</p>
                <p className="flex items-center gap-2 text-sm text-muted">
                  {openToWork ? <span aria-hidden="true" className="status-dot" /> : null}
                  {openToWork ? `Open to work · ${role}` : role}
                </p>
              </div>
            </div>

            <HeroHeadline />

            <p
              className="intro max-w-lg text-lg leading-relaxed text-muted sm:text-[1.2rem]"
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

            <div className="intro" style={cssVars({ "--i": 4 })}>
              <ChangeLookButton />
            </div>
          </div>

          <div className="intro-side min-w-0 px-6 sm:px-10 md:px-0" style={cssVars({ "--i": 2 })}>
            <HeroGlobe className="max-w-[min(600px,72svh)]" />
          </div>
        </div>
      </Container>
    </section>
  );
}
