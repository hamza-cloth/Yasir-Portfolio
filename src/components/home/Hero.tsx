import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Magnetic } from "@/components/ui/Magnetic";
import { cssVars } from "@/lib/css-vars";
import type { ProfilePhoto } from "@/lib/profile-photo";

import { HeroArt } from "./HeroArt";
import { HeroHeadline } from "./HeroHeadline";
import { HeroPortrait, type PortraitBadge } from "./HeroPortrait";
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
  email: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  badges: PortraitBadge[];
};

export function Hero({
  name,
  roleLine,
  photo,
  openToWork,
  stats,
  email,
  linkedinUrl,
  githubUrl,
  badges,
}: HeroProps) {
  const role = roleLine.split(" · ")[0] ?? roleLine;
  // The surname carries the gold.
  const parts = name.trim().split(/\s+/);
  const lastName = parts.length > 1 ? parts.pop() : undefined;
  const firstNames = parts.join(" ");

  const socials = [
    { label: "LinkedIn", href: linkedinUrl, icon: "linkedin" },
    { label: "GitHub", href: githubUrl, icon: "github" },
    { label: "Email", href: `mailto:${email}`, icon: "mail" },
  ].filter((link): link is { label: string; href: string; icon: IconName } => Boolean(link.href));

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-clip pt-[calc(var(--header-h)+40px)] pb-16 laptop:flex laptop:min-h-[88svh] laptop:flex-col laptop:justify-center laptop:pt-[calc(var(--header-h)+24px)] laptop:pb-14"
    >
      <HeroArt />
      <Container>
        {/* Two text blocks: the pitch (eyebrow to CTAs) and the extras (links, stats, look).
            The photo shares a row with the pitch only, so it centres on the name, not on the
            whole column. */}
        <div className="grid gap-x-12 gap-y-8 laptop:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] laptop:grid-rows-[auto_auto]">
          <div className="flex min-w-0 flex-col items-center gap-6 text-center laptop:col-start-1 laptop:row-start-1 laptop:items-start laptop:text-left">
            <div className="intro" style={cssVars({ "--i": 0 })}>
              <Eyebrow>Hello, I’m</Eyebrow>
            </div>

            <div className="flex flex-col items-center gap-3 laptop:items-start">
              <h1
                id="hero-title"
                className="intro-lcp hero-name hero-name--split text-fg"
                style={cssVars({ "--i": 1 })}
              >
                {firstNames} {lastName ? <span className="text-c1-text">{lastName}</span> : null}
              </h1>
              <p
                className="intro flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium text-fg laptop:justify-start"
                style={cssVars({ "--i": 2 })}
              >
                {role}
                {openToWork ? (
                  <span className="label-mono inline-flex items-center gap-2 text-muted">
                    <span aria-hidden="true" className="status-dot" />
                    Open to work
                  </span>
                ) : null}
              </p>
            </div>

            <HeroHeadline />

            <p
              className="intro max-w-lg text-lg leading-relaxed text-muted"
              style={cssVars({ "--i": 4 })}
            >
              A CCNA-trained Software &amp; Network Engineer from India. Technical support for cloud
              business software and hosting, and three products in development.
            </p>

            <div
              className="intro flex flex-wrap items-center justify-center gap-3 pt-1 laptop:justify-start"
              style={cssVars({ "--i": 5 })}
            >
              <Magnetic>
                <Button href="/work" variant="accent" size="lg">
                  See my work
                  <Icon name="arrow-right" />
                </Button>
              </Magnetic>
              <Button href="#hire" variant="line" size="lg">
                Start a Project
              </Button>
            </div>
          </div>

          <div className="flex min-w-0 flex-col items-center gap-6 text-center laptop:col-start-1 laptop:row-start-2 laptop:items-start laptop:text-left">
            {socials.length > 0 ? (
              <ul
                className="intro flex items-center gap-2"
                aria-label="Elsewhere"
                style={cssVars({ "--i": 6 })}
              >
                {socials.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      rel={link.icon === "mail" ? undefined : "me noopener"}
                      aria-label={link.label}
                      className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors duration-200 hover:border-c1 hover:text-c1-text"
                    >
                      <Icon name={link.icon} size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            {stats.length > 0 ? (
              <dl
                className="intro grid w-full max-w-xl grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 text-left sm:grid-cols-4"
                style={cssVars({ "--i": 7 })}
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <dd className="order-1 font-display text-[clamp(1.6rem,2.4vw,2rem)] leading-none font-semibold text-fg">
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

            <div className="intro" style={cssVars({ "--i": 8 })}>
              <LookPicker />
            </div>
          </div>

          <div className="self-center max-laptop:order-first max-laptop:py-6 laptop:col-start-2 laptop:row-start-1">
            <HeroPortrait photo={photo} name={name} badges={badges} />
          </div>
        </div>
      </Container>
    </section>
  );
}
