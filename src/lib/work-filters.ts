import type { ProjectCategory } from "@/generated/prisma/enums";

import type { ProjectSummary } from "./content/types";

export const WORK_FILTERS = [
  { value: "all", label: "All", category: null },
  { value: "products", label: "Products", category: "PRODUCT" },
  { value: "web", label: "Web", category: "WEB" },
  { value: "networking", label: "Networking", category: "NETWORKING" },
] as const satisfies readonly { value: string; label: string; category: ProjectCategory | null }[];

export type WorkFilter = (typeof WORK_FILTERS)[number]["value"];

const ALIASES: Record<string, WorkFilter> = {
  product: "products",
  network: "networking",
};

export function parseWorkFilter(value: string | string[] | undefined): WorkFilter {
  const raw = (Array.isArray(value) ? value[0] : value)?.toLowerCase() ?? "all";
  const normalized = ALIASES[raw] ?? raw;
  return WORK_FILTERS.find((filter) => filter.value === normalized)?.value ?? "all";
}

export function filterProjects<T extends Pick<ProjectSummary, "categories">>(
  projects: T[],
  filter: WorkFilter,
): T[] {
  const category = WORK_FILTERS.find((item) => item.value === filter)?.category ?? null;
  return category ? projects.filter((project) => project.categories.includes(category)) : projects;
}

export function workFilterHref(filter: WorkFilter): string {
  return filter === "all" ? "/work" : `/work?filter=${filter}`;
}
