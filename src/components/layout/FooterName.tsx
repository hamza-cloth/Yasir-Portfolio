// SVG text with a fixed textLength scales with the container, so the giant name never overflows.
export function FooterName({ name }: { name: string }) {
  return (
    <svg
      aria-hidden="true"
      className="footer-name h-auto w-full"
      viewBox="0 0 1000 132"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="footer-name-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--fg)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--fg)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <text x="0" y="112" fontSize="128" textLength="1000" lengthAdjust="spacingAndGlyphs">
        {name}
      </text>
    </svg>
  );
}
