import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { NOTES } from "@/lib/content/notes";
import type { NoteDetail, NoteSummary } from "@/lib/content/types";
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

export async function getNotes(): Promise<NoteSummary[]> {
  "use cache";
  cacheTag(CACHE_TAGS.notes);
  cacheLife("max");

  const db = getDb();
  if (!db) return seedNoteSummaries();

  const rows = await db.note.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { order: "asc" }],
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

export async function getNoteSlugs(): Promise<string[]> {
  return (await getNotes()).map((note) => note.slug);
}

export async function getNote(slug: string): Promise<NoteDetail | null> {
  "use cache";
  cacheTag(CACHE_TAGS.notes);
  cacheLife("max");

  const db = getDb();
  if (!db) {
    const seed = NOTES.find((note) => note.slug === slug);
    if (!seed) return null;
    const body = await readSeedNoteBody(slug);
    return { ...seed, publishedAt: null, readingMinutes: readingMinutes(body), body };
  }

  const row = await db.note.findFirst({
    where: { slug, published: true },
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

  return row ? { ...row, readingMinutes: readingMinutes(row.body) } : null;
}
