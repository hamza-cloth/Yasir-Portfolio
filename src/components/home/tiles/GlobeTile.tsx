import { DotGlobe } from "@/components/canvas/DotGlobe";
import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";

import { TileHead } from "./TileHead";

export function GlobeTile({ className }: { className?: string }) {
  return (
    <Tile
      className={cn("flex min-h-[clamp(340px,82vw,520px)] flex-col justify-between", className)}
    >
      <DotGlobe className="-z-10" />
      <TileHead eyebrow="From Noida, IN" title="Twelve routes out of Noida" />
      <p className="label-mono self-end text-muted">Drag to rotate</p>
    </Tile>
  );
}
