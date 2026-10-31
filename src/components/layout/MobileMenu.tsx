"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";

import { LookPicker } from "@/components/home/LookPicker";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import { whatsappUrl } from "@/lib/hire";
import { ALL_PAGES, isActivePath } from "@/lib/site-nav";

type MobileMenuProps = {
  id: string;
  open: boolean;
  pathname: string;
  onClose: () => void;
  headerRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

// One line under each page name in the menu.
const DESCRIPTIONS: Record<string, string> = {
  "/": "Start here",
  "/work": "Case studies",
  "/about": "Story and principles",
  "/skills": "Stack, layer by layer",
  "/experience": "Roles and training",
  "/notes": "Labs and guides",
  "/resume": "One-page CV",
  "/estimate": "Project cost planner",
  "/contact": "Send a message",
};

type Action = { href: string; label: string; detail: string; icon: IconName; external?: boolean };

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

  const whatsapp = whatsappUrl();
  const actions: Action[] = [
    { href: "/estimate", label: "Estimate", detail: "Get a cost", icon: "sparkle" },
    ...(whatsapp
      ? [
          {
            href: whatsapp,
            label: "WhatsApp",
            detail: "Chat now",
            icon: "whatsapp" as const,
            external: true,
          },
        ]
      : [{ href: "/contact", label: "Message", detail: "Write to me", icon: "mail" as const }]),
  ];
  // Stagger order for the blocks after the page links.
  const after = ALL_PAGES.length + 1;

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
      className="mobile-menu fixed inset-y-0 left-0 z-(--z-overlay) h-dvh w-screen overflow-y-auto overscroll-contain bg-bg pt-[calc(var(--header-h)+env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] laptop:hidden"
    >
      <div aria-hidden="true" className="mm-backdrop">
        <span className="mm-orb mm-orb--one" />
        <span className="mm-orb mm-orb--two" />
        <span className="mm-grid" />
      </div>

      <div className="shell relative flex min-h-full flex-col gap-7 py-6">
        <p className="mm-item mm-eyebrow" style={cssVars({ "--i": 0 })}>
          <span aria-hidden="true" className="mm-eyebrow-dot" />
          Menu
          <span className="text-faint">· {ALL_PAGES.length} pages</span>
        </p>

        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-1.5">
            {ALL_PAGES.map((item, index) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href} className="mm-item" style={cssVars({ "--i": index + 1 })}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn("mm-link", active && "mm-link--active")}
                  >
                    <span aria-hidden="true" className="mm-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="mm-label">{item.label}</span>
                      <span className="mm-detail">
                        {active ? "You’re here" : DESCRIPTIONS[item.href]}
                      </span>
                    </span>
                    <span aria-hidden="true" className="mm-arrow">
                      <Icon name="arrow-right" size={16} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/hire"
            onClick={onClose}
            className="mm-item mm-tile mm-tile--accent col-span-2"
            style={cssVars({ "--i": after })}
          >
            <span className="flex flex-col">
              <span className="text-lg font-semibold">Hire me</span>
              <span className="text-sm opacity-80">Start a project or a role</span>
            </span>
            <span aria-hidden="true" className="mm-tile-icon">
              <Icon name="arrow-up-right" size={18} />
            </span>
          </Link>
          {actions.map((action, index) => (
            <a
              key={action.label}
              href={action.href}
              onClick={action.external ? undefined : onClose}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener" : undefined}
              className="mm-item mm-tile"
              style={cssVars({ "--i": after + 1 + index })}
            >
              <span aria-hidden="true" className="mm-tile-icon mm-tile-icon--soft">
                <Icon name={action.icon} size={17} />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-fg">{action.label}</span>
                <span className="text-xs text-muted">{action.detail}</span>
              </span>
            </a>
          ))}
        </div>

        <section
          aria-labelledby="mm-admin-title"
          className="mm-item mm-admin"
          style={cssVars({ "--i": after + 3 })}
        >
          <span aria-hidden="true" className="mm-admin-icon">
            <Icon name="lock" size={18} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 id="mm-admin-title" className="text-base font-semibold tracking-[-0.01em]">
              Admin panel
            </h2>
            <p className="text-sm text-muted">Projects, messages, leads and settings.</p>
          </div>
          <Link href="/admin" onClick={onClose} className="mm-admin-link">
            Open
            <Icon name="arrow-right" size={15} />
          </Link>
        </section>

        <div className="mm-item mm-look" style={cssVars({ "--i": after + 4 })}>
          <LookPicker />
        </div>

        <div
          className="mm-item mt-auto flex flex-col items-center gap-4 pt-2"
          style={cssVars({ "--i": after + 5 })}
        >
          <button type="button" onClick={onClose} className="mm-close">
            <span aria-hidden="true" className="mm-close-icon">
              <Icon name="close" size={16} />
            </span>
            Close menu
          </button>
          <p className="label-mono text-center text-faint">
            Yasir Abdullah · Software &amp; Network Engineer
          </p>
        </div>
      </div>
    </div>
  );
}
