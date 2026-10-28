export type Service = {
  title: string;
  body: string;
  skills: string[];
};

// Each service lists only skills from the skills seed, so the tags always match the Skills page.
export const SERVICES: Service[] = [
  {
    title: "Technical & IT support",
    body: "Taking a ticket from “it’s not working” to fixed, layer by layer: cabling and hardware, Wi-Fi and wired links, DHCP and DNS, logins and business software, backed by support experience on cloud platforms and hosting.",
    skills: ["Hardware troubleshooting", "DHCP", "DNS", "ping / traceroute", "netstat"],
  },
  {
    title: "Network setup & troubleshooting",
    body: "Planning and configuring small networks on Cisco IOS: IPv4 subnetting and VLSM, VLANs and 802.1Q trunks, OSPF, ACLs and NAT/PAT, verified with show commands before anyone walks away.",
    skills: ["Subnetting / VLSM", "VLANs", "802.1Q trunking", "OSPF", "ACLs", "NAT/PAT"],
  },
  {
    title: "Full-stack web development",
    body: "Building web apps end to end with React, Next.js, NestJS and PostgreSQL, with role-based access, tenant isolation and validated input from the first commit.",
    skills: ["React", "Next.js", "NestJS", "Role-based access", "Tenant isolation"],
  },
];
