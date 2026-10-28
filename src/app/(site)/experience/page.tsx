import { InterfaceTable } from "@/components/experience/InterfaceTable";
import { Timeline } from "@/components/experience/Timeline";
import { TimelineItem } from "@/components/experience/TimelineItem";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { SectionHead } from "@/components/ui/SectionHead";
import { Steps, type Step } from "@/components/ui/Steps";
import { getCredentials } from "@/lib/data/credentials";
import { getExperience } from "@/lib/data/experience";
import { pageMetadata } from "@/lib/seo";
import { buildTimeline } from "@/lib/timeline";

const TICKET_PROCESS: Step[] = [
  {
    title: "Listen and reproduce",
    body: "Get the exact symptom, who it affects and what changed. Then see it fail with your own eyes.",
  },
  {
    title: "Find the layer",
    body: "Walk up from the cable: link, VLAN, address, gateway, DNS, app. Stop at the first thing that is wrong.",
  },
  {
    title: "Fix and verify",
    body: "Change one thing at a time and prove it worked with a ping, a show command or the user’s own test.",
  },
  {
    title: "Document and close",
    body: "Write down the cause and the fix, so the next person with the same ticket starts at the answer.",
  },
];

export async function generateMetadata() {
  return pageMetadata({
    title: "Experience",
    description:
      "Technical support at Earthix Software Solutions and Cyfuture India, Cisco CCNA training at DUCAT and a BCA at Maharishi University of Information Technology.",
    path: "/experience",
  });
}

export default async function ExperiencePage() {
  const [experience, credentials] = await Promise.all([getExperience(), getCredentials()]);
  const timeline = buildTimeline(experience, credentials);

  return (
    <>
      <PageHero
        eyebrow="Experience"
        title={
          <>
            Two support desks and a <Highlight>CCNA lab</Highlight>
          </>
        }
        lead="Technical support on cloud business software and on hosting and data-centre services, backed by CCNA training and a degree in progress."
      />
      <section aria-label="Timeline" className="py-12">
        <Container className="max-w-4xl">
          <Timeline>
            {timeline.map((entry) => (
              <TimelineItem key={entry.id} entry={entry} />
            ))}
          </Timeline>
        </Container>
      </section>
      <section aria-labelledby="interfaces-title" className="py-20">
        <Container className="flex flex-col gap-10">
          <SectionHead
            eyebrow="Console"
            titleId="interfaces-title"
            title="The record, as a router sees it"
          />
          <InterfaceTable entries={timeline} />
        </Container>
      </section>
      <Steps
        id="ticket-title"
        eyebrow="Ticket process"
        title="How a ticket gets closed"
        steps={TICKET_PROCESS}
      />
    </>
  );
}
