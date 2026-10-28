"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import type { OsiLayerGroup } from "@/lib/osi";

import { OsiBand } from "./OsiBand";

const DEFAULT_OPEN = 3;

export function OsiAccordion({ layers }: { layers: OsiLayerGroup[] }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set([DEFAULT_OPEN]));
  const allOpen = open.size === layers.length;

  function toggle(layer: number) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          variant="line"
          size="sm"
          onClick={() => setOpen(allOpen ? new Set() : new Set(layers.map((group) => group.layer)))}
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </Button>
      </div>
      <ol className="border-t border-line">
        {layers.map((group) => (
          <OsiBand
            key={group.layer}
            group={group}
            open={open.has(group.layer)}
            onToggle={() => toggle(group.layer)}
          />
        ))}
      </ol>
    </div>
  );
}
