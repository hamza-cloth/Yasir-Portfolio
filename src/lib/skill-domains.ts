import { SkillDomain } from "@/generated/prisma/enums";

import type { SkillItem } from "./content/types";

export const SKILL_DOMAINS: Record<SkillDomain, { title: string; body: string }> = {
  ROUTING_SWITCHING: {
    title: "Routing & switching",
    body: "VLANs, trunks, spanning tree, OSPF and static routes on clean, well-planned subnets.",
  },
  NETWORK_SERVICES: {
    title: "Network services",
    body: "How traffic finds its way: DNS, DHCP, HTTP/HTTPS, TCP and UDP, ports and sockets.",
  },
  SECURITY: {
    title: "Security & access",
    body: "ACLs, firewall rules, port security, TLS, JWT and role-based access with tenant isolation.",
  },
  FRONTEND: {
    title: "Front end",
    body: "React and Next.js interfaces, typed end to end with TypeScript.",
  },
  BACKEND: {
    title: "Back end",
    body: "NestJS and Node.js APIs, JSON, login sessions and Redis-backed session stores.",
  },
  SUPPORT_HARDWARE: {
    title: "Support & hardware",
    body: "T568A/B cabling, crimping and testing, hardware troubleshooting, ping, traceroute and netstat.",
  },
};

export type DomainGroup = {
  domain: SkillDomain;
  title: string;
  body: string;
  skills: string[];
};

export function groupSkillsByDomain(skills: SkillItem[]): DomainGroup[] {
  return Object.values(SkillDomain).map((domain) => ({
    domain,
    ...SKILL_DOMAINS[domain],
    skills: skills.filter((skill) => skill.domain === domain).map((skill) => skill.name),
  }));
}
