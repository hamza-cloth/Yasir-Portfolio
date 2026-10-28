import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type TileHeadProps = {
  eyebrow: string;
  title?: ReactNode;
  // Light text for the blue and black tiles.
  inverse?: boolean;
};

export function TileHead({ eyebrow, title, inverse = false }: TileHeadProps) {
  return (
    <div className="flex flex-col gap-3">
      <p
        className={cn(
          "label-mono flex items-center gap-2",
          inverse ? "text-white/70" : "text-current opacity-75",
        )}
      >
        <span
          aria-hidden="true"
          className={cn("size-1.5 rounded-full", inverse ? "bg-white" : "bg-current")}
        />
        {eyebrow}
      </p>
      {title ? (
        <h3 className="text-[clamp(1.45rem,2.2vw,1.9rem)] leading-[1.08] tracking-[-0.04em]">
          {title}
        </h3>
      ) : null}
    </div>
  );
}
