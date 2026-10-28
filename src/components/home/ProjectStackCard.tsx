import Link from "next/link";

import { ProjectMockup } from "@/components/mockups/ProjectMockup";
import { Icon } from "@/components/ui/Icon";
import { PlayWhenVisible } from "@/components/ui/PlayWhenVisible";
import { Tag } from "@/components/ui/Tag";
import type { ProjectSummary } from "@/lib/content/types";
import { cssVars } from "@/lib/css-vars";
import { statusTone } from "@/lib/project-status";

type ProjectStackCardProps = {
  project: ProjectSummary;
  index: number;
};

const STACK_PREVIEW = 6;

export function ProjectStackCard({ project, index }: ProjectStackCardProps) {
  const extra = project.stack.length - STACK_PREVIEW;

  return (
    <li className="stack-card md:sticky" style={cssVars({ "--stack-index": index })}>
      <article className="surface grid gap-8 rounded-panel border border-line p-[clamp(20px,3.5vw,44px)] shadow-(--shadow-lift) md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
        <div className="flex min-w-0 flex-col items-start gap-5">
          <Tag tone={statusTone(project.statusLabel)}>{project.statusLabel}</Tag>
          <h3 className="text-[clamp(1.9rem,3.8vw,3rem)] leading-none tracking-[-0.045em]">
            {project.title}
          </h3>
          <p className="text-lg text-fg">{project.tagline}</p>
          <p className="text-muted">{project.summary}</p>
          {project.stack.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Stack">
              {project.stack.slice(0, STACK_PREVIEW).map((item) => (
                <li
                  key={item}
                  className="label-mono rounded-pill border border-line bg-surface-2/60 px-3 py-1.5"
                >
                  {item}
                </li>
              ))}
              {extra > 0 ? (
                <li className="label-mono px-1 py-1 text-muted">+{extra} more</li>
              ) : null}
            </ul>
          ) : null}
          <Link
            href={`/work/${project.slug}`}
            data-cursor="View"
            className="group/link label-mono inline-flex min-h-11 items-center gap-2 text-c1-text transition-colors hover:text-fg"
          >
            Read the case study
            <span className="sr-only">: {project.title}</span>
            <Icon
              name="arrow-right"
              size={14}
              className="transition-transform duration-300 group-hover/link:translate-x-1"
            />
          </Link>
        </div>
        <PlayWhenVisible>
          <ProjectMockup visual={project.visual} />
        </PlayWhenVisible>
      </article>
    </li>
  );
}
