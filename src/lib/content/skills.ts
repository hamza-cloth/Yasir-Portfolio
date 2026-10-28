import type { SkillDomain } from "@/generated/prisma/enums";

import type { SkillItem } from "./types";

type LayerSkills = [layer: number, skills: [name: string, domain: SkillDomain][]];

const BY_LAYER: LayerSkills[] = [
  [
    7,
    [
      ["React", "FRONTEND"],
      ["Next.js", "FRONTEND"],
      ["NestJS", "BACKEND"],
      ["Node.js", "BACKEND"],
      ["REST APIs", "BACKEND"],
      ["HTTP/HTTPS", "NETWORK_SERVICES"],
      ["DNS", "NETWORK_SERVICES"],
      ["DHCP", "NETWORK_SERVICES"],
    ],
  ],
  [
    6,
    [
      ["TLS/SSL", "SECURITY"],
      ["JSON", "BACKEND"],
      ["TypeScript types", "FRONTEND"],
      ["Input validation", "SECURITY"],
      ["Character encoding", "BACKEND"],
    ],
  ],
  [
    5,
    [
      ["Login sessions", "BACKEND"],
      ["JWT", "SECURITY"],
      ["Redis session store", "BACKEND"],
      ["Role-based access", "SECURITY"],
      ["Tenant isolation", "SECURITY"],
    ],
  ],
  [
    4,
    [
      ["TCP vs UDP", "NETWORK_SERVICES"],
      ["Ports and sockets", "NETWORK_SERVICES"],
      ["Three-way handshake", "NETWORK_SERVICES"],
      ["Firewall rules", "SECURITY"],
      ["netstat", "SUPPORT_HARDWARE"],
    ],
  ],
  [
    3,
    [
      ["IPv4 addressing", "ROUTING_SWITCHING"],
      ["Subnetting / VLSM", "ROUTING_SWITCHING"],
      ["Static routing", "ROUTING_SWITCHING"],
      ["OSPF", "ROUTING_SWITCHING"],
      ["ACLs", "SECURITY"],
      ["NAT/PAT", "ROUTING_SWITCHING"],
      ["IPv6 basics", "ROUTING_SWITCHING"],
      ["ping / traceroute", "SUPPORT_HARDWARE"],
    ],
  ],
  [
    2,
    [
      ["VLANs", "ROUTING_SWITCHING"],
      ["802.1Q trunking", "ROUTING_SWITCHING"],
      ["STP", "ROUTING_SWITCHING"],
      ["EtherChannel", "ROUTING_SWITCHING"],
      ["MAC address tables", "ROUTING_SWITCHING"],
      ["Port security", "SECURITY"],
    ],
  ],
  [
    1,
    [
      ["T568A / T568B", "SUPPORT_HARDWARE"],
      ["Crimping and testing", "SUPPORT_HARDWARE"],
      ["Structured cabling", "SUPPORT_HARDWARE"],
      ["Hardware troubleshooting", "SUPPORT_HARDWARE"],
    ],
  ],
];

export const SKILLS: SkillItem[] = BY_LAYER.flatMap(([layer, skills]) =>
  skills.map(([name, domain]) => ({ name, layer, domain })),
);
