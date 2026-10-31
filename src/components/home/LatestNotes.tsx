import { NoteCard } from "@/components/notes/NoteCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import type { NoteSummary } from "@/lib/content/types";

// The newest lab and support notes, so visitors see how problems get worked through.
export function LatestNotes({ notes }: { notes: NoteSummary[] }) {
  if (notes.length === 0) return null;

  return (
    <section aria-labelledby="notes-title" className="section-y">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            eyebrow="Notes"
            titleId="notes-title"
            title={
              <>
                Written down, <Highlight>step by step</Highlight>
              </>
            }
          />
          <Button href="/notes" variant="line">
            All notes
            <Icon name="arrow-right" size={16} />
          </Button>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))] gap-4">
          {notes.map((note, index) => (
            <li key={note.slug} className="min-w-0">
              <Reveal delay={index * 90} className="h-full">
                <NoteCard note={note} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
