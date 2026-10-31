import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";
import type { ProjectSummary } from "@/lib/content/types";

import { TileHead } from "./TileHead";
import { TileLink } from "./TileLink";

type BuildingTileProps = {
  projects: ProjectSummary[];
  className?: string;
};

export function BuildingTile({ projects, className }: BuildingTileProps) {
  return (
    <Tile className={cn("flex flex-col gap-5 text-fg", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TileHead eyebrow="Now building" title={`${projects.length} products in build`} />
        <TileLink href="/work" className="mt-0 text-fg">
          All work
        </TileLink>
      </div>
      <ul className="grid gap-2 @lg:grid-cols-3">
        {projects.map((project, index) => (
          <li key={project.slug} className="min-w-0">
            <Link
              href={`/work/${project.slug}`}
              data-cursor="View"
              className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2 p-4 transition-[border-color,background-color] duration-300 hover:border-c1/40 hover:bg-c1-soft @lg:flex-col @lg:items-start"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="label-mono text-c1-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="leading-tight font-bold tracking-[-0.02em]">{project.title}</span>
                <span className="text-xs text-muted">{project.statusLabel}</span>
              </span>
              <Icon
                name="arrow-up-right"
                size={16}
                className="flex-none text-muted transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-c1-text @lg:self-end"
              />
            </Link>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
