import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";

import { TileHead } from "./TileHead";
import { TileLink } from "./TileLink";

type CcnaTileProps = {
  issuer: string;
  topics: string[];
  className?: string;
};

export function CcnaTile({ issuer, topics, className }: CcnaTileProps) {
  return (
    <Tile className={cn("flex flex-col gap-5", className)}>
      <TileHead eyebrow="Training" title="Cisco CCNA" />
      <p className="text-muted">Trained at {issuer}, practised on Cisco IOS lab topologies.</p>
      <ul className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <li
            key={topic}
            className="label-mono rounded-chip border border-line px-2.5 py-1 text-fg"
          >
            {topic}
          </li>
        ))}
      </ul>
      <TileLink href="/labs">Practice labs</TileLink>
    </Tile>
  );
}
