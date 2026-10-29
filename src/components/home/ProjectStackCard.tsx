import Link from "next/link";

import { ProjectMockup } from "@/components/mockups/ProjectMockup";
import { Icon } from "@/components/ui/Icon";
import { PlayWhenVisible } from "@/components/ui/PlayWhenVisible";
import { cn } from "@/lib/cn";
import type { ProjectSummary } from "@/lib/content/types";
import { cssVars } from "@/lib/css-vars";

type ProjectStackCardProps = {
  project: ProjectSummary;
  index: number;
};

const STACK_PREVIEW = 6;

// Blue, peach, mint, then round again.
const TINTS = [
  { panel: "bg-tint-blue", ink: "text-tint-blue-ink" },
  { panel: "bg-tint-peach", ink: "text-tint-peach-ink" },
  { panel: "bg-tint-mint", ink: "text-tint-mint-ink" },
];

export function ProjectStackCard({ project, index }: ProjectStackCardProps) {
  const extra = project.stack.length - STACK_PREVIEW;
  const tint = TINTS[index % TINTS.length] ?? TINTS[0];

  return (
    <li className="stack-card md:sticky" style={cssVars({ "--stack-index": index })}>
      <article
        className={cn(
          "grid gap-10 overflow-hidden rounded-panel p-[clamp(22px,4vw,56px)] shadow-(--shadow-soft) md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center",
          tint?.panel,
        )}
      >
        <div className="flex min-w-0 flex-col items-start gap-5">
          <p
            className={cn(
              "label-mono inline-flex items-center gap-2 rounded-pill bg-surface-solid/80 px-3 py-1.5",
              tint?.ink,
            )}
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {String(index + 1).padStart(2, "0")} · {project.statusLabel}
          </p>
          <h3 className="text-[clamp(2rem,4vw,3.2rem)] leading-[1] tracking-[-0.035em]">
            {project.title}
          </h3>
          <p className="text-lg font-semibold tracking-[-0.01em] text-fg">{project.tagline}</p>
          <p className="text-muted">{project.summary}</p>
          {project.stack.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
              {project.stack.slice(0, STACK_PREVIEW).map((item) => (
                <li
                  key={item}
                  className="label-mono rounded-pill bg-surface-solid/80 px-3 py-1.5 text-fg"
                >
                  {item}
                </li>
              ))}
              {extra > 0 ? (
                <li className="label-mono px-1 py-1.5 text-muted">+{extra} more</li>
              ) : null}
            </ul>
          ) : null}
          <Link
            href={`/work/${project.slug}`}
            data-cursor="View"
            className="group/link mt-2 inline-flex min-h-12 items-center gap-2 rounded-pill bg-fg px-6 text-[0.95rem] font-semibold text-bg transition-transform duration-300 hover:-translate-y-0.5"
          >
            Read the case study
            <span className="sr-only">: {project.title}</span>
            <Icon
              name="arrow-right"
              size={16}
              className="transition-transform duration-300 group-hover/link:translate-x-1"
            />
          </Link>
        </div>
        <PlayWhenVisible className="parallax">
          <ProjectMockup visual={project.visual} />
        </PlayWhenVisible>
      </article>
    </li>
  );
}
