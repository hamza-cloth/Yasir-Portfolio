import { notFound } from "next/navigation";

import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { CheckField, FormSection, TextArea, TextField } from "@/components/admin/fields";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

import { deleteNote, saveNote } from "../../../actions";

export const metadata = { title: "Edit note" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function NoteEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const { id } = await params;
  const isNew = id === "new";
  const note = isNew ? null : await db.note.findUnique({ where: { id } });
  if (!isNew && !note) notFound();

  return (
    <>
      <AdminHeader
        title={note ? note.title : "New note"}
        back={{ href: "/admin/notes", label: "Notes" }}
      />
      <AdminForm
        action={saveNote.bind(null, note?.id ?? null)}
        submitLabel={isNew ? "Create note" : "Save note"}
      >
        <FormSection title="Note">
          <TextField label="Title" name="title" defaultValue={note?.title} required />
          <TextField
            label="Slug"
            name="slug"
            defaultValue={note?.slug}
            hint="The URL: /notes/your-slug"
            required
          />
          <TextArea
            label="Excerpt"
            name="excerpt"
            defaultValue={note?.excerpt}
            rows={2}
            className="md:col-span-2"
            hint="One or two sentences for the card and search results."
            required
          />
          <TextField
            label="Tags"
            name="tags"
            defaultValue={note?.tags.join(", ")}
            className="md:col-span-2"
            hint="Separated by commas."
          />
          <TextArea
            label="Body"
            name="body"
            defaultValue={note?.body}
            rows={20}
            className="font-mono text-sm md:col-span-2"
            hint="Markdown, with code blocks (```bash, ```cisco) and tables."
            required
          />
        </FormSection>

        <FormSection title="Publishing">
          <TextField
            label="Order"
            name="order"
            type="number"
            min={0}
            defaultValue={note?.order ?? 0}
            hint="Breaks ties between notes published at the same time."
          />
          <div className="flex flex-wrap items-end gap-5">
            <CheckField
              label="Published"
              name="published"
              defaultChecked={note?.published ?? true}
            />
            <CheckField label="Featured" name="featured" defaultChecked={note?.featured ?? false} />
          </div>
        </FormSection>
      </AdminForm>

      {note ? (
        <div className="mt-10 flex items-center justify-between gap-4 rounded-card border border-red/25 p-5">
          <p className="text-sm text-muted">Deleting a note removes its page.</p>
          <InlineAction
            action={deleteNote}
            label="Delete note"
            tone="danger"
            confirm={`Delete “${note.title}” for good?`}
            hidden={{ id: note.id }}
          />
        </div>
      ) : null}
    </>
  );
}
