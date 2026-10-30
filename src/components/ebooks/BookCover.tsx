import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import type { Ebook } from "@/lib/ebooks/types";

type BookCoverProps = {
  book: Ebook;
  className?: string;
  // Hero covers sit still a little longer and lean less; shelf covers turn on hover.
  size?: "shelf" | "hero";
};

const LAYERS = [7, 6, 5, 4, 3, 2, 1];

// A solid book in CSS 3D: front cover, spine, page edges and back, turning towards the reader on hover.
export function BookCover({ book, className, size = "shelf" }: BookCoverProps) {
  return (
    <div aria-hidden="true" className={cn("book3d", className)} data-size={size}>
      <div className="book3d-body" style={cssVars({ "--layer": book.layer })}>
        <div className="book3d-back" />
        <div className="book3d-pages" />
        <div className="book3d-spine">
          <span className="label-mono">Layer {book.layer}</span>
        </div>
        <div className="book3d-front">
          <div className="flex items-start justify-between gap-3">
            <span className="label-mono text-white/80">{book.subtitle}</span>
            <span className="book3d-numeral">L{book.layer}</span>
          </div>
          <div className="flex flex-col gap-3">
            <ol className="book3d-meter">
              {LAYERS.map((layer) => (
                <li key={layer} data-on={layer === book.layer ? "" : undefined} />
              ))}
            </ol>
            <span className="book3d-title">{book.title}</span>
            <span className="label-mono text-white/75">
              {book.chapters.length} chapters · Yasir Abdullah
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
