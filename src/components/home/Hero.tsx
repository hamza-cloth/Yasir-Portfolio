import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Magnetic } from "@/components/ui/Magnetic";
import { cssVars } from "@/lib/css-vars";

import { HeroGlobe } from "./HeroGlobe";

type HeroProps = {
  name: string;
};

export function Hero({ name }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pt-[calc(var(--header-h)+36px)] pb-16 md:flex md:min-h-svh md:flex-col md:justify-center md:pt-(--header-h) md:pb-10"
    >
      <Container>
        <div className="grid items-center gap-14 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
          <div className="flex min-w-0 flex-col items-start gap-7">
            <p
              className="intro inline-flex items-center gap-2.5 rounded-pill border border-line bg-surface-solid py-2 pr-4 pl-3 text-sm font-semibold text-fg shadow-(--shadow-soft)"
              style={cssVars({ "--i": 0 })}
            >
              <span aria-hidden="true" className="status-dot" />
              Hi, I’m {name}
            </p>

            <h1
              id="hero-title"
              className="intro hero-name hero-name--split max-w-[16ch] text-fg"
              style={cssVars({ "--i": 1 })}
            >
              I keep{" "}
              <span className="relative inline-block whitespace-nowrap text-c1-text">
                networks running
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 18"
                  preserveAspectRatio="none"
                  className="absolute -bottom-[0.14em] left-0 h-[0.26em] w-full overflow-visible"
                >
                  <path
                    d="M3 12 C 60 4, 140 3, 200 7 S 280 11, 297 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="scribble-draw opacity-60"
                    pathLength={1}
                  />
                </svg>
              </span>{" "}
              and build software people rely on.
            </h1>

            <p
              className="intro max-w-lg text-lg leading-relaxed text-muted sm:text-[1.2rem]"
              style={cssVars({ "--i": 2 })}
            >
              A CCNA-trained Software &amp; Network Engineer from India. Technical support for cloud
              business software and hosting, and three products in development.
            </p>

            <div className="intro flex flex-wrap gap-3 pt-1" style={cssVars({ "--i": 3 })}>
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
          </div>

          <div className="intro-side min-w-0 px-6 sm:px-10 md:px-0" style={cssVars({ "--i": 2 })}>
            <HeroGlobe className="max-w-[min(600px,72svh)]" />
          </div>
        </div>
      </Container>
    </section>
  );
}
