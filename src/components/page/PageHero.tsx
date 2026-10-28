import type { ReactNode } from "react";

import { Aurora } from "@/components/canvas/Aurora";
import { FibreCanvas } from "@/components/canvas/FibreCanvas";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

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
      className="relative isolate overflow-hidden pt-[calc(var(--header-h)+56px)] pb-16"
    >
      <Aurora className="-z-10" />
      <FibreCanvas className="-z-10 opacity-60" lineCount={7} />
      <Container className="flex flex-col items-start gap-6">
        {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 id="page-title" className="max-w-5xl text-h1 leading-[0.98]">
          {title}
        </h1>
        {lead ? <p className="max-w-2xl text-lg text-muted sm:text-xl">{lead}</p> : null}
        {children}
      </Container>
    </section>
  );
}
