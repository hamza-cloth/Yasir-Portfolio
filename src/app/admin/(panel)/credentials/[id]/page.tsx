import { notFound } from "next/navigation";

import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { CheckField, FormSection, SelectField, TextField } from "@/components/admin/fields";
import { CredentialKind, CredentialStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

import { deleteCredential, saveCredential } from "../../../actions";

export const metadata = { title: "Edit entry" };

const KINDS = [
  [CredentialKind.DEGREE, "Degree"],
  [CredentialKind.TRAINING, "Training"],
  [CredentialKind.CERTIFICATION, "Certification"],
] as const;

const STATUSES = [
  [CredentialStatus.IN_PROGRESS, "In progress"],
  [CredentialStatus.COMPLETED, "Completed"],
] as const;

export default async function CredentialEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const { id } = await params;
  const isNew = id === "new";
  const item = isNew ? null : await db.certification.findUnique({ where: { id } });
  if (!isNew && !item) notFound();

  return (
    <>
      <AdminHeader
        title={item ? item.title : "New entry"}
        back={{ href: "/admin/credentials", label: "Education & training" }}
      />
      <AdminForm
        action={saveCredential.bind(null, item?.id ?? null)}
        submitLabel={isNew ? "Create entry" : "Save entry"}
      >
        <FormSection title="Details">
          <TextField
            label="Title"
            name="title"
            defaultValue={item?.title}
            className="md:col-span-2"
            required
          />
          <TextField label="Issuer" name="issuer" defaultValue={item?.issuer} required />
          <TextField label="Location" name="location" defaultValue={item?.location ?? ""} />
          <SelectField
            label="Kind"
            name="kind"
            options={KINDS}
            defaultValue={item?.kind ?? CredentialKind.CERTIFICATION}
          />
          <SelectField
            label="Status"
            name="status"
            options={STATUSES}
            defaultValue={item?.status ?? CredentialStatus.COMPLETED}
          />
          <TextField
            label="Start year"
            name="startYear"
            type="number"
            defaultValue={item?.startYear ?? ""}
          />
          <TextField
            label="End year"
            name="endYear"
            type="number"
            defaultValue={item?.endYear ?? ""}
          />
          <TextField
            label="Credential URL"
            name="credentialUrl"
            type="url"
            defaultValue={item?.credentialUrl ?? ""}
            className="md:col-span-2"
            placeholder="https://…"
          />
        </FormSection>

        <FormSection title="Publishing">
          <TextField
            label="Order"
            name="order"
            type="number"
            min={0}
            defaultValue={item?.order ?? 0}
          />
          <div className="flex items-end">
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
          <p className="text-sm text-muted">Remove this entry from the site.</p>
          <InlineAction
            action={deleteCredential}
            label="Delete entry"
            tone="danger"
            confirm="Delete this entry for good?"
            hidden={{ id: item.id }}
          />
        </div>
      ) : null}
    </>
  );
}
