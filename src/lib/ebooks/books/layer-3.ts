import type { Ebook } from "../types";

export const LAYER_3: Ebook = {
  slug: "layer-3-network",
  layer: 3,
  layerName: "Network",
  title: "Addresses, Subnets and Routes",
  subtitle: "Layer 3 · Network",
  summary:
    "Getting a packet from one network to another: IPv4 and IPv6 addresses, subnetting, static and OSPF routing, ACLs, NAT and the two tools that test it all.",
  chapters: [
    {
      slug: "ipv4-addressing",
      title: "IPv4 Addressing",
      skill: "IPv4 addressing",
      summary:
        "What the four numbers mean, how the mask splits network from host, and the special ranges.",
      caption: "The mask's 255s mark the network part. Whatever is left over numbers the hosts.",
      diagram: {
        type: "blocks",
        rows: [
          {
            label: "Address",
            cells: [
              { label: "192", sub: "11000000", tone: "c1" },
              { label: "168", sub: "10101000", tone: "c1" },
              { label: "10", sub: "00001010", tone: "c1" },
              { label: "25", sub: "00011001", tone: "c2" },
            ],
          },
          {
            label: "Mask /24",
            cells: [
              { label: "255", sub: "11111111", tone: "c1" },
              { label: "255", sub: "11111111", tone: "c1" },
              { label: "255", sub: "11111111", tone: "c1" },
              { label: "0", sub: "00000000", tone: "c2" },
            ],
          },
          {
            label: "Result",
            cells: [
              {
                label: "Network 192.168.10.0",
                sub: "shared by the whole LAN",
                tone: "c1",
                span: 3,
              },
              { label: "Host .25", sub: "this PC", tone: "c2" },
            ],
          },
        ],
      },
    },
    {
      slug: "subnetting-vlsm",
      title: "Subnetting and VLSM",
      skill: "Subnetting / VLSM",
      summary: "Cutting one network into right-sized pieces using the block size.",
      caption:
        "One /24 split evenly into four /26 blocks, then split by need with VLSM: big blocks first.",
      diagram: {
        type: "blocks",
        rows: [
          {
            label: "/24",
            cells: [{ label: "192.168.10.0/24", sub: "254 hosts", tone: "muted", span: 16 }],
          },
          {
            label: "Even /26",
            cells: [
              { label: ".0", sub: "62 hosts", tone: "c1", span: 4 },
              { label: ".64", sub: "62 hosts", tone: "c2", span: 4 },
              { label: ".128", sub: "62 hosts", tone: "c1", span: 4 },
              { label: ".192", sub: "62 hosts", tone: "c2", span: 4 },
            ],
          },
          {
            label: "VLSM",
            cells: [
              { label: "Staff /25", sub: ".0 – .127", tone: "c1", span: 8 },
              { label: "Guest /26", sub: ".128 – .191", tone: "c2", span: 4 },
              { label: "Servers /27", sub: ".192", tone: "ok", span: 2 },
              { label: "/28", sub: ".224", tone: "warn", span: 1 },
              { label: "/28", sub: ".240", tone: "warn", span: 1 },
            ],
          },
        ],
      },
    },
    {
      slug: "static-routing",
      title: "Static Routing",
      skill: "Static routing",
      summary:
        "Telling a router by hand where a remote network is, and the default route for everything else.",
      caption:
        "Each router knows its own LAN. A static route on each side points at the other, and R2 sends the rest to the internet.",
      diagram: {
        type: "topology",
        zones: [
          { x: 2, y: 30, w: 24, h: 26, label: "10.1.1.0/24", tone: "c1" },
          { x: 50, y: 30, w: 24, h: 26, label: "10.2.2.0/24", tone: "c2" },
        ],
        nodes: [
          { id: "a", kind: "pc", label: "PC-A", sub: ".10", x: 14, y: 48 },
          { id: "r1", kind: "router", label: "R1", x: 22, y: 16 },
          { id: "r2", kind: "router", label: "R2", x: 58, y: 16, tone: "c2" },
          { id: "b", kind: "pc", label: "PC-B", sub: ".20", x: 62, y: 48, tone: "c2" },
          { id: "net", kind: "cloud", label: "Internet", x: 88, y: 26, tone: "ok" },
        ],
        links: [
          { from: "a", to: "r1" },
          { from: "r1", to: "r2", label: "10.0.12.0/30" },
          { from: "r2", to: "b" },
          { from: "r2", to: "net", label: "0.0.0.0/0" },
        ],
        flows: [
          { path: ["a", "r1", "r2", "b"], label: "Static route to 10.2.2.0/24", tone: "c1" },
          { path: ["a", "r1", "r2", "net"], label: "Default route to the internet", tone: "ok" },
        ],
      },
    },
    {
      slug: "ospf",
      title: "OSPF",
      skill: "OSPF",
      summary: "Routers that find each other, share a map of links and pick the lowest-cost path.",
      caption:
        "Every router builds the same map and picks the cheapest path. R1 reaches R4 over two fast links, cost 2, not the slow pair at cost 20.",
      diagram: {
        type: "topology",
        zones: [{ x: 6, y: 4, w: 88, h: 52, label: "Area 0", tone: "c2" }],
        nodes: [
          { id: "r1", kind: "router", label: "R1", x: 18, y: 18 },
          { id: "r2", kind: "router", label: "R2", x: 82, y: 18, tone: "c2" },
          { id: "r3", kind: "router", label: "R3", x: 18, y: 48, tone: "c2" },
          { id: "r4", kind: "router", label: "R4", x: 82, y: 48 },
        ],
        links: [
          { from: "r1", to: "r2", label: "cost 1 · 1 Gb/s" },
          { from: "r2", to: "r4", label: "cost 1" },
          { from: "r1", to: "r3", label: "cost 10 · 10 Mb/s" },
          { from: "r3", to: "r4", label: "cost 10" },
        ],
        flows: [
          { path: ["r1", "r3"], label: "Hello: neighbours form", tone: "c2" },
          { path: ["r1", "r2", "r4"], label: "Best path to R4: cost 2", tone: "ok" },
        ],
      },
    },
    {
      slug: "acls",
      title: "Access Control Lists",
      skill: "ACLs",
      summary: "Permit and deny rules on a router interface, read top to bottom.",
      caption:
        "An ACL on R1 lets staff reach the server and stops guests. The first matching line wins; the last line is an unseen deny.",
      diagram: {
        type: "topology",
        zones: [
          { x: 3, y: 4, w: 30, h: 24, label: "Staff 10.10.0.0/24", tone: "c1" },
          { x: 3, y: 32, w: 30, h: 24, label: "Guest 10.20.0.0/24", tone: "c2" },
        ],
        nodes: [
          { id: "staff", kind: "pc", label: "Staff PC", x: 17, y: 20 },
          { id: "guest", kind: "laptop", label: "Guest", x: 17, y: 48, tone: "c2" },
          { id: "r1", kind: "router", label: "R1", sub: "ACL 110 in", x: 52, y: 32, tone: "warn" },
          {
            id: "srv",
            kind: "server",
            label: "Server",
            sub: "10.50.0.10",
            x: 84,
            y: 32,
            tone: "ok",
          },
        ],
        links: [
          { from: "staff", to: "r1" },
          { from: "guest", to: "r1" },
          { from: "r1", to: "srv" },
        ],
        flows: [
          { path: ["staff", "r1", "srv"], label: "permit 10.10.0.0 → server", tone: "ok" },
          {
            path: ["guest", "r1", "srv"],
            label: "deny 10.20.0.0 → server",
            tone: "bad",
            dropped: true,
          },
        ],
      },
    },
    {
      slug: "nat-pat",
      title: "NAT and PAT",
      skill: "NAT/PAT",
      summary:
        "Sharing one public address between many private devices by rewriting addresses and ports.",
      caption:
        "The router swaps the private source for its public address and a free port, remembers the pair, and reverses it on the reply.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "pc", label: "PC 192.168.1.10", kind: "pc" },
          { id: "r", label: "Router (PAT)", kind: "router" },
          { id: "web", label: "Web server", kind: "server" },
        ],
        messages: [
          { from: "pc", to: "r", label: "src 192.168.1.10:51000", note: "private" },
          {
            from: "r",
            to: "web",
            label: "src 203.0.113.5:62001",
            note: "translated, saved in table",
            tone: "c2",
          },
          { from: "web", to: "r", label: "dst 203.0.113.5:62001", note: "reply", tone: "ok" },
          {
            from: "r",
            to: "pc",
            label: "dst 192.168.1.10:51000",
            note: "looked up, reversed",
            tone: "ok",
          },
        ],
      },
    },
    {
      slug: "ipv6-basics",
      title: "IPv6 Basics",
      skill: "IPv6 basics",
      summary: "Reading and shortening 128-bit addresses, and the prefix and interface parts.",
      caption:
        "Eight groups of four hex digits. Drop leading zeros, replace one run of zero groups with ::, and split at /64.",
      diagram: {
        type: "blocks",
        rows: [
          {
            label: "Full",
            cells: [
              { label: "2001", tone: "c1" },
              { label: "0db8", tone: "c1" },
              { label: "0000", tone: "c1" },
              { label: "0001", tone: "c1" },
              { label: "0000", tone: "c2" },
              { label: "0000", tone: "c2" },
              { label: "0000", tone: "c2" },
              { label: "0025", tone: "c2" },
            ],
          },
          {
            label: "Short",
            cells: [
              { label: "2001", tone: "c1" },
              { label: "db8", tone: "c1" },
              { label: "0", tone: "c1" },
              { label: "1", tone: "c1" },
              { label: "::", sub: "zeros", tone: "warn", span: 3 },
              { label: "25", tone: "c2" },
            ],
          },
          {
            label: "Parts",
            cells: [
              { label: "Prefix /64", sub: "the network", tone: "c1", span: 4 },
              { label: "Interface ID", sub: "this device", tone: "c2", span: 4 },
            ],
          },
        ],
      },
    },
    {
      slug: "ping-traceroute",
      title: "ping and traceroute",
      skill: "ping / traceroute",
      summary: "Testing reachability, and finding the hop where a path breaks.",
      caption:
        "traceroute sends packets with TTL 1, 2, 3… Each router that drops one to zero replies, so every hop shows itself.",
      diagram: {
        type: "topology",
        nodes: [
          { id: "pc", kind: "laptop", label: "Your PC", x: 8, y: 42 },
          { id: "r1", kind: "router", label: "Gateway", sub: "hop 1", x: 32, y: 22 },
          { id: "r2", kind: "router", label: "ISP", sub: "hop 2", x: 56, y: 40, tone: "c2" },
          { id: "web", kind: "server", label: "Website", sub: "hop 3", x: 88, y: 22, tone: "ok" },
        ],
        links: [
          { from: "pc", to: "r1" },
          { from: "r1", to: "r2" },
          { from: "r2", to: "web" },
        ],
        flows: [
          {
            path: ["pc", "r1"],
            label: "TTL 1: gateway replies 'time exceeded'",
            tone: "c1",
          },
          { path: ["pc", "r1", "r2"], label: "TTL 2: ISP replies", tone: "c2" },
          { path: ["pc", "r1", "r2", "web"], label: "TTL 3: the website answers", tone: "ok" },
        ],
      },
    },
  ],
};
