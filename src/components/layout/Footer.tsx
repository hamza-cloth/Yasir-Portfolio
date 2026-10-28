import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { SiteSettingsData } from "@/lib/content/site-settings";
import { ALL_PAGES } from "@/lib/site-nav";

import { FooterName } from "./FooterName";
import { IstClock } from "./IstClock";

type FooterProps = {
  settings: SiteSettingsData;
};

const linkClass =
  "inline-flex min-h-10 items-center gap-2 text-muted transition-colors duration-300 hover:text-fg";

export function Footer({ settings }: FooterProps) {
  const elsewhere = [
    { label: "LinkedIn", href: settings.linkedinUrl, icon: "linkedin" },
    { label: "GitHub", href: settings.githubUrl, icon: "github" },
  ].filter((link): link is { label: string; href: string; icon: IconName } => Boolean(link.href));

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-bg-2 pt-20 pb-[max(32px,env(safe-area-inset-bottom))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-c1/50 to-transparent"
      />
      <Container className="flex flex-col gap-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col gap-5">
            <p className="label-mono flex items-center gap-2.5 text-muted">
              <span aria-hidden="true" className="status-dot" />
              {settings.availability}
            </p>
            <h2 className="max-w-3xl text-[clamp(2.2rem,5.4vw,4.5rem)] leading-[1] tracking-[-0.045em]">
              Let’s build something <Highlight>reliable</Highlight>.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact" variant="primary" size="lg">
              Start a project
              <Icon name="arrow-right" />
            </Button>
            <Button href={`mailto:${settings.email}`} variant="line" size="lg">
              <Icon name="mail" size={17} />
              Email me
            </Button>
          </div>
        </div>

        <div className="grid gap-12 border-t border-line pt-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex min-w-0 flex-col items-start gap-4">
            <p className="text-lg font-semibold tracking-[-0.02em] text-fg">{settings.name}</p>
            <p className="max-w-sm text-muted">{settings.roleLine}</p>
            <IstClock className="mt-2" />
          </div>

          <nav aria-labelledby="footer-pages" className="min-w-0">
            <h2 id="footer-pages" className="label-mono mb-3 text-faint">
              Pages
            </h2>
            <ul className="grid grid-cols-2 gap-x-6">
              {ALL_PAGES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-col">
            <h2 className="label-mono mb-3 text-faint">Elsewhere</h2>
            <a
              href={`mailto:${settings.email}`}
              className={`${linkClass} [overflow-wrap:anywhere]`}
            >
              <Icon name="mail" size={16} className="flex-none" />
              {settings.email}
            </a>
            {elsewhere.map((link) => (
              <a key={link.label} href={link.href} rel="me noopener" className={linkClass}>
                <Icon name={link.icon} size={16} />
                {link.label}
              </a>
            ))}
            <p className={linkClass}>
              <Icon name="map-pin" size={16} />
              {settings.location}
            </p>
          </div>
        </div>

        <FooterName name={settings.name} />

        <div className="-mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-faint">
          <p>© {settings.name}. All rights reserved.</p>
          <p>Designed &amp; built in {settings.location.split(",").at(-1)?.trim() ?? "India"}.</p>
        </div>
      </Container>
    </footer>
  );
}
