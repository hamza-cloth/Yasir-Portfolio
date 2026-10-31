"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";
import { ALL_PAGES, isActivePath } from "@/lib/site-nav";

type NavPillsProps = {
  pathname: string;
  className?: string;
};

// Every page from the mobile menu, inline. The current page is ivory with a gold underline.
// Between 1024px and 1200px the links are a little tighter so all eight fit beside the actions.
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
                  "nav-link relative inline-flex min-h-11 items-center px-2.5 text-[0.875rem] font-medium whitespace-nowrap transition-colors duration-200 min-[75rem]:px-3 min-[75rem]:text-[0.9375rem]",
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
