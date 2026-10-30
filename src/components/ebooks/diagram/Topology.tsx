import { cssVars } from "@/lib/css-vars";
import type { TopologyDiagram, TopologyFlow, TopologyNode } from "@/lib/ebooks/types";

import { NodeGlyph, stepWindow, toneColor } from "./shared";

const FLOOR_H = 60;
const SECONDS_PER_FLOW = 3.4;

function at(node: TopologyNode) {
  return { left: `${node.x}%`, top: `${(node.y / FLOOR_H) * 100}%` };
}

// Where a flow's packet ends: at its last device, or, when dropped, a short way past the device
// before it (the one that blocks it), short of arriving.
const DROP_AT = 0.38;

function flowPoints(flow: TopologyFlow, byId: Map<string, TopologyNode>) {
  const points = flow.path
    .map((id) => byId.get(id))
    .filter((node): node is TopologyNode => Boolean(node))
    .map((node) => ({ x: node.x, y: node.y }));
  const last = points[points.length - 1];
  const before = points[points.length - 2];
  if (flow.dropped && last && before) {
    points[points.length - 1] = {
      x: before.x + (last.x - before.x) * DROP_AT,
      y: before.y + (last.y - before.y) * DROP_AT,
    };
  }
  return points;
}

// A cross where a dropped packet stops.
function DropMark({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x - 1.6} ${y - 1} L${x + 1.6} ${y + 1} M${x + 1.6} ${y - 1} L${x - 1.6} ${y + 1}`}
      className="dg-drop"
    />
  );
}

// A device stands up from its foot and hides the floor behind it, so a link's label sits nearer
// the device further back.
function labelPoint(from: TopologyNode, to: TopologyNode) {
  const [back, front] = from.y <= to.y ? [from, to] : [to, from];
  return { x: back.x + (front.x - back.x) * 0.4, y: back.y + (front.y - back.y) * 0.4 };
}

// Devices stand upright on a tilted floor; links and zones are drawn on the floor, and each flow
// is a packet that travels its hops in turn.
export function Topology({ diagram }: { diagram: TopologyDiagram }) {
  const byId = new Map(diagram.nodes.map((node) => [node.id, node]));
  const flows = diagram.flows ?? [];
  const cycle = Math.max(4, flows.length * SECONDS_PER_FLOW);

  return (
    <>
      <div className="dg-stage">
        <div className="dg-scene dg-scene--floor">
          <div className="dg-floor">
            <svg
              className="dg-floor-svg"
              viewBox={`0 0 100 ${FLOOR_H}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {diagram.zones?.map((zone) => (
                <rect
                  key={zone.label}
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  rx={2}
                  className="dg-zone"
                  style={{ color: toneColor(zone.tone, "c2") }}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {diagram.links.map((link) => {
                const from = byId.get(link.from);
                const to = byId.get(link.to);
                if (!from || !to) return null;
                return (
                  <line
                    key={`${link.from}-${link.to}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className="dg-link"
                    data-style={link.style ?? "solid"}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              {/* Static arrows for reduced motion and print: each flow drawn once as a dashed route. */}
              <g className="dg-static">
                {flows.map((flow, index) => {
                  const points = flowPoints(flow, byId);
                  const last = points[points.length - 1];
                  return (
                    <g key={index} style={{ color: toneColor(flow.tone) }}>
                      <polyline
                        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
                        className="dg-route"
                        vectorEffect="non-scaling-stroke"
                      />
                      {flow.dropped && last ? <DropMark x={last.x} y={last.y} /> : null}
                    </g>
                  );
                })}
              </g>
              <g className="dg-motion">
                {flows.map((flow, index) => {
                  const points = flowPoints(flow, byId);
                  const last = points[points.length - 1];
                  if (points.length < 2 || !last) return null;
                  const d = points
                    .map((point, i) => `${i ? "L" : "M"}${point.x} ${point.y}`)
                    .join(" ");
                  const timing = stepWindow(index, flows.length);
                  const color = toneColor(flow.tone);
                  return (
                    <g key={index} style={{ color }}>
                      <g opacity={0}>
                        <animateMotion
                          dur={`${cycle}s`}
                          repeatCount="indefinite"
                          path={d}
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
                        <ellipse rx={2.6} ry={1.6} className="dg-packet-glow" />
                        <ellipse rx={1.15} ry={0.75} className="dg-packet" />
                      </g>
                      {flow.dropped ? (
                        <g opacity={0}>
                          <animate
                            attributeName="opacity"
                            dur={`${cycle}s`}
                            repeatCount="indefinite"
                            values="0;0;1;1;0;0"
                            keyTimes={timing.afterTimes}
                          />
                          <DropMark x={last.x} y={last.y} />
                        </g>
                      ) : null}
                    </g>
                  );
                })}
              </g>
            </svg>

            {diagram.zones?.map((zone) => (
              <span
                key={zone.label}
                className="dg-zone-label label-mono"
                style={{
                  left: `${zone.x + 1}%`,
                  top: `${((zone.y + 1) / FLOOR_H) * 100}%`,
                  color: toneColor(zone.tone, "c2"),
                }}
              >
                {zone.label}
              </span>
            ))}

            {diagram.links.map((link) => {
              const from = byId.get(link.from);
              const to = byId.get(link.to);
              if (!from || !to || !link.label) return null;
              return (
                <span
                  key={`label-${link.from}-${link.to}`}
                  className="dg-link-label label-mono"
                  style={{
                    left: `${labelPoint(from, to).x}%`,
                    top: `${(labelPoint(from, to).y / FLOOR_H) * 100}%`,
                  }}
                >
                  {link.label}
                </span>
              );
            })}

            {diagram.nodes.map((node, index) => (
              <div
                key={node.id}
                className="dg-node"
                style={{
                  ...at(node),
                  ...cssVars({ "--n": index, "--tone": toneColor(node.tone) }),
                }}
              >
                <div className="dg-node-stand">
                  <span className="dg-node-tile">
                    <NodeGlyph kind={node.kind} />
                  </span>
                  <span className="dg-node-label">{node.label}</span>
                  {node.sub ? <span className="dg-node-sub label-mono">{node.sub}</span> : null}
                </div>
              </div>
            ))}
          </div>
          <div className="dg-floor-edge" aria-hidden="true" />
        </div>
      </div>
      {flows.some((flow) => flow.label) ? (
        <ol className="dg-legend">
          {flows.map((flow, index) =>
            flow.label ? (
              <li key={index} style={cssVars({ "--tone": toneColor(flow.tone) })}>
                {flow.label}
              </li>
            ) : null,
          )}
        </ol>
      ) : null}
    </>
  );
}
