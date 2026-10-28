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
  title: string;
  steps: Step[];
};

// A numbered 4-step process: 4 columns from 960px, 2 from 720px, then 1.
export function Steps({ id, eyebrow, title, steps }: StepsProps) {
  return (
    <section aria-labelledby={id} className="py-24">
      <Container className="flex flex-col gap-12">
        <SectionHead eyebrow={eyebrow} titleId={id} title={title} />
        <ol className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="min-w-0">
              <Reveal delay={index * 80} className="h-full">
                <div className="flex h-full flex-col gap-4 rounded-card border border-line bg-surface-solid p-6">
                  <p className="label-mono text-c1-text" aria-hidden="true">
                    Step {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-xl leading-tight">{step.title}</h3>
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
