import Link from "next/link";

import { replyToMessage, setMessageLabels } from "@/app/admin/system-actions";
import { InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { inputClass } from "@/components/admin/fields";
import { ReplyForm } from "@/components/admin/ReplyForm";
import type { Prisma } from "@/generated/prisma/client";
import { dateTime } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { cn } from "@/lib/cn";
import { getDb } from "@/lib/db";
import { canEmailVisitors, emailContact } from "@/lib/email";
import { MESSAGE_TOPICS } from "@/lib/validation/message";

import { deleteMessage, setMessageFlag } from "../../actions";

export const metadata = { title: "Messages" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

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
  searchParams: Promise<{ tab?: string; label?: string }>;
}) {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const { tab: requested, label } = await searchParams;
  const tab: Tab = isTab(requested) ? requested : "inbox";
  const editable = can(admin.role, "edit");
  const canReply = canEmailVisitors();
  const contact = emailContact();
  const where: Prisma.MessageWhereInput = label
    ? { ...TABS[tab].where, labels: { has: label } }
    : TABS[tab].where;
  const [messages, counts, labelled] = await Promise.all([
    db.message.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }),
    Promise.all(
      (Object.keys(TABS) as Tab[]).map(
        async (key) => [key, await db.message.count({ where: TABS[key].where })] as const,
      ),
    ),
    db.message.findMany({ where: { labels: { isEmpty: false } }, select: { labels: true } }),
  ]);
  const allLabels = [...new Set(labelled.flatMap((row) => row.labels))].sort();
  // Replies sent from here, shown under each message as its thread.
  const replies = await db.messageReply.findMany({
    where: { messageId: { in: messages.map((message) => message.id) } },
    orderBy: { createdAt: "asc" },
  });
  const repliesFor = (id: string) => replies.filter((reply) => reply.messageId === id);
  const unread = await db.message.count({ where: { read: false, archived: false, spam: false } });

  return (
    <>
      <AdminHeader
        title="Messages"
        description={`${unread} unread in the inbox. Spam is caught by a hidden honeypot field and a rate limit on the form. Deleted messages stay in the trash for 30 days.`}
      />

      {editable && !canReply ? (
        <p className="mb-6 rounded-card border border-amber/30 bg-amber/8 px-5 py-3 text-sm">
          Replying from here needs email that can reach visitors. Add the Gmail SMTP settings (
          <code className="font-mono">SMTP_HOST</code>, <code className="font-mono">SMTP_USER</code>
          , <code className="font-mono">SMTP_PASS</code>); System health shows the steps. Until
          then, use “Open in mail app”.
        </p>
      ) : null}

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

      {allLabels.length > 0 ? (
        <nav aria-label="Labels" className="-mt-2 mb-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="label-mono text-faint">Labels</span>
          {allLabels.map((name) => {
            const active = name === label;
            const params = new URLSearchParams({
              ...(tab === "inbox" ? {} : { tab }),
              ...(active ? {} : { label: name }),
            });
            const query = params.toString();
            return (
              <Link
                key={name}
                href={query ? `/admin/messages?${query}` : "/admin/messages"}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-pill border px-3",
                  active
                    ? "border-c1 bg-c1-soft text-c1-text"
                    : "border-line-2 text-muted hover:text-fg",
                )}
              >
                {name}
              </Link>
            );
          })}
        </nav>
      ) : null}

      {messages.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          Nothing in {TABS[tab].label.toLowerCase()}
          {label ? ` with the label “${label}”` : ""}.
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
                    <span className="text-xs text-faint">{dateTime.format(message.createdAt)}</span>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-fg/90">{message.body}</p>
                {message.labels.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5" aria-label="Labels">
                    {message.labels.map((name) => (
                      <li
                        key={name}
                        className="label-mono rounded-pill bg-c1-soft px-2.5 py-1 text-c1-text"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {repliesFor(message.id).length > 0 ? (
                  <ol
                    className="flex flex-col gap-3 border-l-2 border-c1/40 pl-4"
                    aria-label="Replies sent"
                  >
                    {repliesFor(message.id).map((reply) => (
                      <li key={reply.id} className="flex flex-col gap-1">
                        <p className="flex flex-wrap items-center gap-2 text-xs text-faint">
                          <span className="label-mono text-c1-text">You replied</span>
                          {dateTime.format(reply.createdAt)} · {reply.sentBy}
                        </p>
                        <p className="text-sm font-medium text-fg">{reply.subject}</p>
                        <p className="text-sm whitespace-pre-wrap text-muted">{reply.body}</p>
                      </li>
                    ))}
                  </ol>
                ) : null}
                {editable && canReply ? (
                  <details className="group rounded-field border border-c1/40 bg-c1-soft/40">
                    <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 text-sm font-semibold text-c1-text">
                      <span aria-hidden="true">↩</span>
                      {repliesFor(message.id).length > 0 ? "Reply again" : "Reply"} as Yasir
                      Portfolio
                    </summary>
                    <div className="border-t border-line bg-surface-solid p-4">
                      <ReplyForm
                        action={replyToMessage.bind(null, message.id)}
                        name={message.name}
                        email={message.email}
                        original={{
                          body: message.body,
                          date: message.createdAt.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }),
                        }}
                        contact={contact}
                      />
                    </div>
                  </details>
                ) : null}
                {editable ? (
                  <details className="rounded-field border border-line">
                    <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-medium text-fg">
                      Labels
                    </summary>
                    <div className="flex flex-col gap-5 border-t border-line p-4">
                      <form action={setMessageLabels} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="id" value={message.id} />
                        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <span className="label-mono text-faint">Labels, comma-separated</span>
                          <input
                            name="labels"
                            defaultValue={message.labels.join(", ")}
                            placeholder="client, follow-up"
                            className={inputClass}
                          />
                        </label>
                        <button
                          type="submit"
                          className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-4 text-sm text-muted hover:text-fg"
                        >
                          Save labels
                        </button>
                      </form>
                    </div>
                  </details>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message")}`}
                    className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-4 text-sm font-medium text-muted hover:text-fg"
                  >
                    Open in mail app
                  </a>
                  {editable ? (
                    <>
                      {flag("read", "Mark read", "Mark unread")}
                      {flag("starred", "Star", "Unstar")}
                      {flag("archived", "Archive", "Unarchive")}
                      {flag("spam", "Spam", "Not spam")}
                      <InlineAction
                        action={deleteMessage}
                        label="Delete"
                        tone="danger"
                        confirm="Move this message to the trash?"
                        hidden={{ id: message.id }}
                      />
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
