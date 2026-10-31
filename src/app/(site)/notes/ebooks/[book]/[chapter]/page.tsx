import Link from "next/link";
import { notFound } from "next/navigation";

import { Diagram3D } from "@/components/ebooks/diagram/Diagram3D";
import { Markdown } from "@/components/markdown/Markdown";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getChapterBody } from "@/lib/data/ebooks";
import { ebookPdfPath, EBOOKS, findChapter } from "@/lib/ebooks/catalog";
import { readingMinutes } from "@/lib/reading-time";
import { pageMetadata } from "@/lib/seo";

type Params = Promise<{ book: string; chapter: string }>;

// Every book and chapter pair, generated at this level ("bottom up").
export function generateStaticParams() {
  return EBOOKS.flatMap((book) =>
    book.chapters.map((chapter) => ({ book: book.slug, chapter: chapter.slug })),
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { book, chapter } = await params;
  const found = findChapter(book, chapter);
  if (!found) return { title: "Chapter not found" };
  return pageMetadata({
    title: `${found.chapter.title} · ${found.book.title}`,
    description: found.chapter.summary,
    path: `/notes/ebooks/${book}/${chapter}`,
  });
}

export default async function ChapterPage({ params }: { params: Params }) {
  const { book: bookSlug, chapter: chapterSlug } = await params;
  const found = findChapter(bookSlug, chapterSlug);
  if (!found) notFound();

  const { book, chapter, index } = found;
  const body = await getChapterBody(book.slug, chapter.slug);
  const previous = book.chapters[index - 1];
  const next = book.chapters[index + 1];
  const nextBook = next ? undefined : EBOOKS[EBOOKS.indexOf(book) + 1];

  return (
    <>
      <PageHero
        eyebrow={`Layer ${book.layer} · Chapter ${index + 1} of ${book.chapters.length}`}
        title={chapter.title}
        lead={chapter.summary}
        breadcrumb={[
          { label: "Notes", href: "/notes#ebooks" },
          { label: book.title, href: `/notes/ebooks/${book.slug}` },
          { label: chapter.title },
        ]}
      >
        <div className="label-mono flex flex-wrap items-center gap-x-5 gap-y-2 text-muted">
          <span className="inline-flex items-center gap-2">
            <Icon name="clock" size={14} />
            {readingMinutes(body)} min read
          </span>
          <span className="rounded-pill border border-line bg-surface-2/60 px-3 py-1.5 text-fg">
            {chapter.skill}
          </span>
          <a
            href={ebookPdfPath(book)}
            download
            className="inline-flex items-center gap-2 hover:text-fg"
          >
            <Icon name="download" size={14} />
            Book PDF
          </a>
        </div>
      </PageHero>

      <section aria-label="Diagram" className="pb-14">
        <Container>
          <Diagram3D diagram={chapter.diagram} caption={chapter.caption} />
        </Container>
      </section>

      <Container className="grid gap-12 pb-16 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article aria-label={chapter.title} className="min-w-0">
          <Markdown source={body} className="text-lg" />
        </article>

        <nav aria-label={`${book.title}: chapters`} className="reader-toc lg:order-last">
          <div className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--header-h)+32px)]">
            <Link
              href={`/notes/ebooks/${book.slug}`}
              className="label-mono text-c1-text hover:underline"
            >
              Layer {book.layer} · {book.title}
            </Link>
            <ol className="flex flex-col border-l border-line">
              {book.chapters.map((item, itemIndex) => (
                <li key={item.slug}>
                  <Link
                    href={`/notes/ebooks/${book.slug}/${item.slug}`}
                    aria-current={item.slug === chapter.slug ? "page" : undefined}
                    className="-ml-px flex gap-3 border-l-2 border-transparent py-2 pl-4 text-[0.95rem] text-muted transition-colors hover:text-fg"
                  >
                    <span className="font-mono text-faint">{itemIndex + 1}</span>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      </Container>

      <nav aria-label="Chapter navigation" className="pb-8">
        <Container className="grid gap-4 md:grid-cols-2">
          {previous ? (
            <Link
              href={`/notes/ebooks/${book.slug}/${previous.slug}`}
              className="surface group flex flex-col gap-2 rounded-panel border border-line p-6 transition-colors duration-500 hover:border-line-hover md:p-8"
            >
              <span className="label-mono inline-flex items-center gap-2 text-faint">
                <Icon name="arrow-right" size={14} className="rotate-180" />
                Previous chapter
              </span>
              <span className="text-[clamp(1.25rem,2.2vw,1.6rem)] leading-tight font-semibold tracking-[-0.03em] text-fg">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" className="hidden md:block" />
          )}
          {next || nextBook ? (
            <Link
              href={
                next ? `/notes/ebooks/${book.slug}/${next.slug}` : `/notes/ebooks/${nextBook?.slug}`
              }
              className="surface group flex flex-col items-end gap-2 rounded-panel border border-line p-6 text-right transition-colors duration-500 hover:border-line-hover md:p-8"
            >
              <span className="label-mono inline-flex items-center gap-2 text-faint">
                {next ? "Next chapter" : `Next book · Layer ${nextBook?.layer}`}
                <Icon name="arrow-right" size={14} />
              </span>
              <span className="text-[clamp(1.25rem,2.2vw,1.6rem)] leading-tight font-semibold tracking-[-0.03em] text-fg">
                {next ? next.title : nextBook?.title}
              </span>
            </Link>
          ) : null}
        </Container>
      </nav>
    </>
  );
}
