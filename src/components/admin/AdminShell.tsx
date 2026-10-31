"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getShellData,
  markNotificationsRead,
  type NotificationItem,
  type ShellCounts,
} from "@/app/admin/system-actions";
import { LogoMark } from "@/components/brand/LogoMark";
import { Avatar } from "@/components/ui/Avatar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

import { activeItem, groupOf, NAV_GROUPS, NEW_ACTIONS, type NavItem } from "./admin-nav";
import { CommandPalette } from "./CommandPalette";
import { Toaster } from "./Toaster";

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

// Closes a popover on Esc or a click outside it.
function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) close();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, close]);
}

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const popoverClass =
  "absolute top-[calc(100%+8px)] right-0 z-(--z-dropdown) rounded-card border border-line-2 bg-surface-solid p-2 shadow-(--shadow-lift)";

const iconButtonClass =
  "relative grid size-11 flex-none place-items-center rounded-field border border-line-2 text-muted transition-colors hover:border-fg/30 hover:text-fg";

const menuItemClass =
  "flex min-h-11 items-center rounded-field px-3 text-left text-sm text-fg hover:bg-fg/5";

function Badge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="min-w-5 rounded-pill bg-c1 px-1.5 text-center text-[0.7rem] leading-5 font-bold text-on-fill">
      {value > 99 ? "99+" : value}
    </span>
  );
}

