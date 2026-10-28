import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

export type Step = {
  title: string;
  body: string;
};

type StepsProps = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  steps: Step[];
};

// A numbered 4-step process: 4 columns from 960px, 2 from 720px, then 1.
// A dashed line links the number badges on wide screens.
export function Steps({ id, eyebrow, title, steps }: StepsProps) {
  return (
    <section aria-labelledby={id} className="py-20 md:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHead eyebrow={eyebrow} titleId={id} title={title} />
        <ol className="relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-4">
          <span
            aria-hidden="true"
            className="absolute top-[46px] right-[12%] left-[12%] hidden border-t-2 border-dashed border-c1/25 md:block"
          />
          {steps.map((step, index) => (
            <li key={step.title} className="relative min-w-0">
              <Reveal delay={index * 90} className="h-full">
                <div className="surface flex h-full flex-col gap-4 rounded-tile border border-line p-6 transition-transform duration-500 ease-entrance hover:-translate-y-1">
                  <span
                    aria-hidden="true"
                    className="grid size-11 place-items-center rounded-full bg-c1 font-display text-lg text-c1-ink shadow-[0_8px_20px_-8px_var(--c1)]"
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-xl leading-tight tracking-[-0.03em]">{step.title}</h3>
                  <p className="text-muted">{step.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
