import Link from "next/link";

import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export const metadata = { title: "Search" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

type Hit = { href: string; title: string; kind: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const query = ((await searchParams).q ?? "").trim().slice(0, 80);
  let hits: Hit[] = [];
  if (query.length >= 2) {
    const contains = { contains: query, mode: "insensitive" as const };
    const [projects, notes, messages, skills, experience] = await Promise.all([
      db.project.findMany({
        where: { OR: [{ title: contains }, { tagline: contains }] },
        select: { id: true, title: true },
        take: 10,
      }),
      db.note.findMany({
        where: { OR: [{ title: contains }, { body: contains }] },
        select: { id: true, title: true },
        take: 10,
      }),
      db.message.findMany({
        where: { OR: [{ name: contains }, { email: contains }, { body: contains }] },
        select: { name: true, email: true },
        take: 10,
      }),
      db.skill.findMany({ where: { name: contains }, select: { name: true }, take: 10 }),
      db.experience.findMany({
        where: { OR: [{ role: contains }, { company: contains }] },
        select: { id: true, role: true, company: true },
        take: 10,
      }),
    ]);
    hits = [
      ...projects.map((item) => ({
        href: `/admin/projects/${item.id}`,
        title: item.title,
        kind: "Project",
      })),
      ...notes.map((item) => ({
        href: `/admin/notes/${item.id}`,
        title: item.title,
        kind: "Note",
      })),
      ...messages.map((item) => ({
        href: "/admin/messages",
        title: `${item.name} · ${item.email}`,
        kind: "Message",
      })),
      ...skills.map((item) => ({ href: "/admin/skills", title: item.name, kind: "Skill" })),
      ...experience.map((item) => ({
        href: `/admin/experience/${item.id}`,
        title: `${item.role} · ${item.company}`,
        kind: "Experience",
      })),
    ];
  }

  return (
    <>
      <AdminHeader
        title={query ? `Results for “${query}”` : "Search"}
        description="Projects, notes, messages, skills and experience."
      />
      {query.length < 2 ? (
        <p className="text-muted">Type at least two characters in the search box above.</p>
      ) : hits.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          Nothing matches.
        </p>
      ) : (
        <ul className="surface divide-y divide-line rounded-card border border-line">
          {hits.map((hit, index) => (
            <li key={`${hit.href}-${index}`}>
              <Link
                href={hit.href}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-fg/4"
              >
                <span className="truncate font-medium">{hit.title}</span>
                <span className="label-mono text-muted">{hit.kind}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
