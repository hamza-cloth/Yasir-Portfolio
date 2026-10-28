import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { PROJECTS } from "@/lib/content/projects";
import type { ProjectDetail, ProjectSummary } from "@/lib/content/types";
import { getDb } from "@/lib/db";
import { decisionsSchema } from "@/lib/validation/project";

const SUMMARY_FIELDS = {
  slug: true,
  title: true,
  tagline: true,
  summary: true,
  statusLabel: true,
  categories: true,
  stack: true,
  visual: true,
} as const;

function toSummary(project: ProjectDetail): ProjectSummary {
  const { slug, title, tagline, summary, statusLabel, categories, stack, visual } = project;
  return { slug, title, tagline, summary, statusLabel, categories, stack, visual };
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  "use cache";
  cacheTag(CACHE_TAGS.projects);
  cacheLife("max");

  const db = getDb();
  if (!db) return PROJECTS.map(toSummary);

  return db.project.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: SUMMARY_FIELDS,
  });
}

export async function getProjectSlugs(): Promise<string[]> {
  return (await getProjectSummaries()).map((project) => project.slug);
}

export async function getProject(slug: string): Promise<ProjectDetail | null> {
  "use cache";
  cacheTag(CACHE_TAGS.projects);
  cacheLife("max");

  const db = getDb();
  if (!db) return PROJECTS.find((project) => project.slug === slug) ?? null;

  const row = await db.project.findFirst({
    where: { slug, published: true },
    select: {
      ...SUMMARY_FIELDS,
      role: true,
      type: true,
      overview: true,
      decisions: true,
      coverImageUrl: true,
    },
  });
  if (!row) return null;

  const decisions = decisionsSchema.safeParse(row.decisions);
  return { ...row, decisions: decisions.success ? decisions.data : [] };
}
