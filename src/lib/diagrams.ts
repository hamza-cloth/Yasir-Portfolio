import type { ProjectVisual } from "@/generated/prisma/enums";

export type DiagramNode = {
  id: string;
  label: string;
  detail?: string;
  x: number;
  y: number;
  tone?: "c1" | "amber" | "ok";
};

export type DiagramEdge = [from: string, to: string];

export type Diagram = {
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 78;
export const DIAGRAM_WIDTH = 960;
export const DIAGRAM_HEIGHT = 380;

// Columns run left to right: who uses it, the core, what the core talks to. Only parts named in the brief.
export const DIAGRAMS: Record<ProjectVisual, Diagram> = {
  CLINIC_CONSOLE: {
    title: "Earthix AI Healthcare architecture",
    nodes: [
      { id: "web", label: "Web app", detail: "Next.js · Tailwind", x: 10, y: 70 },
      { id: "mobile", label: "Mobile app", detail: "React Native / Expo", x: 10, y: 232 },
      { id: "api", label: "API", detail: "NestJS · multi-tenant", x: 255, y: 151, tone: "c1" },
      {
        id: "ai",
        label: "AI drafting",
        detail: "documentation only",
        x: 500,
        y: 20,
        tone: "amber",
      },
      { id: "abdm", label: "ABDM adapters", detail: "ABHA · HPR · HFR", x: 500, y: 151 },
      { id: "data", label: "Data", detail: "PostgreSQL · Redis", x: 500, y: 282 },
      { id: "review", label: "Doctor review", detail: "every output", x: 750, y: 20, tone: "ok" },
    ],
    edges: [
      ["web", "api"],
      ["mobile", "api"],
      ["api", "ai"],
      ["api", "abdm"],
      ["api", "data"],
      ["ai", "review"],
    ],
  },
  STOREFRONT: {
    title: "Hamza Cloth architecture",
    nodes: [
      { id: "store", label: "Storefront", detail: "customer app", x: 20, y: 20 },
      { id: "admin", label: "Admin panel", detail: "orders · catalogue", x: 20, y: 151 },
      { id: "rider", label: "Delivery-partner app", detail: "for Hamza Express", x: 20, y: 282 },
      {
        id: "backend",
        label: "One backend",
        detail: "shared by all three",
        x: 380,
        y: 151,
        tone: "c1",
      },
      {
        id: "razorpay",
        label: "Razorpay",
        detail: "checkout via APIs",
        x: 740,
        y: 20,
        tone: "amber",
      },
      {
        id: "utr",
        label: "UTR approval",
        detail: "then money is credited",
        x: 740,
        y: 151,
        tone: "ok",
      },
      { id: "express", label: "Hamza Express", detail: "in-house delivery", x: 740, y: 282 },
    ],
    edges: [
      ["store", "backend"],
      ["admin", "backend"],
      ["rider", "backend"],
      ["backend", "razorpay"],
      ["razorpay", "utr"],
      ["backend", "express"],
    ],
  },
  SEAT_MAP: {
    title: "The People’s Library architecture",
    nodes: [
      { id: "frontend", label: "Front end", detail: "React + Vite", x: 20, y: 151 },
      { id: "backend", label: "Backend", detail: "connected API", x: 380, y: 151, tone: "c1" },
      { id: "admissions", label: "Admissions", detail: "new students", x: 740, y: 20 },
      { id: "records", label: "Student records", detail: "one place", x: 740, y: 151 },
      {
        id: "fees",
        label: "Fees per shift",
        detail: "3 shifts · 24×7",
        x: 740,
        y: 282,
        tone: "amber",
      },
    ],
    edges: [
      ["frontend", "backend"],
      ["backend", "admissions"],
      ["backend", "records"],
      ["backend", "fees"],
    ],
  },
};

// A smooth curve from the source's right edge to the target's left edge, or straight down
// when the target sits in the same column.
export function edgePath(from: DiagramNode, to: DiagramNode): string {
  if (Math.abs(from.x - to.x) < NODE_WIDTH / 2) {
    const x = from.x + NODE_WIDTH / 2;
    return `M ${x} ${from.y + NODE_HEIGHT} L ${x} ${to.y}`;
  }
  const startX = from.x + NODE_WIDTH;
  const startY = from.y + NODE_HEIGHT / 2;
  const endX = to.x;
  const endY = to.y + NODE_HEIGHT / 2;
  const mid = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${mid} ${startY} ${mid} ${endY} ${endX} ${endY}`;
}
