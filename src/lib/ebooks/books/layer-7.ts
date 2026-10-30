import type { Ebook } from "../types";

export const LAYER_7: Ebook = {
  slug: "layer-7-application",
  layer: 7,
  layerName: "Application",
  title: "Apps, APIs and the Services Underneath",
  subtitle: "Layer 7 · Application",
  summary:
    "What people actually use: React and Next.js on the front, NestJS and Node.js behind, REST and HTTP between them, and the DNS and DHCP that make the rest possible.",
  chapters: [
    {
      slug: "react",
      title: "React",
      skill: "React",
      summary:
        "Building interfaces from components: data flows down as props, events flow back up.",
      caption:
        "State lives in the parent. It flows down as props; a click in a child calls a function from the parent, which updates state and re-renders.",
      diagram: {
        type: "topology",
        nodes: [
          {
            id: "app",
            kind: "browser",
            label: "<Cart>",
            sub: "state: items",
            x: 50,
            y: 8,
            tone: "c2",
          },
          { id: "list", kind: "file", label: "<ProductList>", x: 26, y: 30 },
          { id: "total", kind: "file", label: "<Total>", x: 76, y: 30 },
          { id: "c1", kind: "file", label: "<ProductCard>", sub: "Add button", x: 14, y: 52 },
          { id: "c2", kind: "file", label: "<ProductCard>", x: 40, y: 52 },
        ],
        links: [
          { from: "app", to: "list" },
          { from: "app", to: "total" },
          { from: "list", to: "c1" },
          { from: "list", to: "c2" },
        ],
        flows: [
          { path: ["c1", "list", "app"], label: "Event up: onAdd(product)", tone: "warn" },
          { path: ["app", "total"], label: "Props down: new total", tone: "c1" },
          { path: ["app", "list", "c2"], label: "Props down: items", tone: "c2" },
        ],
      },
    },
    {
      slug: "nextjs",
      title: "Next.js",
      skill: "Next.js",
      summary:
        "React with a server: rendering on the server, streaming HTML, and small client islands.",
      caption:
        "The server renders the page with its data and streams HTML. The browser shows it at once, then hydrates only the interactive parts.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "b", label: "Browser", kind: "browser" },
          { id: "n", label: "Next.js server", kind: "server" },
          { id: "d", label: "Database", kind: "db" },
        ],
        messages: [
          { from: "b", to: "n", label: "GET /notes" },
          { from: "n", to: "d", label: "Server component query", tone: "c2" },
          { from: "d", to: "n", label: "Rows", tone: "c2" },
          { from: "n", to: "b", label: "HTML, streamed", note: "readable at once", tone: "ok" },
          {
            from: "n",
            to: "b",
            label: "JS for client components",
            note: "hydrate the button",
            tone: "warn",
          },
        ],
      },
    },
    {
      slug: "nestjs",
      title: "NestJS",
      skill: "NestJS",
      summary:
        "A structured Node.js backend: modules, controllers, services and the request pipeline.",
      caption:
        "A request passes through the pipeline in a fixed order. Anything that fails a guard or a pipe never reaches your business logic.",
      diagram: {
        type: "stack",
        packet: "request",
        layers: [
          { label: "Middleware", note: "logging, CORS", tone: "muted" },
          { label: "Guard", note: "signed in? right role?", tone: "warn" },
          { label: "Pipe", note: "validate + transform DTO", tone: "warn" },
          { label: "Controller", note: "@Get('tickets/:id')", tone: "c1" },
          { label: "Service", note: "business rules", tone: "c2" },
          { label: "Repository", note: "database", tone: "ok" },
        ],
      },
    },
    {
      slug: "nodejs",
      title: "Node.js",
      skill: "Node.js",
      summary:
        "JavaScript on the server, and how one thread serves thousands of requests with the event loop.",
      caption:
        "Slow work is handed off. Your code keeps going, and when the operating system finishes, the callback is queued and the event loop runs it.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "code", label: "Your code", kind: "file" },
          { id: "loop", label: "Event loop", kind: "tool" },
          { id: "os", label: "OS / thread pool", kind: "server" },
        ],
        messages: [
          { from: "code", to: "os", label: "readFile('a.csv')", note: "handed off" },
          { from: "code", to: "loop", label: "Carry on", note: "next request served", tone: "c2" },
          { from: "os", to: "loop", label: "Done: queue callback", tone: "warn" },
          { from: "loop", to: "code", label: "Run callback", note: "stack is empty", tone: "ok" },
        ],
      },
    },
    {
      slug: "rest-apis",
      title: "REST APIs",
      skill: "REST APIs",
      summary:
        "Resources, methods and status codes: designing an API that behaves the way people expect.",
      caption:
        "Nouns in the URL, verbs in the method, and a status code that tells the client what happened.",
      diagram: {
        type: "blocks",
        rows: [
          {
            label: "List",
            cells: [
              { label: "GET", tone: "c1" },
              { label: "/tickets", tone: "muted", span: 2 },
              { label: "200", sub: "array", tone: "ok" },
            ],
          },
          {
            label: "Create",
            cells: [
              { label: "POST", tone: "c2" },
              { label: "/tickets", tone: "muted", span: 2 },
              { label: "201", sub: "Location", tone: "ok" },
            ],
          },
          {
            label: "Update",
            cells: [
              { label: "PATCH", tone: "warn" },
              { label: "/tickets/42", tone: "muted", span: 2 },
              { label: "200", sub: "updated", tone: "ok" },
            ],
          },
          {
            label: "Delete",
            cells: [
              { label: "DELETE", tone: "bad" },
              { label: "/tickets/42", tone: "muted", span: 2 },
              { label: "204", sub: "no body", tone: "ok" },
            ],
          },
          {
            label: "Missing",
            cells: [
              { label: "GET", tone: "c1" },
              { label: "/tickets/999", tone: "muted", span: 2 },
              { label: "404", sub: "not found", tone: "bad" },
            ],
          },
        ],
      },
    },
    {
      slug: "http-https",
      title: "HTTP and HTTPS",
      skill: "HTTP/HTTPS",
      summary: "Requests and responses, methods, headers and status codes, and what the S adds.",
      caption:
        "HTTPS is HTTP inside TLS. After the handshake, the same request and response travel encrypted.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "b", label: "Browser", kind: "browser" },
          { id: "s", label: "example.com :443", kind: "server" },
        ],
        messages: [
          { from: "b", to: "s", label: "TCP handshake", tone: "muted" },
          { from: "b", to: "s", label: "TLS handshake", note: "the S in HTTPS", tone: "c2" },
          { from: "b", to: "s", label: "GET /pricing HTTP/1.1", note: "Host, Accept, Cookie" },
          {
            from: "s",
            to: "b",
            label: "HTTP/1.1 200 OK",
            note: "Content-Type, Cache-Control",
            tone: "ok",
          },
          { from: "s", to: "b", label: "Body: HTML", tone: "ok" },
        ],
      },
    },
    {
      slug: "dns",
      title: "DNS",
      skill: "DNS",
      summary: "Turning names into addresses: resolvers, the hierarchy, record types and caching.",
      caption:
        "The resolver asks down the hierarchy, root to .com to the domain's own server, then caches the answer for its TTL.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "pc", label: "Laptop", kind: "laptop" },
          { id: "res", label: "Resolver", kind: "server" },
          { id: "root", label: "Root", kind: "cloud" },
          { id: "tld", label: ".com", kind: "cloud" },
          { id: "auth", label: "example.com NS", kind: "db" },
        ],
        messages: [
          { from: "pc", to: "res", label: "www.example.com?" },
          { from: "res", to: "root", label: "Ask root", tone: "muted" },
          { from: "root", to: "res", label: "Try .com", tone: "muted" },
          { from: "res", to: "tld", label: "Ask .com", tone: "c2" },
          { from: "tld", to: "res", label: "Try example.com NS", tone: "c2" },
          { from: "res", to: "auth", label: "Ask the owner", tone: "warn" },
          { from: "auth", to: "res", label: "A 93.184.216.34", note: "TTL 3600", tone: "ok" },
          { from: "res", to: "pc", label: "Answer, now cached", tone: "ok" },
        ],
      },
    },
    {
      slug: "dhcp",
      title: "DHCP",
      skill: "DHCP",
      summary: "How a device gets its address, mask, gateway and DNS without anyone typing them.",
      caption:
        "Discover, Offer, Request, Acknowledge. Four messages and the laptop has an address, a gateway and DNS servers for the lease time.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "c", label: "New laptop", kind: "laptop" },
          { id: "s", label: "DHCP server", kind: "server" },
        ],
        messages: [
          { from: "c", to: "s", label: "Discover", note: "broadcast: anyone there?" },
          { from: "s", to: "c", label: "Offer", note: "192.168.1.50 for 24 h", tone: "c2" },
          { from: "c", to: "s", label: "Request", note: "I'll take .50" },
          { from: "s", to: "c", label: "Ack", note: "mask, gateway, DNS", tone: "ok" },
        ],
      },
    },
  ],
};
