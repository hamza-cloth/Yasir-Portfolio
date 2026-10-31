import type { Ebook } from "../types";

export const LAYER_4: Ebook = {
  slug: "layer-4-transport",
  layer: 4,
  layerName: "Transport",
  title: "Ports, Handshakes and Firewalls",
  subtitle: "Layer 4 · Transport",
  summary:
    "How data reaches the right program on the right machine: TCP and UDP, ports and sockets, the handshake, firewall rules and reading connections with netstat.",
  chapters: [
    {
      slug: "tcp-vs-udp",
      title: "TCP vs UDP",
      skill: "TCP vs UDP",
      summary:
        "Reliable and ordered, or fast and fire-and-forget: choosing between the two transports.",
      caption:
        "TCP sets up a connection and acknowledges what arrives. UDP just sends; any checking is the application's job.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "c", label: "Client", kind: "laptop" },
          { id: "s", label: "Server", kind: "server" },
        ],
        messages: [
          { from: "c", to: "s", label: "TCP: SYN", note: "connect first" },
          { from: "s", to: "c", label: "TCP: SYN-ACK" },
          { from: "c", to: "s", label: "TCP: data, seq 1–1460" },
          { from: "s", to: "c", label: "TCP: ACK 1461", note: "got it" },
          { from: "c", to: "s", label: "UDP: datagram", note: "no setup", tone: "c2" },
          { from: "c", to: "s", label: "UDP: datagram", note: "no ACK", tone: "c2" },
        ],
      },
    },
    {
      slug: "ports-and-sockets",
      title: "Ports and Sockets",
      skill: "Ports and sockets",
      summary: "How one machine keeps many conversations apart: address plus port, at both ends.",
      caption:
        "One laptop, three conversations. Each is a socket pair: its own random port on the left, a well-known port on the right.",
      diagram: {
        type: "topology",
        nodes: [
          { id: "pc", kind: "laptop", label: "Laptop", sub: "192.168.1.20", x: 14, y: 32 },
          { id: "web", kind: "server", label: "Web", sub: "TCP 443", x: 80, y: 10, tone: "c1" },
          { id: "ssh", kind: "server", label: "SSH", sub: "TCP 22", x: 84, y: 32, tone: "c2" },
          { id: "dns", kind: "server", label: "DNS", sub: "UDP 53", x: 80, y: 54, tone: "ok" },
        ],
        links: [
          { from: "pc", to: "web", label: ":51514 → :443" },
          { from: "pc", to: "ssh", label: ":51620 → :22" },
          { from: "pc", to: "dns", label: ":60012 → :53" },
        ],
        flows: [
          { path: ["pc", "web"], label: "HTTPS socket", tone: "c1" },
          { path: ["pc", "ssh"], label: "SSH socket", tone: "c2" },
          { path: ["pc", "dns"], label: "DNS query", tone: "ok" },
        ],
      },
    },
    {
      slug: "three-way-handshake",
      title: "The Three-Way Handshake",
      skill: "Three-way handshake",
      summary: "SYN, SYN-ACK, ACK: how TCP opens a connection, and how it closes one.",
      caption:
        "Both sides pick a starting sequence number and confirm the other's. Closing takes a FIN and an ACK in each direction.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "c", label: "Client", kind: "laptop" },
          { id: "s", label: "Server :443", kind: "server" },
        ],
        messages: [
          { from: "c", to: "s", label: "SYN", note: "seq = x" },
          { from: "s", to: "c", label: "SYN-ACK", note: "seq = y, ack = x+1", tone: "c2" },
          { from: "c", to: "s", label: "ACK", note: "ack = y+1 · ESTABLISHED", tone: "ok" },
          { from: "c", to: "s", label: "Data both ways" },
          { from: "c", to: "s", label: "FIN", note: "done sending", tone: "warn" },
          { from: "s", to: "c", label: "ACK, then FIN", tone: "warn" },
        ],
      },
    },
    {
      slug: "firewall-rules",
      title: "Firewall Rules",
      skill: "Firewall rules",
      summary:
        "Allowing only the traffic you mean to, and why replies get through a stateful firewall.",
      caption:
        "Outside may reach the web server on 443 and nothing else. Inside may go out, and the replies are let back in because the firewall remembers the request.",
      diagram: {
        type: "topology",
        zones: [
          { x: 60, y: 4, w: 37, h: 22, label: "DMZ", tone: "c2" },
          { x: 60, y: 34, w: 37, h: 22, label: "LAN", tone: "c1" },
        ],
        nodes: [
          { id: "net", kind: "cloud", label: "Internet", x: 12, y: 30 },
          {
            id: "fw",
            kind: "firewall",
            label: "Firewall",
            sub: "stateful",
            x: 40,
            y: 30,
            tone: "warn",
          },
          {
            id: "web",
            kind: "server",
            label: "Web server",
            sub: "TCP 443",
            x: 80,
            y: 18,
            tone: "c2",
          },
          { id: "pc", kind: "pc", label: "Office PC", x: 80, y: 48 },
        ],
        links: [
          { from: "net", to: "fw" },
          { from: "fw", to: "web" },
          { from: "fw", to: "pc" },
        ],
        flows: [
          { path: ["net", "fw", "web"], label: "allow any → web :443", tone: "ok" },
          { path: ["net", "fw", "pc"], label: "deny any → LAN", tone: "bad", dropped: true },
          { path: ["pc", "fw", "net"], label: "LAN out, replies allowed back", tone: "c1" },
        ],
      },
    },
    {
      slug: "netstat",
      title: "netstat",
      skill: "netstat",
      summary: "Listing open ports and live connections, and which program owns each one.",
      caption:
        "netstat -ano on Windows: each line is a socket, its state and the process ID that owns it.",
      diagram: {
        type: "blocks",
        rows: [
          {
            label: "TCP",
            cells: [
              { label: "0.0.0.0:443", sub: "local", tone: "c1", span: 2 },
              { label: "0.0.0.0:0", sub: "remote", tone: "muted", span: 2 },
              { label: "LISTENING", tone: "c2", span: 2 },
              { label: "4120", sub: "PID", tone: "muted" },
            ],
          },
          {
            label: "TCP",
            cells: [
              { label: "192.168.1.20:51514", sub: "local", tone: "c1", span: 2 },
              { label: "93.184.216.34:443", sub: "remote", tone: "c1", span: 2 },
              { label: "ESTABLISHED", tone: "ok", span: 2 },
              { label: "7788", sub: "PID", tone: "muted" },
            ],
          },
          {
            label: "TCP",
            cells: [
              { label: "192.168.1.20:51490", sub: "local", tone: "c1", span: 2 },
              { label: "142.250.1.1:443", sub: "remote", tone: "c1", span: 2 },
              { label: "TIME_WAIT", tone: "warn", span: 2 },
              { label: "0", sub: "PID", tone: "muted" },
            ],
          },
          {
            label: "UDP",
            cells: [
              { label: "0.0.0.0:5353", sub: "local", tone: "c2", span: 2 },
              { label: "*:*", sub: "remote", tone: "muted", span: 2 },
              { label: "(no state)", tone: "muted", span: 2 },
              { label: "2236", sub: "PID", tone: "muted" },
            ],
          },
        ],
      },
    },
  ],
};
