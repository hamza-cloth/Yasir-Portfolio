"use client";

import { Tile } from "@/components/ui/Tile";
import { useIstTime } from "@/hooks/useIstTime";
import { cn } from "@/lib/cn";
import { IST_OFFSET_LABEL } from "@/lib/ist-time";

import { TileHead } from "./TileHead";

export function ClockTile({ location, className }: { location: string; className?: string }) {
  const time = useIstTime();

  return (
    <Tile
      className={cn(
        "flex flex-col gap-4 border-transparent bg-tint-butter text-tint-butter-ink",
        className,
      )}
    >
      <TileHead eyebrow="Local time" />
      <p className="font-mono text-[clamp(2rem,3.4vw,2.8rem)] leading-none font-medium tracking-[-0.04em] text-fg tabular-nums">
        <time aria-live="off">{time ?? "--:--:--"}</time>
      </p>
      <p className="mt-auto text-sm font-medium">
        {location} · {IST_OFFSET_LABEL}
        <br />
        Replies usually within a day.
      </p>
    </Tile>
  );
}
