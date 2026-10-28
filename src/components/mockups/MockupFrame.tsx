import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type MockupFrameProps = {
  label: string;
  title: string;
  children: ReactNode;
  className?: string;
};

// Window chrome shared by the project mockups. The whole mockup is one labelled image.
export function MockupFrame({ label, title, children, className }: MockupFrameProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex aspect-[4/3] w-full min-w-0 flex-col overflow-hidden rounded-card border border-line bg-bg-2",
        className,
      )}
    >
      <div aria-hidden="true" className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red/70" />
        <span className="size-2.5 rounded-full bg-amber/70" />
        <span className="size-2.5 rounded-full bg-ok/70" />
        <span className="label-mono ml-2 truncate text-muted">{title}</span>
      </div>
      <div aria-hidden="true" className="relative min-h-0 flex-1">
        {children}
      </div>
    </div>
  );
}
