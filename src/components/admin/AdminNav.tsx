"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Profile & settings" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/notes", label: "Notes" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/credentials", label: "Education & training" },
  { href: "/admin/skills", label: "Skills" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {ITEMS.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-none">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center rounded-field px-3 text-sm whitespace-nowrap transition-colors",
                  active ? "bg-fg/8 text-fg" : "text-muted hover:bg-fg/4 hover:text-fg",
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
