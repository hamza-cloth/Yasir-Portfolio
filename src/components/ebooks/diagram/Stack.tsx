import { cssVars } from "@/lib/css-vars";
import type { StackDiagram } from "@/lib/ebooks/types";

import { toneColor } from "./shared";

const STEP_SECONDS = 0.8;

// Solid slabs seen from above and to one side, labels on their upright front faces. The slabs
// breathe apart, and a packet sinks (or rises) past them, lighting each one as it goes by.
export function Stack({ diagram }: { diagram: StackDiagram }) {
  const { layers } = diagram;
  const count = layers.length;
  const down = (diagram.direction ?? "down") === "down";

  return (
    <div className="dg-stage">
      <div
        className="dg-scene dg-scene--stack"
        style={cssVars({ "--travel": `${count * STEP_SECONDS}s`, "--step": `${STEP_SECONDS}s` })}
      >
        {layers.map((layer, index) => (
          <div
            key={layer.label}
            className="dg-slab"
            style={cssVars({
              "--spread": index - (count - 1) / 2,
              "--order": down ? index : count - 1 - index,
              "--tone": toneColor(layer.tone, index % 2 ? "c2" : "c1"),
            })}
          >
            <span className="dg-slab-glow" />
            <span className="dg-slab-title">{layer.label}</span>
            {layer.note ? <span className="dg-slab-note label-mono">{layer.note}</span> : null}
          </div>
        ))}
        {diagram.packet ? (
          <div className="dg-stack-packet" data-direction={down ? "down" : "up"}>
            <span className="label-mono">{diagram.packet}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
