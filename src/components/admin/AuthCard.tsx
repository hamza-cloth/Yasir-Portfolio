import type { ReactNode } from "react";
import Link from "next/link";

import { Aurora } from "@/components/canvas/Aurora";
import { Icon } from "@/components/ui/Icon";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

// The frame for the pages around sign-in: same background and card as the sign-in page, without
// its brand panel.
export function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-bg px-4 py-10 sm:px-8">
      <Aurora className="-z-10 opacity-70" />
      <div className="w-full max-w-[27rem]">
        <Link
          href="/admin/login"
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <Icon name="arrow-right" size={16} className="rotate-180" />
          Back to sign-in
        </Link>
        <div className="animate-rise rounded-panel border border-line bg-surface-solid p-6 shadow-(--shadow-lift) sm:p-9">
          <p className="label-mono text-muted">{eyebrow}</p>
          <h1 className="mt-1 text-[1.75rem] leading-tight tracking-[-0.03em]">{title}</h1>
          {description ? (
            <div className="mt-3 mb-7 text-muted">{description}</div>
          ) : (
            <div className="mb-7" />
          )}
          {children}
        </div>
      </div>
    </main>
  );
}
