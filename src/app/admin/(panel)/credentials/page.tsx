import { AdminHeader, AdminList, NoDatabase } from "@/components/admin/AdminUi";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export const metadata = { title: "Education & training" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function CredentialsAdminPage() {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const items = await db.certification.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, issuer: true, kind: true, published: true },
  });

  return (
    <>
      <AdminHeader
        title="Education & training"
        description="Degrees, training and certifications."
        action={{ href: "/admin/credentials/new", label: "New entry" }}
      />
      <AdminList
        empty="Nothing here yet."
        rows={items.map((item) => ({
          id: item.id,
          href: `/admin/credentials/${item.id}`,
          title: item.title,
          meta: `${item.kind.toLowerCase()} · ${item.issuer}`,
          published: item.published,
        }))}
      />
    </>
  );
}
