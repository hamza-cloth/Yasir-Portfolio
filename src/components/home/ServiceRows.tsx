import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import type { Service } from "@/lib/content/services";

export function ServiceRows({ services }: { services: Service[] }) {
  return (
    <section aria-labelledby="services-title" className="py-24">
      <Container className="flex flex-col gap-12">
        <SectionHead eyebrow="Services" titleId="services-title" title="Three ways I can help" />
        <ol className="border-t border-line">
          {services.map((service, index) => (
            <li key={service.title} className="border-b border-line">
              <Reveal
                delay={index * 80}
                className="grid gap-6 py-10 md:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10"
              >
                <p aria-hidden="true" className="label-mono text-c1-text">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-[clamp(1.5rem,3vw,2.4rem)] leading-tight">{service.title}</h3>
                <div className="flex min-w-0 flex-col gap-5">
                  <p className="text-muted">{service.body}</p>
                  <ul className="flex flex-wrap gap-2">
                    {service.skills.map((skill) => (
                      <li
                        key={skill}
                        className="label-mono rounded-chip border border-line px-2.5 py-1"
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
