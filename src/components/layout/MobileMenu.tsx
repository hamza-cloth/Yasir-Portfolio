"use client";

import { useRef, type RefObject } from "react";
import Link from "next/link";

import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { EASE_ENTRANCE, EASE_WIPE } from "@/lib/motion";
import { ALL_PAGES, isActivePath } from "@/lib/site-nav";

type MobileMenuProps = {
  id: string;
  open: boolean;
  pathname: string;
  onClose: () => void;
  headerRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export function MobileMenu({
  id,
  open,
  pathname,
  onClose,
  headerRef,
  triggerRef,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useBodyScrollLock(open);
  // The header stays above the menu, so Tab cycles through both and the toggle stays reachable.
  useFocusTrap({
    active: open,
    regions: [headerRef, panelRef],
    initialFocus: panelRef,
    returnFocus: triggerRef,
    onEscape: onClose,
  });

  const wipe = reducedMotion ? { duration: 0 } : { duration: 0.6, ease: EASE_WIPE };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          id={id}
          className="fixed inset-0 z-(--z-mobile-menu) overflow-y-auto overscroll-contain bg-bg bg-(image:--page-wash) pt-[calc(var(--header-h)+env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] lg:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={wipe}
        >
          <Container className="flex min-h-full flex-col gap-10 py-8">
            <nav aria-label="Mobile">
              <ul className="flex flex-col">
                {ALL_PAGES.map((item, index) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <motion.li
                      key={item.href}
                      className="border-b border-line"
                      initial={reducedMotion ? false : { opacity: 0, y: 32 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.15 + index * 0.045,
                        duration: 0.6,
                        ease: EASE_ENTRANCE,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-14 items-center justify-between gap-4 py-3 font-display text-[clamp(1.6rem,7vw,2.6rem)] leading-none font-medium tracking-[-0.04em]",
                          active ? "text-c1-text" : "text-fg",
                        )}
                      >
                        {item.label}
                        <span aria-hidden="true" className="label-mono text-muted">
                          {String(index).padStart(2, "0")}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
            <div className="mt-auto flex flex-wrap gap-3">
              <Button href="/contact" variant="primary" onClick={onClose}>
                Let’s talk
              </Button>
            </div>
          </Container>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
