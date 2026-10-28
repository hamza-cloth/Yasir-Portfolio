import { InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { MESSAGE_TOPICS } from "@/lib/validation/message";

import { deleteMessage, setMessageRead } from "../../actions";

export const metadata = { title: "Messages" };

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default async function MessagesPage() {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const messages = await db.message.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const unread = messages.filter((message) => !message.read).length;

  return (
    <>
      <AdminHeader
        title="Messages"
        description={`${messages.length} messages from the contact form, ${unread} unread.`}
      />
      {messages.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          No messages yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <li
              key={message.id}
              className={
                "surface flex flex-col gap-3 rounded-card border p-5 " +
                (message.read ? "border-line" : "border-c1/40")
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <p className="flex items-center gap-2 font-medium text-fg">
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
                  <span className="text-xs text-faint">{dateFormat.format(message.createdAt)}</span>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-fg/90">{message.body}</p>
              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message")}`}
                  className="inline-flex min-h-9 items-center rounded-pill bg-fg px-3.5 text-sm font-medium text-bg"
                >
                  Reply
                </a>
                <InlineAction
                  action={setMessageRead}
                  label={message.read ? "Mark unread" : "Mark read"}
                  hidden={{ id: message.id, read: String(!message.read) }}
                />
                <InlineAction
                  action={deleteMessage}
                  label="Delete"
                  tone="danger"
                  confirm="Delete this message for good?"
                  hidden={{ id: message.id }}
                />
                {!message.emailSent ? (
                  <span className="ml-auto text-xs text-faint">No email alert was sent</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
