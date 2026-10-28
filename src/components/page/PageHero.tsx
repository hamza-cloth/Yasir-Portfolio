import type { ReactNode } from "react";

import { Aurora } from "@/components/canvas/Aurora";
import { GridSpotlight } from "@/components/canvas/GridSpotlight";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cssVars } from "@/lib/css-vars";

import { Breadcrumb, type Crumb } from "./Breadcrumb";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  breadcrumb?: Crumb[];
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, lead, breadcrumb, children }: PageHeroProps) {
  return (
    <section
      aria-labelledby="page-title"
      className="relative isolate overflow-hidden pt-[calc(var(--header-h)+64px)] pb-16 md:pb-20"
    >
      <Aurora className="-z-10" />
      <GridSpotlight className="-z-10" />
      <div aria-hidden="true" className="hero-halo -top-[30%] -right-[18%] -z-10 opacity-80" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-b from-transparent to-bg"
      />
      <Container className="flex flex-col items-start gap-6">
        {breadcrumb ? (
          <div className="intro" style={cssVars({ "--i": 0 })}>
            <Breadcrumb items={breadcrumb} />
          </div>
        ) : null}
        <div className="intro" style={cssVars({ "--i": 0 })}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h1
          id="page-title"
          className="intro max-w-5xl text-h1 leading-[0.98] tracking-[-0.045em]"
          style={cssVars({ "--i": 1 })}
        >
          {title}
        </h1>
        {lead ? (
          <p
            className="intro max-w-2xl text-lg leading-relaxed text-muted sm:text-xl"
            style={cssVars({ "--i": 2 })}
          >
            {lead}
          </p>
        ) : null}
        {children ? (
          <div className="intro w-full" style={cssVars({ "--i": 3 })}>
            {children}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
