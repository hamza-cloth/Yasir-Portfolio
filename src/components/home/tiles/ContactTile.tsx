import { IstClock } from "@/components/layout/IstClock";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";

import { TileHead } from "./TileHead";

type ContactTileProps = {
  email: string;
  availability: string;
  className?: string;
};

export function ContactTile({ email, availability, className }: ContactTileProps) {
  return (
    <Tile
      className={cn("flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between", className)}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <TileHead eyebrow="Contact" title="Let’s talk" />
        <p className="max-w-md text-muted">{availability}</p>
        <IstClock />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button href="/contact" variant="primary">
          Let’s talk
        </Button>
        <CopyButton value={email}>Copy email</CopyButton>
      </div>
    </Tile>
  );
}
