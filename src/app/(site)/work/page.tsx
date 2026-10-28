import { Suspense, type ReactNode } from "react";

import { ProjectMockup } from "@/components/mockups/ProjectMockup";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Steps, type Step } from "@/components/ui/Steps";
import { WorkResults } from "@/components/work/WorkResults";
import type { ProjectSummary } from "@/lib/content/types";
import { getProjectSummaries } from "@/lib/data/projects";
import { pageMetadata } from "@/lib/seo";
import { parseWorkFilter } from "@/lib/work-filters";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PROCESS: Step[] = [
  {
    title: "Reproduce the problem",
    body: "Start from what people actually do: the desk, the ticket, the shift. Nothing gets designed before the problem is clear.",
  },
  {
    title: "Model it",
    body: "Tenants, shifts, payments, subnets: get the shape of the data and the network right before the screens.",
  },
  {
    title: "Build and verify",
    body: "Ship in small pieces and check each one, the way a config change ends with a show command.",
  },
  {
    title: "Hand over",
    body: "Write down how it works and keep supporting it. Support is where the next version starts.",
  },
];

export async function generateMetadata() {
  return pageMetadata({
    title: "Work",
    description:
      "Earthix AI Healthcare, Hamza Cloth and The People’s Library: products and sites Yasir Abdullah is building.",
    path: "/work",
  });
}

async function FilteredWork(props: {
  searchParams: SearchParams;
  projects: ProjectSummary[];
  previews: Record<string, ReactNode>;
}) {
  const { filter } = await props.searchParams;
  return (
    <WorkResults
      filter={parseWorkFilter(filter)}
      projects={props.projects}
      previews={props.previews}
    />
  );
}

export default async function WorkPage({ searchParams }: { searchParams: SearchParams }) {
  const projects = await getProjectSummaries();
  const previews = Object.fromEntries(
    projects.map((project) => [
      project.slug,
      <ProjectMockup key={project.slug} visual={project.visual} />,
    ]),
  );

  return (
    <>
      <PageHero
        eyebrow="Work"
        title={
          <>
            Products, stores and <Highlight>study desks</Highlight>
          </>
        }
        lead="Three builds: an AI operating system for clinics, a clothing store with its own delivery arm, and a portal for a 24×7 study centre."
      />
      <section aria-label="Projects" className="pb-12">
        <Container>
          <Suspense fallback={<WorkResults filter="all" projects={projects} previews={previews} />}>
            <FilteredWork searchParams={searchParams} projects={projects} previews={previews} />
          </Suspense>
        </Container>
      </section>
      <Steps id="process-title" eyebrow="Process" title="Four steps, every time" steps={PROCESS} />
    </>
  );
}
