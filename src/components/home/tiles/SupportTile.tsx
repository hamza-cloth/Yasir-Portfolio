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
    <Tile
      className={cn(
        "flex flex-col gap-4 border-transparent bg-tint-peach text-tint-peach-ink",
        className,
      )}
    >
      <TileHead eyebrow="Support record" />
      <p className="flex items-baseline gap-3">
        <CountUp
          value={companies.length}
          className="font-display text-[clamp(3.5rem,6vw,4.75rem)] leading-none text-fg"
        />
        <span className="text-lg font-bold tracking-[-0.02em] text-fg">support roles</span>
      </p>
      <ul className="flex flex-col gap-1 text-sm">
        {companies.map((company) => (
          <li key={company}>{company}</li>
        ))}
      </ul>
      <TileLink href="/experience" className="text-fg">
        Experience
      </TileLink>
    </Tile>
  );
}
