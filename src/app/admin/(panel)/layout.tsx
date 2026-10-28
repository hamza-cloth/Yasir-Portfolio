import { Suspense, type ReactNode } from "react";
import Link from "next/link";

import { AdminNav } from "@/components/admin/AdminNav";

import { logout } from "../actions";

function PanelLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-64 animate-pulse rounded-field bg-surface-2" />
      <div className="h-40 animate-pulse rounded-card bg-surface-2" />
      <div className="h-40 animate-pulse rounded-card bg-surface-2" />
    </div>
  );
}

// The shell is static; each page checks the session itself, inside the Suspense boundary.
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1320px] gap-6 px-4 py-6 md:grid-cols-[230px_minmax(0,1fr)] md:gap-10 md:px-8 md:py-10">
      <aside className="flex min-w-0 flex-col gap-6 md:sticky md:top-10 md:self-start">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="surface grid size-10 place-items-center rounded-xl border border-line-2">
            <span className="text-gradient font-display text-[0.95rem] font-semibold">YA</span>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-semibold tracking-[-0.02em]">Admin</span>
            <span className="text-xs text-muted">Portfolio content</span>
          </span>
        </Link>
        <AdminNav />
        <div className="flex gap-2 border-t border-line pt-4 md:flex-col">
          <Link
            href="/"
            target="_blank"
            className="flex min-h-10 items-center rounded-field px-3 text-sm text-muted hover:text-fg"
          >
            View site ↗
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex min-h-10 w-full items-center rounded-field px-3 text-sm text-muted hover:text-red"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0">
        <Suspense fallback={<PanelLoading />}>{children}</Suspense>
      </main>
    </div>
  );
}
