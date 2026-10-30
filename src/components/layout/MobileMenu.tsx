"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
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

  useBodyScrollLock(open);
  // The header stays above the menu, so Tab cycles through both and the toggle stays reachable.
  useFocusTrap({
    active: open,
    regions: [headerRef, panelRef],
    initialFocus: panelRef,
    returnFocus: triggerRef,
    onEscape: onClose,
  });

  // Closes on any route change, including the browser's back button.
  const openedOn = useRef(pathname);
  useEffect(() => {
    if (pathname === openedOn.current) return;
    openedOn.current = pathname;
    if (open) onClose();
  }, [pathname, open, onClose]);

  // Always mounted, so it can animate both ways with CSS; closed, it is inert and hidden,
  // so it never catches a click or a Tab.
  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      inert={!open}
      data-open={open}
      data-lenis-prevent
      className="mobile-menu fixed inset-y-0 left-0 z-(--z-overlay) h-dvh w-screen overflow-y-auto overscroll-contain bg-bg bg-(image:--page-wash) pt-[calc(var(--header-h)+env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] laptop:hidden"
    >
      <Container className="flex min-h-full flex-col gap-10 py-8">
        <nav aria-label="Mobile">
          <ul className="flex flex-col">
            {ALL_PAGES.map((item, index) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li
                  key={item.href}
                  className="mobile-menu-item border-b border-line"
                  style={cssVars({ "--i": index })}
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
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto flex flex-wrap gap-3">
          <Button href="/contact" variant="accent" onClick={onClose}>
            Hire me
          </Button>
        </div>
      </Container>
    </div>
  );
}
