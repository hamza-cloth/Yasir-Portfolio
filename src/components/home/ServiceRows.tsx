import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import type { Service } from "@/lib/content/services";

export function ServiceRows({ services }: { services: Service[] }) {
  return (
    <section aria-labelledby="services-title" className="py-24">
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
        <ol className="border-t border-line">
          {services.map((service, index) => (
            <li
              key={service.title}
              className="group border-b border-line transition-colors duration-500 hover:bg-surface/60"
            >
              <Reveal
                delay={index * 80}
                className="grid gap-6 py-10 md:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10 md:px-4"
              >
                <p
                  aria-hidden="true"
                  className="text-serif-accent text-4xl leading-none text-faint transition-colors duration-500 group-hover:text-c1-text"
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.04em]">
                  {service.title}
                </h3>
                <div className="flex min-w-0 flex-col gap-5">
                  <p className="text-muted">{service.body}</p>
                  <ul className="flex flex-wrap gap-2">
                    {service.skills.map((skill) => (
                      <li
                        key={skill}
                        className="label-mono rounded-pill border border-line bg-surface-2/60 px-3 py-1.5"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
