import type { ReactNode } from "react";
import Image from "next/image";

import { PageHero } from "@/components/page/PageHero";
import { PrintButton } from "@/components/resume/PrintButton";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getCredentials } from "@/lib/data/credentials";
import { getExperience } from "@/lib/data/experience";
import { getProjectSummaries } from "@/lib/data/projects";
import { getActiveResume, getSiteSettings } from "@/lib/data/settings";
import { getSkills } from "@/lib/data/skills";
import { WHATSAPP_NUMBER } from "@/lib/hire";
import { getProfilePhoto } from "@/lib/profile-photo";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { groupSkillsByDomain } from "@/lib/skill-domains";
import { buildTimeline } from "@/lib/timeline";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return pageMetadata({
    title: "Resume",
    description: `Résumé of ${settings.name}: ${settings.roleLine}.`,
    path: "/resume",
  });
}

function SheetHeading({ children }: { children: string }) {
  return (
    <h2 className="cv-heading">
      <span aria-hidden="true" className="cv-heading-mark" />
      {children}
    </h2>
  );
}

function Contact({ icon, href, children }: { icon: IconName; href?: string; children: ReactNode }) {
  const body = (
    <>
      <span aria-hidden="true" className="cv-contact-icon">
        <Icon name={icon} size={12} />
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="cv-contact">
          {body}
        </a>
      ) : (
        <span className="cv-contact">{body}</span>
      )}
    </li>
  );
}

