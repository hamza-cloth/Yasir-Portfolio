"use client";

import { useIstTime } from "@/hooks/useIstTime";
import { cn } from "@/lib/cn";
import { IST_OFFSET_LABEL } from "@/lib/ist-time";

export function IstClock({ className }: { className?: string }) {
  const time = useIstTime();

  return (
    <p className={cn("label-mono inline-flex items-center gap-2 text-muted", className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-ok shadow-[0_0_8px_var(--ok)]" />
      <span>IST</span>
      <time className="text-fg tabular-nums" aria-live="off">
        {time ?? IST_OFFSET_LABEL}
      </time>
    </p>
  );
}
