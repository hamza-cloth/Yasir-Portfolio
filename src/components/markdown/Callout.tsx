import type { ComponentProps } from "react";

import { CALLOUT_TYPES, type CalloutType } from "@/lib/markdown/remark-callouts";

const LABELS: Record<CalloutType, string> = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
};

type CalloutProps = ComponentProps<"aside"> & { "data-callout"?: string };

function isCalloutType(value: string | undefined): value is CalloutType {
  return (CALLOUT_TYPES as readonly string[]).includes(value ?? "");
}

export function Callout({ "data-callout": type, children, ...props }: CalloutProps) {
  if (!isCalloutType(type)) return <aside {...props}>{children}</aside>;

  return (
    <aside {...props} data-callout={type} aria-label={LABELS[type]}>
      <p className="label-mono callout-label">{LABELS[type]}</p>
      {children}
    </aside>
  );
}
