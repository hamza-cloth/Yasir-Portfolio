import Link from "next/link";

import { chipClassName } from "@/components/ui/Chip";
import { WORK_FILTERS, workFilterHref, type WorkFilter } from "@/lib/work-filters";

type FilterChipsProps = {
  active: WorkFilter;
  counts: Record<WorkFilter, number>;
};

// Plain links, so filtering works without JavaScript and every filter has its own URL.
export function FilterChips({ active, counts }: FilterChipsProps) {
  return (
    <nav aria-label="Filter work">
      <ul className="flex flex-wrap gap-2">
        {WORK_FILTERS.map((filter) => (
          <li key={filter.value}>
            <Link
              href={workFilterHref(filter.value)}
              scroll={false}
              aria-current={filter.value === active ? "page" : undefined}
              className={chipClassName(filter.value === active)}
            >
              {filter.label}
              <span className="text-muted">{counts[filter.value]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
