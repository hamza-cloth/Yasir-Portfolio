import { cacheLife } from "next/cache";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { SiteSettingsData } from "@/lib/content/site-settings";
import { ALL_PAGES } from "@/lib/site-nav";

import { FooterName } from "./FooterName";
import { IstClock } from "./IstClock";
import { Logo } from "./Logo";

type FooterProps = {
  settings: SiteSettingsData;
};

const linkClass =
  "inline-flex min-h-11 min-w-11 items-center gap-2 text-muted transition-colors duration-300 hover:text-fg";

// Cached for a day, so the year rolls over without reading the clock on every render.
async function copyrightYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer({ settings }: FooterProps) {
  const year = await copyrightYear();
  const elsewhere = [
    { label: "LinkedIn", href: settings.linkedinUrl, icon: "linkedin" },
    { label: "GitHub", href: settings.githubUrl, icon: "github" },
  ].filter((link): link is { label: string; href: string; icon: IconName } => Boolean(link.href));

  return (
    <footer className="relative mt-12 overflow-hidden border-t border-line bg-surface-solid pt-16 pb-[max(32px,env(safe-area-inset-bottom))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-c1/50 to-transparent"
      />
      <Container className="flex flex-col gap-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex min-w-0 flex-col items-start gap-4">
            <Logo />
            <p className="max-w-sm text-muted">{settings.roleLine}</p>
            <p className="label-mono flex items-center gap-2.5 text-muted">
              <span aria-hidden="true" className="status-dot" />
              {settings.availability}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-4">
              <Button href="/hire" variant="accent" size="sm">
                Hire me
                <Icon name="arrow-up-right" size={15} />
              </Button>
              <IstClock />
            </div>
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

        <div className="-mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 pr-16 text-sm text-faint">
          <p>
            © {year} {settings.name}. All rights reserved.
          </p>
          <p>Designed &amp; built in {settings.location.split(",").at(-1)?.trim() ?? "India"}.</p>
        </div>
      </Container>
    </footer>
  );
}
