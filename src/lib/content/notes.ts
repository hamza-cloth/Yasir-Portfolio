export type NoteSeed = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  featured: boolean;
};

// Bodies live in content/notes/<slug>.md. Listed newest first.
export const NOTES: NoteSeed[] = [
  {
    slug: "subnetting-without-the-headache",
    title: "Subnetting without the headache",
    excerpt:
      "One trick, the block size, answers almost every subnetting question: where a network starts, where it ends and how many hosts fit.",
    tags: ["Subnetting", "IPv4", "CCNA"],
    featured: true,
  },
  {
    slug: "the-internet-is-down",
    title: "The internet is down",
    excerpt:
      "A layer-by-layer support playbook for the most common ticket there is, from the cable to DNS.",
    tags: ["Support", "Troubleshooting", "DNS"],
    featured: false,
  },
  {
    slug: "vlans-on-one-office-floor",
    title: "VLANs on one office floor",
    excerpt:
      "Splitting one switch into staff and guest networks, with an 802.1Q trunk and router-on-a-stick.",
    tags: ["VLANs", "Switching", "CCNA"],
    featured: false,
  },
];
