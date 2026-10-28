import { cn } from "@/lib/cn";

import { EcgLine } from "./EcgLine";
import { MockupFrame } from "./MockupFrame";
import { SkeletonLines } from "./SkeletonLines";

const NAV = ["Queue", "Notes", "Reports", "Consent"];

export function ClinicConsole() {
  return (
    <MockupFrame
      title="earthix / opd-dashboard"
      label="Mockup of the Earthix clinic console: a heart-rate trace, an AI-drafted note waiting for doctor review, and an ABHA link badge."
    >
      <div className="grid h-full grid-cols-[30%_minmax(0,1fr)]">
        <div className="flex flex-col gap-1 border-r border-line p-3">
          <p className="label-mono mb-2 truncate text-muted">Platform › Org › Branch</p>
          {NAV.map((item, index) => (
            <span
              key={item}
              className={cn(
                "truncate rounded-chip px-2 py-1 text-xs",
                index === 1 ? "bg-surface-2 text-fg" : "text-muted",
              )}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-col gap-3 p-3">
          <EcgLine />
          <div className="flex min-h-0 flex-1 flex-col gap-2.5 rounded-chip border border-line bg-surface p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="label-mono text-fg">AI draft · note</span>
              <span className="label-mono rounded-pill bg-amber px-2 py-0.5 text-amber-ink">
                Doctor review required
              </span>
            </div>
            <SkeletonLines count={5} />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="label-mono rounded-pill border border-c1 px-2 py-0.5 text-c1-text">
              ABHA linked
            </span>
            <span className="label-mono rounded-pill border border-line px-2 py-0.5 text-muted">
              Consent manager
            </span>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}
