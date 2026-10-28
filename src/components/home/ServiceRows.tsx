import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { cn } from "@/lib/cn";
import type { Service } from "@/lib/content/services";

// Support, network, code: one icon and tint per service, in SERVICES order.
const LOOKS = [
  {
    tint: "bg-tint-peach text-tint-peach-ink",
    path: "M4 13v-1a8 8 0 0 1 16 0v1M4 13h2.5v5H5a1 1 0 0 1-1-1zM20 13h-2.5v5H19a1 1 0 0 0 1-1zM17.5 18c0 1.5-2 2.5-4.5 2.5",
  },
  {
    tint: "bg-tint-blue text-tint-blue-ink",
    path: "M12 4v5M12 9H6v4M12 9h6v4M4 13h4v4H4zM16 13h4v4h-4zM10 3h4v3h-4z",
  },
  {
    tint: "bg-tint-mint text-tint-mint-ink",
    path: "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
  },
];

export function ServiceRows({ services }: { services: Service[] }) {
  return (
    <section aria-labelledby="services-title" className="py-20 md:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHead
          eyebrow="Services"
          titleId="services-title"
          title={
            <>
              Three ways <Highlight>I can help</Highlight>
            </>
          }
        />
        <ol className="grid gap-4 md:grid-cols-3">
          {services.map((service, index) => {
            const look = LOOKS[index % LOOKS.length];
            return (
              <li key={service.title} className="min-w-0">
                <Reveal delay={index * 90} className="h-full">
                  <article className="surface group flex h-full flex-col gap-5 rounded-tile border border-line p-7 transition-[transform,box-shadow] duration-500 ease-entrance hover:-translate-y-1.5 hover:shadow-(--shadow-lift)">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-12 place-items-center rounded-2xl transition-transform duration-500 ease-entrance group-hover:scale-110 group-hover:-rotate-6",
                        look?.tint,
                      )}
                    >
                      <svg viewBox="0 0 24 24" className="size-6" fill="none">
                        <path
                          d={look?.path}
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <h3 className="text-[1.45rem] leading-tight tracking-[-0.035em]">
                      {service.title}
                    </h3>
                    <p className="text-muted">{service.body}</p>
                    <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {service.skills.map((skill) => (
                        <li
                          key={skill}
                          className="label-mono rounded-pill bg-surface-2 px-3 py-1.5 text-muted"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
