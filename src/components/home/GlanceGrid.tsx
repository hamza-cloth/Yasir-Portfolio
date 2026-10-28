import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import type { SiteSettingsData } from "@/lib/content/site-settings";
import type { Credential, ExperienceItem, ProjectSummary } from "@/lib/content/types";
import type { OsiLayerGroup } from "@/lib/osi";

import { AboutTile } from "./tiles/AboutTile";
import { BuildingTile } from "./tiles/BuildingTile";
import { CcnaTile } from "./tiles/CcnaTile";
import { ContactTile } from "./tiles/ContactTile";
import { GlobeTile } from "./tiles/GlobeTile";
import { LayersTile } from "./tiles/LayersTile";
import { ShortcutsTile } from "./tiles/ShortcutsTile";
import { SupportTile } from "./tiles/SupportTile";

type GlanceGridProps = {
  settings: SiteSettingsData;
  projects: ProjectSummary[];
  experience: ExperienceItem[];
  credentials: Credential[];
  layers: OsiLayerGroup[];
};

// 12 columns from 1120px, 6 from 720px (globe and contact full width), 12 below.
const SPAN = {
  globe: "col-span-12 lg:col-span-7 lg:row-span-2",
  half: "col-span-12 sm:col-span-6 lg:col-span-5",
  third: "col-span-12 sm:col-span-6 lg:col-span-4",
  contact: "col-span-12 lg:col-span-8",
};

const CCNA_TOPICS = new Set(["VLANs", "802.1Q trunking", "STP", "OSPF", "ACLs", "NAT/PAT"]);

export function GlanceGrid({
  settings,
  projects,
  experience,
  credentials,
  layers,
}: GlanceGridProps) {
  const ccna = credentials.find((credential) => credential.kind === "TRAINING");
  const degree = credentials.find((credential) => credential.kind === "DEGREE");
  const headline = settings.aboutStory.split("\n\n")[0] ?? settings.roleLine;
  const facts = [
    ...experience.map((item) => `${item.role} at ${item.company}`),
    ...(degree ? [`${degree.title}, ${degree.startYear}–${degree.endYear}`] : []),
  ];
  const topics = layers.flatMap((group) => group.skills).filter((skill) => CCNA_TOPICS.has(skill));

  return (
    <section aria-labelledby="glance-title" className="py-24">
      <Container className="flex flex-col gap-12">
        <SectionHead
          eyebrow="At a glance"
          titleId="glance-title"
          title="The whole stack, one screen"
        />
        <Reveal>
          <div className="grid grid-cols-12 gap-4">
            <GlobeTile className={SPAN.globe} />
            <AboutTile
              headline={headline}
              location={settings.location}
              facts={facts}
              className={SPAN.half}
            />
            <BuildingTile projects={projects} className={SPAN.half} />
            {ccna ? <CcnaTile issuer={ccna.issuer} topics={topics} className={SPAN.third} /> : null}
            <LayersTile layers={layers} className={SPAN.third} />
            <ShortcutsTile className={SPAN.third} />
            <SupportTile
              companies={experience.map((item) => item.company)}
              className={SPAN.third}
            />
            <ContactTile
              email={settings.email}
              availability={settings.availability}
              className={SPAN.contact}
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
