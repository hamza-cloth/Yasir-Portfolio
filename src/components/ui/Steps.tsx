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
// On wide screens a rail links the number badges and fills in as the steps come into view.
export function Steps({ id, eyebrow, title, steps }: StepsProps) {
  return (
    <section aria-labelledby={id} className="section-y">
      <Container className="flex flex-col gap-10">
        <SectionHead eyebrow={eyebrow} titleId={id} title={title} />
        <div className="relative">
          <Reveal className="steps-rail absolute top-[46px] right-[12%] left-[12%] hidden md:block">
            <span aria-hidden="true" className="steps-rail-fill" />
          </Reveal>
          <ol className="relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-4">
            {steps.map((step, index) => (
              <li key={step.title} className="relative min-w-0">
                <Reveal delay={index * 90} className="h-full">
                  <div className="step-card spotlight tilt-3d surface group relative isolate flex h-full flex-col gap-4 overflow-hidden rounded-tile border border-line p-6 transition-[border-color] duration-500 ease-entrance hover:border-line-hover">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        aria-hidden="true"
                        className="step-badge btn-accent grid size-11 place-items-center rounded-full font-display text-lg shadow-[0_8px_20px_-8px_var(--fill-1)]"
                      >
                        {index + 1}
                      </span>
                      <span aria-hidden="true" className="label-mono text-faint">
                        Step {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-xl leading-tight tracking-[-0.03em]">{step.title}</h3>
                    <p className="text-muted">{step.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
