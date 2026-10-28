import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";
import type { OsiLayerGroup } from "@/lib/osi";

import { TileHead } from "./TileHead";
import { TileLink } from "./TileLink";

type LayersTileProps = {
  layers: OsiLayerGroup[];
  className?: string;
};

export function LayersTile({ layers, className }: LayersTileProps) {
  return (
    <Tile className={cn("flex flex-col gap-4", className)}>
      <TileHead eyebrow="Skills by layer" />
      <ol className="flex flex-col">
        {layers.map((group) => (
          <li
            key={group.layer}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line py-1.5 last:border-b-0"
          >
            <span className="label-mono text-c1-text">L{group.layer}</span>
            <span className="truncate">{group.name}</span>
            <span className="label-mono text-muted">{group.skills.length}</span>
          </li>
        ))}
      </ol>
      <TileLink href="/skills">All skills</TileLink>
    </Tile>
  );
}
