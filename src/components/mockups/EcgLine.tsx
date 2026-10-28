// One heartbeat cycle, drawn twice side by side so the track can loop at -50%.
const BEAT = "l18 0 l4 -6 l4 6 l6 0 l3 8 l5 -30 l5 34 l4 -12 l8 0 l6 -5 l6 5 l21 0";

export function EcgLine() {
  return (
    <div className="relative h-16 overflow-hidden rounded-chip border border-line bg-surface-2">
      <svg
        className="ecg-track absolute inset-y-0 left-0 h-full w-[200%]"
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
      >
        <path
          d={`M0 34 ${BEAT} ${BEAT} ${BEAT} ${BEAT}`}
          fill="none"
          stroke="var(--ok)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
