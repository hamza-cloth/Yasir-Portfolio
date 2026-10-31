import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";

import { readingMinutes } from "@/lib/reading-time";

const EBOOKS_DIRECTORY = path.join(process.cwd(), "content", "ebooks");

// Chapter text ships with the code (content/ebooks/<book>/<chapter>.md), so it is cached for good.
export async function getChapterBody(bookSlug: string, chapterSlug: string): Promise<string> {
  "use cache";
  cacheLife("max");

  return readFile(path.join(EBOOKS_DIRECTORY, bookSlug, `${chapterSlug}.md`), "utf8");
}

export async function getChapterMinutes(bookSlug: string, chapterSlug: string): Promise<number> {
  return readingMinutes(await getChapterBody(bookSlug, chapterSlug));
}
