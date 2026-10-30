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

type GlanceGridProps = {
  settings: SiteSettingsData;
  projects: ProjectSummary[];
  experience: ExperienceItem[];
  credentials: Credential[];
  layers: OsiLayerGroup[];
};

// 12 columns from 1120px: About fills the left of the first two rows; then skills and shortcuts.
const SPAN = {
  about: "col-span-12 lg:col-span-5 lg:row-span-2",
  ccna: "col-span-12 sm:col-span-6 lg:col-span-4",
  clock: "col-span-12 sm:col-span-6 lg:col-span-3",
  building: "col-span-12 lg:col-span-7",
  layers: "col-span-12 lg:col-span-8",
  shortcuts: "col-span-12 lg:col-span-4",
};

const CCNA_TOPICS = new Set(["VLANs", "802.1Q trunking", "STP", "OSPF", "ACLs", "NAT/PAT"]);
// The everyday toolbox shown on the About tile, in this order, where the skills list has them.
const TOOLBOX = [
  "React",
  "Next.js",
  "NestJS",
  "Node.js",
  "DNS",
  "DHCP",
  "Subnetting / VLSM",
  "OSPF",
  "VLANs",
  "Hardware troubleshooting",
];

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
  const skills = new Set(layers.flatMap((group) => group.skills));
  const topics = [...skills].filter((skill) => CCNA_TOPICS.has(skill));
  const toolbox = TOOLBOX.filter((skill) => skills.has(skill));

  return (
    <section aria-labelledby="glance-title" className="section-y">
      <Container className="flex flex-col gap-10">
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
              toolbox={toolbox}
              className={SPAN.about}
            />
            {ccna ? <CcnaTile issuer={ccna.issuer} topics={topics} className={SPAN.ccna} /> : null}
            <ClockTile
              location={settings.location}
              availability={settings.availability}
              className={SPAN.clock}
            />
            <BuildingTile projects={projects} className={SPAN.building} />
            <LayersTile layers={layers} className={SPAN.layers} />
            <ShortcutsTile className={SPAN.shortcuts} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
