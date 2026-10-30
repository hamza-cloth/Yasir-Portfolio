import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import type { OsiLayerGroup } from "@/lib/osi";

import { TileHead } from "./TileHead";
import { TileLink } from "./TileLink";

type LayersTileProps = {
  layers: OsiLayerGroup[];
  className?: string;
};

export function LayersTile({ layers, className }: LayersTileProps) {
  const most = Math.max(1, ...layers.map((group) => group.skills.length));

  return (
    <Tile className={cn("flex flex-col gap-5 text-fg", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TileHead eyebrow="Skills by layer" title="All seven OSI layers" />
        <TileLink href="/skills" className="mt-0 text-fg">
          All skills
        </TileLink>
      </div>
      <ol className="grid gap-2.5 @lg:grid-cols-2 @lg:gap-x-8">
        {layers.map((group) => (
          <li
            key={group.layer}
            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3"
          >
            <span className="label-mono font-semibold text-c1-text">L{group.layer}</span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm font-semibold text-fg">{group.name}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="layer-bar block h-full rounded-full [background:var(--accent-fill)]"
                  style={cssVars({ "--fill": group.skills.length / most })}
                />
              </span>
            </span>
            <span className="label-mono text-muted">{group.skills.length}</span>
          </li>
        ))}
      </ol>
    </Tile>
  );
}
