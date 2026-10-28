import type {
  CredentialKind,
  CredentialStatus,
  ProjectCategory,
  ProjectVisual,
  SkillDomain,
} from "@/generated/prisma/enums";

export type ProjectSummary = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  statusLabel: string;
  categories: ProjectCategory[];
  stack: string[];
  visual: ProjectVisual;
};

export type ProjectDecision = {
  title: string;
  body: string;
};

export type ProjectDetail = ProjectSummary & {
  role: string | null;
  type: string | null;
  overview: string;
  decisions: ProjectDecision[];
  coverImageUrl: string | null;
};

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  location: string | null;
  summary: string;
  highlights: string[];
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
};

export type Credential = {
  id: string;
  title: string;
  issuer: string;
  kind: CredentialKind;
  status: CredentialStatus;
  location: string | null;
  startYear: number | null;
  endYear: number | null;
};

export type SkillItem = {
  name: string;
  layer: number | null;
  domain: SkillDomain | null;
};

export type NoteSummary = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  featured: boolean;
  publishedAt: Date | null;
  readingMinutes: number;
};
