import Link from "next/link";

import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { pageAdmin } from "@/lib/admin/guard";
import { cn } from "@/lib/cn";
import { getDb } from "@/lib/db";

export const metadata = { title: "Analytics" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

const RANGES = { "7": "7 days", "30": "30 days", "90": "90 days" } as const;
type Range = keyof typeof RANGES;

const countries = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(code: string): string {
  if (code === "unknown") return "Unknown";
  try {
    return countries.of(code) ?? code;
  } catch {
    return code;
  }
}

function startOfDay(daysAgo: number): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
}

function percentChange(now: number, before: number): string | null {
  if (before === 0) return null;
  const change = Math.round(((now - before) / before) * 100);
  return `${change > 0 ? "+" : ""}${change}%`;
}

function Breakdown({
  title,
  rows,
  total,
}: {
  title: string;
  rows: [string, number][];
  total: number;
}) {
  return (
    <section className="surface flex flex-col gap-4 rounded-card border border-line p-5">
      <h2 className="text-lg tracking-[-0.02em]">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Nothing recorded in this range yet.</p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm">
          {rows.map(([label, count]) => (
            <li key={label} className="relative overflow-hidden rounded-field px-3 py-2">
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 bg-c1-soft"
                style={{ width: `${Math.max(2, (count / Math.max(1, total)) * 100)}%` }}
              />
              <span className="relative flex justify-between gap-3">
                <span className="truncate text-fg">{label}</span>
                <span className="font-mono text-muted">{count}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const requested = (await searchParams).range;
  const range: Range = requested && requested in RANGES ? (requested as Range) : "30";
  const length = Number(range);
  const since = startOfDay(length - 1);
  const previous = startOfDay(length * 2 - 1);

  const [views, stats, previousViews, previousVisitors] = await Promise.all([
    db.pageView.findMany({
      where: { day: { gte: since } },
      select: { day: true, path: true, count: true },
    }),
    db.statDay.findMany({ where: { day: { gte: since } } }),
    db.pageView.aggregate({ where: { day: { gte: previous, lt: since } }, _sum: { count: true } }),
    db.statDay.aggregate({
      where: { day: { gte: previous, lt: since }, kind: "visitors" },
      _sum: { count: true },
    }),
  ]);

  const byDay = new Map<string, { views: number; visitors: number }>();
  const byPath = new Map<string, number>();
  for (const row of views) {
    const key = row.day.toISOString().slice(0, 10);
    const entry = byDay.get(key) ?? { views: 0, visitors: 0 };
    entry.views += row.count;
    byDay.set(key, entry);
    byPath.set(row.path, (byPath.get(row.path) ?? 0) + row.count);
  }
  const byKind = new Map<string, Map<string, number>>();
  for (const row of stats) {
    if (row.kind === "visitors") {
      const key = row.day.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? { views: 0, visitors: 0 };
      entry.visitors += row.count;
      byDay.set(key, entry);
      continue;
    }
    const bucket = byKind.get(row.kind) ?? new Map<string, number>();
    bucket.set(row.value, (bucket.get(row.value) ?? 0) + row.count);
    byKind.set(row.kind, bucket);
  }
  const sorted = (kind: string, label: (value: string) => string = (value) => value) =>
    [...(byKind.get(kind) ?? new Map<string, number>()).entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => [label(value), count] as [string, number]);

  const days = Array.from({ length }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { key, ...(byDay.get(key) ?? { views: 0, visitors: 0 }) };
  });
  const totalViews = days.reduce((sum, day) => sum + day.views, 0);
  const totalVisitors = days.reduce((sum, day) => sum + day.visitors, 0);
  const peak = Math.max(1, ...days.map((day) => day.views));
  const viewsChange = percentChange(totalViews, previousViews._sum.count ?? 0);
  const visitorsChange = percentChange(totalVisitors, previousVisitors._sum.count ?? 0);
  const topPages = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <>
      <AdminHeader
        title="Analytics"
        description="Cookie-less and private: page views per day, and each visitor's first view of the day by source, device and country. Visitors are counted from the day this was switched on; crawlers and Do Not Track are skipped."
      />
      <nav aria-label="Date range" className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(RANGES) as Range[]).map((key) => (
          <Link
            key={key}
            href={`/admin/analytics?range=${key}`}
            aria-current={key === range ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-pill border px-4 text-sm font-medium",
              key === range
                ? "border-c1 bg-c1-soft text-c1-text"
                : "border-line-2 text-muted hover:text-fg",
            )}
          >
            {RANGES[key]}
          </Link>
        ))}
      </nav>

      <ul className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Page views", value: totalViews, change: viewsChange },
          { label: "Visitors", value: totalVisitors, change: visitorsChange },
          {
            label: "Views per visitor",
            value: totalVisitors ? (totalViews / totalVisitors).toFixed(1) : "—",
            change: null,
          },
          { label: "Pages viewed", value: byPath.size, change: null },
        ].map((stat) => (
          <li
            key={stat.label}
            className="surface flex flex-col gap-1 rounded-card border border-line p-5"
          >
            <span className="font-display text-3xl text-fg">{stat.value}</span>
            <span className="text-sm text-muted">
              {stat.label}
              {stat.change ? (
                <span
                  className={cn(
                    "ml-2 font-mono",
                    stat.change.startsWith("-") ? "text-red" : "text-ok",
                  )}
                >
                  {stat.change}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <p className="-mt-3 mb-6 text-xs text-faint">
        Change compared with the {RANGES[range]} before.
      </p>

      <section className="surface mb-6 flex flex-col gap-4 rounded-card border border-line p-5">
        <h2 className="text-lg tracking-[-0.02em]">Views per day</h2>
        <ol className="flex h-40 items-end gap-px" aria-label="Page views and visitors per day">
          {days.map((day) => (
            <li
              key={day.key}
              className="group relative flex h-full flex-1 flex-col justify-end"
              title={`${day.key}: ${day.views} views, ${day.visitors} visitors`}
            >
              <span className="sr-only">
                {day.key}: {day.views} views, {day.visitors} visitors
              </span>
              <span
                aria-hidden="true"
                className="w-full rounded-t-sm bg-c1/70 group-hover:bg-c1"
                style={{ height: `${Math.max(2, (day.views / peak) * 100)}%` }}
              />
            </li>
          ))}
        </ol>
        <div className="flex justify-between text-xs text-faint">
          <span>{days[0]?.key}</span>
          <span>{days.at(-1)?.key}</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Breakdown title="Top pages" rows={topPages} total={topPages[0]?.[1] ?? 1} />
        <Breakdown title="Sources" rows={sorted("referrer")} total={totalVisitors} />
        <Breakdown title="Devices" rows={sorted("device")} total={totalVisitors} />
        <Breakdown title="Countries" rows={sorted("country", countryName)} total={totalVisitors} />
      </div>
    </>
  );
}
