import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type TagTone = "accent" | "amber" | "ok" | "muted";

const TONES: Record<TagTone, string> = {
  accent: "text-c1-text before:bg-c1",
  amber: "text-fg before:bg-amber",
  ok: "text-ok before:bg-ok",
  muted: "text-muted before:bg-faint",
};

type TagProps = {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
};

export function Tag({ children, tone = "accent", className }: TagProps) {
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-2 rounded-pill border border-line bg-surface-2/70 px-3 py-1.5",
        "before:size-1.5 before:flex-none before:rounded-full before:content-['']",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
