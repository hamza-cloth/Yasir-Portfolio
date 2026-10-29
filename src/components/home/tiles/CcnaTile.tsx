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
    <Tile
      className={cn(
        "flex flex-col gap-5 border-transparent text-white shadow-[0_24px_50px_-24px_var(--c1)] [background:var(--feature-bg)]",
        className,
      )}
    >
      <TileHead eyebrow="Training" title="Cisco CCNA" inverse />
      <p className="text-white/80">Trained at {issuer}, practised on Cisco IOS lab topologies.</p>
      <ul className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <li
            key={topic}
            className="label-mono rounded-pill bg-white/15 px-3 py-1.5 text-white backdrop-blur-sm"
          >
            {topic}
          </li>
        ))}
      </ul>
      <TileLink href="/notes" className="text-white">
        Lab notes
      </TileLink>
    </Tile>
  );
}
