import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";
import { EBOOKS } from "@/lib/ebooks/catalog";

import { BookCover } from "./BookCover";

// The seven layer books on the Notes page, bottom layer first.
export function EbookShelf() {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,15rem),1fr))] gap-x-6 gap-y-10">
      {EBOOKS.map((book, index) => (
        <li key={book.slug} className="min-w-0">
          <Reveal delay={index * 70} className="h-full">
            <article className="group relative flex h-full flex-col items-center gap-5 text-center">
              <BookCover book={book} />
              <div className="flex flex-col items-center gap-2">
                <p className="label-mono text-c1-text">
                  Layer {book.layer} · {book.layerName}
                </p>
                <h3 className="text-[clamp(1.15rem,1.8vw,1.4rem)] leading-tight">
                  {/* The link covers the whole card; only the title is announced as the link text. */}
                  <Link
                    href={`/notes/ebooks/${book.slug}`}
                    data-cursor="Read"
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {book.title}
                  </Link>
                </h3>
                <p className="text-sm text-muted">
                  {book.chapters.length} chapters, each with a 3D diagram
                </p>
              </div>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
