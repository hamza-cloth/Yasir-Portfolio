import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import type { JourneyPanel as JourneyPanelData } from "@/lib/content/journey";

export function JourneyPanel({ panel }: { panel: JourneyPanelData }) {
  return (
    <li className="journey-panel">
      <article className="glass flex h-full min-h-[22rem] flex-col gap-6 rounded-panel p-[clamp(24px,4vw,48px)]">
        <p className="label-mono text-c1-text">{panel.label}</p>
        <h3 className="text-[clamp(1.8rem,4vw,3.2rem)] leading-none">{panel.title}</h3>
        <p className="max-w-2xl text-lg text-muted">{panel.body}</p>
        <ul className="flex flex-wrap gap-2">
          {panel.tags.map((tag) => (
            <li key={tag} className="label-mono rounded-chip border border-line px-2.5 py-1">
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
