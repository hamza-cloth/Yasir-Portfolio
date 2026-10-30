import { EbookShelf } from "@/components/ebooks/EbookShelf";
import { NoteCard } from "@/components/notes/NoteCard";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { getNotes } from "@/lib/data/notes";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    title: "Notes",
    description:
      "Seven free ebooks, one per OSI layer, with a 3D diagram for every skill, plus field notes on networking and support.",
    path: "/notes",
  });
}

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <>
      <PageHero
        eyebrow="Notes"
        title={
          <>
            Written down <Highlight>so I don’t forget</Highlight>
          </>
        }
        lead="Seven ebooks that cover every skill from the cable up, and short notes from the support desk and the CCNA lab."
      />
      <section aria-labelledby="ebooks-title" id="ebooks" className="scroll-mt-28 pb-20">
        <Container className="flex flex-col gap-12">
          <SectionHead
            eyebrow="Ebooks"
            titleId="ebooks-title"
            title={
              <>
                Seven books, <Highlight>one per layer</Highlight>
              </>
            }
            lead="Every skill on this site, explained from the cable up. Each chapter has an animated 3D diagram, and each book downloads as a PDF."
          />
          <EbookShelf />
        </Container>
      </section>
      <section aria-labelledby="notes-list-title" className="pb-12">
        <Container className="flex flex-col gap-10">
          <SectionHead eyebrow="Field notes" titleId="notes-list-title" title="Short notes" />
          {notes.length > 0 ? (
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))] gap-4">
              {notes.map((note, index) => (
                <li key={note.slug} className="min-w-0">
                  <Reveal delay={index * 80} className="h-full">
                    <NoteCard note={note} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <p className="max-w-xl border-y border-line py-10 text-lg text-muted">
              No notes published yet.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
