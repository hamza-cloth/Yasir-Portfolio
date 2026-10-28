import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type TagTone = "cyan" | "amber" | "ok" | "muted";

const TONES: Record<TagTone, string> = {
  cyan: "text-c1-text before:bg-c1",
  amber: "text-fg before:bg-amber",
  ok: "text-ok before:bg-ok",
  muted: "text-muted before:bg-faint",
};

type TagProps = {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
};

export function Tag({ children, tone = "cyan", className }: TagProps) {
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-2 rounded-chip border border-line bg-surface-2 px-2.5 py-1",
        "before:size-1.5 before:flex-none before:rounded-full before:content-['']",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
