"use client";

import Link from "next/link";

import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { EASE_ENTRANCE } from "@/lib/motion";
import { isActivePath, NAV_ITEMS } from "@/lib/site-nav";

type NavPillsProps = {
  pathname: string;
  className?: string;
};

export function NavPills({ pathname, className }: NavPillsProps) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-0.5 rounded-pill border border-line bg-surface p-1">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href} className="relative">
              {active ? (
                <motion.span
                  layoutId="nav-active-pill"
                  aria-hidden="true"
                  className="absolute inset-0 rounded-pill border border-c1/50 bg-surface-2 shadow-[0_0_24px_var(--glow)]"
                  transition={{ duration: 0.5, ease: EASE_ENTRANCE }}
                />
              ) : null}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-pill px-3.5 text-sm font-medium",
                  active ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
