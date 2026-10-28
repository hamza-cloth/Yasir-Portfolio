import { ConsoleSection } from "@/components/home/ConsoleSection";
import { CtaBand } from "@/components/home/CtaBand";
import { GlanceGrid } from "@/components/home/GlanceGrid";
import { Hero, type HeroStat } from "@/components/home/Hero";
import { Journey } from "@/components/home/Journey";
import { LatestNotes } from "@/components/home/LatestNotes";
import { Marquee } from "@/components/home/Marquee";
import { ProjectStack } from "@/components/home/ProjectStack";
import { ServiceRows } from "@/components/home/ServiceRows";
import type { StatusRow } from "@/components/home/StatusPanel";
import { buildJourneyPanels } from "@/lib/content/journey";
import { SERVICES } from "@/lib/content/services";
import { getCredentials } from "@/lib/data/credentials";
import { getExperience } from "@/lib/data/experience";
import { getLatestNotes } from "@/lib/data/notes";
import { getProjectSummaries } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { getSkills } from "@/lib/data/skills";
import { groupSkillsByLayer } from "@/lib/osi";
import { buildTerminalContext } from "@/lib/terminal/context";
import { buildTranscript, DEMO_COMMANDS } from "@/lib/terminal/transcript";

export default async function HomePage() {
  const [settings, projects, experience, credentials, skills, notes] = await Promise.all([
    getSiteSettings(),
    getProjectSummaries(),
    getExperience(),
    getCredentials(),
    getSkills(),
    getLatestNotes(3),
  ]);

  const layers = groupSkillsByLayer(skills);
  const terminalContext = buildTerminalContext(settings, projects, skills);
  const ccna = credentials.find((credential) => credential.kind === "TRAINING");
  const degree = credentials.find((credential) => credential.kind === "DEGREE");
  // "Bachelor of Computer Applications (BCA)" → "BCA"; the panel row is short.
  const degreeName = degree ? (/\(([^)]+)\)/.exec(degree.title)?.[1] ?? degree.title) : null;

  const statusRows: StatusRow[] = [
    { label: "Role", value: settings.roleLine.split(" · ")[0] ?? settings.roleLine },
    ...(ccna ? [{ label: "Training", value: `${ccna.title} · ${ccna.issuer}` }] : []),
    ...(degree && degreeName
      ? [{ label: "Degree", value: `${degreeName} · ${degree.startYear}–${degree.endYear}` }]
      : []),
    ...(projects[0] ? [{ label: "Building", value: projects[0].title }] : []),
  ];

  const stats: HeroStat[] = [
    ...(ccna ? [{ value: "CCNA", label: "Cisco routing & switching training" }] : []),
    { value: experience.length, label: "Support roles in cloud & hosting" },
    { value: projects.length, label: "Products in development" },
    { value: skills.length, label: "Skills across the network and the app" },
  ];

  return (
    <>
      <Hero
        name={settings.name}
        location={settings.location}
        statusRows={statusRows}
        stats={stats}
      />
      <Marquee />
      <GlanceGrid
        settings={settings}
        projects={projects}
        experience={experience}
        credentials={credentials}
        layers={layers}
      />
      <Journey panels={buildJourneyPanels(settings, experience, projects)} />
      <ServiceRows services={SERVICES} />
      <ProjectStack projects={projects} />
      <ConsoleSection
        context={terminalContext}
        transcript={buildTranscript(DEMO_COMMANDS, terminalContext)}
      />
      <LatestNotes notes={notes} />
      <CtaBand email={settings.email} availability={settings.availability} />
    </>
  );
}
