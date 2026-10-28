import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import type { ProjectDecision } from "@/lib/content/types";

export function DecisionsGrid({ decisions }: { decisions: ProjectDecision[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2">
      {decisions.map((decision, index) => (
        <li key={decision.title} className="min-w-0">
          <Reveal delay={index * 70} className="h-full">
            <Card className="flex h-full flex-col gap-3">
              <p aria-hidden="true" className="label-mono text-c1-text">
                Decision {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-xl leading-tight">{decision.title}</h3>
              <p className="text-muted">{decision.body}</p>
            </Card>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
