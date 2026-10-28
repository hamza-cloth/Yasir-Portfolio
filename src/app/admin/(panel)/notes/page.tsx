import { AdminHeader, AdminList, NoDatabase } from "@/components/admin/AdminUi";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export const metadata = { title: "Notes" };

export default async function NotesAdminPage() {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const notes = await db.note.findMany({
    orderBy: [{ publishedAt: "desc" }, { order: "asc" }],
    select: { id: true, title: true, tags: true, published: true, featured: true },
  });

  return (
    <>
      <AdminHeader
        title="Notes"
        description="Markdown write-ups on the Notes page, newest first."
        action={{ href: "/admin/notes/new", label: "New note" }}
      />
      <AdminList
        empty="No notes yet."
        rows={notes.map((note) => ({
          id: note.id,
          href: `/admin/notes/${note.id}`,
          title: note.title,
          meta: [note.featured ? "Featured" : null, note.tags.join(", ")]
            .filter(Boolean)
            .join(" · "),
          published: note.published,
        }))}
      />
    </>
  );
}
