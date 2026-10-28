import type { OsiLayerGroup } from "@/lib/osi";
import type { Skin } from "@/lib/skin";

export type TerminalLineKind = "input" | "output" | "accent" | "error";

export type TerminalLine = {
  kind: TerminalLineKind;
  text: string;
};

export type TerminalEffect =
  | { type: "clear" }
  | { type: "navigate"; href: string }
  | { type: "theme"; skin: Skin }
  | { type: "exit" };

export type TerminalResult = {
  lines: TerminalLine[];
  effect?: TerminalEffect;
};

export type TerminalContext = {
  name: string;
  roleLine: string;
  email: string;
  availability: string;
  projects: { slug: string; title: string; statusLabel: string }[];
  layers: OsiLayerGroup[];
};

export type TerminalCommand = {
  name: string;
  aliases?: string[];
  usage?: string;
  summary: string;
  run: (args: string[], context: TerminalContext) => TerminalResult;
};
