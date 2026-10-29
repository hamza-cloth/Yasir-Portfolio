import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { ReorderList } from "@/components/admin/ReorderList";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

import { reorderProjects } from "../../media-actions";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const projects = await db.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, statusLabel: true, published: true, coverImageUrl: true },
  });

  return (
    <>
      <AdminHeader
        title="Projects"
        description="Case studies on the Work page and the home page. Drag to reorder; the order saves straight away."
        action={{ href: "/admin/projects/new", label: "New project" }}
      />
      {projects.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          No projects yet.
        </p>
      ) : (
        <ReorderList
          save={reorderProjects}
          rows={projects.map((project) => ({
            id: project.id,
            href: `/admin/projects/${project.id}`,
            title: project.title,
            meta: [project.statusLabel, project.coverImageUrl ? "has cover" : null]
              .filter(Boolean)
              .join(" · "),
            published: project.published,
          }))}
        />
      )}
    </>
  );
}
