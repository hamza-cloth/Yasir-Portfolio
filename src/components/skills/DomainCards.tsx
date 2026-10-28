import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { Tile } from "@/components/ui/Tile";
import type { DomainGroup } from "@/lib/skill-domains";

export function DomainCards({ domains }: { domains: DomainGroup[] }) {
  return (
    <section aria-labelledby="domains-title" className="py-20">
      <Container className="flex flex-col gap-10">
        <SectionHead eyebrow="Domains" titleId="domains-title" title="The same skills, by job" />
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {domains.map((group, index) => (
            <li key={group.domain} className="min-w-0">
              <Reveal delay={(index % 3) * 80} className="h-full">
                <Tile className="flex h-full flex-col gap-4">
                  <h3 className="text-xl leading-tight">{group.title}</h3>
                  <p className="text-muted">{group.body}</p>
                  <ul
                    aria-label={`${group.title} skills`}
                    className="mt-auto flex flex-wrap gap-1.5"
                  >
                    {group.skills.map((skill) => (
                      <li
                        key={skill}
                        className="label-mono rounded-chip border border-line px-2 py-1"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </Tile>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
