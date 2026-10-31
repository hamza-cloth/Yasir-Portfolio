import { notFound } from "next/navigation";

import { deleteTestimonial, saveTestimonial } from "@/app/admin/system-actions";
import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { FormSection, SelectField, TextArea, TextField } from "@/components/admin/fields";
import { pageAdmin } from "@/lib/admin/guard";
import { getDb } from "@/lib/db";

export const metadata = { title: "Testimonial" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function TestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  await pageAdmin("edit");
  const db = getDb();
  if (!db) return <NoDatabase />;

  const { id } = await params;
  const isNew = id === "new";
  const item = isNew ? null : await db.testimonial.findUnique({ where: { id } });
  if (!isNew && !item) notFound();

  return (
    <>
      <AdminHeader
        title={item ? item.name : "New testimonial"}
        back={{ href: "/admin/testimonials", label: "Testimonials" }}
      />
      <AdminForm action={saveTestimonial.bind(null, item?.id ?? null)}>
        <FormSection title="Who said it">
          <TextField label="Name" name="name" defaultValue={item?.name} required />
          <TextField
            label="Role"
            name="role"
            defaultValue={item?.role ?? ""}
            placeholder="Founder"
          />
          <TextField label="Company" name="company" defaultValue={item?.company ?? ""} />
          <SelectField
            label="Rating"
            name="rating"
            defaultValue={String(item?.rating ?? "")}
            options={[
              ["", "No rating"],
              ["5", "★★★★★"],
              ["4", "★★★★"],
              ["3", "★★★"],
              ["2", "★★"],
              ["1", "★"],
            ]}
          />
        </FormSection>
        <FormSection title="Quote">
          <TextArea
            label="What they said"
            name="quote"
            rows={5}
            defaultValue={item?.quote ?? ""}
            hint="Their words, lightly edited at most. 10 to 1,200 characters."
            className="md:col-span-2"
            required
          />
          <SelectField
            label="Status"
            name="status"
            defaultValue={item?.status ?? "PENDING"}
            options={[
              ["PENDING", "Pending review"],
              ["APPROVED", "Approved (shown on the site)"],
              ["HIDDEN", "Hidden"],
            ]}
          />
          <TextField
            label="Order"
            name="order"
            type="number"
            min={0}
            max={999}
            defaultValue={item?.order ?? 0}
            hint="Lower shows first."
          />
        </FormSection>
      </AdminForm>
      {item ? (
        <div className="mt-10">
          <InlineAction
            action={deleteTestimonial}
            hidden={{ id: item.id }}
            label="Delete testimonial"
            tone="danger"
            confirm={`Move the testimonial from ${item.name} to the trash?`}
          />
        </div>
      ) : null}
    </>
  );
}
