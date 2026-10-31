import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";

type SectionHeadProps = {
  eyebrow: string;
  title: ReactNode;
  titleId?: string;
  lead?: ReactNode;
  align?: "start" | "center";
  className?: string;
};

export function SectionHead({
  eyebrow,
  title,
  titleId,
  lead,
  align = "start",
  className,
}: SectionHeadProps) {
  return (
    <Reveal className={cn("reveal-group", align === "center" && "mx-auto")}>
      <header
        className={cn(
          "stagger flex max-w-3xl flex-col gap-5",
          align === "center" && "mx-auto items-center text-center",
          className,
        )}
      >
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={titleId} className="text-h2 leading-[1.02]">
          {title}
        </h2>
        {lead ? <p className="max-w-2xl text-lg leading-relaxed text-muted">{lead}</p> : null}
      </header>
    </Reveal>
  );
}
