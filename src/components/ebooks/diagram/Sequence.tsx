import { cssVars } from "@/lib/css-vars";
import type { SequenceDiagram } from "@/lib/ebooks/types";

import { NodeGlyph, stepWindow, toneColor } from "./shared";

const ROW = 10;
const TOP = 4;
const SECONDS_PER_MESSAGE = 1.6;

// Actors stand at the top of a tilted board; each message draws itself in turn, a dot rides
// along it, and the finished exchange holds for a moment before the cycle starts again.
export function Sequence({ diagram }: { diagram: SequenceDiagram }) {
  const { actors, messages } = diagram;
  const height = TOP + messages.length * ROW + 4;
  const column = new Map(
    actors.map((actor, index) => [
      actor.id,
      actors.length === 1 ? 50 : 12 + (index * 76) / (actors.length - 1),
    ]),
  );
  // One extra slot at the end, so the whole exchange stays on screen before it resets.
  const slots = messages.length + 1;
  const cycle = slots * SECONDS_PER_MESSAGE;

  return (
    <div className="dg-stage">
      <div className="dg-scene dg-scene--board">
        <ul className="dg-actors">
          {actors.map((actor) => (
            <li key={actor.id} style={{ left: `${column.get(actor.id)}%` }}>
              <span className="dg-node-tile">
                <NodeGlyph kind={actor.kind} />
              </span>
              <span className="dg-node-label">{actor.label}</span>
            </li>
          ))}
        </ul>
        <div
          className="dg-seq"
          style={cssVars({ "--seq-ratio": `${100 / height}`, "--rows": messages.length })}
        >
          <svg
            className="dg-seq-svg"
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {actors.map((actor) => (
              <line
                key={actor.id}
                x1={column.get(actor.id)}
                x2={column.get(actor.id)}
                y1={0}
                y2={height}
                className="dg-lifeline"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {messages.map((message, index) => {
              const x1 = column.get(message.from) ?? 0;
              const x2 = column.get(message.to) ?? 0;
              const y = TOP + index * ROW + ROW * 0.62;
              const dir = x2 >= x1 ? 1 : -1;
              const start = x1 + dir * 1.2;
              const end = x2 - dir * 1.2;
              const timing = stepWindow(index, slots, 0.8);
              const color = toneColor(message.tone);
              return (
                <g key={index} style={{ color }}>
                  <line
                    x1={start}
                    x2={end}
                    y1={y}
                    y2={y}
                    className="dg-seq-track"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path d={`M${end} ${y} l${-dir * 2.2} -1.3 v2.6 z`} className="dg-seq-head" />
                  <g className="dg-motion">
                    <line
                      x1={start}
                      x2={end}
                      y1={y}
                      y2={y}
                      pathLength={1}
                      className="dg-seq-draw"
                      strokeDasharray="1 1"
                      strokeDashoffset={1}
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        dur={`${cycle}s`}
                        repeatCount="indefinite"
                        values="1;1;0;0;1"
                        keyTimes={`0;${timing.start.toFixed(4)};${timing.end.toFixed(4)};0.97;1`}
                      />
                    </line>
                    <g opacity={0}>
                      <animateMotion
                        dur={`${cycle}s`}
                        repeatCount="indefinite"
                        path={`M${start} ${y} L${end} ${y}`}
                        keyPoints="0;0;1;1"
                        keyTimes={timing.motionTimes}
                        calcMode="linear"
                      />
                      <animate
                        attributeName="opacity"
                        dur={`${cycle}s`}
                        repeatCount="indefinite"
                        values="0;0;1;1;0;0"
                        keyTimes={timing.opacityTimes}
                      />
                      <ellipse rx={1.4} ry={2.2} className="dg-packet-glow" />
                      <ellipse rx={0.7} ry={1.1} className="dg-packet" />
                    </g>
                  </g>
                </g>
              );
            })}
          </svg>
          {messages.map((message, index) => {
            const x1 = column.get(message.from) ?? 0;
            const x2 = column.get(message.to) ?? 0;
            const y = TOP + index * ROW + ROW * 0.62;
            return (
              <span
                key={index}
                className="dg-seq-label"
                style={{
                  left: `${(x1 + x2) / 2}%`,
                  top: `${(y / height) * 100}%`,
                  color: toneColor(message.tone),
                }}
              >
                <span className="dg-seq-text">{message.label}</span>
                {message.note ? (
                  <span className="dg-seq-note label-mono">{message.note}</span>
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
