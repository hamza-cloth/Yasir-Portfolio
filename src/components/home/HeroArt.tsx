// Background art behind the hero: two soft light pools and a few running fibre lines, all drawn
// from the active look's colours, so every look gets the same art in its own palette.
// Decorative only, and pure SVG/CSS, so it costs no JavaScript.
const FIBRES = [
  "M-40 620 C 300 520, 520 760, 860 560 S 1300 420, 1500 520",
  "M-40 700 C 260 640, 600 820, 900 640 S 1280 520, 1500 600",
  "M-40 540 C 340 420, 560 660, 880 470 S 1320 330, 1500 430",
];

export function HeroArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="hero-pool hero-pool--one" />
      <div className="hero-pool hero-pool--two" />
      <svg
        className="hero-fibres absolute inset-0 size-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {FIBRES.map((d, index) => (
          <path
            key={d}
            d={d}
            stroke={index % 2 ? "var(--c2)" : "var(--c1)"}
            strokeWidth="1.5"
            className="fibre-path"
            style={{ animationDelay: `${index * -2.2}s` }}
          />
        ))}
      </svg>
      <div className="hero-fade absolute inset-x-0 bottom-0 h-40" />
    </div>
  );
}
