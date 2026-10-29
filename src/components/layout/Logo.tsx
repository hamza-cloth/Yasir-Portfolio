import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex min-h-11 min-w-11 flex-none items-center gap-2.5">
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-full bg-fg text-bg transition-transform duration-500 ease-entrance group-hover:-rotate-12"
      >
        <span className="font-display text-[0.9rem] leading-none font-extrabold tracking-[-0.04em]">
          YA
        </span>
      </span>
      {/* The name is the link's text (only shown from xl up), so its accessible name matches. */}
      <span className="sr-only text-[0.95rem] font-bold tracking-[-0.02em] xl:not-sr-only">
        Yasir Abdullah
      </span>
      <span className="sr-only">, home</span>
    </Link>
  );
}
