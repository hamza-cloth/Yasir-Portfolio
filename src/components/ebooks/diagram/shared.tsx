import type { NodeKind, Tone } from "@/lib/ebooks/types";

export const TONE_COLOR: Record<Tone, string> = {
  c1: "var(--c1-text)",
  c2: "var(--c2-text)",
  ok: "var(--ok)",
  warn: "var(--amber)",
  bad: "var(--red)",
  muted: "var(--faint)",
};

export function toneColor(tone: Tone | undefined, fallback: Tone = "c1"): string {
  return TONE_COLOR[tone ?? fallback];
}

// 24 × 24 outline glyphs, drawn with the current colour.
const NODE_PATHS: Record<NodeKind, string> = {
  pc: "M3 4h18v12H3zM8 20h8M12 16v4",
  laptop: "M5 5h14v10H5zM2 19h20l-2-4H4z",
  phone: "M8 2h8v20H8zM11 18h2",
  server: "M4 3h16v6H4zM4 15h16v6H4zM4 9v6M20 9v6M8 6h.01M8 18h.01",
  switch: "M2 8h20v8H2zM6 12h.01M10 12h.01M14 12h.01M18 12h.01",
  router: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 8l3 3M8 8h3M8 8v3M16 16l-3-3M16 16h-3M16 16v-3",
  firewall: "M3 5h18v14H3zM3 10h18M3 15h18M9 5v5M15 10v5M9 15v4",
  cloud: "M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9z",
  db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  browser: "M3 4h18v16H3zM3 9h18M6 6.5h.01M9 6.5h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  api: "M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16",
  cache: "M13 2 4 14h7l-1 8 9-12h-7z",
  printer: "M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z",
  ap: "M2 9a15 15 0 0 1 20 0M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M12 20h.01",
  lock: "M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3",
  key: "M8 14a4 4 0 1 1 3.5-6H21v3h-2v3h-3v-3h-4.5A4 4 0 0 1 8 14z",
  file: "M6 2h8l4 4v16H6zM14 2v4h4M9 12h6M9 16h6",
  panel: "M2 8h20v8H2zM5 11h2v2H5zM9 11h2v2H9zM13 11h2v2h-2zM17 11h2v2h-2z",
  outlet: "M5 3h14v18H5zM9 7h6v4H9zM9 14h6v3H9z",
  tool: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z",
};

export function NodeGlyph({ kind, size = 20 }: { kind: NodeKind; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={NODE_PATHS[kind]} />
    </svg>
  );
}

// SMIL timing for one step of a looping cycle: the step runs from `start` to `end` (both 0–1 of
// the cycle) and is hidden the rest of the time. Every step shares one duration, so they stay in phase.
export function stepWindow(index: number, count: number, travel = 0.72) {
  const slot = 1 / count;
  const start = index * slot;
  const end = start + slot * travel;
  const fade = Math.min(0.012, slot * 0.08);
  return {
    start,
    end,
    motionTimes: `0;${fmt(start)};${fmt(end)};1`,
    opacityTimes: `0;${fmt(start)};${fmt(start + fade)};${fmt(end)};${fmt(Math.min(end + fade, 1))};1`,
    afterTimes: `0;${fmt(end)};${fmt(Math.min(end + fade, 1))};${fmt(Math.min(start + slot * 0.97, 1))};${fmt(Math.min(start + slot, 1))};1`,
  };
}

function fmt(value: number): string {
  return value.toFixed(4);
}
