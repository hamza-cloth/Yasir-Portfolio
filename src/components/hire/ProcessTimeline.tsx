import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { HIRE_STEPS, TECH_I_USE } from "@/lib/hire";

// Four steps on a connector that draws itself in gold as it scrolls into view (left to right on
// desktop, top to bottom on phones), then the tools behind them.
export function ProcessTimeline() {
  return (
    <section aria-labelledby="hire-process-title" className="section-y">
      <Container className="flex flex-col gap-12">
        <SectionHead
          eyebrow="Process"
          titleId="hire-process-title"
          title="How We'll Work Together"
        />
        <Reveal className="reveal-group">
          <ol className="hire-steps stagger">
            {HIRE_STEPS.map((step, index) => (
              <li key={step.title} className="hire-step">
                <span aria-hidden="true" className="hire-step-dot" />
                <span className="font-mono text-3xl font-medium text-c1-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl leading-tight">{step.title}</h3>
                <p className="text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
        <div className="flex flex-col gap-4">
          <h3 className="label-mono text-faint">Tech I use</h3>
          <ul className="flex flex-wrap gap-2">
            {TECH_I_USE.map((tech) => (
              <li
                key={tech}
                className="rounded-pill border border-line bg-surface-solid px-3.5 py-1.5 font-mono text-sm text-fg"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
