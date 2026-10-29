"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";
import { isActivePath, NAV_ITEMS } from "@/lib/site-nav";

type NavPillsProps = {
  pathname: string;
  className?: string;
};

export function NavPills({ pathname, className }: NavPillsProps) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-pill px-3.5 text-[0.92rem] font-semibold tracking-[-0.01em] transition-colors duration-300",
                  active ? "bg-c1-soft text-c1-text" : "text-muted hover:bg-fg/5 hover:text-fg",
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
