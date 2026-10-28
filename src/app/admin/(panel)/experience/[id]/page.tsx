import { notFound } from "next/navigation";

import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { CheckField, FormSection, TextArea, TextField } from "@/components/admin/fields";
import { toDateInput } from "@/lib/admin/form-data";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

import { deleteExperience, saveExperience } from "../../../actions";

export const metadata = { title: "Edit role" };

export default async function ExperienceEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const { id } = await params;
  const isNew = id === "new";
  const item = isNew ? null : await db.experience.findUnique({ where: { id } });
  if (!isNew && !item) notFound();

  return (
    <>
      <AdminHeader
        title={item ? `${item.role} · ${item.company}` : "New role"}
        back={{ href: "/admin/experience", label: "Experience" }}
      />
      <AdminForm
        action={saveExperience.bind(null, item?.id ?? null)}
        submitLabel={isNew ? "Create role" : "Save role"}
      >
        <FormSection title="Role">
          <TextField label="Role" name="role" defaultValue={item?.role} required />
          <TextField label="Company" name="company" defaultValue={item?.company} required />
          <TextField label="Location" name="location" defaultValue={item?.location ?? ""} />
          <div />
          <TextArea
            label="Summary"
            name="summary"
            defaultValue={item?.summary}
            rows={3}
            className="md:col-span-2"
            required
          />
          <TextArea
            label="Highlights"
            name="highlights"
            defaultValue={item?.highlights.join("\n")}
            rows={4}
            className="md:col-span-2"
            hint="One per line. Shown as bullets on the résumé."
          />
        </FormSection>

        <FormSection title="Dates & publishing">
          <TextField
            label="Start date"
            name="startDate"
            type="date"
            defaultValue={toDateInput(item?.startDate ?? null)}
            hint="Leave empty to hide dates."
          />
          <TextField
            label="End date"
            name="endDate"
            type="date"
            defaultValue={toDateInput(item?.endDate ?? null)}
          />
          <TextField
            label="Order"
            name="order"
            type="number"
            min={0}
            defaultValue={item?.order ?? 0}
          />
          <div className="flex flex-wrap items-end gap-5">
            <CheckField
              label="Current role"
              name="isCurrent"
              defaultChecked={item?.isCurrent ?? false}
            />
            <CheckField
              label="Published"
              name="published"
              defaultChecked={item?.published ?? true}
            />
          </div>
        </FormSection>
      </AdminForm>

      {item ? (
        <div className="mt-10 flex items-center justify-between gap-4 rounded-card border border-red/25 p-5">
          <p className="text-sm text-muted">Remove this role from the site.</p>
          <InlineAction
            action={deleteExperience}
            label="Delete role"
            tone="danger"
            confirm="Delete this role for good?"
            hidden={{ id: item.id }}
          />
        </div>
      ) : null}
    </>
  );
}
