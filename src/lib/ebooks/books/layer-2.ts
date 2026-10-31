import type { Ebook } from "../types";

export const LAYER_2: Ebook = {
  slug: "layer-2-data-link",
  layer: 2,
  layerName: "Data Link",
  title: "Switching, VLANs and Loops",
  subtitle: "Layer 2 · Data Link",
  summary:
    "How switches move frames: VLANs and trunks, the MAC table, spanning tree, bundled links and locking ports down.",
  chapters: [
    {
      slug: "vlans",
      title: "VLANs",
      skill: "VLANs",
      summary: "Splitting one physical switch into separate networks that cannot see each other.",
      caption:
        "Staff and guests share one switch but sit in different VLANs. Traffic between them never crosses without a router.",
      diagram: {
        type: "topology",
        zones: [
          { x: 3, y: 28, w: 44, h: 29, label: "VLAN 10 · Staff", tone: "c1" },
          { x: 53, y: 28, w: 44, h: 29, label: "VLAN 20 · Guest", tone: "c2" },
        ],
        nodes: [
          { id: "sw", kind: "switch", label: "SW1", sub: "one switch", x: 50, y: 16 },
          { id: "a", kind: "pc", label: "Staff PC", sub: "Gi0/1", x: 14, y: 48 },
          { id: "p", kind: "printer", label: "Printer", sub: "Gi0/2", x: 36, y: 48 },
          { id: "g", kind: "laptop", label: "Guest", sub: "Gi0/9", x: 76, y: 48, tone: "c2" },
        ],
        links: [
          { from: "sw", to: "a" },
          { from: "sw", to: "p" },
          { from: "sw", to: "g" },
        ],
        flows: [
          { path: ["a", "sw", "p"], label: "Staff to printer: same VLAN", tone: "c1" },
          {
            path: ["g", "sw", "p"],
            label: "Guest to printer: blocked",
            tone: "bad",
            dropped: true,
          },
        ],
      },
    },
    {
      slug: "8021q-trunking",
      title: "802.1Q Trunking",
      skill: "802.1Q trunking",
      summary: "Carrying many VLANs over one link by tagging each frame with its VLAN number.",
      caption:
        "One trunk carries both VLANs. Each frame is tagged on the way in and untagged at the far port.",
      diagram: {
        type: "topology",
        zones: [
          { x: 3, y: 34, w: 30, h: 23, label: "Floor 1", tone: "c1" },
          { x: 67, y: 34, w: 30, h: 23, label: "Floor 2", tone: "c2" },
        ],
        nodes: [
          { id: "s1", kind: "switch", label: "SW1", x: 26, y: 18 },
          { id: "s2", kind: "switch", label: "SW2", x: 74, y: 18, tone: "c2" },
          { id: "a1", kind: "pc", label: "Staff", sub: "VLAN 10", x: 10, y: 50 },
          { id: "b1", kind: "laptop", label: "Guest", sub: "VLAN 20", x: 26, y: 50, tone: "c2" },
          { id: "a2", kind: "pc", label: "Staff", sub: "VLAN 10", x: 74, y: 50 },
          { id: "b2", kind: "laptop", label: "Guest", sub: "VLAN 20", x: 90, y: 50, tone: "c2" },
        ],
        links: [
          { from: "s1", to: "s2", style: "trunk", label: "trunk · tags 10, 20" },
          { from: "s1", to: "a1" },
          { from: "s1", to: "b1" },
          { from: "s2", to: "a2" },
          { from: "s2", to: "b2" },
        ],
        flows: [
          { path: ["a1", "s1", "s2", "a2"], label: "Tagged VLAN 10 across the trunk", tone: "c1" },
          { path: ["b1", "s1", "s2", "b2"], label: "Tagged VLAN 20 across the trunk", tone: "c2" },
        ],
      },
    },
    {
      slug: "stp",
      title: "Spanning Tree (STP)",
      skill: "STP",
      summary: "Keeping backup links without creating a loop that floods the network.",
      caption:
        "Three switches in a triangle. STP elects SW1 as root and blocks one port, so every frame has exactly one path.",
      diagram: {
        type: "topology",
        nodes: [
          { id: "s1", kind: "switch", label: "SW1", sub: "root bridge", x: 50, y: 10, tone: "ok" },
          { id: "s2", kind: "switch", label: "SW2", x: 18, y: 48 },
          { id: "s3", kind: "switch", label: "SW3", x: 82, y: 48, tone: "c2" },
        ],
        links: [
          { from: "s1", to: "s2", label: "root port" },
          { from: "s1", to: "s3", label: "root port" },
          { from: "s2", to: "s3", style: "blocked", label: "blocked on SW3" },
        ],
        flows: [
          { path: ["s1", "s2"], label: "BPDUs from the root", tone: "ok" },
          { path: ["s2", "s1", "s3"], label: "SW2 to SW3 goes via the root", tone: "c1" },
          { path: ["s2", "s3"], label: "Direct link: discarded", tone: "bad", dropped: true },
        ],
      },
    },
    {
      slug: "etherchannel",
      title: "EtherChannel",
      skill: "EtherChannel",
      summary:
        "Bundling several links into one logical link for more bandwidth and no blocked ports.",
      caption:
        "Four physical ports become one Port-channel. Each conversation is hashed onto one member link.",
      diagram: {
        type: "blocks",
        rows: [
          {
            label: "Physical",
            cells: [
              { label: "Gi1/0/1", sub: "1 Gb/s", tone: "c1" },
              { label: "Gi1/0/2", sub: "1 Gb/s", tone: "c1" },
              { label: "Gi1/0/3", sub: "1 Gb/s", tone: "c1" },
              { label: "Gi1/0/4", sub: "1 Gb/s", tone: "c1" },
            ],
          },
          {
            label: "Logical",
            cells: [
              { label: "Port-channel 1", sub: "4 Gb/s · one STP port · LACP", tone: "c2", span: 4 },
            ],
          },
          {
            label: "Hashing",
            cells: [
              { label: "PC-A → server", sub: "link 1", tone: "ok" },
              { label: "PC-B → server", sub: "link 3", tone: "ok" },
              { label: "PC-C → NAS", sub: "link 2", tone: "ok" },
              { label: "PC-D → server", sub: "link 4", tone: "ok" },
            ],
          },
        ],
      },
    },
    {
      slug: "mac-address-tables",
      title: "MAC Address Tables",
      skill: "MAC address tables",
      summary: "How a switch learns where each device is, and why it floods when it does not know.",
      caption:
        "The switch learns sources as frames arrive, floods frames for unknown destinations, then forwards directly.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "a", label: "PC-A", kind: "pc" },
          { id: "s", label: "Switch", kind: "switch" },
          { id: "b", label: "PC-B", kind: "pc" },
          { id: "c", label: "PC-C", kind: "laptop" },
        ],
        messages: [
          { from: "a", to: "s", label: "Frame for B", note: "learn A on Gi0/1" },
          { from: "s", to: "b", label: "Flood", note: "B unknown", tone: "warn" },
          { from: "s", to: "c", label: "Flood", note: "C drops it", tone: "warn" },
          { from: "b", to: "s", label: "Reply to A", note: "learn B on Gi0/2", tone: "c2" },
          { from: "s", to: "a", label: "Forward", note: "A known: one port", tone: "ok" },
        ],
      },
    },
    {
      slug: "port-security",
      title: "Port Security",
      skill: "Port security",
      summary:
        "Limiting which devices may use a switch port, and what happens when another one plugs in.",
      caption:
        "The desk PC's MAC is learned as sticky. When an unknown laptop appears on a secured port, the port shuts down.",
      diagram: {
        type: "topology",
        nodes: [
          { id: "srv", kind: "server", label: "File server", x: 50, y: 8, tone: "c2" },
          { id: "sw", kind: "switch", label: "Access switch", x: 50, y: 28 },
          {
            id: "pc",
            kind: "pc",
            label: "Desk PC",
            sub: "Gi0/5 · sticky MAC",
            x: 22,
            y: 50,
            tone: "ok",
          },
          {
            id: "rogue",
            kind: "laptop",
            label: "Unknown laptop",
            sub: "Gi0/6 · err-disabled",
            x: 78,
            y: 50,
            tone: "bad",
          },
        ],
        links: [
          { from: "sw", to: "srv" },
          { from: "sw", to: "pc" },
          { from: "sw", to: "rogue", style: "blocked" },
        ],
        flows: [
          { path: ["pc", "sw", "srv"], label: "Known MAC: forwarded", tone: "ok" },
          {
            path: ["rogue", "sw"],
            label: "Unknown MAC: violation, port shut",
            tone: "bad",
            dropped: true,
          },
        ],
      },
    },
  ],
};
