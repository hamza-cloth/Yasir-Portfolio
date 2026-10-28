import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { CREDENTIALS } from "@/lib/content/credentials";
import type { Credential } from "@/lib/content/types";
import { getDb } from "@/lib/db";

export async function getCredentials(): Promise<Credential[]> {
  "use cache";
  cacheTag(CACHE_TAGS.credentials);
  cacheLife("max");

  const db = getDb();
  if (!db) return CREDENTIALS;

  return db.certification.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      issuer: true,
      kind: true,
      status: true,
      location: true,
      startYear: true,
      endYear: true,
    },
  });
}
