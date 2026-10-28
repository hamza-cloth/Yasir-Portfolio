import { AdminHeader, AdminList, NoDatabase } from "@/components/admin/AdminUi";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const projects = await db.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, statusLabel: true, published: true, order: true },
  });

  return (
    <>
      <AdminHeader
        title="Projects"
        description="Case studies on the Work page and the home page, in order."
        action={{ href: "/admin/projects/new", label: "New project" }}
      />
      <AdminList
        empty="No projects yet."
        rows={projects.map((project) => ({
          id: project.id,
          href: `/admin/projects/${project.id}`,
          title: project.title,
          meta: `#${project.order} · ${project.statusLabel}`,
          published: project.published,
        }))}
      />
    </>
  );
}
