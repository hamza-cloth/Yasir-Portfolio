import type { Ebook } from "../types";

export const LAYER_6: Ebook = {
  slug: "layer-6-presentation",
  layer: 6,
  layerName: "Presentation",
  title: "Encryption, Formats and Encoding",
  subtitle: "Layer 6 · Presentation",
  summary:
    "The shape and safety of the data itself: TLS encryption, JSON, TypeScript types, validating input and the bytes behind every character.",
  chapters: [
    {
      slug: "tls-ssl",
      title: "TLS and SSL",
      skill: "TLS/SSL",
      summary:
        "How a browser and a server agree on keys, prove who the server is and encrypt everything after.",
      caption:
        "TLS 1.3 in one round trip: the client offers a key share, the server answers with its own and its certificate, and both derive the same keys.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "c", label: "Browser", kind: "browser" },
          { id: "s", label: "Server", kind: "server" },
        ],
        messages: [
          { from: "c", to: "s", label: "ClientHello", note: "TLS 1.3, ciphers, key share" },
          { from: "s", to: "c", label: "ServerHello + key share", tone: "c2" },
          {
            from: "s",
            to: "c",
            label: "Certificate + signature",
            note: "proves it is the site",
            tone: "c2",
          },
          { from: "c", to: "s", label: "Finished", note: "keys agreed", tone: "ok" },
          { from: "c", to: "s", label: "GET / (encrypted)", tone: "ok" },
          { from: "s", to: "c", label: "200 OK (encrypted)", tone: "ok" },
        ],
      },
    },
    {
      slug: "json",
      title: "JSON",
      skill: "JSON",
      summary:
        "The text format almost every API speaks: its six value types and the mistakes that break it.",
      caption: "One object, one value of each type. Keys are always double-quoted strings.",
      diagram: {
        type: "blocks",
        rows: [
          {
            label: "Object",
            cells: [
              { label: '"id": 42', sub: "number", tone: "c1" },
              { label: '"name": "Asha"', sub: "string", tone: "ok", span: 1.4 },
              { label: '"active": true', sub: "boolean", tone: "c2", span: 1.2 },
              { label: '"manager": null', sub: "null", tone: "muted", span: 1.3 },
            ],
          },
          {
            label: "Nested",
            cells: [
              { label: '"roles": ["staff", "support"]', sub: "array", tone: "warn", span: 2 },
              { label: '"address": { "city": "Noida" }', sub: "object", tone: "c2", span: 2 },
            ],
          },
          {
            label: "Invalid",
            cells: [
              { label: "{ id: 42 }", sub: "unquoted key", tone: "bad" },
              { label: "'Asha'", sub: "single quotes", tone: "bad" },
              { label: "[1, 2,]", sub: "trailing comma", tone: "bad" },
              { label: "// note", sub: "no comments", tone: "bad" },
            ],
          },
        ],
      },
    },
    {
      slug: "typescript-types",
      title: "TypeScript Types",
      skill: "TypeScript types",
      summary: "Catching mistakes before the code runs, and why types vanish at runtime.",
      caption:
        "Types are checked when you build, then erased. The JavaScript that runs has no types, so data from outside still needs checking.",
      diagram: {
        type: "stack",
        packet: "code",
        layers: [
          { label: "TypeScript source", note: "type Ticket = { id: number }", tone: "c1" },
          { label: "tsc type check", note: "errors stop the build", tone: "warn" },
          { label: "JavaScript output", note: "types erased", tone: "c2" },
          { label: "Runtime", note: "browser or Node.js", tone: "ok" },
        ],
      },
    },
    {
      slug: "input-validation",
      title: "Input Validation",
      skill: "Input validation",
      summary:
        "Checking every piece of outside data on the server, against a schema, before using it.",
      caption:
        "The browser check helps the user; the server check protects the system. Bad input stops at the schema and never reaches the database.",
      diagram: {
        type: "topology",
        nodes: [
          {
            id: "form",
            kind: "browser",
            label: "Contact form",
            sub: "required, type=email",
            x: 12,
            y: 30,
          },
          {
            id: "api",
            kind: "api",
            label: "Server action",
            sub: "zod schema",
            x: 48,
            y: 30,
            tone: "warn",
          },
          { id: "db", kind: "db", label: "Database", x: 86, y: 30, tone: "ok" },
        ],
        links: [
          { from: "form", to: "api" },
          { from: "api", to: "db" },
        ],
        flows: [
          { path: ["form", "api", "db"], label: "Valid: parsed, typed, saved", tone: "ok" },
          {
            path: ["form", "api", "db"],
            label: "Invalid: 400 with field errors",
            tone: "bad",
            dropped: true,
          },
        ],
      },
    },
    {
      slug: "character-encoding",
      title: "Character Encoding",
      skill: "Character encoding",
      summary: "How text becomes bytes in UTF-8, and what garbled characters are telling you.",
      caption:
        "UTF-8 uses one byte for plain English and up to four for everything else. The first byte says how many follow.",
      diagram: {
        type: "blocks",
        rows: [
          { label: "A", cells: [{ label: "41", sub: "1 byte · ASCII", tone: "c1" }] },
          {
            label: "é",
            cells: [
              { label: "C3", sub: "lead", tone: "c2" },
              { label: "A9", sub: "cont.", tone: "c2" },
            ],
          },
          {
            label: "₹",
            cells: [
              { label: "E2", sub: "lead", tone: "ok" },
              { label: "82", sub: "cont.", tone: "ok" },
              { label: "B9", sub: "cont.", tone: "ok" },
            ],
          },
          {
            label: "😀",
            cells: [
              { label: "F0", sub: "lead", tone: "warn" },
              { label: "9F", sub: "cont.", tone: "warn" },
              { label: "98", sub: "cont.", tone: "warn" },
              { label: "80", sub: "cont.", tone: "warn" },
            ],
          },
        ],
      },
    },
  ],
};
