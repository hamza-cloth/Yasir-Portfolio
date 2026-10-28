import type { SiteSettingsData } from "./site-settings";
import type { ExperienceItem, ProjectSummary } from "./types";

export type JourneyPanel = {
  label: string;
  title: string;
  body: string;
  tags: string[];
  cta?: { href: string; label: string };
};

export function buildJourneyPanels(
  settings: SiteSettingsData,
  experience: ExperienceItem[],
  projects: ProjectSummary[],
): JourneyPanel[] {
  return [
    {
      label: "Room 01",
      title: "The support desk",
      body: experience.map((item) => `${item.company}: ${item.summary}`).join(" "),
      tags: ["Ticket triage", "Cloud platforms", "Hosting", "Data centre"],
    },
    {
      label: "Room 02",
      title: "The network",
      body: "CCNA training put the theory on real Cisco IOS: VLANs and 802.1Q trunks, OSPF, ACLs, NAT/PAT and DHCP, built and verified in lab topologies.",
      tags: ["VLANs", "OSPF", "ACLs", "NAT/PAT", "DHCP"],
      cta: { href: "/labs", label: "See the labs" },
    },
    {
      label: "Room 03",
      title: "The products",
      body: projects.map((project) => `${project.title}: ${project.tagline}`).join(" "),
      tags: projects.map((project) => project.statusLabel),
      cta: { href: "/work", label: "See the work" },
    },
    {
      label: "Room 04",
      title: "Your team",
      body: `${settings.availability}. Someone who can take the ticket, find the layer that failed and fix it, and also ship the app.`,
      tags: ["Technical Support", "IT Support", "Network Engineering"],
      cta: { href: "/contact", label: "Let’s talk" },
    },
  ];
}
