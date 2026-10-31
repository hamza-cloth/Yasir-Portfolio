import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { HIRE_SERVICES, type ServiceIcon } from "@/lib/hire";

const ICONS: Record<ServiceIcon, string> = {
  browser: "M3 5h18v14H3zM3 9h18M6.5 7h.01M9 7h.01",
  cart: "M3 4h2l2.4 11h10.2L20 8H6.2M9 20h.01M17 20h.01",
  dashboard: "M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z",
  phone: "M8 2h8v20H8zM11 18h2M10 5h4",
  gauge: "M4 17a8 8 0 1 1 16 0M12 13l4-4M12 17h.01",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM9 12l2 2 4-4",
};

// "What I can build for you": one card per service, prices only where they are set.
export function ServicesGrid() {
  return (
    <section aria-labelledby="hire-services-title" className="section-y">
      <Container className="flex flex-col gap-10">
        <SectionHead
          eyebrow="Services"
          titleId="hire-services-title"
          title="What I Can Build For You"
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HIRE_SERVICES.map((service, index) => (
            <li key={service.title} className="min-w-0">
              <Reveal delay={index * 70} className="h-full">
                <article className="hire-card group surface flex h-full flex-col gap-5 rounded-tile border border-line p-7">
                  <span className="hire-icon grid size-12 place-items-center rounded-xl border border-c1 text-c1-text">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={ICONS[service.icon]} />
                    </svg>
                  </span>
                  <h3 className="text-xl leading-tight">{service.title}</h3>
                  <p className="text-muted">{service.description}</p>
                  <ul className="mt-auto flex flex-wrap gap-2" aria-label="Includes">
                    {service.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-pill border border-line px-3 py-1 font-mono text-xs text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                  {service.startingPrice ? (
                    <p className="border-t border-line pt-4 font-mono text-sm text-c1-text">
                      Starting at {service.startingPrice}
                    </p>
                  ) : null}
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
