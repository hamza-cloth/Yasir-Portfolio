import { PageHero } from "@/components/page/PageHero";
import { DomainCards } from "@/components/skills/DomainCards";
import { OsiAccordion } from "@/components/skills/OsiAccordion";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { getSkills } from "@/lib/data/skills";
import { groupSkillsByLayer } from "@/lib/osi";
import { pageMetadata } from "@/lib/seo";
import { groupSkillsByDomain } from "@/lib/skill-domains";

export async function generateMetadata() {
  return pageMetadata({
    title: "Skills",
    description:
      "Skills by OSI layer, from T568B cabling and VLANs to OSPF, TLS, sessions and React: the whole stack Yasir Abdullah works across.",
    path: "/skills",
  });
}

export default async function SkillsPage() {
  const skills = await getSkills();

  return (
    <>
      <PageHero
        eyebrow="Skills"
        title={
          <>
            Seven layers, <Highlight>one stack</Highlight>
          </>
        }
        lead="Sorted the way networks are: by OSI layer, from the cable at L1 to the app at L7. Layer 3 is open; expand the rest."
      />
      <section aria-labelledby="osi-title" className="pb-12">
        <Container>
          <h2 id="osi-title" className="sr-only">
            Skills by OSI layer
          </h2>
          <OsiAccordion layers={groupSkillsByLayer(skills)} />
        </Container>
      </section>
      <DomainCards domains={groupSkillsByDomain(skills)} />
    </>
  );
}
