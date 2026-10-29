import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type MockupFrameProps = {
  label: string;
  title: string;
  children: ReactNode;
  className?: string;
};

// macOS-style browser chrome shared by the project mockups. The whole mockup is one labelled image.
export function MockupFrame({ label, title, children, className }: MockupFrameProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex aspect-[4/3] w-full min-w-0 flex-col overflow-hidden rounded-[18px] border border-line bg-surface-solid shadow-(--shadow-lift)",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5"
      >
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto flex max-w-full min-w-0 items-center gap-1.5 truncate rounded-md bg-surface-solid px-3 py-1 font-mono text-xs text-muted shadow-(--edge-light)">
          <svg viewBox="0 0 24 24" className="size-3 flex-none" fill="none">
            <path
              d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span className="truncate">{title}</span>
        </span>
        <span className="w-[42px]" />
      </div>
      <div aria-hidden="true" className="relative min-h-0 flex-1">
        {children}
      </div>
    </div>
  );
}
