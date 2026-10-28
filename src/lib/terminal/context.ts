import type { SiteSettingsData } from "@/lib/content/site-settings";
import type { ProjectSummary, SkillItem } from "@/lib/content/types";
import { groupSkillsByLayer } from "@/lib/osi";

import type { TerminalContext } from "./types";

export function buildTerminalContext(
  settings: SiteSettingsData,
  projects: ProjectSummary[],
  skills: SkillItem[],
): TerminalContext {
  return {
    name: settings.name,
    roleLine: settings.roleLine,
    email: settings.email,
    availability: settings.availability,
    projects: projects.map(({ slug, title, statusLabel }) => ({ slug, title, statusLabel })),
    layers: groupSkillsByLayer(skills),
  };
}
