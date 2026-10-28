import type { Principle } from "@/lib/validation/settings";

export type SiteSettingsData = {
  name: string;
  roleLine: string;
  email: string;
  location: string;
  availability: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  photoUrl: string | null;
  aboutStory: string;
  principles: Principle[];
  nowItems: string[];
  nowUpdatedAt: Date | null;
};

// Used until the database has a SiteSettings row, and by the seed script.
export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  name: "Yasir Abdullah",
  roleLine: "Software & Network Engineer · CCNA-trained · India",
  email: "yasirabdullahearthix@gmail.com",
  location: "Noida, India",
  availability: "Open to Technical Support, IT Support and Network Engineering roles",
  linkedinUrl: null,
  githubUrl: null,
  photoUrl: null,
  aboutStory: [
    "I work where software meets the network.",
    "At Earthix Software Solutions I supported users of a cloud business management platform covering School ERP, pharmacy, retail, restaurant, CRM, POS and inventory. At Cyfuture India I worked in technical support for cloud, hosting and data-centre services.",
    "I am CCNA-trained, through Cisco CCNA training at DUCAT, and I am studying for a Bachelor of Computer Applications at Maharishi University of Information Technology, Noida (2024–2027).",
  ].join("\n\n"),
  principles: [
    {
      title: "Find the layer that failed",
      body: "Start at the cable and walk up. Stop at the first thing that is wrong instead of guessing at the top.",
    },
    {
      title: "Humans make the call",
      body: "Tools draft, people decide. It is the rule Earthix AI Healthcare is built on: a doctor reviews every AI output.",
    },
    {
      title: "Verify before walking away",
      body: "Every change ends with proof: a show command, a ping, a test. “It should work” is not done.",
    },
    {
      title: "Write it down",
      body: "A fix that is not written down will be needed again. That is what the notes on this site are for.",
    },
  ],
  nowItems: [
    "Building the Earthix AI Healthcare MVP",
    "Rebuilding Hamza Cloth as v2",
    "CCNA practice labs: inter-VLAN routing, OSPF, ACL + PAT and DHCP",
    "BCA at Maharishi University of Information Technology",
  ],
  nowUpdatedAt: new Date("2026-10-25T00:00:00+05:30"),
};
