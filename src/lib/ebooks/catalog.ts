import { LAYER_1 } from "./books/layer-1";
import { LAYER_2 } from "./books/layer-2";
import { LAYER_3 } from "./books/layer-3";
import { LAYER_4 } from "./books/layer-4";
import { LAYER_5 } from "./books/layer-5";
import { LAYER_6 } from "./books/layer-6";
import { LAYER_7 } from "./books/layer-7";
import type { Chapter, Ebook } from "./types";

// Read from the cable up, the same order the layers are taught in.
export const EBOOKS: Ebook[] = [LAYER_1, LAYER_2, LAYER_3, LAYER_4, LAYER_5, LAYER_6, LAYER_7];

export function findEbook(slug: string): Ebook | undefined {
  return EBOOKS.find((book) => book.slug === slug);
}

export function findChapter(
  bookSlug: string,
  chapterSlug: string,
): { book: Ebook; chapter: Chapter; index: number } | undefined {
  const book = findEbook(bookSlug);
  if (!book) return undefined;
  const index = book.chapters.findIndex((chapter) => chapter.slug === chapterSlug);
  const chapter = book.chapters[index];
  return chapter ? { book, chapter, index } : undefined;
}

export function ebookPdfPath(book: Ebook): string {
  return `/ebooks/${book.slug}.pdf`;
}
