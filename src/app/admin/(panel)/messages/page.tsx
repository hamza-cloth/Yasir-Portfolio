import Link from "next/link";

import { InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { getDb } from "@/lib/db";
import { MESSAGE_TOPICS } from "@/lib/validation/message";

import { deleteMessage, setMessageFlag } from "../../actions";

export const metadata = { title: "Messages" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const TABS = {
  inbox: { label: "Inbox", where: { archived: false, spam: false } },
  starred: { label: "Starred", where: { starred: true, spam: false } },
  archived: { label: "Archived", where: { archived: true, spam: false } },
  spam: { label: "Spam", where: { spam: true } },
} satisfies Record<string, { label: string; where: Prisma.MessageWhereInput }>;

type Tab = keyof typeof TABS;

function isTab(value: unknown): value is Tab {
  return typeof value === "string" && value in TABS;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const requested = (await searchParams).tab;
  const tab: Tab = isTab(requested) ? requested : "inbox";
  const [messages, counts] = await Promise.all([
    db.message.findMany({ where: TABS[tab].where, orderBy: { createdAt: "desc" }, take: 200 }),
    Promise.all(
      (Object.keys(TABS) as Tab[]).map(
        async (key) => [key, await db.message.count({ where: TABS[key].where })] as const,
      ),
    ),
  ]);
  const unread = await db.message.count({ where: { read: false, archived: false, spam: false } });

  return (
    <>
      <AdminHeader
        title="Messages"
        description={`${unread} unread in the inbox. Spam is caught by a hidden honeypot field and a rate limit on the form.`}
      />

      <nav aria-label="Message folders" className="mb-6 flex flex-wrap gap-2">
        {counts.map(([key, count]) => (
          <Link
            key={key}
            href={key === "inbox" ? "/admin/messages" : `/admin/messages?tab=${key}`}
            aria-current={key === tab ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 text-sm font-medium",
              key === tab
                ? "border-c1 bg-c1-soft text-c1-text"
                : "border-line-2 text-muted hover:text-fg",
            )}
          >
            {TABS[key].label}
            <span className="label-mono">{count}</span>
          </Link>
        ))}
      </nav>

      {messages.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          Nothing in {TABS[tab].label.toLowerCase()}.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => {
            const flag = (
              name: "read" | "starred" | "archived" | "spam",
              on: string,
              off: string,
            ) => (
              <InlineAction
                action={setMessageFlag}
                label={message[name] ? off : on}
                hidden={{ id: message.id, flag: name, value: String(!message[name]) }}
              />
            );
            return (
              <li
                key={message.id}
                className={cn(
                  "surface flex flex-col gap-3 rounded-card border p-5",
                  message.read ? "border-line" : "border-c1/40",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <p className="flex items-center gap-2 font-semibold text-fg">
                      {message.starred ? <span aria-label="Starred">★</span> : null}
                      {!message.read ? (
                        <span aria-label="Unread" className="size-2 rounded-full bg-c1" />
                      ) : null}
                      {message.name}
                    </p>
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message")}`}
                      className="text-sm [overflow-wrap:anywhere] text-c1-text hover:underline"
                    >
                      {message.email}
                    </a>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className="label-mono text-muted">{MESSAGE_TOPICS[message.topic]}</span>
                    <span className="text-xs text-faint">
                      {dateFormat.format(message.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-fg/90">{message.body}</p>
                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message")}`}
                    className="inline-flex min-h-11 items-center rounded-pill bg-fg px-4 text-sm font-medium text-bg"
                  >
                    Reply
                  </a>
                  {flag("read", "Mark read", "Mark unread")}
                  {flag("starred", "Star", "Unstar")}
                  {flag("archived", "Archive", "Unarchive")}
                  {flag("spam", "Spam", "Not spam")}
                  <InlineAction
                    action={deleteMessage}
                    label="Delete"
                    tone="danger"
                    confirm="Delete this message for good?"
                    hidden={{ id: message.id }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
