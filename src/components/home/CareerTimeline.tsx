import { Timeline } from "@/components/experience/Timeline";
import { TimelineItem } from "@/components/experience/TimelineItem";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Icon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/SectionHead";
import type { TimelineEntry } from "@/lib/timeline";

export function CareerTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <section aria-labelledby="career-title" className="py-14 md:py-16">
      <Container className="grid gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-16">
        <div className="flex flex-col items-start gap-8 md:sticky md:top-[calc(var(--header-h)+32px)] md:self-start">
          <SectionHead
            eyebrow="Career"
            titleId="career-title"
            title={
              <>
                From the support desk <Highlight>to the lab</Highlight>
              </>
            }
            lead="Two technical support roles, Cisco CCNA training and a degree in progress."
          />
          <div className="flex flex-wrap gap-3">
            <Button href="/resume" variant="line">
              <Icon name="download" size={16} />
              Résumé
            </Button>
            <Button href="/experience" variant="line">
              Full experience
              <Icon name="arrow-right" size={16} />
            </Button>
          </div>
        </div>
        <Timeline>
          {entries.map((entry) => (
            <TimelineItem key={entry.id} entry={entry} />
          ))}
        </Timeline>
      </Container>
    </section>
  );
}
