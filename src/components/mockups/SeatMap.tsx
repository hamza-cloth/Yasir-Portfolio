import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";

import { MockupFrame } from "./MockupFrame";

const SEATS = Array.from({ length: 8 * 5 }, (_, index) => index);
const SHIFTS = [0, 1, 2];

// A fixed, illustrative pattern per shift. It is not real occupancy data.
function isBooked(seat: number, shift: number): boolean {
  return (seat * 7 + shift * 11) % 5 < 2;
}

function SeatGrid({ shift }: { shift: number }) {
  return (
    <div
      className="seat-layer absolute inset-0 grid grid-cols-8 grid-rows-5 gap-1.5"
      style={cssVars({ "--shift": shift })}
    >
      {SEATS.map((seat) => (
        <span
          key={seat}
          className={cn(
            "rounded-[4px] terminal:rounded-none",
            isBooked(seat, shift) ? "bg-c1" : "border border-line-2",
          )}
        />
      ))}
    </div>
  );
}

export function SeatMap() {
  return (
    <MockupFrame
      title="peoples-library / seats"
      label="Mockup of The People’s Library seat map cycling through three shifts of a 24×7 self-study centre."
    >
      <div className="flex h-full flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="label-mono text-fg">24×7 · 3 shifts</span>
          <div className="flex gap-1.5">
            {SHIFTS.map((shift) => (
              <span
                key={shift}
                className="shift-tab label-mono rounded-pill border border-c1 px-2 py-0.5 text-c1-text"
                style={cssVars({ "--shift": shift })}
              >
                Shift {shift + 1}
              </span>
            ))}
          </div>
        </div>
        {/* Sized from the height left over, so the grid always fits inside the frame. */}
        <div className="relative aspect-[8/5] min-h-0 max-w-full flex-1 self-center">
          {SHIFTS.map((shift) => (
            <SeatGrid key={shift} shift={shift} />
          ))}
        </div>
        <div className="label-mono flex gap-4 text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 bg-c1" /> Booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 border border-line-2" /> Free
          </span>
        </div>
      </div>
    </MockupFrame>
  );
}
