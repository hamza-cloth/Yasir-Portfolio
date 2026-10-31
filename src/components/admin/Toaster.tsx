"use client";

import { useEffect, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/cn";

const TOAST_EVENT = "ya:toast";

type Toast = { id: number; kind: "ok" | "error"; text: string };

export function toast(kind: Toast["kind"], text: string): void {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { kind, text } }));
}

// Bottom-right notifications for the admin. Announced politely; errors stay a little longer.
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let next = 0;
    const timers = new Set<number>();
    function handle(event: Event) {
      const { kind, text } = (event as CustomEvent<Omit<Toast, "id">>).detail;
      const id = (next += 1);
      setToasts((current) => [...current.slice(-3), { id, kind, text }]);
      const timer = window.setTimeout(
        () => setToasts((current) => current.filter((item) => item.id !== id)),
        kind === "error" ? 6000 : 3500,
      );
      timers.add(timer);
    }
    window.addEventListener(TOAST_EVENT, handle);
    return () => {
      window.removeEventListener(TOAST_EVENT, handle);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-(--z-toast) flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
    >
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.p
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={cn(
              "pointer-events-auto rounded-card border px-4 py-3 text-sm font-medium shadow-(--shadow-lift)",
              item.kind === "ok"
                ? "border-ok/30 bg-surface-solid text-fg"
                : "border-red/40 bg-surface-solid text-red",
            )}
          >
            {item.kind === "ok" ? "✓ " : "⚠ "}
            {item.text}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  );
}
