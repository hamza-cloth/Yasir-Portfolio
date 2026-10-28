import { IstClock } from "@/components/layout/IstClock";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Icon } from "@/components/ui/Icon";

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
    <GlassPanel
      as="aside"
      aria-label="Status"
      className="border-beam flex flex-col gap-5 p-6 md:p-7"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="label-mono flex items-center gap-2.5 text-fg">
          <span aria-hidden="true" className="status-dot" />
          Online now
        </p>
        <SignalBars />
      </div>

      <dl className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 border-t border-line py-3 first:border-t-0 first:pt-0"
          >
            <dt className="label-mono text-faint">{row.label}</dt>
            <dd className="min-w-0 text-[0.98rem] font-medium tracking-[-0.01em] text-fg">
              {row.value}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3.5">
          <dt className="label-mono text-faint">Local time</dt>
          <dd className="min-w-0">
            <IstClock />
          </dd>
        </div>
      </dl>

      <Button href="/contact" variant="line" className="w-full">
        <Icon name="mail" size={16} />
        Start a conversation
      </Button>
    </GlassPanel>
  );
}
