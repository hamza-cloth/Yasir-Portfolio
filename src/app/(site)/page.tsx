import { Fragment, type ReactNode } from "react";

import { HireIntro } from "@/components/hire/HireIntro";
import { CareerTimeline } from "@/components/home/CareerTimeline";
import { CtaBand } from "@/components/home/CtaBand";
import { GlanceGrid } from "@/components/home/GlanceGrid";
import { Hero } from "@/components/home/Hero";
import { LatestNotes } from "@/components/home/LatestNotes";
import { LogoStrip } from "@/components/home/LogoStrip";
import { ProjectStack } from "@/components/home/ProjectStack";
import { ServiceRows } from "@/components/home/ServiceRows";
import { Testimonials } from "@/components/home/Testimonials";
import { Highlight } from "@/components/ui/Highlight";
import { Steps } from "@/components/ui/Steps";
import { PROCESS } from "@/lib/content/process";
import { SERVICES } from "@/lib/content/services";
import { getCredentials } from "@/lib/data/credentials";
import { getExperience } from "@/lib/data/experience";
import { getLatestNotes } from "@/lib/data/notes";
import { getProjectSummaries } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { getSiteConfig } from "@/lib/data/site-config";
import { getSkills } from "@/lib/data/skills";
import { getTestimonials } from "@/lib/data/testimonials";
import { groupSkillsByLayer } from "@/lib/osi";
import { getProfilePhoto } from "@/lib/profile-photo";
import { pageMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import type { HomeSectionId } from "@/lib/site-config";
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
  const [
    settings,
    projects,
    experience,
    credentials,
    skills,
    notes,
    testimonials,
    sections,
    appearance,
  ] = await Promise.all([
    getSiteSettings(),
    getProjectSummaries(),
    getExperience(),
    getCredentials(),
    getSkills(),
    getLatestNotes(3),
    getTestimonials(),
    getSiteConfig("sections"),
    getSiteConfig("appearance"),
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

  // Every section after the hero, shown in the order and with the visibility set in the admin.
  const blocks: Record<HomeSectionId, ReactNode> = {
    logos: <LogoStrip />,
    glance: (
      <GlanceGrid
        settings={settings}
        projects={projects}
        experience={experience}
        credentials={credentials}
        layers={layers}
      />
    ),
    services: <ServiceRows services={SERVICES} />,
    projects: <ProjectStack projects={projects} />,
    process: (
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
    ),
    timeline: <CareerTimeline entries={buildTimeline(experience, credentials)} />,
    notes: <LatestNotes notes={notes} />,
    testimonials: <Testimonials testimonials={testimonials} />,
    hire: (
      <HireIntro
        id="hire"
        headingLevel="h2"
        projectHref="/hire#inquiry"
        email={settings.email}
        className="section-y scroll-mt-20"
      />
    ),
    cta: <CtaBand email={settings.email} availability={settings.availability} />,
  };

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
        globeOpacity={appearance.watermark ? appearance.watermarkOpacity / 100 : null}
        badges={[
          ...(hasCcna ? [{ title: "Cisco CCNA", detail: "trained" }] : []),
          { title: `${projects.length} products`, detail: "in build" },
          { title: `${experience.length} support roles`, detail: "technical support" },
        ]}
      />
      {sections.home.map((id) => (
        <Fragment key={id}>{blocks[id]}</Fragment>
      ))}
    </>
  );
}
