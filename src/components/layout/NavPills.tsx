"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";
import { ALL_PAGES, isActivePath } from "@/lib/site-nav";

type NavPillsProps = {
  pathname: string;
  className?: string;
};

// Every page from the mobile menu, inline. Between 1024px and 1200px the pills are a little
// tighter so all eight fit on one line beside the actions.
export function NavPills({ pathname, className }: NavPillsProps) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-0.5">
        {ALL_PAGES.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-pill px-2.5 text-[0.875rem] font-semibold tracking-[-0.01em] whitespace-nowrap transition-colors duration-300 min-[75rem]:px-3.5 min-[75rem]:text-[0.92rem]",
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
