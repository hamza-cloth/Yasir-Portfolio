import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";
import type { SiteSettingsData } from "@/lib/content/site-settings";
import { ALL_PAGES } from "@/lib/site-nav";

import { FooterName } from "./FooterName";
import { IstClock } from "./IstClock";

type FooterProps = {
  settings: SiteSettingsData;
};

const linkClass = "inline-flex min-h-11 items-center text-muted hover:text-fg";

export function Footer({ settings }: FooterProps) {
  const elsewhere = [
    { label: "LinkedIn", href: settings.linkedinUrl },
    { label: "GitHub", href: settings.githubUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <footer className="relative mt-24 border-t border-line bg-bg-2 pt-16 pb-[max(32px,env(safe-area-inset-bottom))]">
      <Container className="flex flex-col gap-14">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex min-w-0 flex-col items-start gap-5">
            <Eyebrow>Status</Eyebrow>
            <p className="max-w-md text-lg text-fg">{settings.availability}</p>
            <Button href="/contact" variant="cyan">
              Let’s talk
            </Button>
          </div>

          <nav aria-labelledby="footer-pages" className="min-w-0">
            <h2 id="footer-pages" className="label-mono mb-3 text-muted">
              Pages
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 md:grid-cols-1">
              {ALL_PAGES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-col gap-3">
            <h2 className="label-mono mb-1 text-muted">Elsewhere</h2>
            <a
              href={`mailto:${settings.email}`}
              className={cn(linkClass, "[overflow-wrap:anywhere]")}
            >
              {settings.email}
            </a>
            {elsewhere.map((link) => (
              <a key={link.label} href={link.href} rel="me noopener" className={linkClass}>
                {link.label}
              </a>
            ))}
            <IstClock className="mt-3" />
          </div>
        </div>

        <FooterName name={settings.name} />

        <div className="label-mono flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-muted">
          <p>© {settings.name}</p>
          <p>{settings.location}</p>
        </div>
      </Container>
    </footer>
  );
}
