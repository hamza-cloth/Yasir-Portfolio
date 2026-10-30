import { notFound } from "next/navigation";

import { Diagram3D } from "@/components/ebooks/diagram/Diagram3D";
import { Markdown } from "@/components/markdown/Markdown";
import { Container } from "@/components/ui/Container";
import { getChapterBody } from "@/lib/data/ebooks";
import { EBOOKS, findEbook } from "@/lib/ebooks/catalog";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type Params = Promise<{ book: string }>;

export function generateStaticParams() {
  return EBOOKS.map((book) => ({ book: book.slug }));
}

// The whole book on one page, diagrams held still: the source for the downloadable PDF
// (scripts/build-ebook-pdfs.ts). Not meant to be found on its own.
export async function generateMetadata({ params }: { params: Params }) {
  const book = findEbook((await params).book);
  if (!book) return { title: "Ebook not found" };
  const metadata = await pageMetadata({
    title: `${book.title} (print)`,
    description: book.summary,
    path: `/notes/ebooks/${book.slug}/print`,
  });
  return { ...metadata, robots: { index: false, follow: true } };
}

export default async function EbookPrintPage({ params }: { params: Params }) {
  const book = findEbook((await params).book);
  if (!book) notFound();

  const bodies = await Promise.all(
    book.chapters.map((chapter) => getChapterBody(book.slug, chapter.slug)),
  );

  return (
    <Container className="ebook-print flex flex-col gap-16 pt-[calc(var(--header-h)+40px)] pb-16 print:pt-0">
      <header className="flex min-h-[70vh] flex-col justify-between gap-10 rounded-panel p-[clamp(28px,6vw,64px)] text-white [background:var(--feature-bg)] print:min-h-[250mm]">
        <p className="label-mono text-white/80">{book.subtitle}</p>
        <div className="flex flex-col gap-6">
          <p className="font-display text-[clamp(5rem,14vw,9rem)] leading-[0.8] font-extrabold tracking-[-0.06em] text-white/90">
            L{book.layer}
          </p>
          <h1 className="text-[clamp(2.4rem,6vw,4.4rem)] leading-[1] tracking-[-0.035em]">
            {book.title}
          </h1>
          <p className="max-w-2xl text-xl text-white/85">{book.summary}</p>
        </div>
        <p className="label-mono text-white/80">
          Yasir Abdullah · {SITE_URL.replace(/^https?:\/\//, "")}/notes/ebooks/{book.slug}
        </p>
      </header>

      <section aria-labelledby="print-contents" className="ebook-print-chapter flex flex-col gap-6">
        <h2 id="print-contents" className="text-h2 leading-tight">
          Contents
        </h2>
        <ol className="flex flex-col divide-y divide-line border-y border-line">
          {book.chapters.map((chapter, index) => (
            <li key={chapter.slug} className="flex gap-5 py-4">
              <span className="font-display text-xl text-c1-text">{index + 1}</span>
              <span className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-fg">{chapter.title}</span>
                <span className="text-muted">{chapter.summary}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {book.chapters.map((chapter, index) => (
        <section
          key={chapter.slug}
          aria-labelledby={`chapter-${chapter.slug}`}
          className="ebook-print-chapter flex flex-col gap-8"
        >
          <header className="flex flex-col gap-3">
            <p className="label-mono text-c1-text">
              Chapter {index + 1} · {chapter.skill}
            </p>
            <h2
              id={`chapter-${chapter.slug}`}
              className="text-h2 leading-[1.02] tracking-[-0.035em]"
            >
              {chapter.title}
            </h2>
            <p className="max-w-2xl text-lg text-muted">{chapter.summary}</p>
          </header>
          <Diagram3D diagram={chapter.diagram} caption={chapter.caption} still />
          <Markdown source={bodies[index] ?? ""} className="text-base" />
        </section>
      ))}
    </Container>
  );
}
