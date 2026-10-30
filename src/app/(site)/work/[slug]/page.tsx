import { notFound } from "next/navigation";

import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";
import { Markdown } from "@/components/markdown/Markdown";
import { ProjectMockup } from "@/components/mockups/ProjectMockup";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { PlayWhenVisible } from "@/components/ui/PlayWhenVisible";
import { SectionHead } from "@/components/ui/SectionHead";
import { CaseMeta } from "@/components/work/CaseMeta";
import { DecisionsGrid } from "@/components/work/DecisionsGrid";
import { NextCase } from "@/components/work/NextCase";
import { getProject, getProjectSlugs, getProjectSummaries } from "@/lib/data/projects";
import { pageMetadata } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Case study not found" };
  return pageMetadata({
    title: project.title,
    description: project.tagline,
    path: `/work/${slug}`,
  });
}

export default async function CaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProject(slug), getProjectSummaries()]);
  if (!project) notFound();

  const index = all.findIndex((item) => item.slug === project.slug);
  const next = all.length > 1 ? all[(index + 1) % all.length] : undefined;

  return (
    <>
      <PageHero
        eyebrow="Case study"
        title={project.title}
        lead={project.tagline}
        breadcrumb={[{ label: "Work", href: "/work" }, { label: project.title }]}
      >
        <CaseMeta project={project} />
      </PageHero>

      <Container className="pb-8">
        <PlayWhenVisible className="mx-auto max-w-4xl">
          <ProjectMockup visual={project.visual} />
        </PlayWhenVisible>
      </Container>

      <section aria-labelledby="overview-title" className="section-y">
        <Container className="grid gap-10 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <SectionHead eyebrow="Overview" titleId="overview-title" title="What it is" />
          <Markdown source={project.overview} className="text-lg" />
        </Container>
      </section>

      {project.decisions.length > 0 ? (
        <section aria-labelledby="decisions-title" className="section-y">
          <Container className="flex flex-col gap-10">
            <SectionHead
              eyebrow="Decisions"
              titleId="decisions-title"
              title="Choices that shaped it"
            />
            <DecisionsGrid decisions={project.decisions} />
          </Container>
        </section>
      ) : null}

      <section aria-labelledby="architecture-title" className="section-y">
        <Container className="flex flex-col gap-10">
          <SectionHead
            eyebrow="Architecture"
            titleId="architecture-title"
            title="How the parts connect"
          />
          <PlayWhenVisible>
            <ArchitectureDiagram visual={project.visual} />
          </PlayWhenVisible>
          {project.stack.length > 0 ? (
            <ul aria-label="Stack" className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <li key={item} className="label-mono rounded-pill border border-line px-3 py-1.5">
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </section>

      {next ? <NextCase project={next} /> : null}
    </>
  );
}
