import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import type { JourneyPanel as JourneyPanelData } from "@/lib/content/journey";

export function JourneyPanel({ panel }: { panel: JourneyPanelData }) {
  return (
    <li className="journey-panel">
      <article className="surface relative flex h-full min-h-[22rem] flex-col gap-6 overflow-hidden rounded-panel border border-line p-[clamp(24px,4vw,48px)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-40 size-[28rem] bg-[radial-gradient(closest-side,var(--glow),transparent)] terminal:hidden"
        />
        <p className="label-mono text-c1-text">{panel.label}</p>
        <h3 className="text-[clamp(1.9rem,4vw,3.3rem)] leading-none tracking-[-0.045em]">
          {panel.title}
        </h3>
        <p className="max-w-2xl text-lg text-muted">{panel.body}</p>
        <ul className="flex flex-wrap gap-2">
          {panel.tags.map((tag) => (
            <li
              key={tag}
              className="label-mono rounded-pill border border-line bg-surface-2/60 px-3 py-1.5"
            >
              {tag}
            </li>
          ))}
        </ul>
        {panel.cta ? (
          <Link
            href={panel.cta.href}
            className="label-mono mt-auto inline-flex min-h-11 items-center gap-2 self-start text-c1-text hover:text-fg"
          >
            {panel.cta.label}
            <Icon name="arrow-right" size={14} />
          </Link>
        ) : null}
      </article>
    </li>
  );
}
