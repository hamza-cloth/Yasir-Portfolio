import { deleteForever, emptyTrash, restoreFromTrash } from "@/app/admin/system-actions";
import { InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { dateTime } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { purgeExpiredTrash, TRASH_DAYS, trashDaysLeft } from "@/lib/admin/trash";
import { getDb } from "@/lib/db";

export const metadata = { title: "Trash" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function TrashPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  // Anything past its 30 days is purged whenever the trash is opened.
  await purgeExpiredTrash(db);
  const items = await db.trashItem.findMany({ orderBy: { deletedAt: "desc" } });
  const { error } = await searchParams;
  const canEdit = can(admin.role, "edit");
  const canManage = can(admin.role, "manage");

  return (
    <>
      <AdminHeader
        title="Trash"
        description={`Deleted projects, notes, experience, credentials, skills, messages, leads, testimonials and clients stay here for ${TRASH_DAYS} days, then go for good.`}
      />
      {error === "conflict" ? (
        <p
          role="alert"
          className="mb-6 rounded-card border border-amber/30 bg-amber/8 px-5 py-3 text-sm"
        >
          That item could not be restored: something with the same slug or id exists now. Rename or
          delete the newer one, then try again.
        </p>
      ) : null}
      {items.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          The trash is empty.
        </p>
      ) : (
        <>
          {canManage ? (
            <div className="mb-4 flex justify-end">
              <InlineAction
                action={emptyTrash}
                label="Empty the trash"
                tone="danger"
                confirm={`Delete all ${items.length} items forever?`}
              />
            </div>
          ) : null}
          <ul className="surface divide-y divide-line rounded-card border border-line">
            {items.map((item) => {
              const left = trashDaysLeft(item.deletedAt);
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="font-medium text-fg">
                      <span className="label-mono mr-2 text-c1-text">{item.entity}</span>
                      {item.label}
                    </p>
                    <p className="text-xs text-faint">
                      Deleted by {item.deletedBy} · {dateTime.format(item.deletedAt)} · {left} days
                      left
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canEdit ? (
                      <InlineAction
                        action={restoreFromTrash}
                        hidden={{ id: item.id }}
                        label="Restore"
                      />
                    ) : null}
                    {canManage ? (
                      <InlineAction
                        action={deleteForever}
                        hidden={{ id: item.id }}
                        label="Delete forever"
                        tone="danger"
                        confirm={`Delete “${item.label}” forever?`}
                      />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
