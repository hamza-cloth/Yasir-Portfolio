import type { Ebook } from "../types";

export const LAYER_5: Ebook = {
  slug: "layer-5-session",
  layer: 5,
  layerName: "Session",
  title: "Sessions, Tokens and Access",
  subtitle: "Layer 5 · Session",
  summary:
    "Remembering who someone is between requests, and deciding what they may do: login sessions, JWTs, Redis, roles and keeping tenants apart.",
  chapters: [
    {
      slug: "login-sessions",
      title: "Login Sessions",
      skill: "Login sessions",
      summary: "How a server remembers a signed-in user with a random ID in a cookie.",
      caption:
        "The password is checked once. After that the browser shows a random session ID, and the server looks it up on every request.",
      diagram: {
        type: "sequence",
        actors: [
          { id: "b", label: "Browser", kind: "browser" },
          { id: "app", label: "App server", kind: "server" },
          { id: "st", label: "Session store", kind: "db" },
        ],
        messages: [
          { from: "b", to: "app", label: "POST /login", note: "email + password" },
          { from: "app", to: "st", label: "Save session", note: "sid → user 42", tone: "c2" },
          { from: "app", to: "b", label: "Set-Cookie: sid", note: "HttpOnly · Secure", tone: "ok" },
          { from: "b", to: "app", label: "GET /dashboard", note: "cookie sent" },
          { from: "app", to: "st", label: "Look up sid", tone: "c2" },
          { from: "app", to: "b", label: "200 · Hello, Asha", tone: "ok" },
        ],
      },
    },
    {
      slug: "jwt",
      title: "JSON Web Tokens",
      skill: "JWT",
      summary: "A signed token that carries its own claims, and the rules for using one safely.",
      caption:
        "Three base64url parts joined by dots. Anyone can read the payload; only the signature proves it was not changed.",
      diagram: {
        type: "blocks",
        rows: [
          {
            label: "Token",
            cells: [
              { label: "Header", sub: "alg: HS256", tone: "c1" },
              { label: ".", tone: "muted", span: 0.2 },
              { label: "Payload", sub: "the claims", tone: "c2" },
              { label: ".", tone: "muted", span: 0.2 },
              { label: "Signature", sub: "HMAC(header.payload)", tone: "ok" },
            ],
          },
          {
            label: "Claims",
            cells: [
              { label: "sub", sub: "user 42", tone: "c2" },
              { label: "role", sub: "staff", tone: "c2" },
              { label: "iat", sub: "issued at", tone: "c2" },
              { label: "exp", sub: "15 min later", tone: "warn" },
            ],
          },
          {
            label: "Server",
            cells: [
              { label: "Check signature", tone: "ok" },
              { label: "Check exp", tone: "ok" },
              { label: "Then trust claims", tone: "ok" },
            ],
          },
        ],
      },
    },
    {
      slug: "redis-session-store",
      title: "Redis as a Session Store",
      skill: "Redis session store",
      summary:
        "Keeping sessions in one fast shared store so any app server can answer any request.",
      caption:
        "Two requests from one user land on different app servers. Both find the same session in Redis, so the user stays signed in.",
      diagram: {
        type: "topology",
        nodes: [
          { id: "b", kind: "browser", label: "Browser", sub: "cookie sid=7f3a", x: 10, y: 30 },
          { id: "lb", kind: "switch", label: "Load balancer", x: 34, y: 30, tone: "c2" },
          { id: "a1", kind: "server", label: "App 1", x: 60, y: 12 },
          { id: "a2", kind: "server", label: "App 2", x: 60, y: 48 },
          {
            id: "r",
            kind: "cache",
            label: "Redis",
            sub: "sess:7f3a · TTL 30m",
            x: 88,
            y: 30,
            tone: "bad",
          },
        ],
        links: [
          { from: "b", to: "lb" },
          { from: "lb", to: "a1" },
          { from: "lb", to: "a2" },
          { from: "a1", to: "r" },
          { from: "a2", to: "r" },
        ],
        flows: [
          { path: ["b", "lb", "a1", "r"], label: "Request 1 via App 1", tone: "c1" },
          { path: ["b", "lb", "a2", "r"], label: "Request 2 via App 2: same session", tone: "c2" },
        ],
      },
    },
    {
      slug: "role-based-access",
      title: "Role-Based Access Control",
      skill: "Role-based access",
      summary:
        "Giving permissions to roles, not people, and checking them on the server every time.",
      caption:
        "Each role has a fixed set of actions. A user gets a role; the server checks the role on every request.",
      diagram: {
        type: "blocks",
        rows: [
          {
            label: "Action",
            cells: [
              { label: "View", tone: "muted" },
              { label: "Create", tone: "muted" },
              { label: "Edit", tone: "muted" },
              { label: "Delete", tone: "muted" },
              { label: "Manage users", tone: "muted" },
            ],
          },
          {
            label: "Admin",
            cells: [
              { label: "✓", tone: "ok" },
              { label: "✓", tone: "ok" },
              { label: "✓", tone: "ok" },
              { label: "✓", tone: "ok" },
              { label: "✓", tone: "ok" },
            ],
          },
          {
            label: "Staff",
            cells: [
              { label: "✓", tone: "ok" },
              { label: "✓", tone: "ok" },
              { label: "✓", sub: "own only", tone: "warn" },
              { label: "✕", tone: "bad" },
              { label: "✕", tone: "bad" },
            ],
          },
          {
            label: "Viewer",
            cells: [
              { label: "✓", tone: "ok" },
              { label: "✕", tone: "bad" },
              { label: "✕", tone: "bad" },
              { label: "✕", tone: "bad" },
              { label: "✕", tone: "bad" },
            ],
          },
        ],
      },
    },
    {
      slug: "tenant-isolation",
      title: "Tenant Isolation",
      skill: "Tenant isolation",
      summary:
        "Making sure one customer's data can never be read by another, in an app they all share.",
      caption:
        "Every query is scoped to the tenant in the signed-in session. A request for another tenant's record finds nothing.",
      diagram: {
        type: "topology",
        zones: [
          { x: 70, y: 4, w: 27, h: 24, label: "tenant_id = A", tone: "c1" },
          { x: 70, y: 32, w: 27, h: 24, label: "tenant_id = B", tone: "c2" },
        ],
        nodes: [
          { id: "ua", kind: "user", label: "Clinic A user", x: 10, y: 16 },
          { id: "ub", kind: "user", label: "Clinic B user", x: 10, y: 46, tone: "c2" },
          {
            id: "api",
            kind: "api",
            label: "API",
            sub: "WHERE tenant_id = ?",
            x: 42,
            y: 30,
            tone: "warn",
          },
          { id: "da", kind: "db", label: "A's records", x: 84, y: 18 },
          { id: "db", kind: "db", label: "B's records", x: 84, y: 46, tone: "c2" },
        ],
        links: [
          { from: "ua", to: "api" },
          { from: "ub", to: "api" },
          { from: "api", to: "da" },
          { from: "api", to: "db" },
        ],
        flows: [
          { path: ["ua", "api", "da"], label: "A reads A's data", tone: "c1" },
          { path: ["ub", "api", "db"], label: "B reads B's data", tone: "c2" },
          {
            path: ["ua", "api", "db"],
            label: "A asks for B's record: not found",
            tone: "bad",
            dropped: true,
          },
        ],
      },
    },
  ],
};
