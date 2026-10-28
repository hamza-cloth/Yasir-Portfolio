import { NowList } from "@/components/about/NowList";
import { Portrait } from "@/components/about/Portrait";
import { Principles } from "@/components/about/Principles";
import { CtaBand } from "@/components/home/CtaBand";
import { Markdown } from "@/components/markdown/Markdown";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { getSiteSettings } from "@/lib/data/settings";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return pageMetadata({
    title: "About",
    description: `${settings.name}: ${settings.roleLine}. ${settings.availability}.`,
    path: "/about",
  });
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const [headline, ...story] = settings.aboutStory.split("\n\n");

  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            From the support desk to the <Highlight>subnet mask</Highlight>
          </>
        }
        lead={headline}
      />
      <section aria-label="Story" className="py-12">
        <Container className="grid gap-12 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] md:items-start">
          <div className="max-w-md">
            <Portrait name={settings.name} photoUrl={settings.photoUrl} />
          </div>
          <Markdown source={story.join("\n\n")} className="text-lg" />
        </Container>
      </section>
      <Principles principles={settings.principles} />
      <NowList items={settings.nowItems} updatedAt={settings.nowUpdatedAt} />
      <CtaBand email={settings.email} availability={settings.availability} />
    </>
  );
}
