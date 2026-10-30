import { CareerTimeline } from "@/components/home/CareerTimeline";
import { CtaBand } from "@/components/home/CtaBand";
import { GlanceGrid } from "@/components/home/GlanceGrid";
import { Hero } from "@/components/home/Hero";
import { LatestNotes } from "@/components/home/LatestNotes";
import { LogoStrip } from "@/components/home/LogoStrip";
import { ProjectStack } from "@/components/home/ProjectStack";
import { ServiceRows } from "@/components/home/ServiceRows";
import { Highlight } from "@/components/ui/Highlight";
import { Steps } from "@/components/ui/Steps";
import { PROCESS } from "@/lib/content/process";
import { SERVICES } from "@/lib/content/services";
import { getCredentials } from "@/lib/data/credentials";
import { getExperience } from "@/lib/data/experience";
import { getLatestNotes } from "@/lib/data/notes";
import { getProjectSummaries } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { getSkills } from "@/lib/data/skills";
import { groupSkillsByLayer } from "@/lib/osi";
import { getProfilePhoto } from "@/lib/profile-photo";
import { pageMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import { buildTimeline } from "@/lib/timeline";

export async function generateMetadata() {
  const metadata = await pageMetadata({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
  });
  // The home title is the full name line, not "… · Yasir Abdullah" from the template.
  return { ...metadata, title: { absolute: String(metadata.title) } };
}

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
  const skillCount = layers.reduce((sum, group) => sum + group.skills.length, 0);
  const hasCcna = credentials.some((credential) => credential.kind === "TRAINING");
  const stats = [
    { value: experience.length, label: "Support roles" },
    { value: projects.length, label: "Products in build" },
    { value: skillCount, label: "Skills listed" },
    ...(hasCcna ? [{ value: "CCNA", label: "Cisco trained" }] : []),
  ];

  return (
    <>
      <Hero
        name={settings.name}
        roleLine={settings.roleLine}
        photo={await getProfilePhoto(settings.photoUrl)}
        openToWork={settings.openToWork}
        stats={stats}
        email={settings.email}
        linkedinUrl={settings.linkedinUrl}
        githubUrl={settings.githubUrl}
        badges={[
          ...(hasCcna ? [{ title: "Cisco CCNA", detail: "trained" }] : []),
          { title: `${projects.length} products`, detail: "in build" },
          { title: `${experience.length} support roles`, detail: "technical support" },
        ]}
      />
      <LogoStrip />
      <GlanceGrid
        settings={settings}
        projects={projects}
        experience={experience}
        credentials={credentials}
        layers={layers}
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
      <LatestNotes notes={notes} />
      <CtaBand email={settings.email} availability={settings.availability} />
    </>
  );
}
