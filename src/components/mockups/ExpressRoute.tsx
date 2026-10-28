// The dot follows the same path as .route-dot's offset-path in home.css.
const ROUTE = "M 12 108 C 60 108 70 40 120 40 S 190 92 236 22";

export function ExpressRoute() {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="label-mono text-fg">Hamza Express</p>
      <div className="relative aspect-[248/130] w-full overflow-hidden rounded-chip border border-line bg-surface-2">
        <svg viewBox="0 0 248 130" className="absolute inset-0 size-full">
          <path
            d={ROUTE}
            fill="none"
            stroke="var(--line-2)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d={ROUTE}
            fill="none"
            stroke="var(--c1)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeLinecap="round"
          />
          <circle cx="12" cy="108" r="5" fill="var(--amber)" />
          <circle cx="236" cy="22" r="5" fill="var(--ok)" />
          <circle className="route-dot" r="4" fill="var(--c1)" />
        </svg>
      </div>
      <p className="label-mono rounded-pill border border-line px-2 py-1 text-muted">
        Paid to Hamza Cloth · credited after UTR approval
      </p>
    </div>
  );
}
