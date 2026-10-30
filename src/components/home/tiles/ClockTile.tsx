"use client";

import { Tile } from "@/components/ui/Tile";
import { useIstTime } from "@/hooks/useIstTime";
import { cn } from "@/lib/cn";
import { IST_OFFSET_LABEL } from "@/lib/ist-time";

import { TileHead } from "./TileHead";

type ClockTileProps = {
  location: string;
  availability: string;
  className?: string;
};

export function ClockTile({ location, availability, className }: ClockTileProps) {
  const time = useIstTime();

  return (
    <Tile className={cn("flex flex-col gap-4 text-fg", className)}>
      <TileHead eyebrow="Local time" />
      <p className="font-mono text-[clamp(2rem,3.2vw,2.6rem)] leading-none font-medium tracking-[-0.04em] tabular-nums">
        <time aria-live="off">{time ?? "--:--:--"}</time>
      </p>
      <p className="text-sm text-muted">
        {location} · {IST_OFFSET_LABEL}
      </p>
      <p className="mt-auto flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2 p-3 text-sm">
        <span aria-hidden="true" className="status-dot mt-[0.45em]" />
        <span>
          <span className="font-semibold">Replies within a day.</span>{" "}
          <span className="text-muted">{availability}</span>
        </span>
      </p>
    </Tile>
  );
}
