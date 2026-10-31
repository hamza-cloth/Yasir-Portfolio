import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import type { PublicTestimonial } from "@/lib/data/testimonials";

// What clients said, approved in the admin. Hidden until there is at least one.
export function Testimonials({ testimonials }: { testimonials: PublicTestimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-title" className="section-y">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            eyebrow="Testimonials"
            titleId="testimonials-title"
            title={
              <>
                In their <Highlight>own words</Highlight>
              </>
            }
          />
          <Button href="/testimonial" variant="line">
            Leave a testimonial
          </Button>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-4">
          {testimonials.map((item, index) => (
            <li key={item.id} className="min-w-0">
              <Reveal delay={index * 90} className="h-full">
                <figure className="surface flex h-full flex-col gap-5 rounded-card border border-line p-6">
                  {item.rating ? (
                    <p className="text-c1-text">
                      <span aria-hidden="true">
                        {"★".repeat(item.rating)}
                        <span className="text-faint">{"★".repeat(5 - item.rating)}</span>
                      </span>
                      <span className="sr-only">Rated {item.rating} out of 5</span>
                    </p>
                  ) : null}
                  <blockquote className="flex-1 text-[1.02rem] leading-relaxed whitespace-pre-line text-fg/90">
                    “{item.quote}”
                  </blockquote>
                  <figcaption>
                    <span className="block font-semibold text-fg">{item.name}</span>
                    {item.role || item.company ? (
                      <span className="text-sm text-muted">
                        {[item.role, item.company].filter(Boolean).join(", ")}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
