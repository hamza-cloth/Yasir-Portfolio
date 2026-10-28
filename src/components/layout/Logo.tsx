import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Yasir Abdullah, home"
      className="group flex min-h-11 flex-none items-center gap-2.5"
    >
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-full bg-fg text-bg transition-transform duration-500 ease-entrance group-hover:-rotate-12 terminal:rounded-none terminal:bg-c1 terminal:text-c1-ink"
      >
        <span className="font-display text-[0.9rem] leading-none font-extrabold tracking-[-0.04em] terminal:text-2xl">
          YA
        </span>
      </span>
      <span
        aria-hidden="true"
        className="hidden text-[0.95rem] font-bold tracking-[-0.02em] xl:inline"
      >
        Yasir Abdullah
      </span>
    </Link>
  );
}
