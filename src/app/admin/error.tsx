"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Aurora } from "@/components/canvas/Aurora";
import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { reportError } from "@/lib/monitoring";

// The admin's error boundary: what failed, that nothing was half-saved, and a way back. The
// reference (Next's error digest) matches the server log entry for the failure.
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => reportError(error, { boundary: "admin" }), [error]);
  const digest =
    typeof error === "object" && error && "digest" in error ? String(error.digest) : null;

  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-bg px-4 py-16">
      <Aurora className="-z-10 opacity-70" />
      <section
        aria-labelledby="admin-error-title"
        className="animate-rise w-full max-w-lg rounded-panel border border-line bg-surface-solid p-7 text-center shadow-(--shadow-lift) sm:p-10"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red/10 text-red">
          <Icon name="alert" size={26} />
        </span>
        <p className="label-mono mt-6 text-muted">Admin error</p>
        <h1
          id="admin-error-title"
          className="mt-2 text-[clamp(1.6rem,4vw,2.1rem)] leading-tight tracking-[-0.03em]"
        >
          That request did not finish.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          Nothing was half-saved. Try again; if it keeps happening, the database may be out of reach
          for a moment.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={retry} className={buttonClassName("accent", "md")}>
            Try again
          </button>
          <Link href="/admin" className={buttonClassName("line", "md")}>
            Back to dashboard
          </Link>
        </div>

        <Link
          href="/"
          className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-fg"
        >
          <Icon name="arrow-right" size={15} className="rotate-180" />
          Go to the site
        </Link>

        {digest ? <p className="mt-4 font-mono text-xs text-muted">Reference {digest}</p> : null}
      </section>
    </main>
  );
}