function NotificationBell({
  items,
  unread,
  onOpen,
}: {
  items: NotificationItem[];
  unread: number;
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={unread > 0 ? `Notifications, ${unread} new` : "Notifications"}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          if (!open && unread > 0) onOpen();
        }}
        className={iconButtonClass}
      >
        <NavIcon d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 21h4" />
        {unread > 0 ? (
          <span className="absolute top-2 right-2 size-2.5 rounded-full bg-c1 ring-2 ring-surface-solid" />
        ) : null}
      </button>
      {open ? (
        <div className={cn(popoverClass, "w-[min(22rem,calc(100vw-2rem))]")}>
          <p className="label-mono px-3 pt-2 pb-1 text-faint">Notifications</p>
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">You are all caught up.</p>
          ) : (
            <ul className="flex max-h-96 flex-col overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href ?? "/admin"}
                    onClick={close}
                    className="flex flex-col gap-0.5 rounded-field px-3 py-2.5 hover:bg-fg/5"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-fg">
                      {!item.read ? (
                        <span className="size-1.5 flex-none rounded-full bg-c1" />
                      ) : null}
                      {item.title}
                    </span>
                    {item.body ? (
                      <span className="line-clamp-2 text-xs text-muted">{item.body}</span>
                    ) : null}
                    <span className="text-[0.7rem] text-faint">
                      {timeFormat.format(new Date(item.createdAt))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MenuButton({
  label,
  trigger,
  className,
  children,
}: {
  label: string;
  trigger: ReactNode;
  className?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={className}
      >
        {trigger}
      </button>
      {open ? (
        <div role="menu" className={cn(popoverClass, "flex w-56 flex-col")}>
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const current = activeItem(pathname);
  const group = current ? groupOf(current) : undefined;
  const sub = current && pathname !== current.href;
  if (!current || current.href === "/admin") {
    return <p className="hidden flex-1 text-sm font-medium text-fg lg:block">Dashboard</p>;
  }
  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 lg:block">
      <ol className="flex items-center gap-2 text-sm text-muted">
        <li>{group?.label}</li>
        <li aria-hidden="true" className="text-faint">
          /
        </li>
        <li className="truncate">
          {sub ? (
            <Link href={current.href} className="hover:text-fg">
              {current.label}
            </Link>
          ) : (
            <span aria-current="page" className="font-medium text-fg">
              {current.label}
            </span>
          )}
        </li>
        {sub ? (
          <>
            <li aria-hidden="true" className="text-faint">
              /
            </li>
            <li aria-current="page" className="font-medium text-fg">
              {pathname.endsWith("/new") ? "New" : "Details"}
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

type AdminShellProps = {
  photo: { src: string; blurDataURL: string } | null;
  name: string;
  logout: () => Promise<void>;
  children: ReactNode;
};

// The admin "command center": grouped, collapsible sidebar with live counts (a drawer on
// phones), a top bar with breadcrumbs, ⌘K, "+ New", notifications, theme and the account menu.
// Its own light/dark mode, separate from the site's looks.
export function AdminShell({ photo, name, logout, children }: AdminShellProps) {
  const pathname = usePathname();
  const theme = useStored(THEME_KEY, "light");
  const collapsed = useStored(COLLAPSE_KEY, "false") === "true";
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const desktop = useMediaQuery("(min-width: 48rem)", true);
  const [counts, setCounts] = useState<ShellCounts>({ messages: 0, leads: 0, notifications: 0 });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [role, setRole] = useState("OWNER");
  const [email, setEmail] = useState("");
  // Close the drawer on navigation (derived from the path, adjusted during render).
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (pathname !== drawerPath) {
    setDrawerPath(pathname);
    setDrawer(false);
  }

  // Counts and notifications: on each navigation and every minute while the tab is visible.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (document.visibilityState !== "visible") return;
      try {
        const data = await getShellData();
        if (cancelled) return;
        setCounts(data.counts);
        setNotifications(data.notifications);
        setRole(data.role);
        setEmail(data.email);
      } catch {
        // Signed out or offline: the badges just stay as they were.
      }
    }
    void load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const canManage = role === "OWNER";
  const current = activeItem(pathname);
  const badgeValue = (item: NavItem) => (item.badge ? counts[item.badge] : 0);
  const toggleTheme = () => writeStored(THEME_KEY, theme === "dark" ? "light" : "dark");

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => item.permission !== "manage" || canManage);
        if (items.length === 0) return null;
        return (
          <div key={group.label} className="flex flex-col gap-0.5">
            <p
              className={cn(
                "label-mono px-3 pb-1 text-[0.68rem] text-faint",
                collapsed && "md:sr-only",
              )}
            >
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const active = item === current;
                const badge = badgeValue(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "relative flex min-h-10 items-center gap-3 rounded-field px-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-c1-soft text-c1-text"
                          : "text-muted hover:bg-fg/5 hover:text-fg",
                        collapsed && "md:justify-center md:px-0",
                      )}
                    >
                      <NavIcon d={item.icon} />
                      <span className={cn("truncate", collapsed && "md:sr-only")}>
                        {item.label}
                        {badge > 0 ? <span className="sr-only">, {badge} new</span> : null}
                      </span>
                      {badge > 0 ? (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "ml-auto",
                            collapsed && "md:absolute md:top-1 md:right-1 md:ml-0",
                          )}
                        >
                          <Badge value={badge} />
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div
      data-look={theme === "dark" ? "midnight-ink" : "porcelain"}
      className="min-h-svh bg-bg font-body text-fg"
      style={{ colorScheme: theme === "dark" ? "dark" : "light" }}
    >
      <div
        className={cn(
          "grid min-h-svh md:grid-cols-[var(--sidebar)_minmax(0,1fr)]",
          collapsed ? "[--sidebar:72px]" : "[--sidebar:264px]",
        )}
      >
        {/* Sidebar (desktop) / drawer (phones). */}
        <aside
          // A closed drawer on phones is off-screen; inert keeps it out of the tab order too.
          inert={!desktop && !drawer}
          className={cn(
            "fixed inset-y-0 left-0 z-(--z-overlay) flex w-[280px] flex-col gap-5 border-r border-line bg-surface-solid p-3 transition-transform duration-300 md:sticky md:top-0 md:z-auto md:h-svh md:w-auto md:translate-x-0 print:hidden",
            drawer ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-2 pt-1",
              collapsed && "md:justify-center md:px-0",
            )}
          >
            <span className="grid size-10 flex-none place-items-center rounded-xl border border-line bg-bg text-fg">
              <LogoMark className="h-6" />
            </span>
            <span className={cn("flex flex-col leading-tight", collapsed && "md:hidden")}>
              <span className="font-bold tracking-[-0.02em]">Command Center</span>
              <span className="text-xs text-muted">Portfolio admin</span>
            </span>
          </Link>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">{nav}</div>
          <div
            className={cn(
              "flex flex-col gap-1 border-t border-line pt-3",
              collapsed && "md:items-center",
            )}
          >
            <Link
              href="/admin/settings"
              className={cn(
                "flex items-center gap-3 rounded-field p-2 hover:bg-fg/5",
                collapsed && "md:justify-center md:p-1",
              )}
            >
              <Avatar photo={photo} size={36} />
              <span className={cn("flex min-w-0 flex-col leading-tight", collapsed && "md:hidden")}>
                <span className="truncate text-sm font-semibold">{name}</span>
                <span className="truncate text-xs text-muted">{email || "Signed in"}</span>
              </span>
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener"
              title={collapsed ? "View live site" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-field px-3 text-sm text-muted hover:bg-fg/5 hover:text-fg",
                collapsed && "md:justify-center md:px-0",
              )}
            >
              <NavIcon d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />
              <span className={cn(collapsed && "md:sr-only")}>View live site</span>
            </a>
            <button
              type="button"
              onClick={() => writeStored(COLLAPSE_KEY, String(!collapsed))}
              aria-label={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
              className="hidden min-h-10 items-center justify-center gap-2 rounded-field text-sm text-muted hover:bg-fg/5 hover:text-fg md:flex"
            >
              {collapsed ? "»" : "« Collapse"}
            </button>
          </div>
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
          <header className="sticky top-0 z-(--z-header) flex h-16 items-center gap-2 border-b border-line bg-surface/85 px-3 backdrop-blur-xl sm:gap-3 md:px-6 print:hidden">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={drawer}
              onClick={() => setDrawer(true)}
              className={cn(iconButtonClass, "md:hidden")}
            >
              ☰
            </button>
            <Breadcrumbs pathname={pathname} />
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-pill border border-line-2 bg-bg/60 px-4 text-sm text-faint hover:border-fg/30 lg:max-w-xs"
            >
              <NavIcon d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" />
              <span className="truncate">Search or jump to…</span>
              <kbd className="label-mono ml-auto hidden rounded border border-line-2 px-1.5 text-[0.68rem] sm:inline">
                Ctrl K
              </kbd>
            </button>
            {role !== "VIEWER" ? (
              <MenuButton
                label="Create new"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-pill bg-fg px-4 text-sm font-semibold text-bg hover:bg-fg/90"
                trigger={
                  <>
                    <span aria-hidden="true">+</span>
                    <span className="hidden sm:inline">New</span>
                  </>
                }
              >
                {(close) =>
                  NEW_ACTIONS.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      role="menuitem"
                      onClick={close}
                      className={menuItemClass}
                    >
                      {action.label}
                    </Link>
                  ))
                }
              </MenuButton>
            ) : null}
            <NotificationBell
              items={notifications}
              unread={counts.notifications}
              onOpen={() => {
                setCounts((value) => ({ ...value, notifications: 0 }));
                void markNotificationsRead().catch(() => undefined);
              }}
            />
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(iconButtonClass, "hidden sm:grid")}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <MenuButton
              label="Account menu"
              className="flex-none rounded-full"
              trigger={<Avatar photo={photo} size={40} />}
            >
              {(close) => (
                <>
                  <p className="truncate px-3 pt-2 pb-1 text-xs text-muted">{email}</p>
                  <Link
                    href="/admin/settings"
                    role="menuitem"
                    onClick={close}
                    className={menuItemClass}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/admin/security"
                    role="menuitem"
                    onClick={close}
                    className={menuItemClass}
                  >
                    Security & sessions
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={toggleTheme}
                    className={cn(menuItemClass, "sm:hidden")}
                  >
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </button>
                  <form action={logout}>
                    <button
                      type="submit"
                      role="menuitem"
                      className={cn(menuItemClass, "w-full text-red")}
                    >
                      Sign out
                    </button>
                  </form>
                </>
              )}
            </MenuButton>
          </header>
          <main className="min-w-0 px-4 py-6 md:px-8 md:py-10">{children}</main>
        </div>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} canManage={canManage} />
      <Toaster />
    </div>
  );
}
