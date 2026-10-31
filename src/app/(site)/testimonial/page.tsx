import { TestimonialForm } from "@/components/home/TestimonialForm";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "Leave a testimonial",
    description: "Worked with Yasir? Share how it went in a few lines.",
    path: "/testimonial",
  });
}

export default function TestimonialPage() {
  return (
    <>
      <PageHero
        eyebrow="Testimonial"
        title={
          <>
            Worked together? <Highlight>Say how it went</Highlight>
          </>
        }
        lead="Two or three honest lines help the next client decide. Thank you for taking the time."
      />
      <Container className="max-w-3xl pb-(--section-y)">
        <TestimonialForm />
      </Container>
    </>
  );
}
