import { PageHero } from "@/components/page/PageHero";
import { PrintButton } from "@/components/resume/PrintButton";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { Icon } from "@/components/ui/Icon";
import { getCredentials } from "@/lib/data/credentials";
import { getExperience } from "@/lib/data/experience";
import { getProjectSummaries } from "@/lib/data/projects";
import { getActiveResume, getSiteSettings } from "@/lib/data/settings";
import { getSkills } from "@/lib/data/skills";
import { pageMetadata } from "@/lib/seo";
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
    <h2 className="mb-4 border-b border-(--sheet-line) pb-2 font-mono text-xs font-medium tracking-[0.12em] text-(--sheet-accent) uppercase">
      {children}
    </h2>
  );
}

export default async function ResumePage() {
  const [settings, experience, credentials, skills, projects, pdf] = await Promise.all([
    getSiteSettings(),
    getExperience(),
    getCredentials(),
    getSkills(),
    getProjectSummaries(),
    getActiveResume(),
  ]);

  const timeline = buildTimeline(experience, credentials);
  const jobs = timeline.filter((entry) => experience.some((item) => item.id === entry.id));
  const education = timeline.filter((entry) => credentials.some((item) => item.id === entry.id));
  const domains = groupSkillsByDomain(skills).filter((group) => group.skills.length > 0);
  const [summary] = settings.aboutStory.split("\n\n");

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
          lead="Everything a hiring manager needs on a single sheet. Print it, or save it as a PDF from the print dialog."
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

      <section aria-label="Résumé" className="pb-12 print:p-0">
        <Container className="print:max-w-none print:p-0">
          <article className="mx-auto max-w-[52rem] rounded-card bg-(--sheet-bg) p-[clamp(24px,6vw,64px)] text-(--sheet-fg) shadow-(--shadow-lift) [text-shadow:none] print:max-w-none print:rounded-none print:p-0 print:shadow-none">
            <header className="flex flex-col gap-4 border-b border-(--sheet-line) pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="font-body text-[clamp(2rem,5vw,2.75rem)] leading-none font-semibold tracking-[-0.04em]">
                  {settings.name}
                </h1>
                <p className="text-(--sheet-muted)">{settings.roleLine}</p>
              </div>
              <ul className="flex flex-col gap-1 text-sm text-(--sheet-muted) sm:items-end">
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex items-center gap-2 hover:text-(--sheet-accent)"
                  >
                    <Icon name="mail" size={14} />
                    {settings.email}
                  </a>
                </li>
                <li className="inline-flex items-center gap-2">
                  <Icon name="map-pin" size={14} />
                  {settings.location}
                </li>
                {settings.linkedinUrl ? (
                  <li>
                    <a href={settings.linkedinUrl} className="inline-flex items-center gap-2">
                      <Icon name="linkedin" size={14} />
                      LinkedIn
                    </a>
                  </li>
                ) : null}
                {settings.githubUrl ? (
                  <li>
                    <a href={settings.githubUrl} className="inline-flex items-center gap-2">
                      <Icon name="github" size={14} />
                      GitHub
                    </a>
                  </li>
                ) : null}
              </ul>
            </header>

            <div className="flex flex-col gap-9 pt-8">
              <section>
                <SheetHeading>Profile</SheetHeading>
                <p className="leading-relaxed">
                  {summary} {settings.availability}.
                </p>
              </section>

              <section>
                <SheetHeading>Experience</SheetHeading>
                <ol className="flex flex-col gap-6">
                  {jobs.map((job) => {
                    const item = experience.find((entry) => entry.id === job.id);
                    return (
                      <li key={job.id} className="break-inside-avoid">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                          <h3 className="font-body text-lg font-semibold tracking-[-0.02em]">
                            {job.kind} · {job.heading}
                          </h3>
                          <p className="font-mono text-xs text-(--sheet-muted)">
                            {[job.period, job.location].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        {job.summary ? (
                          <p className="mt-1 text-(--sheet-muted)">{job.summary}</p>
                        ) : null}
                        {item && item.highlights.length > 0 ? (
                          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 marker:text-(--sheet-accent)">
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

              <section>
                <SheetHeading>Projects</SheetHeading>
                <ul className="flex flex-col gap-4">
                  {projects.map((project) => (
                    <li key={project.slug} className="break-inside-avoid">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <h3 className="font-body font-semibold tracking-[-0.02em]">
                          {project.title}
                        </h3>
                        <p className="font-mono text-xs text-(--sheet-muted)">
                          {project.statusLabel}
                        </p>
                      </div>
                      <p className="text-(--sheet-muted)">{project.tagline}</p>
                      {project.stack.length > 0 ? (
                        <p className="mt-1 font-mono text-xs text-(--sheet-muted)">
                          {project.stack.join(" · ")}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="grid gap-9 sm:grid-cols-2">
                <section>
                  <SheetHeading>Education & training</SheetHeading>
                  <ul className="flex flex-col gap-4">
                    {education.map((entry) => (
                      <li key={entry.id} className="break-inside-avoid">
                        <h3 className="font-body font-semibold tracking-[-0.02em]">
                          {entry.heading}
                        </h3>
                        <p className="text-sm text-(--sheet-muted)">
                          {[entry.detail, entry.period].filter(Boolean).join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <SheetHeading>Skills</SheetHeading>
                  <dl className="flex flex-col gap-3">
                    {domains.map((group) => (
                      <div key={group.domain} className="break-inside-avoid">
                        <dt className="text-sm font-semibold">{group.title}</dt>
                        <dd className="text-sm text-(--sheet-muted)">{group.skills.join(", ")}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}
