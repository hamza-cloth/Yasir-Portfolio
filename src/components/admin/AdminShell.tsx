"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar } from "@/components/ui/Avatar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

import { Toaster } from "./Toaster";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "M4 13h6V4H4zM14 20h6v-9h-6zM14 4v4h6V4zM4 20h6v-4H4z",
  },
  { href: "/admin/messages", label: "Messages", icon: "M4 6h16v12H4zM4 7l8 6 8-6" },
  {
    href: "/admin/settings",
    label: "Profile",
    icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0",
  },
  {
    href: "/admin/looks",
    label: "Home looks",
    icon: "M12 3a9 9 0 1 0 9 9c0-1-1-1.5-2-1.5h-2a2 2 0 0 1-2-2V7c0-1-.5-2-1.5-2z",
  },
  { href: "/admin/projects", label: "Projects", icon: "M3 7h18v13H3zM8 7V4h8v3" },
  { href: "/admin/notes", label: "Notes", icon: "M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4" },
  { href: "/admin/experience", label: "Experience", icon: "M4 8h16v12H4zM9 8V5h6v3" },
  {
    href: "/admin/credentials",
    label: "Education & labs",
    icon: "M3 9l9-5 9 5-9 5zM7 11v5c3 2 7 2 10 0v-5",
  },
  {
    href: "/admin/skills",
    label: "Skills",
    icon: "M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 15.6 7 18.2l1-5.5-4-3.9 5.5-.8z",
  },
  { href: "/admin/resume", label: "Résumé", icon: "M7 3h7l4 4v14H7zM12 11v6M9 14l3 3 3-3" },
  { href: "/admin/media", label: "Media", icon: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5" },
  {
    href: "/admin/seo",
    label: "SEO & settings",
    icon: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  },
];

const THEME_KEY = "ya-admin-theme";
const COLLAPSE_KEY = "ya-admin-collapsed";

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {
    // Preference only lasts this visit.
  }
}

function useStored(key: string, fallback: string): string {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    () => readStored(key) ?? fallback,
    () => fallback,
  );
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] flex-none" fill="none">
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type AdminShellProps = {
  photo: { src: string; blurDataURL: string } | null;
  children: ReactNode;
};

// The admin frame: collapsible sidebar (a drawer on phones), a top bar with search, theme and
// the admin avatar, and the toast area. Its own light/dark mode, separate from the site's looks.
export function AdminShell({ photo, children }: AdminShellProps) {
  const pathname = usePathname();
  const theme = useStored(THEME_KEY, "light");
  const collapsed = useStored(COLLAPSE_KEY, "false") === "true";
  const [drawer, setDrawer] = useState(false);
  const desktop = useMediaQuery("(min-width: 48rem)", true);
  // Close the drawer on navigation (derived from the path, adjusted during render).
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (pathname !== drawerPath) {
    setDrawerPath(pathname);
    setDrawer(false);
  }

  const nav = (
    <nav aria-label="Admin">
      <ul className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-field px-3 text-sm font-medium transition-colors",
                  active ? "bg-c1-soft text-c1-text" : "text-muted hover:bg-fg/5 hover:text-fg",
                  collapsed && "md:justify-center md:px-0",
                )}
              >
                <NavIcon d={item.icon} />
                <span className={cn(collapsed && "md:sr-only")}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div
      data-look={theme === "dark" ? "midnight-ops" : "porcelain"}
      className="min-h-svh bg-bg font-body text-fg"
      style={{ colorScheme: theme === "dark" ? "dark" : "light" }}
    >
      <div
        className={cn(
          "grid min-h-svh md:grid-cols-[var(--sidebar)_minmax(0,1fr)]",
          collapsed ? "[--sidebar:76px]" : "[--sidebar:248px]",
        )}
      >
        {/* Sidebar (desktop) / drawer (phones). */}
        <aside
          // A closed drawer on phones is off-screen; inert keeps it out of the tab order too.
          inert={!desktop && !drawer}
          className={cn(
            "fixed inset-y-0 left-0 z-(--z-overlay) flex w-[260px] flex-col gap-6 border-r border-line bg-surface-solid p-4 transition-transform duration-300 md:sticky md:top-0 md:z-auto md:h-svh md:w-auto md:translate-x-0",
            drawer ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Link
            href="/admin"
            className={cn("flex items-center gap-3 px-1", collapsed && "md:justify-center")}
          >
            <span className="grid size-10 flex-none place-items-center rounded-xl bg-fg font-display text-sm text-bg">
              YA
            </span>
            <span className={cn("flex flex-col leading-tight", collapsed && "md:hidden")}>
              <span className="font-bold tracking-[-0.02em]">Admin</span>
              <span className="text-xs text-muted">Portfolio content</span>
            </span>
          </Link>
          <div className="min-h-0 flex-1 overflow-y-auto">{nav}</div>
          <button
            type="button"
            onClick={() => writeStored(COLLAPSE_KEY, String(!collapsed))}
            className="hidden min-h-11 items-center justify-center gap-2 rounded-field text-sm text-muted hover:bg-fg/5 hover:text-fg md:flex"
          >
            {collapsed ? "»" : "« Collapse"}
          </button>
        </aside>
        {drawer ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawer(false)}
            className="fixed inset-0 z-(--z-dropdown) bg-[#0e1220]/40 md:hidden"
          />
        ) : null}

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-(--z-header) flex items-center gap-3 border-b border-line bg-surface/85 px-4 py-3 backdrop-blur-xl md:px-8">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={drawer}
              onClick={() => setDrawer(true)}
              className="grid size-11 place-items-center rounded-field border border-line-2 md:hidden"
            >
              ☰
            </button>
            <form action="/admin/search" className="flex min-w-0 flex-1">
              <label className="sr-only" htmlFor="admin-search">
                Search content
              </label>
              <input
                id="admin-search"
                name="q"
                type="search"
                placeholder="Search projects, notes, messages, skills…"
                className="min-h-11 w-full max-w-md rounded-pill border border-line-2 bg-bg/60 px-4 text-sm outline-none focus:border-c1/70"
              />
            </form>
            <button
              type="button"
              onClick={() => writeStored(THEME_KEY, theme === "dark" ? "light" : "dark")}
              className="min-h-11 rounded-pill border border-line-2 px-3.5 text-sm text-muted hover:text-fg"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? "☀ Light" : "☾ Dark"}
            </button>
            <Link
              href="/"
              target="_blank"
              className="hidden min-h-11 items-center px-2 text-sm text-muted hover:text-fg sm:flex"
            >
              View site ↗
            </Link>
            <Link href="/admin/settings" aria-label="Your profile">
              <Avatar photo={photo} size={40} />
            </Link>
          </header>
          <main className="min-w-0 px-4 py-6 md:px-8 md:py-10">{children}</main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
