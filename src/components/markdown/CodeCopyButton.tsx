"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/Icon";

type CopyState = "idle" | "copied" | "failed";

const LABELS: Record<CopyState, string> = {
  idle: "Copy",
  copied: "Copied",
  failed: "Copy failed",
};

export function CodeCopyButton({ value }: { value: string }) {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="label-mono inline-flex min-h-11 items-center gap-2 rounded-pill px-3 text-muted hover:text-fg print:hidden"
    >
      <Icon name="copy" size={14} />
      <span aria-live="polite">{LABELS[state]}</span>
      <span className="sr-only"> code</span>
    </button>
  );
}
