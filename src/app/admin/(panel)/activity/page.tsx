import Link from "next/link";

import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import type { Prisma } from "@/generated/prisma/client";
import { diffSnapshots } from "@/lib/admin/diff";
import { dateTime } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { cn } from "@/lib/cn";
import { getDb } from "@/lib/db";

export const metadata = { title: "Activity log" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

const PAGE_SIZE = 50;
const ACTIONS = ["create", "update", "delete", "restore", "upload", "login", "logout", "security"];

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; action?: string; actor?: string; page?: string }>;
}) {
  await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const where: Prisma.AuditLogWhereInput = {
    ...(params.entity ? { entity: params.entity } : {}),
    ...(params.action ? { action: params.action } : {}),
    ...(params.actor ? { actor: params.actor } : {}),
  };
  const [entries, total, entities, actors] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      distinct: ["entity"],
      select: { entity: true },
      orderBy: { entity: "asc" },
    }),
    db.auditLog.findMany({
      distinct: ["actor"],
      select: { actor: true },
      orderBy: { actor: "asc" },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (next: Record<string, string | undefined>) => {
    const query = new URLSearchParams(
      Object.entries({ ...params, ...next }).filter((entry): entry is [string, string] =>
        Boolean(entry[1]),
      ),
    );
    const text = query.toString();
    return text ? `/admin/activity?${text}` : "/admin/activity";
  };
  const selectClass = "min-h-11 rounded-field border border-line-2 bg-bg/60 px-3 text-sm";

  return (
    <>
      <AdminHeader
        title="Activity log"
        description={`Every change, upload and sign-in, newest first. ${total} entries${params.entity || params.action || params.actor ? " match" : ""}.`}
      />
      <form className="mb-6 flex flex-wrap items-end gap-3" action="/admin/activity">
        <label className="flex flex-col gap-1">
          <span className="label-mono text-faint">What</span>
          <select name="entity" defaultValue={params.entity ?? ""} className={selectClass}>
            <option value="">Everything</option>
            {entities.map((row) => (
              <option key={row.entity} value={row.entity}>
                {row.entity}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-mono text-faint">Action</span>
          <select name="action" defaultValue={params.action ?? ""} className={selectClass}>
            <option value="">Any</option>
            {ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-mono text-faint">Who</span>
          <select name="actor" defaultValue={params.actor ?? ""} className={selectClass}>
            <option value="">Anyone</option>
            {actors.map((row) => (
              <option key={row.actor} value={row.actor}>
                {row.actor}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-pill bg-fg px-5 text-sm font-semibold text-bg"
        >
          Filter
        </button>
        {params.entity || params.action || params.actor ? (
          <Link
            href="/admin/activity"
            className="min-h-11 content-center text-sm text-muted hover:text-fg"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {entries.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          Nothing recorded yet.
        </p>
      ) : (
        <ol className="surface divide-y divide-line rounded-card border border-line">
          {entries.map((entry) => {
            const changes = diffSnapshots(entry.before, entry.after);
            return (
              <li key={entry.id} className="flex flex-col gap-1 px-5 py-3.5">
                <p className="text-sm">
                  <span
                    className={cn(
                      "label-mono mr-2",
                      entry.action === "delete" ? "text-red" : "text-c1-text",
                    )}
                  >
                    {entry.action}
                  </span>
                  <span className="text-muted">{entry.entity}</span> · {entry.summary}
                </p>
                <p className="text-xs text-faint">
                  {entry.actor} · {dateTime.format(entry.createdAt)}
                </p>
                {changes.length > 0 ? (
                  <details className="mt-1 text-xs">
                    <summary className="cursor-pointer text-muted hover:text-fg">
                      {changes.length} field{changes.length === 1 ? "" : "s"} changed
                    </summary>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full min-w-[32rem] text-left">
                        <thead className="text-faint">
                          <tr>
                            <th scope="col" className="py-1 pr-3 font-normal">
                              Field
                            </th>
                            <th scope="col" className="py-1 pr-3 font-normal">
                              Before
                            </th>
                            <th scope="col" className="py-1 font-normal">
                              After
                            </th>
                          </tr>
                        </thead>
                        <tbody className="align-top">
                          {changes.map((change) => (
                            <tr key={change.field}>
                              <td className="py-1 pr-3 font-mono">{change.field}</td>
                              <td className="py-1 pr-3 break-words text-red/90">{change.before}</td>
                              <td className="py-1 break-words text-ok">{change.after}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}

      {pages > 1 ? (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={link({ page: String(page - 1) })} className="text-muted hover:text-fg">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-faint">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={link({ page: String(page + 1) })} className="text-muted hover:text-fg">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  );
}
