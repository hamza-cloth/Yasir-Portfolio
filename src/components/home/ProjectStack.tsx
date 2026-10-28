import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import type { ProjectSummary } from "@/lib/content/types";

import { ProjectStackCard } from "./ProjectStackCard";

export function ProjectStack({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section aria-labelledby="projects-title" className="py-24">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow="Selected work" titleId="projects-title" title="What I’m building" />
          <Button href="/work" variant="line">
            All work
          </Button>
        </div>
        <ol className="flex flex-col gap-8">
          {projects.map((project, index) => (
            <ProjectStackCard key={project.slug} project={project} index={index} />
          ))}
        </ol>
      </Container>
    </section>
  );
}
