import type { TimelineEntry } from "@/lib/timeline";

export function TimelineItem({ entry }: { entry: TimelineEntry }) {
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className="timeline-dot absolute top-6 -left-10 size-[15px] rounded-full border-[3px] border-c1 bg-surface-solid sm:-left-14 sm:size-[23px]"
      />
      <article className="tilt-3d surface flex flex-col gap-3 rounded-tile border border-line p-6 transition-transform duration-500 ease-entrance hover:translate-x-1 md:p-7">
        <p className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1 text-c1-text">
          <span>{entry.kind}</span>
          {entry.period ? <span className="text-muted">{entry.period}</span> : null}
        </p>
        <h3 className="text-[clamp(1.3rem,2.4vw,1.75rem)] leading-tight tracking-[-0.035em]">
          {entry.heading}
        </h3>
        {entry.detail ? <p className="text-fg">{entry.detail}</p> : null}
        {entry.location ? <p className="label-mono text-muted">{entry.location}</p> : null}
        {entry.summary ? <p className="max-w-2xl text-muted">{entry.summary}</p> : null}
      </article>
    </li>
  );
}
