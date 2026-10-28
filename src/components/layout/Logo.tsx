import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Yasir Abdullah, home"
      className="group flex min-h-11 flex-none items-center gap-3"
    >
      <span
        aria-hidden="true"
        className="surface grid size-10 place-items-center rounded-xl border border-line-2 transition-transform duration-500 ease-entrance group-hover:-rotate-6 terminal:rounded-none"
      >
        <span className="text-gradient font-display text-[0.95rem] leading-none font-semibold tracking-[-0.04em] terminal:text-2xl">
          YA
        </span>
      </span>
      <span aria-hidden="true" className="hidden flex-col leading-tight xl:flex">
        <span className="text-[0.95rem] font-semibold tracking-[-0.02em] text-fg">
          Yasir Abdullah
        </span>
        <span className="text-xs text-muted">Software &amp; Network Engineer</span>
      </span>
    </Link>
  );
}
