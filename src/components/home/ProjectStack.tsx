import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Icon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/SectionHead";
import type { ProjectSummary } from "@/lib/content/types";

import { ProjectStackCard } from "./ProjectStackCard";

export function ProjectStack({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section aria-labelledby="projects-title" className="py-14 md:py-16">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            eyebrow="Selected work"
            titleId="projects-title"
            title={
              <>
                What I’m <Highlight>building</Highlight>
              </>
            }
          />
          <Button href="/work" variant="line">
            All work
            <Icon name="arrow-right" size={16} />
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
