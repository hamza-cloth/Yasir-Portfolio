import { useId } from "react";

import type { ProjectVisual } from "@/generated/prisma/enums";
import { cssVars } from "@/lib/css-vars";
import { DIAGRAM_HEIGHT, DIAGRAM_WIDTH, DIAGRAMS, edgePath } from "@/lib/diagrams";

import { DiagramBox } from "./DiagramBox";

export function ArchitectureDiagram({ visual }: { visual: ProjectVisual }) {
  const diagram = DIAGRAMS[visual];
  const titleId = useId();
  const descId = useId();
  const byId = new Map(diagram.nodes.map((node) => [node.id, node]));
  const edges = diagram.edges.flatMap(([fromId, toId]) => {
    const from = byId.get(fromId);
    const to = byId.get(toId);
    return from && to ? [{ key: `${fromId}-${toId}`, from, to, d: edgePath(from, to) }] : [];
  });

  return (
    <div className="diagram-scroll rounded-card border border-line bg-bg-2 p-4" tabIndex={0}>
      <svg
        viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        className="h-auto w-full min-w-[800px]"
      >
        <title id={titleId}>{diagram.title}</title>
        <desc id={descId}>
          {edges.map((edge) => `${edge.from.label} connects to ${edge.to.label}.`).join(" ")}
        </desc>
        <g fill="none" stroke="var(--line-2)" strokeWidth="1.5">
          {edges.map((edge) => (
            <path key={edge.key} d={edge.d} />
          ))}
        </g>
        <g aria-hidden="true">
          {edges.map((edge, index) => (
            <circle
              key={edge.key}
              r="4"
              fill="var(--c1)"
              className="diagram-packet"
              style={cssVars({ "--edge": `path("${edge.d}")`, "--delay": `${index * 0.45}s` })}
            />
          ))}
        </g>
        {diagram.nodes.map((node) => (
          <DiagramBox key={node.id} node={node} />
        ))}
      </svg>
    </div>
  );
}
