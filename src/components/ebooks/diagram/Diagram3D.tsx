import { PlayWhenVisible } from "@/components/ui/PlayWhenVisible";
import { cn } from "@/lib/cn";
import type { Diagram } from "@/lib/ebooks/types";

import { Blocks } from "./Blocks";
import { Sequence } from "./Sequence";
import { Stack } from "./Stack";
import { Topology } from "./Topology";

type Diagram3DProps = {
  diagram: Diagram;
  caption: string;
  // Print and PDF: no motion, every route and arrow drawn in full.
  still?: boolean;
  className?: string;
};

// The scene is decoration for sighted readers; this list carries the same facts as text.
function describe(diagram: Diagram): string[] {
  switch (diagram.type) {
    case "topology": {
      const names = new Map(diagram.nodes.map((node) => [node.id, node.label]));
      return [
        `Devices: ${diagram.nodes.map((node) => node.label).join(", ")}.`,
        ...(diagram.flows ?? []).map(
          (flow) =>
            `${flow.label ? `${flow.label}: ` : ""}${flow.path.map((id) => names.get(id)).join(" → ")}${flow.dropped ? " (dropped)" : ""}.`,
        ),
      ];
    }
    case "sequence": {
      const names = new Map(diagram.actors.map((actor) => [actor.id, actor.label]));
      return diagram.messages.map(
        (message, index) =>
          `${index + 1}. ${names.get(message.from)} → ${names.get(message.to)}: ${message.label}${message.note ? ` (${message.note})` : ""}.`,
      );
    }
    case "stack":
      return diagram.layers.map(
        (layer, index) => `${index + 1}. ${layer.label}${layer.note ? `: ${layer.note}` : ""}.`,
      );
    case "blocks":
      return diagram.rows.map(
        (row) =>
          `${row.label ? `${row.label}: ` : ""}${row.cells.map((cell) => (cell.sub ? `${cell.label} (${cell.sub})` : cell.label)).join(", ")}.`,
      );
  }
}

function Scene({ diagram }: { diagram: Diagram }) {
  switch (diagram.type) {
    case "topology":
      return <Topology diagram={diagram} />;
    case "sequence":
      return <Sequence diagram={diagram} />;
    case "stack":
      return <Stack diagram={diagram} />;
    case "blocks":
      return <Blocks diagram={diagram} />;
  }
}

export function Diagram3D({ diagram, caption, still = false, className }: Diagram3DProps) {
  const scene = (
    <div aria-hidden="true" className="dg-frame tilt-3d">
      <Scene diagram={diagram} />
    </div>
  );

  return (
    <figure className={cn("dg", className)} data-dg-still={still ? "" : undefined}>
      {still ? scene : <PlayWhenVisible>{scene}</PlayWhenVisible>}
      <ul className="sr-only">
        {describe(diagram).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <figcaption className="dg-caption">{caption}</figcaption>
    </figure>
  );
}
