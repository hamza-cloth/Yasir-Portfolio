import { CountUp } from "@/components/ui/CountUp";
import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";

import { TileHead } from "./TileHead";
import { TileLink } from "./TileLink";

type SupportTileProps = {
  companies: string[];
  className?: string;
};

export function SupportTile({ companies, className }: SupportTileProps) {
  return (
    <Tile className={cn("flex flex-col gap-4", className)}>
      <TileHead eyebrow="Support record" />
      <p className="flex items-baseline gap-3">
        <CountUp
          value={companies.length}
          className="text-gradient font-display text-[clamp(3.5rem,7vw,5rem)] leading-none font-medium tracking-[-0.05em]"
        />
        <span className="text-lg text-muted">technical support roles</span>
      </p>
      <ul className="flex flex-col gap-1 text-fg">
        {companies.map((company) => (
          <li key={company}>{company}</li>
        ))}
      </ul>
      <TileLink href="/experience">Experience</TileLink>
    </Tile>
  );
}
