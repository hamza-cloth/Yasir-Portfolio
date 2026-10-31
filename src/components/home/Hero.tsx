import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
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
  location: string;
  photo: ProfilePhoto | null;
  openToWork: boolean;
  stats: HeroStat[];
  email: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  badges: PortraitBadge[];
  globeOpacity: number | null;
};

// One icon per stat, in the order the home page passes them.
const STAT_ICONS: IconName[] = ["phone", "sparkle", "list", "shield"];

export function Hero({
  name,
  roleLine,
  location,
  photo,
  openToWork,
  stats,
  email,
  linkedinUrl,
  githubUrl,
  badges,
  globeOpacity,
}: HeroProps) {
  const role = roleLine.split(" · ")[0] ?? roleLine;
  // The surname carries the accent.
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
      className="hero spotlight relative isolate overflow-clip pt-[calc(var(--header-h)+36px)] pb-14 laptop:flex laptop:min-h-[92svh] laptop:flex-col laptop:justify-center laptop:pt-[calc(var(--header-h)+28px)] laptop:pb-12"
    >
      <HeroArt />
      <Container className="flex flex-col gap-12 laptop:gap-14">
        <div className="grid items-center gap-x-14 gap-y-12 laptop:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="flex min-w-0 flex-col items-center gap-6 text-center laptop:items-start laptop:text-left">
            <p className="intro hero-pill" style={cssVars({ "--i": 0 })}>
              {openToWork ? <span aria-hidden="true" className="status-dot" /> : null}
              <span>{openToWork ? "Available for new projects" : "Hello, I’m"}</span>
              <span aria-hidden="true" className="hero-pill-sep" />
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Icon name="map-pin" size={13} />
                {location}
              </span>
            </p>

            <div className="flex flex-col items-center gap-4 laptop:items-start">
              <h1
                id="hero-title"
                className="intro-lcp hero-name hero-name--split text-fg"
                style={cssVars({ "--i": 1 })}
              >
                {firstNames} {lastName ? <span className="hero-surname">{lastName}</span> : null}
              </h1>
              <p
                className="intro hero-role flex flex-wrap items-center justify-center gap-x-3 gap-y-1 laptop:justify-start"
                style={cssVars({ "--i": 2 })}
              >
                <span className="hero-role-line" aria-hidden="true" />
                {role}
              </p>
            </div>

            <HeroHeadline />

            <p
              className="intro max-w-xl text-lg leading-relaxed text-muted"
              style={cssVars({ "--i": 4 })}
            >
              A CCNA-trained Software &amp; Network Engineer from India. Technical support for cloud
              business software and hosting, and three products in development.
            </p>

            <div
              className="intro flex w-full flex-wrap items-center justify-center gap-3 pt-1 max-sm:flex-col max-sm:items-stretch laptop:justify-start"
              style={cssVars({ "--i": 5 })}
            >
              <Magnetic>
                <Button href="/work" variant="accent" size="lg" className="hero-cta max-sm:w-full">
                  See my work
                  <Icon name="arrow-right" />
                </Button>
              </Magnetic>
              <Button
                href="#hire"
                variant="line"
                size="lg"
                className="hero-cta-ghost max-sm:w-full"
              >
                Start a Project
                <Icon name="arrow-up-right" size={16} />
              </Button>
            </div>

            <div
              className="intro flex flex-wrap items-center justify-center gap-x-3 gap-y-4 sm:gap-x-6 laptop:justify-start"
              style={cssVars({ "--i": 6 })}
            >
              {socials.length > 0 ? (
                <ul className="flex items-center gap-2" aria-label="Elsewhere">
                  {socials.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        rel={link.icon === "mail" ? undefined : "me noopener"}
                        aria-label={link.label}
                        className="hero-social"
                      >
                        <Icon name={link.icon} size={18} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              <LookPicker labelClassName="max-sm:hidden" />
            </div>
          </div>

          <div className="min-w-0 self-center">
            <HeroPortrait
              photo={photo}
              name={name}
              location={location}
              openToWork={openToWork}
              badges={badges}
              globeOpacity={globeOpacity}
            />
          </div>
        </div>

        {stats.length > 0 ? (
          <dl className="intro hero-stats" style={cssVars({ "--i": 7 })}>
            {stats.map((stat, index) => (
              <div key={stat.label} className="hero-stat">
                <span aria-hidden="true" className="hero-stat-icon">
                  <Icon name={STAT_ICONS[index] ?? "sparkle"} size={18} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <dd className="order-1 font-display text-[clamp(1.5rem,2.3vw,2rem)] leading-none font-semibold text-fg">
                    {typeof stat.value === "number" ? (
                      <CountUp value={stat.value} immediateDelayMs={700} />
                    ) : (
                      stat.value
                    )}
                  </dd>
                  <dt className="order-2 mt-1.5 text-sm text-muted">{stat.label}</dt>
                </div>
              </div>
            ))}
          </dl>
        ) : null}
      </Container>
    </section>
  );
}
