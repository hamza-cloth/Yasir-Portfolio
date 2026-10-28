import Link from "next/link";

import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email";

export const metadata = { title: "Dashboard" };

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const [unread, messages, projects, notes, skills, recent] = await Promise.all([
    db.message.count({ where: { read: false } }),
    db.message.count(),
    db.project.count(),
    db.note.count(),
    db.skill.count(),
    db.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Unread messages", value: unread, href: "/admin/messages" },
    { label: "All messages", value: messages, href: "/admin/messages" },
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Notes", value: notes, href: "/admin/notes" },
    { label: "Skills", value: skills, href: "/admin/skills" },
  ];

  return (
    <>
      <AdminHeader title="Welcome back" description={`Signed in as ${admin.email}.`} />

      {!isEmailConfigured() ? (
        <p className="mb-6 rounded-card border border-amber/30 bg-amber/8 px-5 py-4 text-sm text-fg">
          Contact messages are saved here, but email alerts are off. Add{" "}
          <code className="font-mono">RESEND_API_KEY</code> and{" "}
          <code className="font-mono">CONTACT_TO_EMAIL</code> to get an email for each message.
        </p>
      ) : null}

      <ul className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link
              href={stat.href}
              className="surface flex flex-col gap-1 rounded-card border border-line p-5 transition-colors hover:border-line-2"
            >
              <span className="font-display text-3xl font-medium tracking-[-0.04em] text-fg">
                {stat.value}
              </span>
              <span className="text-sm text-muted">{stat.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent-title" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 id="recent-title" className="text-xl tracking-[-0.03em]">
            Latest messages
          </h2>
          <Link href="/admin/messages" className="text-sm text-muted hover:text-fg">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
            No messages yet. They appear here when someone uses the contact form.
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
                <p className="label-mono text-faint">{dateFormat.format(message.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
