import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import type { ProjectSummary } from "@/lib/content/types";

export function NextCase({ project }: { project: ProjectSummary }) {
  return (
    <section aria-label="Next case study" className="py-24">
      <Container>
        <Link
          href={`/work/${project.slug}`}
          data-cursor="Next"
          className="glow-hover group flex flex-col gap-6 rounded-panel border border-line bg-surface-solid p-[clamp(24px,5vw,56px)] sm:flex-row sm:items-end sm:justify-between"
        >
          <span className="flex min-w-0 flex-col gap-4">
            <Eyebrow as="span">Next case study</Eyebrow>
            <span className="font-display text-h2 leading-none">{project.title}</span>
            <span className="max-w-xl text-muted">{project.tagline}</span>
          </span>
          <span className="grid size-14 flex-none place-items-center rounded-pill bg-c1 text-c1-ink transition-transform duration-500 ease-entrance group-hover:translate-x-1.5">
            <Icon name="arrow-right" size={22} />
          </span>
        </Link>
      </Container>
    </section>
  );
}
