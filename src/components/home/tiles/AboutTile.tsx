import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";

import { TileHead } from "./TileHead";
import { TileLink } from "./TileLink";

type AboutTileProps = {
  headline: string;
  location: string;
  facts: string[];
  className?: string;
};

export function AboutTile({ headline, location, facts, className }: AboutTileProps) {
  return (
    <Tile className={cn("flex flex-col gap-5", className)}>
      <TileHead eyebrow={`About · ${location}`} title={headline} />
      <ul className="flex flex-col gap-2 text-muted">
        {facts.map((fact) => (
          <li key={fact} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.7em] size-1 flex-none bg-c1" />
            {fact}
          </li>
        ))}
      </ul>
      <TileLink href="/about">More about me</TileLink>
    </Tile>
  );
}
