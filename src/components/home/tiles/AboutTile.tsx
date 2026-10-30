import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";

import { TileHead } from "./TileHead";
import { TileLink } from "./TileLink";

type AboutTileProps = {
  headline: string;
  location: string;
  facts: string[];
  toolbox: string[];
  className?: string;
};

export function AboutTile({ headline, location, facts, toolbox, className }: AboutTileProps) {
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
      <div className="mt-auto flex flex-col gap-4">
        {toolbox.length > 0 ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-4">
            <p className="label-mono text-faint">Everyday toolbox</p>
            <ul className="flex flex-wrap gap-1.5">
              {toolbox.map((skill) => (
                <li
                  key={skill}
                  className="rounded-pill border border-line bg-surface-solid px-3 py-1 text-sm font-medium text-fg"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <TileLink href="/about" className="text-c1-text">
          More about me
        </TileLink>
      </div>
    </Tile>
  );
}
