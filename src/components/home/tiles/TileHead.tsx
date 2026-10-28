import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";

type TileHeadProps = {
  eyebrow: string;
  title?: ReactNode;
};

export function TileHead({ eyebrow, title }: TileHeadProps) {
  return (
    <div className="flex flex-col gap-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      {title ? <h3 className="text-[clamp(1.25rem,2vw,1.6rem)] leading-tight">{title}</h3> : null}
    </div>
  );
}
