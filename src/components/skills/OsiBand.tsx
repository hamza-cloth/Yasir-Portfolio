import type { OsiLayerGroup } from "@/lib/osi";

type OsiBandProps = {
  group: OsiLayerGroup;
  open: boolean;
  onToggle: () => void;
};

export function OsiBand({ group, open, onToggle }: OsiBandProps) {
  const buttonId = `osi-l${group.layer}-button`;
  const regionId = `osi-l${group.layer}-region`;

  return (
    <li className="border-b border-line">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={onToggle}
          className="grid min-h-20 w-full grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 py-4 text-left"
        >
          <span className="label-mono text-c1-text">L{group.layer}</span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="font-display text-[clamp(1.3rem,3vw,2rem)] leading-none">
              {group.name}
            </span>
            <span className="[font-family:var(--ff-body)] text-base font-normal tracking-normal text-muted">
              {group.summary}
            </span>
          </span>
          <span className="flex items-center gap-4">
            <span className="label-mono hidden text-muted sm:inline">
              {group.skills.length} skills
            </span>
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-pill border border-line-2 text-xl"
            >
              <span className="osi-chevron">+</span>
            </span>
          </span>
        </button>
      </h3>
      <div
        id={regionId}
        role="region"
        aria-labelledby={buttonId}
        data-open={open}
        className="osi-region pb-8 pl-[4.5rem]"
      >
        <ul className="flex flex-wrap gap-2">
          {group.skills.map((skill) => (
            <li
              key={skill}
              className="label-mono rounded-pill border border-line bg-surface-2 px-3 py-1.5"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
