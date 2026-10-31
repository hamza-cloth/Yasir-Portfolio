import Link from "next/link";

import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import type { PrismaClient } from "@/generated/prisma/client";
import { dateTime } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { TRASH_DAYS } from "@/lib/admin/trash";
import { isTwoFactorAvailable } from "@/lib/auth/totp";
import { cn } from "@/lib/cn";
import { getSiteConfig } from "@/lib/data/site-config";
import { getDb } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email";
import { isBlobConfigured } from "@/lib/media";

export const metadata = { title: "System health" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

type Check = { label: string; ok: boolean; detail: string };

function CheckRow({ check }: { check: Check }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span
        aria-hidden="true"
        className={cn("mt-1.5 size-2.5 flex-none rounded-full", check.ok ? "bg-ok" : "bg-amber")}
      />
      <div className="min-w-0">
        <p className="font-medium text-fg">
          {check.label}{" "}
          <span className="sr-only">{check.ok ? "(working)" : "(needs attention)"}</span>
        </p>
        <p className="text-sm text-muted">{check.detail}</p>
      </div>
    </li>
  );
}

// One round trip to the database, timed.
async function pingDatabase(db: PrismaClient): Promise<{ reachable: boolean; latency: number }> {
  const started = performance.now();
  const reachable = await db.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  return { reachable, latency: Math.round(performance.now() - started) };
}

export default async function HealthPage() {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const { reachable, latency } = await pingDatabase(db);

  // A health page must still load when the database is struggling, so failures read as "unknown".
  const [counts, maintenance, lastBackup] = await Promise.all([
    reachable
      ? Promise.all([
          db.project.count(),
          db.note.count(),
          db.message.count(),
          db.lead.count(),
          db.subscriber.count(),
          db.mediaAsset.count(),
          db.trashItem.count(),
          db.auditLog.count(),
        ]).catch(() => null)
      : null,
    getSiteConfig("maintenance"),
    reachable
      ? db.auditLog
          .findFirst({ where: { entity: "backup" }, orderBy: { createdAt: "desc" } })
          .catch(() => null)
      : null,
  ]);

  const checks: Check[] = [
    {
      label: "Database",
      ok: reachable,
      detail: reachable
        ? `Connected, answered in ${latency} ms.`
        : "Not reachable. Check DATABASE_URL.",
    },
    {
      label: "Email (Resend)",
      ok: isEmailConfigured(),
      detail: isEmailConfigured()
        ? "Alerts, replies, invitations and password resets can be sent."
        : "RESEND_API_KEY or CONTACT_TO_EMAIL is missing: no alerts, replies, invitations or reset emails.",
    },
    {
      label: "Uploads (Vercel Blob)",
      ok: isBlobConfigured(),
      detail: isBlobConfigured()
        ? "Photos, covers and résumés can be uploaded."
        : "BLOB_READ_WRITE_TOKEN is missing.",
    },
    {
      label: "Two-factor sign-in",
      ok: isTwoFactorAvailable(),
      detail: isTwoFactorAvailable()
        ? "Available under Users & security."
        : "ADMIN_ENCRYPTION_KEY is missing.",
    },
    {
      label: "Visitor privacy salt",
      ok: Boolean(process.env.IP_HASH_SALT),
      detail: process.env.IP_HASH_SALT
        ? "Visitor IPs are hashed with a secret salt."
        : "IP_HASH_SALT is missing, so IP hashes are easier to reverse.",
    },
    {
      label: "Site address",
      ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      detail: process.env.NEXT_PUBLIC_SITE_URL
        ? `Links in emails point to ${process.env.NEXT_PUBLIC_SITE_URL}.`
        : "NEXT_PUBLIC_SITE_URL is missing, so links in emails point to localhost.",
    },
    {
      label: "Maintenance mode",
      ok: !maintenance.enabled,
      detail: maintenance.enabled
        ? "On: visitors see the maintenance page."
        : "Off: the site is open.",
    },
  ];

  const tables = counts
    ? ([
        ["Projects", counts[0]],
        ["Notes", counts[1]],
        ["Messages", counts[2]],
        ["Leads", counts[3]],
        ["Subscribers", counts[4]],
        ["Media files", counts[5]],
        [`Trash (kept ${TRASH_DAYS} days)`, counts[6]],
        ["Activity entries", counts[7]],
      ] as const)
    : [];
  const linkClass =
    "inline-flex min-h-11 items-center rounded-pill border border-line-2 px-4 text-sm font-medium text-muted hover:border-c1 hover:text-fg";

  return (
    <>
      <AdminHeader
        title="System health"
        description="What is configured, what is missing, and your data to take away."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="surface rounded-card border border-line p-5">
          <h2 className="text-lg tracking-[-0.02em]">Checks</h2>
          <ul className="divide-y divide-line">
            {checks.map((check) => (
              <CheckRow key={check.label} check={check} />
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-6">
          <section className="surface flex flex-col gap-3 rounded-card border border-line p-5">
            <h2 className="text-lg tracking-[-0.02em]">Exports</h2>
            <p className="text-sm text-muted">
              Spreadsheets (CSV) that open in Excel or Google Sheets.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="/api/admin/export?type=leads" className={linkClass}>
                Leads
              </a>
              <a href="/api/admin/export?type=messages" className={linkClass}>
                Messages
              </a>
              <a href="/api/admin/export?type=subscribers" className={linkClass}>
                Subscribers
              </a>
            </div>
          </section>

          {can(admin.role, "manage") ? (
            <section className="surface flex flex-col gap-3 rounded-card border border-line p-5">
              <h2 className="text-lg tracking-[-0.02em]">Backup</h2>
              <p className="text-sm text-muted">
                Everything you wrote, in one JSON file: settings, projects, notes, credentials,
                messages, leads, clients and invoices. Uploaded files stay in Vercel Blob.
                {lastBackup
                  ? ` Last downloaded ${dateTime.format(lastBackup.createdAt)}.`
                  : " Never downloaded yet."}
              </p>
              <a href="/api/admin/export?type=backup" className={cn(linkClass, "self-start")}>
                Download backup
              </a>
            </section>
          ) : null}

          <section className="surface flex flex-col gap-3 rounded-card border border-line p-5">
            <h2 className="text-lg tracking-[-0.02em]">Stored</h2>
            {tables.length === 0 ? (
              <p className="text-sm text-muted">The counts could not be read right now.</p>
            ) : (
              <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm">
                {tables.map(([label, count]) => (
                  <div key={label} className="contents">
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-mono text-fg">{count}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Link href="/admin/trash" className="text-sm text-c1-text hover:underline">
              Open the trash
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
