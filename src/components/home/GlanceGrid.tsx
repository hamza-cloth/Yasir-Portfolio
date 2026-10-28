import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import type { SiteSettingsData } from "@/lib/content/site-settings";
import type { Credential, ExperienceItem, ProjectSummary } from "@/lib/content/types";
import type { OsiLayerGroup } from "@/lib/osi";

import { AboutTile } from "./tiles/AboutTile";
import { BuildingTile } from "./tiles/BuildingTile";
import { CcnaTile } from "./tiles/CcnaTile";
import { ClockTile } from "./tiles/ClockTile";
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

// 12 columns from 1120px, 6 from 720px, one below.
const SPAN = {
  about: "col-span-12 sm:col-span-6 lg:col-span-5 lg:row-span-2",
  ccna: "col-span-12 sm:col-span-6 lg:col-span-4",
  clock: "col-span-12 sm:col-span-6 lg:col-span-3",
  building: "col-span-12 sm:col-span-6 lg:col-span-4",
  support: "col-span-12 sm:col-span-6 lg:col-span-3",
  layers: "col-span-12 lg:col-span-8",
  shortcuts: "col-span-12 sm:col-span-6 lg:col-span-4",
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
  const stats = [
    { value: projects.length, label: "Products in build" },
    { value: layers.reduce((sum, group) => sum + group.skills.length, 0), label: "Skills listed" },
  ];

  return (
    <section aria-labelledby="glance-title" className="py-20 md:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHead
          eyebrow="At a glance"
          titleId="glance-title"
          title={
            <>
              The whole stack, <Highlight>one screen</Highlight>
            </>
          }
        />
        <Reveal className="reveal-group">
          <div className="stagger grid grid-cols-12 gap-4">
            <AboutTile
              headline={headline}
              location={settings.location}
              facts={facts}
              stats={stats}
              className={SPAN.about}
            />
            {ccna ? <CcnaTile issuer={ccna.issuer} topics={topics} className={SPAN.ccna} /> : null}
            <ClockTile location={settings.location} className={SPAN.clock} />
            <BuildingTile projects={projects} className={SPAN.building} />
            <SupportTile
              companies={experience.map((item) => item.company)}
              className={SPAN.support}
            />
            <LayersTile layers={layers} className={SPAN.layers} />
            <ShortcutsTile className={SPAN.shortcuts} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
