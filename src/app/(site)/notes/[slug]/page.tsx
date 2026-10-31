import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/markdown/Markdown";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getNote, getNotes, getNoteSlugs } from "@/lib/data/notes";
import { redirectIfMoved } from "@/lib/redirects";
import { pageMetadata } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getNoteSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) return { title: "Note not found" };
  return pageMetadata({ title: note.title, description: note.excerpt, path: `/notes/${slug}` });
}

export default async function NotePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [note, all] = await Promise.all([getNote(slug), getNotes()]);
  if (!note) {
    await redirectIfMoved(`/notes/${slug}`);
    notFound();
  }

  const index = all.findIndex((item) => item.slug === note.slug);
  const next = all.length > 1 ? all[(index + 1) % all.length] : undefined;

  return (
    <>
      <PageHero
        eyebrow="Note"
        title={note.title}
        lead={note.excerpt}
        breadcrumb={[{ label: "Notes", href: "/notes" }, { label: note.title }]}
      >
        <div className="label-mono flex flex-wrap items-center gap-x-5 gap-y-2 text-muted">
          <span className="inline-flex items-center gap-2">
            <Icon name="clock" size={14} />
            {note.readingMinutes} min read
          </span>
          <ul className="flex flex-wrap gap-2" aria-label="Tags">
            {note.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-pill border border-line bg-surface-2/60 px-3 py-1.5 text-fg"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </PageHero>

      <article aria-label={note.title} className="pb-16">
        <Container className="flex justify-center">
          <Markdown source={note.body} className="w-full text-lg" />
        </Container>
      </article>

      {next ? (
        <section aria-label="Next note" className="pb-8">
          <Container>
            <Link
              href={`/notes/${next.slug}`}
              className="surface group flex flex-col gap-3 rounded-panel border border-line p-[clamp(24px,4vw,48px)] transition-colors duration-500 hover:border-line-hover md:flex-row md:items-center md:justify-between"
            >
              <span className="flex flex-col gap-3">
                <span className="label-mono text-faint">Next note</span>
                <span className="text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.05] font-medium tracking-[-0.04em] text-fg">
                  {next.title}
                </span>
              </span>
              <span className="grid size-14 flex-none place-items-center rounded-full border border-line-2 text-fg transition-transform duration-500 ease-entrance group-hover:translate-x-1 group-hover:bg-fg group-hover:text-bg">
                <Icon name="arrow-right" />
              </span>
            </Link>
          </Container>
        </section>
      ) : null}
    </>
  );
}
