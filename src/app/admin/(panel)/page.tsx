import Link from "next/link";

import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email";
import { isBlobConfigured } from "@/lib/media";

export const metadata = { title: "Dashboard" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const QUICK_ACTIONS = [
  { href: "/admin/projects/new", label: "New project" },
  { href: "/admin/notes/new", label: "New note" },
  { href: "/admin/settings", label: "Change photo" },
  { href: "/admin/looks", label: "Home looks" },
  { href: "/admin/resume", label: "Upload résumé" },
];

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 6);
  since.setUTCHours(0, 0, 0, 0);

  const [unread, total, recent, activity, views] = await Promise.all([
    db.message.count({ where: { read: false, archived: false, spam: false } }),
    db.message.count({ where: { spam: false } }),
    db.message.findMany({
      where: { spam: false, archived: false },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.pageView.findMany({
      where: { day: { gte: since } },
      select: { day: true, path: true, count: true },
    }),
  ]);

  const viewsTotal = views.reduce((sum, row) => sum + row.count, 0);
  const byPath = new Map<string, number>();
  const byDay = new Map<string, number>();
  for (const row of views) {
    byPath.set(row.path, (byPath.get(row.path) ?? 0) + row.count);
    const day = row.day.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + row.count);
  }
  const topPages = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { key, count: byDay.get(key) ?? 0 };
  });
  const peak = Math.max(1, ...days.map((day) => day.count));

  return (
    <>
      <AdminHeader title="Welcome back" description={`Signed in as ${admin.email}.`} />

      {!isEmailConfigured() || !isBlobConfigured() ? (
        <ul className="mb-6 flex flex-col gap-2">
          {!isEmailConfigured() ? (
            <li className="rounded-card border border-amber/30 bg-amber/8 px-5 py-3 text-sm">
              Email alerts are off: add <code className="font-mono">RESEND_API_KEY</code> to get an
              email for each message. Messages are saved here either way.
            </li>
          ) : null}
          {!isBlobConfigured() ? (
            <li className="rounded-card border border-amber/30 bg-amber/8 px-5 py-3 text-sm">
              Uploads are off: <code className="font-mono">BLOB_READ_WRITE_TOKEN</code> is missing.
            </li>
          ) : null}
        </ul>
      ) : null}

      <ul className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "New messages", value: unread, href: "/admin/messages" },
          { label: "All messages", value: total, href: "/admin/messages" },
          { label: "Page views · 7 days", value: viewsTotal, href: "#views" },
          { label: "Pages viewed", value: byPath.size, href: "#views" },
        ].map((stat) => (
          <li key={stat.label}>
            <Link
              href={stat.href}
              className="surface flex flex-col gap-1 rounded-card border border-line p-5 transition-colors hover:border-line-2"
            >
              <span className="font-display text-3xl text-fg">{stat.value}</span>
              <span className="text-sm text-muted">{stat.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-label="Quick actions" className="mb-10 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="inline-flex min-h-11 items-center rounded-pill border border-line-2 bg-surface-solid px-4 text-sm font-semibold hover:border-c1"
          >
            + {action.label}
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section
          id="views"
          aria-labelledby="views-title"
          className="surface flex flex-col gap-5 rounded-card border border-line p-5"
        >
          <h2 id="views-title" className="text-lg tracking-[-0.02em]">
            Page views, last 7 days
          </h2>
          <ol className="flex h-32 items-end gap-2" aria-label="Views per day">
            {days.map((day) => (
              <li key={day.key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs text-muted">{day.count}</span>
                <span
                  className="w-full rounded-t-md bg-c1"
                  style={{ height: `${Math.max(4, (day.count / peak) * 88)}px` }}
                />
                <span className="text-xs text-faint">{day.key.slice(8)}</span>
              </li>
            ))}
          </ol>
          <ul className="flex flex-col divide-y divide-line text-sm">
            {topPages.length === 0 ? (
              <li className="py-2 text-muted">No views recorded yet.</li>
            ) : (
              topPages.map(([path, count]) => (
                <li key={path} className="flex justify-between gap-3 py-2">
                  <span className="truncate font-mono">{path}</span>
                  <span className="text-muted">{count}</span>
                </li>
              ))
            )}
          </ul>
          <p className="text-xs text-faint">
            Counted per page and day only. No cookies, IPs or trackers.
          </p>
        </section>

        <section
          aria-labelledby="activity-title"
          className="surface flex flex-col gap-4 rounded-card border border-line p-5"
        >
          <h2 id="activity-title" className="text-lg tracking-[-0.02em]">
            Latest activity
          </h2>
          {activity.length === 0 ? (
            <p className="text-sm text-muted">Nothing yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line text-sm">
              {activity.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-0.5 py-2.5">
                  <span>
                    <span className="label-mono mr-2 text-c1-text">{entry.action}</span>
                    {entry.entity} · {entry.summary}
                  </span>
                  <span className="text-xs text-faint">
                    {entry.actor} · {dateFormat.format(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="recent-title" className="mt-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 id="recent-title" className="text-lg tracking-[-0.02em]">
            Latest messages
          </h2>
          <Link href="/admin/messages" className="text-sm text-muted hover:text-fg">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
            No messages yet.
          </p>
        ) : (
          <ul className="surface divide-y divide-line rounded-card border border-line">
            {recent.map((message) => (
              <li key={message.id} className="flex flex-col gap-1 px-5 py-4">
                <p className="flex flex-wrap items-center gap-2 font-medium text-fg">
                  {!message.read ? (
                    <span aria-label="Unread" className="size-2 rounded-full bg-c1" />
                  ) : null}
                  {message.name}
                  <span className="text-sm font-normal text-muted">· {message.email}</span>
                </p>
                <p className="line-clamp-2 text-sm text-muted">{message.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
