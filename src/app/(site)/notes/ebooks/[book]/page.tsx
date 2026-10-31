import Link from "next/link";
import { notFound } from "next/navigation";

import { BookCover } from "@/components/ebooks/BookCover";
import { PageHero } from "@/components/page/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { getChapterMinutes } from "@/lib/data/ebooks";
import { ebookPdfPath, EBOOKS, findEbook } from "@/lib/ebooks/catalog";
import { pageMetadata } from "@/lib/seo";

type Params = Promise<{ book: string }>;

export function generateStaticParams() {
  return EBOOKS.map((book) => ({ book: book.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const book = findEbook((await params).book);
  if (!book) return { title: "Ebook not found" };
  return pageMetadata({
    title: `${book.title}: Layer ${book.layer} ebook`,
    description: book.summary,
    path: `/notes/ebooks/${book.slug}`,
  });
}

export default async function EbookPage({ params }: { params: Params }) {
  const book = findEbook((await params).book);
  if (!book) notFound();

  const minutes = await Promise.all(
    book.chapters.map((chapter) => getChapterMinutes(book.slug, chapter.slug)),
  );
  const totalMinutes = minutes.reduce((sum, value) => sum + value, 0);
  const first = book.chapters[0];

  return (
    <>
      <PageHero
        eyebrow={`Ebook · ${book.subtitle}`}
        title={book.title}
        lead={book.summary}
        breadcrumb={[{ label: "Notes", href: "/notes#ebooks" }, { label: book.title }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          {first ? (
            <Button href={`/notes/ebooks/${book.slug}/${first.slug}`} variant="accent" size="lg">
              Start reading
              <Icon name="arrow-right" />
            </Button>
          ) : null}
          <a
            href={ebookPdfPath(book)}
            download
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-(--r-button) border border-line-2 bg-surface-solid px-7 font-semibold tracking-[-0.01em] text-fg shadow-(--shadow-soft) transition-[transform,border-color] duration-300 ease-entrance hover:-translate-y-0.5 hover:border-fg/20"
          >
            <Icon name="download" />
            Download PDF
          </a>
          <span className="label-mono text-muted">
            {book.chapters.length} chapters · {totalMinutes} min read
          </span>
        </div>
      </PageHero>

      <section aria-labelledby="contents-title" className="pb-16">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:items-start">
          <div className="group flex justify-center lg:sticky lg:top-[calc(var(--header-h)+32px)]">
            <BookCover book={book} size="hero" />
          </div>
          <div className="flex flex-col gap-6">
            <h2 id="contents-title" className="text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight">
              Contents
            </h2>
            <ol className="flex flex-col gap-3">
              {book.chapters.map((chapter, index) => (
                <li key={chapter.slug}>
                  <Reveal delay={index * 60}>
                    <Link
                      href={`/notes/ebooks/${book.slug}/${chapter.slug}`}
                      className="surface group/row flex items-start gap-5 rounded-card border border-line p-5 transition-[border-color,transform] duration-500 ease-entrance hover:-translate-y-0.5 hover:border-line-hover md:p-6"
                    >
                      <span className="grid size-11 flex-none place-items-center rounded-full border border-line-2 font-display text-lg text-c1-text">
                        {index + 1}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="text-lg font-semibold tracking-[-0.01em] text-fg">
                          {chapter.title}
                        </span>
                        <span className="text-muted">{chapter.summary}</span>
                        <span className="label-mono mt-1 text-faint">
                          {minutes[index]} min · {chapter.diagram.type} diagram
                        </span>
                      </span>
                      <Icon
                        name="arrow-right"
                        className="mt-3 flex-none text-faint transition-transform duration-500 ease-entrance group-hover/row:translate-x-1 group-hover/row:text-fg"
                      />
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    </>
  );
}
