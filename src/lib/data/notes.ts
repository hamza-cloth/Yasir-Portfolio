import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { NOTES } from "@/lib/content/notes";
import type { NoteSummary } from "@/lib/content/types";
import { getDb } from "@/lib/db";
import { readingMinutes } from "@/lib/reading-time";

const NOTES_DIRECTORY = path.join(process.cwd(), "content", "notes");

export async function readSeedNoteBody(slug: string): Promise<string> {
  return readFile(path.join(NOTES_DIRECTORY, `${slug}.md`), "utf8");
}

async function seedNoteSummaries(): Promise<NoteSummary[]> {
  return Promise.all(
    NOTES.map(async (note) => ({
      ...note,
      publishedAt: null,
      readingMinutes: readingMinutes(await readSeedNoteBody(note.slug)),
    })),
  );
}

export async function getLatestNotes(limit: number): Promise<NoteSummary[]> {
  "use cache";
  cacheTag(CACHE_TAGS.notes);
  cacheLife("max");

  const db = getDb();
  if (!db) return (await seedNoteSummaries()).slice(0, limit);

  const rows = await db.note.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { order: "asc" }],
    take: limit,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      tags: true,
      featured: true,
      publishedAt: true,
      body: true,
    },
  });

  return rows.map(({ body, ...note }) => ({ ...note, readingMinutes: readingMinutes(body) }));
}
