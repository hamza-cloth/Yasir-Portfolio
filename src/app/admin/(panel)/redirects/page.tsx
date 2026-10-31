import { addRedirect, deleteRedirect } from "@/app/admin/system-actions";
import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { CheckField, FormSection, TextField } from "@/components/admin/fields";
import { dateOnly } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { getDb } from "@/lib/db";

export const metadata = { title: "Redirects" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function RedirectsPage() {
  await pageAdmin("manage");
  const db = getDb();
  if (!db) return <NoDatabase />;

  const redirects = await db.redirect.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminHeader
        title="Redirects"
        description="Send an old address somewhere new, for example after renaming a project's slug. They apply to addresses that no longer show a page; a page that still exists is never redirected."
      />
      <AdminForm action={addRedirect} submitLabel="Add redirect">
        <FormSection title="New redirect">
          <TextField label="From" name="from" placeholder="/work/old-name" required />
          <TextField label="To" name="to" placeholder="/work/new-name or https://…" required />
          <div className="md:col-span-2">
            <CheckField
              label="Permanent (search engines move the old address's ranking to the new one)"
              name="permanent"
              defaultChecked
            />
          </div>
        </FormSection>
      </AdminForm>

      <div className="mt-8">
        {redirects.length === 0 ? (
          <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
            No redirects yet.
          </p>
        ) : (
          <ul className="surface divide-y divide-line rounded-card border border-line">
            {redirects.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm [overflow-wrap:anywhere] text-fg">
                    {item.from} <span className="text-faint">→</span> {item.to}
                  </p>
                  <p className="text-xs text-faint">
                    {item.permanent ? "Permanent" : "Temporary"} · {item.hits} visits · added{" "}
                    {dateOnly.format(item.createdAt)}
                  </p>
                </div>
                <InlineAction
                  action={deleteRedirect}
                  hidden={{ id: item.id }}
                  label="Delete"
                  tone="danger"
                  confirm={`Stop redirecting ${item.from}?`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
