import { IstClock } from "@/components/layout/IstClock";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";

import { SignalBars } from "./SignalBars";

export type StatusRow = {
  label: string;
  value: string;
};

type StatusPanelProps = {
  rows: StatusRow[];
};

export function StatusPanel({ rows }: StatusPanelProps) {
  return (
    <GlassPanel as="aside" aria-label="Status" className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="label-mono flex items-center gap-2.5 text-fg">
          <span aria-hidden="true" className="status-dot" />
          Online
        </p>
        <SignalBars />
      </div>

      <dl className="flex flex-col divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-3">
            <dt className="label-mono pt-0.5 text-muted">{row.label}</dt>
            <dd className="min-w-0 text-[0.95rem] text-fg">{row.value}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-3">
          <dt className="label-mono pt-0.5 text-muted">Local time</dt>
          <dd className="min-w-0">
            <IstClock />
          </dd>
        </div>
      </dl>

      <Button href="/contact" variant="line" className="w-full">
        Ping me
      </Button>
    </GlassPanel>
  );
}
