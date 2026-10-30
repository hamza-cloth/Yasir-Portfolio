import { cssVars } from "@/lib/css-vars";
import type { BlockCell, BlocksDiagram } from "@/lib/ebooks/types";

import { toneColor } from "./shared";

const WAVE_SECONDS = 0.14;

function cellStyle(cell: BlockCell, index: number) {
  if (cell.color) {
    const fill = cell.striped
      ? `repeating-linear-gradient(135deg, ${cell.color} 0 7px, #f4f4f2 7px 13px)`
      : cell.color;
    return cssVars({ "--k": index, "--fill": fill, "--span": cell.span ?? 1 });
  }
  return cssVars({
    "--k": index,
    "--tone": toneColor(cell.tone, "muted"),
    "--span": cell.span ?? 1,
  });
}

// Rows of raised tiles on a tilted board. A wave lifts each tile in reading order, so the eye
// follows the sequence: pin 1 to pin 8, block to block, row to row.
export function Blocks({ diagram }: { diagram: BlocksDiagram }) {
  const total = diagram.rows.reduce((sum, row) => sum + row.cells.length, 0);
  const cycle = Math.max(3, total * WAVE_SECONDS + 1.6);
  // Where each row starts in reading order, so the wave runs across rows without a gap.
  const offsets = diagram.rows.map((_, rowIndex) =>
    diagram.rows.slice(0, rowIndex).reduce((sum, row) => sum + row.cells.length, 0),
  );

  return (
    <div className="dg-stage">
      <div
        className="dg-scene dg-scene--blocks"
        style={cssVars({ "--cycle": `${cycle}s`, "--wave": `${WAVE_SECONDS}s` })}
      >
        {diagram.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="dg-block-row">
            {row.label ? <span className="dg-block-row-label label-mono">{row.label}</span> : null}
            <div className="dg-block-cells">
              {row.cells.map((cell, cellIndex) => {
                const index = (offsets[rowIndex] ?? 0) + cellIndex;
                return (
                  <div
                    key={cellIndex}
                    className="dg-block"
                    data-wire={cell.color ? "" : undefined}
                    style={cellStyle(cell, index)}
                  >
                    <span className="dg-block-label">{cell.label}</span>
                    {cell.sub ? <span className="dg-block-sub label-mono">{cell.sub}</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
