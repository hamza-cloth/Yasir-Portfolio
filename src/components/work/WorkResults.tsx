import type { ReactNode } from "react";
import Link from "next/link";

import type { ProjectSummary } from "@/lib/content/types";
import { filterProjects, WORK_FILTERS, type WorkFilter } from "@/lib/work-filters";

import { FilterChips } from "./FilterChips";
import { ProjectRow } from "./ProjectRow";
import { WorkList } from "./WorkList";

type WorkResultsProps = {
  filter: WorkFilter;
  projects: ProjectSummary[];
  previews: Record<string, ReactNode>;
};

export function WorkResults({ filter, projects, previews }: WorkResultsProps) {
  const visible = filterProjects(projects, filter);
  const counts = Object.fromEntries(
    WORK_FILTERS.map((item) => [item.value, filterProjects(projects, item.value).length]),
  ) as Record<WorkFilter, number>;

  return (
    <div className="flex flex-col gap-10">
      <FilterChips active={filter} counts={counts} />
      {visible.length > 0 ? (
        <WorkList previews={previews}>
          {visible.map((project, index) => (
            <ProjectRow key={project.slug} project={project} index={index} />
          ))}
        </WorkList>
      ) : (
        <p className="max-w-xl border-y border-line py-10 text-lg text-muted">
          No projects here yet. The networking work lives in the{" "}
          <Link href="/labs" className="text-c1-text underline underline-offset-4">
            CCNA practice labs
          </Link>
          .
        </p>
      )}
    </div>
  );
}
