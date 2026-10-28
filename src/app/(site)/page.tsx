import { CareerTimeline } from "@/components/home/CareerTimeline";
import { CtaBand } from "@/components/home/CtaBand";
import { GlanceGrid } from "@/components/home/GlanceGrid";
import { Hero } from "@/components/home/Hero";
import { LogoStrip } from "@/components/home/LogoStrip";
import { ProjectStack } from "@/components/home/ProjectStack";
import { ServiceRows } from "@/components/home/ServiceRows";
import { Highlight } from "@/components/ui/Highlight";
import { Steps } from "@/components/ui/Steps";
import { PROCESS } from "@/lib/content/process";
import { SERVICES } from "@/lib/content/services";
import { getCredentials } from "@/lib/data/credentials";
import { getExperience } from "@/lib/data/experience";
import { getProjectSummaries } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { getSkills } from "@/lib/data/skills";
import { groupSkillsByLayer } from "@/lib/osi";
import { buildTimeline } from "@/lib/timeline";

export default async function HomePage() {
  const [settings, projects, experience, credentials, skills] = await Promise.all([
    getSiteSettings(),
    getProjectSummaries(),
    getExperience(),
    getCredentials(),
    getSkills(),
  ]);

  return (
    <>
      <Hero name={settings.name} />
      <LogoStrip />
      <GlanceGrid
        settings={settings}
        projects={projects}
        experience={experience}
        credentials={credentials}
        layers={groupSkillsByLayer(skills)}
      />
      <ServiceRows services={SERVICES} />
      <ProjectStack projects={projects} />
      <Steps
        id="process-title"
        eyebrow="Process"
        title={
          <>
            Four steps, <Highlight>every time</Highlight>
          </>
        }
        steps={PROCESS}
      />
      <CareerTimeline entries={buildTimeline(experience, credentials)} />
      <CtaBand email={settings.email} availability={settings.availability} />
    </>
  );
}
