import Image from "next/image";
import { notFound } from "next/navigation";

import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";
import { Markdown } from "@/components/markdown/Markdown";
import { ProjectMockup } from "@/components/mockups/ProjectMockup";
import { PageHero } from "@/components/page/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { PlayWhenVisible } from "@/components/ui/PlayWhenVisible";
import { SectionHead } from "@/components/ui/SectionHead";
import { CaseMeta } from "@/components/work/CaseMeta";
import { DecisionsGrid } from "@/components/work/DecisionsGrid";
import { NextCase } from "@/components/work/NextCase";
import { getProject, getProjectSlugs, getProjectSummaries } from "@/lib/data/projects";
import { redirectIfMoved } from "@/lib/redirects";
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
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.tagline,
    path: `/work/${slug}`,
  });
}

export default async function CaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProject(slug), getProjectSummaries()]);
  if (!project) {
    await redirectIfMoved(`/work/${slug}`);
    notFound();
  }

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
        {project.liveUrl || project.githubUrl ? (
          <div className="mt-2 flex flex-wrap gap-3">
            {project.liveUrl ? (
              <Button
                href={project.liveUrl}
                variant="accent"
                size="md"
                target="_blank"
                rel="noopener"
              >
                Visit the live site
                <Icon name="arrow-up-right" size={16} />
              </Button>
            ) : null}
            {project.githubUrl ? (
              <Button
                href={project.githubUrl}
                variant="line"
                size="md"
                target="_blank"
                rel="noopener"
              >
                <Icon name="github" size={16} />
                Source code
              </Button>
            ) : null}
          </div>
        ) : null}
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

      {project.gallery && project.gallery.length > 0 ? (
        <section aria-labelledby="gallery-title" className="section-y">
          <Container className="flex flex-col gap-10">
            <SectionHead eyebrow="Gallery" titleId="gallery-title" title="Screens from the build" />
            <ul className="grid gap-4 sm:grid-cols-2">
              {project.gallery.map((src, index) => (
                <li
                  key={src}
                  className="relative aspect-[16/10] overflow-hidden rounded-card border border-line"
                >
                  <Image
                    src={src}
                    alt={`${project.title}, screen ${index + 1}`}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

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
