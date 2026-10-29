import { NODE_HEIGHT, NODE_WIDTH, type DiagramNode } from "@/lib/diagrams";

const TONES = {
  c1: "var(--c1)",
  amber: "var(--amber)",
  ok: "var(--ok)",
} as const;

export function DiagramBox({ node }: { node: DiagramNode }) {
  const accent = node.tone ? TONES[node.tone] : "var(--line-2)";

  return (
    <g transform={`translate(${node.x} ${node.y})`}>
      <rect
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx="14"
        fill="var(--surface-solid)"
        stroke={accent}
        strokeWidth={node.tone ? 1.6 : 1}
      />
      <rect x="14" y="16" width="6" height="6" fill={accent} />
      <text x="28" y="26" fill="var(--fg)" fontSize="17" fontWeight="600" className="font-body">
        {node.label}
      </text>
      {node.detail ? (
        <text x="14" y="56" fill="var(--muted)" fontSize="15" className="font-body">
          {node.detail}
        </text>
      ) : null}
    </g>
  );
}
