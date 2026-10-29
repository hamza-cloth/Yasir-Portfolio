import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase, StatusPill } from "@/components/admin/AdminUi";
import { CheckField, FileField, FormSection, TextField } from "@/components/admin/fields";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

import { activateResume, deleteResume, uploadResume } from "../../media-actions";

export const metadata = { title: "Résumé" };

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

export default async function ResumeAdminPage() {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const versions = await db.resumeVersion.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminHeader
        title="Résumé"
        description="Upload PDF versions and choose which one the public résumé page offers for download. The on-page résumé is built from your content either way."
      />

      <AdminForm action={uploadResume} submitLabel="Upload PDF" className="mb-10">
        <FormSection title="New version">
          <TextField label="Label" name="label" placeholder="e.g. October 2026, network roles" />
          <FileField
            label="PDF"
            name="resume"
            accept="application/pdf"
            hint="Up to 4 MB."
            required
          />
          <div className="md:col-span-2">
            <CheckField label="Make this the live version" name="activate" defaultChecked />
          </div>
        </FormSection>
      </AdminForm>

      <h2 className="mb-3 text-lg tracking-[-0.02em]">Version history</h2>
      {versions.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          No PDF uploaded yet.
        </p>
      ) : (
        <ul className="surface divide-y divide-line rounded-card border border-line">
          {versions.map((version) => (
            <li
              key={version.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div className="flex min-w-0 flex-col">
                <a
                  href={version.url}
                  target="_blank"
                  rel="noopener"
                  className="font-medium text-fg hover:underline"
                >
                  {version.label}
                </a>
                <span className="text-sm text-muted">
                  {dateFormat.format(version.createdAt)} · {(version.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill on={version.active} onLabel="Live" offLabel="Archived" />
                {!version.active ? (
                  <InlineAction
                    action={activateResume}
                    label="Make live"
                    hidden={{ id: version.id }}
                  />
                ) : null}
                <InlineAction
                  action={deleteResume}
                  label="Delete"
                  tone="danger"
                  confirm={`Delete “${version.label}”?`}
                  hidden={{ id: version.id }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
