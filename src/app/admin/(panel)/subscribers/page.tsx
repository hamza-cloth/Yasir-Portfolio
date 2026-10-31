import { deleteSubscriber } from "@/app/admin/system-actions";
import { InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { dateOnly } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { cn } from "@/lib/cn";
import { getDb } from "@/lib/db";

export const metadata = { title: "Subscribers" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: "border-ok/30 text-ok",
  PENDING: "border-amber/40 text-amber",
  UNSUBSCRIBED: "border-line-2 text-faint",
};

export default async function SubscribersPage() {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  const confirmed = subscribers.filter((item) => item.status === "CONFIRMED").length;
  const editable = can(admin.role, "edit");

  return (
    <>
      <AdminHeader
        title="Subscribers"
        description={`${confirmed} confirmed of ${subscribers.length}. People sign up in the site footer and confirm from an email, so only confirmed addresses should get the newsletter.`}
      />
      <div className="mb-4 flex justify-end">
        <a
          href="/api/admin/export?type=subscribers"
          className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-4 text-sm text-muted hover:text-fg"
        >
          Download CSV
        </a>
      </div>
      {subscribers.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          No subscribers yet. The sign-up form is in the footer of every page.
        </p>
      ) : (
        <ul className="surface divide-y divide-line rounded-card border border-line">
          {subscribers.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="[overflow-wrap:anywhere] text-fg">{item.email}</p>
                <p className="text-xs text-faint">
                  Signed up {dateOnly.format(item.createdAt)}
                  {item.confirmedAt ? ` · confirmed ${dateOnly.format(item.confirmedAt)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "label-mono rounded-pill border px-2.5 py-1",
                    STATUS_STYLE[item.status],
                  )}
                >
                  {item.status.toLowerCase()}
                </span>
                {editable ? (
                  <InlineAction
                    action={deleteSubscriber}
                    hidden={{ id: item.id }}
                    label="Delete"
                    tone="danger"
                    confirm={`Delete ${item.email} from the list?`}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
