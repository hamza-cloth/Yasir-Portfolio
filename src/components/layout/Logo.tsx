import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Yasir Abdullah, home"
      className="glow-hover grid size-11 flex-none place-items-center rounded-chip border border-line-2 bg-surface-solid"
    >
      <span
        aria-hidden="true"
        className="text-gradient font-display text-[0.95rem] leading-none font-bold terminal:text-2xl"
      >
        YA
      </span>
    </Link>
  );
}
