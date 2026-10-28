import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { EXPERIENCE } from "@/lib/content/experience";
import type { ExperienceItem } from "@/lib/content/types";
import { getDb } from "@/lib/db";

export async function getExperience(): Promise<ExperienceItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.experience);
  cacheLife("max");

  const db = getDb();
  if (!db) return EXPERIENCE;

  return db.experience.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      role: true,
      company: true,
      location: true,
      summary: true,
      highlights: true,
      startDate: true,
      endDate: true,
      isCurrent: true,
    },
  });
}
