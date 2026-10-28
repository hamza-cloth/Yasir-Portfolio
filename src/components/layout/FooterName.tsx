// SVG text with a fixed textLength scales with the container, so the giant name never overflows.
export function FooterName({ name }: { name: string }) {
  return (
    <svg
      aria-hidden="true"
      className="footer-name h-auto w-full"
      viewBox="0 0 1000 132"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x="0" y="112" fontSize="128" textLength="1000" lengthAdjust="spacingAndGlyphs">
        {name}
      </text>
    </svg>
  );
}
