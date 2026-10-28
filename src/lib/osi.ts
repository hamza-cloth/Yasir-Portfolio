import type { SkillItem } from "@/lib/content/types";

export const OSI_LAYERS = [
  {
    layer: 7,
    name: "Application",
    summary: "What people actually use: apps, APIs and the protocols behind them.",
  },
  {
    layer: 6,
    name: "Presentation",
    summary: "How data is shaped, encrypted and checked on its way in and out.",
  },
  {
    layer: 5,
    name: "Session",
    summary: "Who is logged in, for how long, and what they are allowed to see.",
  },
  {
    layer: 4,
    name: "Transport",
    summary: "Reliable or fast delivery between programs: ports, sockets, TCP and UDP.",
  },
  { layer: 3, name: "Network", summary: "Addressing and routing packets between networks." },
  {
    layer: 2,
    name: "Data Link",
    summary: "Frames on the local network: switching, VLANs and loop prevention.",
  },
  {
    layer: 1,
    name: "Physical",
    summary: "Cables, connectors and the hardware the signal runs on.",
  },
] as const;

export type OsiLayerGroup = {
  layer: number;
  name: string;
  summary: string;
  skills: string[];
};

export function groupSkillsByLayer(skills: SkillItem[]): OsiLayerGroup[] {
  return OSI_LAYERS.map(({ layer, name, summary }) => ({
    layer,
    name,
    summary,
    skills: skills.filter((skill) => skill.layer === layer).map((skill) => skill.name),
  }));
}
