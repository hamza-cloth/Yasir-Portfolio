import type { ExperienceItem } from "./types";

// Dates are unknown, so they stay null and are hidden wherever experience is shown.
export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "earthix-support",
    role: "Technical Support",
    company: "Earthix Software Solutions Pvt. Ltd.",
    location: "Bihar, India",
    summary:
      "Supported users of a cloud business management platform: School ERP, pharmacy, retail, restaurant, CRM, POS and inventory.",
    highlights: [],
    startDate: null,
    endDate: null,
    isCurrent: false,
  },
  {
    id: "cyfuture-support",
    role: "Technical Support",
    company: "Cyfuture India",
    location: null,
    summary: "Technical support for cloud, hosting and data-centre services.",
    highlights: [],
    startDate: null,
    endDate: null,
    isCurrent: false,
  },
];
