import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";
import type { ProjectSummary } from "@/lib/content/types";

import { TileHead } from "./TileHead";

type BuildingTileProps = {
  projects: ProjectSummary[];
  className?: string;
};

export function BuildingTile({ projects, className }: BuildingTileProps) {
  return (
    <Tile
      className={cn(
        "flex flex-col gap-4 border-transparent bg-tint-mint text-tint-mint-ink",
        className,
      )}
    >
      <TileHead eyebrow="Now building" />
      <ul className="flex flex-col gap-2">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              data-cursor="View"
              className="group flex items-center justify-between gap-3 rounded-2xl bg-surface-solid/75 px-4 py-3 transition-colors hover:bg-surface-solid terminal:bg-transparent"
            >
              <span className="flex min-w-0 flex-col">
                <span className="font-bold tracking-[-0.02em] text-fg">{project.title}</span>
                <span className="text-xs">{project.statusLabel}</span>
              </span>
              <Icon
                name="arrow-up-right"
                size={16}
                className="flex-none text-fg transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
