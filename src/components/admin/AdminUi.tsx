import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type AdminHeaderProps = {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  back?: { href: string; label: string };
};

export function AdminHeader({ title, description, action, back }: AdminHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        {back ? (
          <Link href={back.href} className="text-sm text-muted hover:text-fg">
            ← {back.label}
          </Link>
        ) : null}
        <h1 className="text-[clamp(1.7rem,3vw,2.3rem)] tracking-[-0.04em]">{title}</h1>
        {description ? <p className="max-w-2xl text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex min-h-10 items-center rounded-pill bg-fg px-4 text-sm font-medium text-bg hover:bg-fg/90"
        >
          {action.label}
        </Link>
      ) : null}
    </header>
  );
}

export function StatusPill({
  on,
  onLabel,
  offLabel,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1",
        on ? "border-ok/30 text-ok" : "border-line-2 text-faint",
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", on ? "bg-ok" : "bg-faint")} />
      {on ? onLabel : offLabel}
    </span>
  );
}

type Row = {
  id: string;
  href: string;
  title: string;
  meta?: string;
  published: boolean;
};

export function AdminList({ rows, empty }: { rows: Row[]; empty: ReactNode }) {
  if (rows.length === 0) {
    return (
      <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
        {empty}
      </p>
    );
  }

  return (
    <ul className="surface divide-y divide-line overflow-hidden rounded-card border border-line">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            href={row.href}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-fg/4"
          >
            <span className="flex min-w-0 flex-col">
              <span className="font-medium text-fg">{row.title}</span>
              {row.meta ? <span className="text-sm text-muted">{row.meta}</span> : null}
            </span>
            <StatusPill on={row.published} onLabel="Published" offLabel="Draft" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function NoDatabase() {
  return (
    <p className="surface rounded-card border border-line p-8 text-muted">
      No database is connected, so there is nothing to edit. Set <code>DATABASE_URL</code> and
      redeploy.
    </p>
  );
}
