import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { ProjectSummary } from "@/lib/content/types";
import { statusTone } from "@/lib/project-status";

type ProjectRowProps = {
  project: ProjectSummary;
  index: number;
};

export function ProjectRow({ project, index }: ProjectRowProps) {
  return (
    <li className="border-b border-line">
      <Link
        href={`/work/${project.slug}`}
        data-cursor="View"
        data-preview={project.slug}
        className="group grid gap-x-8 gap-y-4 py-8 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-center"
      >
        <span aria-hidden="true" className="label-mono text-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex min-w-0 flex-col gap-3">
          <span className="font-display text-[clamp(1.8rem,4.6vw,3.6rem)] leading-none transition-transform duration-500 ease-entrance group-hover:translate-x-2">
            {project.title}
          </span>
          <span className="max-w-2xl text-muted">{project.tagline}</span>
        </span>
        <span className="flex flex-wrap items-center gap-3 sm:justify-end">
          <Tag tone={statusTone(project.statusLabel)}>{project.statusLabel}</Tag>
          <span className="grid size-11 place-items-center rounded-pill border border-line-2 transition-transform duration-500 ease-entrance group-hover:-rotate-45">
            <Icon name="arrow-right" />
          </span>
        </span>
      </Link>
    </li>
  );
}
