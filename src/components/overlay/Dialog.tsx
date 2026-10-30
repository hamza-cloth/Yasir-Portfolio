"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { EASE_ENTRANCE } from "@/lib/motion";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  // Sets the panel width (a max-w-* class); defaults to max-w-xl.
  panelClassName?: string;
};

// The shared modal shell: full-viewport (100dvh) backdrop, focus trapped inside, closes on Esc,
// backdrop click and route change, and returns focus to whatever opened it.
export function Dialog({
  open,
  onClose,
  label,
  children,
  panelClassName = "max-w-xl",
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const lastPathname = useRef(pathname);
  const reducedMotion = useReducedMotion();

  // Runs before the focus trap's effect, so it records the trigger before focus moves inside.
  useEffect(() => {
    if (open) returnRef.current = document.activeElement as HTMLElement | null;
  }, [open]);

  useBodyScrollLock(open);
  useFocusTrap({
    active: open,
    regions: [panelRef],
    initialFocus: panelRef,
    returnFocus: returnRef,
    onEscape: onClose,
  });

  useEffect(() => {
    if (pathname === lastPathname.current) return;
    lastPathname.current = pathname;
    if (open) onClose();
  }, [pathname, open, onClose]);

  const duration = reducedMotion ? 0 : 0.28;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="dialog"
          className="fixed inset-y-0 left-0 z-(--z-modal) flex h-dvh w-screen items-start justify-center pt-[max(1rem,env(safe-area-inset-top),12dvh)] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: EASE_ENTRANCE }}
        >
          <div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-[#0e1220]/40 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            data-lenis-prevent
            className={cn(
              "relative flex max-h-[min(100%,45rem)] w-full flex-col overflow-hidden overscroll-contain rounded-tile border border-line bg-surface-solid shadow-(--shadow-lift)",
              panelClassName,
            )}
            initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration, ease: EASE_ENTRANCE }}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
