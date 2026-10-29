// Background art behind the hero, one layer per look; CSS shows only the active one.
// Decorative only, and pure SVG/CSS, so it costs no JavaScript.
export function HeroArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="hero-art hero-art-porcelain absolute -top-1/4 right-[-10%] size-[60rem] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />

      <svg
        className="hero-art hero-art-midnight-ops absolute inset-0 size-full [mask-image:linear-gradient(90deg,transparent_30%,#000_60%)]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <filter id="fibre-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[
          "M-40 620 C 300 520, 520 760, 860 560 S 1300 420, 1500 520",
          "M-40 700 C 260 640, 600 820, 900 640 S 1280 520, 1500 600",
          "M-40 540 C 340 420, 560 660, 880 470 S 1320 330, 1500 430",
          "M-40 780 C 360 720, 640 900, 940 720 S 1300 610, 1500 690",
        ].map((d, index) => (
          <path
            key={d}
            d={d}
            stroke={index % 2 ? "#3b82f6" : "#22d3ee"}
            strokeWidth="1.6"
            strokeOpacity="0.55"
            filter="url(#fibre-glow)"
            className="fibre-path"
            style={{ animationDelay: `${index * -1.4}s` }}
          />
        ))}
      </svg>

      <div className="hero-art hero-art-sunset-fibre absolute inset-0">
        <div className="absolute top-[8%] right-[4%] size-[34rem] rounded-full bg-[linear-gradient(180deg,#fdba74,#f97316_45%,#db2777_80%,#7c2d5b)] [mask-image:repeating-linear-gradient(180deg,#000_0_14px,transparent_14px_20px)] opacity-35 blur-[2px]" />
      </div>

      <div className="hero-art hero-art-aurora absolute inset-0">
        <div className="orb top-[-10%] right-[0%] size-[38rem] bg-[#8b5cf6]/35" />
        <div
          className="orb top-[30%] left-[-10%] size-[30rem] bg-[#2dd4bf]/20"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="orb right-[25%] bottom-[-20%] size-[26rem] bg-[#ec4899]/15"
          style={{ animationDelay: "-9s" }}
        />
      </div>
    </div>
  );
}
