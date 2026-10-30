// Ebooks: one per OSI layer, one chapter per skill. Each chapter carries a diagram spec that
// the 3D diagram components render; the chapter text lives in content/ebooks/<book>/<chapter>.md.

export type Tone = "c1" | "c2" | "ok" | "warn" | "bad" | "muted";

export type NodeKind =
  | "pc"
  | "laptop"
  | "phone"
  | "server"
  | "switch"
  | "router"
  | "firewall"
  | "cloud"
  | "db"
  | "browser"
  | "user"
  | "api"
  | "cache"
  | "printer"
  | "ap"
  | "lock"
  | "key"
  | "file"
  | "tool"
  | "panel"
  | "outlet";

// Coordinates are on a 100 × 60 floor: x 0–100 left to right, y 0–60 back to front.
export type TopologyNode = {
  id: string;
  kind: NodeKind;
  label: string;
  sub?: string;
  x: number;
  y: number;
  tone?: Tone;
};

export type TopologyLink = {
  from: string;
  to: string;
  label?: string;
  style?: "solid" | "trunk" | "dashed" | "blocked";
};

// A packet that travels through the listed nodes in order.
export type TopologyFlow = {
  path: string[];
  label?: string;
  tone?: Tone;
  // Stops at the last hop with a cross instead of arriving.
  dropped?: boolean;
};

export type TopologyZone = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone?: Tone;
};

export type TopologyDiagram = {
  type: "topology";
  nodes: TopologyNode[];
  links: TopologyLink[];
  flows?: TopologyFlow[];
  zones?: TopologyZone[];
};

export type SequenceActor = { id: string; label: string; kind: NodeKind };

export type SequenceMessage = {
  from: string;
  to: string;
  label: string;
  note?: string;
  tone?: Tone;
};

export type SequenceDiagram = {
  type: "sequence";
  actors: SequenceActor[];
  messages: SequenceMessage[];
};

export type StackLayer = { label: string; note?: string; tone?: Tone };

// Plates stacked in depth; a packet passes through them top to bottom (or bottom to top).
export type StackDiagram = {
  type: "stack";
  layers: StackLayer[];
  direction?: "down" | "up";
  packet?: string;
};

export type BlockCell = {
  label: string;
  sub?: string;
  tone?: Tone;
  // Wire colours for cable pinouts: a solid colour, optionally striped with white.
  color?: string;
  striped?: boolean;
  span?: number;
};

export type BlockRow = { label?: string; cells: BlockCell[] };

export type BlocksDiagram = {
  type: "blocks";
  rows: BlockRow[];
};

export type Diagram = TopologyDiagram | SequenceDiagram | StackDiagram | BlocksDiagram;

export type Chapter = {
  slug: string;
  title: string;
  // The skill name exactly as it appears in the skills list.
  skill: string;
  summary: string;
  diagram: Diagram;
  // One line under the diagram saying what it shows.
  caption: string;
};

export type Ebook = {
  slug: string;
  layer: number;
  layerName: string;
  title: string;
  subtitle: string;
  summary: string;
  chapters: Chapter[];
};
