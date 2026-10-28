import { CountUp } from "@/components/ui/CountUp";
import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";

import { TileHead } from "./TileHead";
import { TileLink } from "./TileLink";

export type AboutStat = {
  value: number | string;
  label: string;
};

type AboutTileProps = {
  headline: string;
  location: string;
  facts: string[];
  stats: AboutStat[];
  className?: string;
};

export function AboutTile({ headline, location, facts, stats, className }: AboutTileProps) {
  return (
    <Tile className={cn("flex flex-col gap-6 text-fg", className)}>
      <TileHead eyebrow={`About · ${location}`} />
      <p className="text-[clamp(1.6rem,2.6vw,2.25rem)] leading-[1.1] font-extrabold tracking-[-0.04em]">
        {headline}
      </p>
      <ul className="flex flex-col gap-3 text-muted">
        {facts.map((fact) => (
          <li key={fact} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-[0.55em] size-1.5 flex-none rounded-full bg-c1"
            />
            {fact}
          </li>
        ))}
      </ul>
      {stats.length > 0 ? (
        <dl className="mt-auto grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 rounded-2xl bg-surface-2 p-4">
              <dd className="order-1 font-display text-[1.9rem] leading-none text-fg">
                {typeof stat.value === "number" ? <CountUp value={stat.value} /> : stat.value}
              </dd>
              <dt className="order-2 text-sm text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      ) : null}
      <TileLink href="/about" className="mt-0 text-c1-text">
        More about me
      </TileLink>
    </Tile>
  );
}
