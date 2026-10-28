"use client";

import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { SectionHead } from "@/components/ui/SectionHead";
import type { JourneyPanel as JourneyPanelData } from "@/lib/content/journey";

import { JourneyPanel } from "./JourneyPanel";

// Must match the media query in home.css that turns on the pinned layout.
const PINNED_QUERY = "(min-width: 961px) and (prefers-reduced-motion: no-preference)";

export function Journey({ panels }: { panels: JourneyPanelData[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const media = window.matchMedia(PINNED_QUERY);
    let frame = 0;
    let onScreen = false;

    function update() {
      frame = 0;
      if (!section || !track || !media.matches) return;
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      const distance = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.setProperty("--journey-shift", `${(progress * distance).toFixed(1)}px`);
      section.style.setProperty("--journey-progress", progress.toFixed(4));
      setActive(Math.min(panels.length - 1, Math.round(progress * (panels.length - 1))));
    }

    function schedule() {
      if (onScreen && !frame) frame = window.requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      schedule();
    });
    observer.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [panels.length]);

  return (
    <section ref={sectionRef} aria-labelledby="journey-title" className="journey py-24">
      <div className="journey-sticky flex flex-col gap-12">
        <Container className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            eyebrow="The journey"
            titleId="journey-title"
            title={
              <>
                Four rooms <Highlight>I work in</Highlight>
              </>
            }
          />
          <div aria-hidden="true" className="journey-meter w-56 flex-col gap-3">
            <p className="label-mono text-muted">
              <span className="text-fg">{active + 1}</span> / {panels.length}
            </p>
            <div className="h-0.5 w-full bg-line">
              <div className="journey-progress h-full w-full" />
            </div>
          </div>
        </Container>
        <div className="min-w-0">
          <ol ref={trackRef} className="journey-track shell">
            {panels.map((panel) => (
              <JourneyPanel key={panel.title} panel={panel} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
