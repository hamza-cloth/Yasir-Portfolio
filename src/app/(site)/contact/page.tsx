import { IstClock } from "@/components/layout/IstClock";
import { PageHero } from "@/components/page/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CopyButton } from "@/components/ui/CopyButton";
import { Highlight } from "@/components/ui/Highlight";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getSiteSettings } from "@/lib/data/settings";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return pageMetadata({
    title: "Contact",
    description: `Get in touch with ${settings.name}. ${settings.availability}.`,
    path: "/contact",
  });
}

const STEPS = [
  {
    title: "Send a short note",
    body: "The role or the problem, and where you are. A few lines is plenty.",
  },
  {
    title: "I reply within a day",
    body: "Usually the same day in India Standard Time, with questions or a time to talk.",
  },
  {
    title: "We pick a next step",
    body: "A call, an interview or a scoped fix. No long back-and-forth.",
  },
];

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const profiles = [
    { label: "LinkedIn", href: settings.linkedinUrl, icon: "linkedin" },
    { label: "GitHub", href: settings.githubUrl, icon: "github" },
  ].filter((link): link is { label: string; href: string; icon: IconName } => Boolean(link.href));

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let’s <Highlight>talk</Highlight>
          </>
        }
        lead={`${settings.availability}. Hiring, a network that misbehaves or an app that needs shipping: email is the fastest way to reach me.`}
      />

      <section aria-label="Ways to reach me" className="pb-12">
        <Container className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="surface relative isolate flex min-w-0 flex-col gap-8 overflow-hidden rounded-panel border border-line-2 p-[clamp(24px,4.5vw,56px)] shadow-(--shadow-lift)">
            <div
              aria-hidden="true"
              className="absolute -top-1/3 -right-1/4 -z-10 size-[36rem] bg-[radial-gradient(closest-side,var(--glow),transparent)] terminal:hidden"
            />
            <p className="label-mono flex items-center gap-2.5 text-ok">
              <span aria-hidden="true" className="status-dot" />
              Available now
            </p>
            <div className="flex min-w-0 flex-col gap-3">
              <p className="label-mono text-faint">Email</p>
              <a
                href={`mailto:${settings.email}`}
                className="text-[clamp(1.4rem,3.6vw,2.6rem)] leading-tight font-medium tracking-[-0.035em] [overflow-wrap:anywhere] text-fg transition-colors hover:text-c1-text"
              >
                {settings.email}
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href={`mailto:${settings.email}`} variant="primary" size="lg">
                <Icon name="mail" size={17} />
                Write an email
              </Button>
              <CopyButton value={settings.email}>Copy address</CopyButton>
            </div>
            {profiles.length > 0 ? (
              <ul className="flex flex-wrap gap-3 border-t border-line pt-6">
                {profiles.map((profile) => (
                  <li key={profile.label}>
                    <Button href={profile.href} variant="line" rel="me noopener">
                      <Icon name={profile.icon} size={16} />
                      {profile.label}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <aside
            aria-label="Details"
            className="surface flex min-w-0 flex-col gap-6 rounded-panel border border-line p-[clamp(24px,3.5vw,40px)]"
          >
            <dl className="flex flex-col">
              <div className="flex flex-col gap-1 pb-4">
                <dt className="label-mono text-faint">Based in</dt>
                <dd className="inline-flex items-center gap-2 text-lg font-medium text-fg">
                  <Icon name="map-pin" size={17} className="text-muted" />
                  {settings.location}
                </dd>
              </div>
              <div className="flex flex-col gap-2 border-t border-line py-4">
                <dt className="label-mono text-faint">Local time</dt>
                <dd>
                  <IstClock />
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-t border-line pt-4">
                <dt className="label-mono text-faint">Role</dt>
                <dd className="text-lg font-medium text-fg">{settings.roleLine}</dd>
              </div>
            </dl>
          </aside>
        </Container>
      </section>

      <section aria-labelledby="process-title" className="py-16">
        <Container className="flex flex-col gap-10">
          <h2 id="process-title" className="text-h2 leading-[1.02]">
            What happens <Highlight>next</Highlight>
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="surface flex flex-col gap-4 rounded-card border border-line p-6 md:p-7"
              >
                <span className="text-serif-accent text-4xl leading-none text-c1-text">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl tracking-[-0.03em]">{step.title}</h3>
                <p className="text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
