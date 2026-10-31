"use client";

import { useId, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import type { FaqItem } from "@/lib/hire";

// One open at a time. The panel animates its height with a grid row, so it needs no measuring.
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <ul className="flex flex-col divide-y divide-line border-y border-line">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <li key={item.question}>
            <h3>
              <button
                type="button"
                id={`${id}-q${index}`}
                aria-expanded={expanded}
                aria-controls={`${id}-a${index}`}
                onClick={() => setOpen(expanded ? null : index)}
                className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left text-lg font-semibold text-fg transition-colors hover:text-c1-text"
              >
                {item.question}
                <Icon
                  name="chevron-down"
                  className="flex-none text-c1-text transition-transform duration-300 ease-entrance data-[open=true]:rotate-180"
                  data-open={expanded}
                />
              </button>
            </h3>
            <div
              id={`${id}-a${index}`}
              role="region"
              aria-labelledby={`${id}-q${index}`}
              className="faq-panel"
              data-open={expanded}
              inert={!expanded}
            >
              <div className="overflow-hidden">
                <p className="pb-5 text-muted">
                  {item.answer ?? <span className="font-mono text-amber">[YOUR ANSWER]</span>}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
