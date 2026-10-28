import { AdminHeader, AdminList, NoDatabase } from "@/components/admin/AdminUi";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export const metadata = { title: "Experience" };

export default async function ExperienceAdminPage() {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const items = await db.experience.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, role: true, company: true, published: true, order: true },
  });

  return (
    <>
      <AdminHeader
        title="Experience"
        description="Roles on the Experience page, the résumé and the home page."
        action={{ href: "/admin/experience/new", label: "New role" }}
      />
      <AdminList
        empty="No roles yet."
        rows={items.map((item) => ({
          id: item.id,
          href: `/admin/experience/${item.id}`,
          title: `${item.role} · ${item.company}`,
          meta: `#${item.order}`,
          published: item.published,
        }))}
      />
    </>
  );
}