const urlLabel = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default async function ResumePage() {
  const [settings, experience, credentials, skills, projects, pdf] = await Promise.all([
    getSiteSettings(),
    getExperience(),
    getCredentials(),
    getSkills(),
    getProjectSummaries(),
    getActiveResume(),
  ]);
  const photo = await getProfilePhoto(settings.photoUrl);

  const timeline = buildTimeline(experience, credentials);
  const jobs = timeline.filter((entry) => experience.some((item) => item.id === entry.id));
  const education = timeline.filter((entry) => credentials.some((item) => item.id === entry.id));
  const domains = groupSkillsByDomain(skills).filter((group) => group.skills.length > 0);
  const [summary] = settings.aboutStory.split("\n\n");
  const [role, ...tags] = settings.roleLine.split(" · ");
  const initials = settings.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const phone = WHATSAPP_NUMBER
    ? `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 7)} ${WHATSAPP_NUMBER.slice(7)}`
    : null;
  const skillCount = domains.reduce((sum, group) => sum + group.skills.length, 0);
  const facts = [
    { value: String(jobs.length), label: jobs.length === 1 ? "Support role" : "Support roles" },
    { value: String(projects.length), label: "Products in build" },
    { value: String(skillCount), label: "Skills" },
  ];

  return (
    <>
      <div className="print:hidden">
        <PageHero
          eyebrow="Resume"
          title={
            <>
              One page, <Highlight>no fluff</Highlight>
            </>
          }
          lead="Everything a hiring manager needs on a single sheet. Download it, or print it and save it as a PDF."
        >
          <div className="flex flex-wrap gap-3">
            {pdf ? (
              <Button href="/api/resume" variant="accent" size="lg">
                <Icon name="download" size={17} />
                Download PDF
              </Button>
            ) : null}
            <PrintButton />
            <Button href="/contact" variant="line" size="lg">
              Get in touch
            </Button>
          </div>
        </PageHero>
      </div>

      <section aria-label="Résumé" className="cv-stage pb-16 print:p-0">
        <Container className="print:max-w-none print:p-0">
          <div aria-hidden="true" className="cv-glow print:hidden" />
          <article className="cv">
            <header className="cv-head">
              <div className="cv-identity">
                <div className="cv-photo">
                  {photo ? (
                    <Image
                      src={photo.src}
                      alt={settings.name}
                      width={240}
                      height={240}
                      sizes="96px"
                      placeholder="blur"
                      blurDataURL={photo.blurDataURL}
                      className="size-full object-cover object-[center_20%]"
                    />
                  ) : (
                    <span role="img" aria-label={settings.name} className="cv-initials">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h1 className="cv-name">{settings.name}</h1>
                  <p className="cv-role">{role}</p>
                  {tags.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <li key={tag} className="cv-tag">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
              <ul className="cv-contacts">
                <Contact icon="mail" href={`mailto:${settings.email}`}>
                  {settings.email}
                </Contact>
                {phone ? (
                  <Contact icon="phone" href={`tel:+${WHATSAPP_NUMBER}`}>
                    {phone}
                  </Contact>
                ) : null}
                <Contact icon="map-pin">{settings.location}</Contact>
                {settings.linkedinUrl ? (
                  <Contact icon="linkedin" href={settings.linkedinUrl}>
                    {urlLabel(settings.linkedinUrl)}
                  </Contact>
                ) : null}
                {settings.githubUrl ? (
                  <Contact icon="github" href={settings.githubUrl}>
                    {urlLabel(settings.githubUrl)}
                  </Contact>
                ) : null}
                <Contact icon="arrow-up-right" href={SITE_URL}>
                  {urlLabel(SITE_URL)}
                </Contact>
              </ul>
            </header>

            <div className="cv-body">
              <div className="cv-main">
                <section>
                  <SheetHeading>Profile</SheetHeading>
                  <p className="cv-text">
                    {summary} {settings.availability}.
                  </p>
                </section>

                {jobs.length > 0 ? (
                  <section>
                    <SheetHeading>Experience</SheetHeading>
                    <ol className="cv-timeline">
                      {jobs.map((job) => {
                        const item = experience.find((entry) => entry.id === job.id);
                        return (
                          <li key={job.id} className="cv-entry">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                              <h3 className="cv-entry-title">{job.heading}</h3>
                              <p className="cv-meta">
                                {[job.period, job.location].filter(Boolean).join(" · ")}
                              </p>
                            </div>
                            <p className="cv-kind">{job.kind}</p>
                            {job.summary ? <p className="cv-text mt-1">{job.summary}</p> : null}
                            {item && item.highlights.length > 0 ? (
                              <ul className="cv-bullets">
                                {item.highlights.map((highlight) => (
                                  <li key={highlight}>{highlight}</li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                ) : null}

                {projects.length > 0 ? (
                  <section>
                    <SheetHeading>Projects</SheetHeading>
                    <ul className="flex flex-col gap-3.5">
                      {projects.map((project) => (
                        <li key={project.slug} className="cv-project">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <h3 className="cv-entry-title">{project.title}</h3>
                            <span className="cv-status">{project.statusLabel}</span>
                          </div>
                          <p className="cv-text">{project.tagline}</p>
                          {project.stack.length > 0 ? (
                            <p className="cv-stack">{project.stack.join(" · ")}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                {education.length > 0 ? (
                  <section>
                    <SheetHeading>Education & training</SheetHeading>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {education.map((entry) => (
                        <li key={entry.id} className="cv-edu">
                          <h3 className="cv-entry-title cv-entry-title--sm">{entry.heading}</h3>
                          <p className="cv-meta">
                            {[entry.detail, entry.period].filter(Boolean).join(" · ")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>

              <aside className="cv-side" aria-label="At a glance and skills">
                <section>
                  <SheetHeading>At a glance</SheetHeading>
                  <dl className="cv-facts">
                    {facts.map((fact) => (
                      <div key={fact.label} className="flex flex-col">
                        <dt className="cv-fact-label order-2">{fact.label}</dt>
                        <dd className="cv-fact-value order-1">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                {domains.length > 0 ? (
                  <section>
                    <SheetHeading>Skills</SheetHeading>
                    <dl className="flex flex-col gap-3">
                      {domains.map((group) => (
                        <div key={group.domain} className="cv-skill-group">
                          <dt className="cv-skill-title">{group.title}</dt>
                          <dd>
                            <ul className="flex flex-wrap gap-1">
                              {group.skills.map((skill) => (
                                <li key={skill} className="cv-chip">
                                  {skill}
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ) : null}
              </aside>
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}
