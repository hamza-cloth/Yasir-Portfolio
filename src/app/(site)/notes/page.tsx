import { NoteCard } from "@/components/notes/NoteCard";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Reveal } from "@/components/ui/Reveal";
import { getNotes } from "@/lib/data/notes";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    title: "Notes",
    description:
      "Field notes on networking and support: subnetting, VLANs and troubleshooting, written down so they are never solved twice.",
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
        lead="Short, practical notes from the support desk and the CCNA lab. Each one solves a problem I have met more than once."
      />
      <section aria-label="All notes" className="pb-12">
        <Container>
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
