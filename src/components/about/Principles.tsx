import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { Tile } from "@/components/ui/Tile";
import type { Principle } from "@/lib/validation/settings";

export function Principles({ principles }: { principles: Principle[] }) {
  if (principles.length === 0) return null;

  return (
    <section aria-labelledby="principles-title" className="section-y">
      <Container className="flex flex-col gap-10">
        <SectionHead eyebrow="Principles" titleId="principles-title" title="How I like to work" />
        <ol className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {principles.map((principle, index) => (
            <li key={principle.title} className="min-w-0">
              <Reveal delay={index * 80} className="h-full">
                <Tile className="flex h-full flex-col gap-4">
                  <p aria-hidden="true" className="label-mono text-c1-text">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-xl leading-tight">{principle.title}</h3>
                  <p className="text-muted">{principle.body}</p>
                </Tile>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
