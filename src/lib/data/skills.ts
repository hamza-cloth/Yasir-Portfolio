import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { SKILLS } from "@/lib/content/skills";
import type { SkillItem } from "@/lib/content/types";
import { getDb } from "@/lib/db";

export async function getSkills(): Promise<SkillItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.skills);
  cacheLife("max");

  const db = getDb();
  if (!db) return SKILLS;

  return db.skill.findMany({
    where: { published: true },
    orderBy: [{ layer: "desc" }, { order: "asc" }],
    select: { name: true, layer: true, domain: true },
  });
}
