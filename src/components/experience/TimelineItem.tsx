import type { TimelineEntry } from "@/lib/timeline";

export function TimelineItem({ entry }: { entry: TimelineEntry }) {
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className="timeline-dot absolute top-2 -left-10 size-[15px] rounded-full border-2 border-c1 bg-bg sm:-left-14 sm:size-[23px]"
      />
      <article className="flex flex-col gap-3 rounded-card border border-line bg-surface-solid p-6">
        <p className="label-mono flex flex-wrap gap-x-3 gap-y-1 text-c1-text">
          <span>{entry.kind}</span>
          {entry.period ? <span className="text-muted">{entry.period}</span> : null}
        </p>
        <h3 className="text-[clamp(1.3rem,2.4vw,1.8rem)] leading-tight">{entry.heading}</h3>
        {entry.detail ? <p className="text-fg">{entry.detail}</p> : null}
        {entry.location ? <p className="label-mono text-muted">{entry.location}</p> : null}
        {entry.summary ? <p className="max-w-2xl text-muted">{entry.summary}</p> : null}
      </article>
    </li>
  );
}
