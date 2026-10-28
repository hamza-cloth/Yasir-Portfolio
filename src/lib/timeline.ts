import type { Credential, ExperienceItem } from "./content/types";

export type TimelineEntry = {
  id: string;
  kind: string;
  heading: string;
  detail: string | null;
  location: string | null;
  summary: string | null;
  period: string | null;
};

const yearFormatter = new Intl.DateTimeFormat("en-IN", {
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

// Builds "2024–2027", "2024–present" or "2024"; null when nothing is known, so the period is hidden.
export function formatPeriod(
  start: number | null,
  end: number | null,
  current = false,
): string | null {
  if (start === null) return end === null ? null : String(end);
  if (current) return `${start}–present`;
  return end === null || end === start ? String(start) : `${start}–${end}`;
}

function year(date: Date | null): number | null {
  return date ? Number(yearFormatter.format(date)) : null;
}

const CREDENTIAL_KIND: Record<Credential["kind"], string> = {
  DEGREE: "Degree",
  TRAINING: "Training",
  CERTIFICATION: "Certification",
};

export function buildTimeline(
  experience: ExperienceItem[],
  credentials: Credential[],
): TimelineEntry[] {
  return [
    ...experience.map((item) => ({
      id: item.id,
      kind: item.role,
      heading: item.company,
      detail: null,
      location: item.location,
      summary: item.summary,
      period: formatPeriod(year(item.startDate), year(item.endDate), item.isCurrent),
    })),
    ...credentials.map((credential) => ({
      id: credential.id,
      kind: CREDENTIAL_KIND[credential.kind],
      heading: credential.title,
      detail: credential.issuer,
      location: credential.location,
      summary: null,
      period: formatPeriod(credential.startYear, credential.endYear),
    })),
  ];
}
