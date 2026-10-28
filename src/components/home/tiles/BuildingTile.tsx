import Link from "next/link";

import { Tag } from "@/components/ui/Tag";
import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";
import type { ProjectSummary } from "@/lib/content/types";
import { statusTone } from "@/lib/project-status";

import { TileHead } from "./TileHead";

type BuildingTileProps = {
  projects: ProjectSummary[];
  className?: string;
};

export function BuildingTile({ projects, className }: BuildingTileProps) {
  return (
    <Tile className={cn("flex flex-col gap-4", className)}>
      <TileHead eyebrow="Now building" />
      <ul className="flex flex-col divide-y divide-line">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              data-cursor="View"
              className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 hover:text-c1-text"
            >
              <span className="min-w-0 font-semibold">{project.title}</span>
              <Tag tone={statusTone(project.statusLabel)}>{project.statusLabel}</Tag>
            </Link>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
