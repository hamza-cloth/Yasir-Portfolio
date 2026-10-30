import Link from "next/link";

import { LogoMark } from "@/components/brand/LogoMark";
import { cn } from "@/lib/cn";

type LogoProps = {
  variant?: "full" | "mark";
  // Extra classes for the divider and wordmark, e.g. to hide them at some widths.
  wordmarkClassName?: string;
  href?: string;
  label?: string;
  className?: string;
};

// The mark, a hairline divider and the stacked wordmark, linking home.
export function Logo({
  variant = "full",
  wordmarkClassName,
  href = "/",
  label = "Yasir Abdullah — Home",
  className,
}: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("group flex min-h-11 min-w-11 flex-none items-center gap-3 text-fg", className)}
    >
      <LogoMark className="transition-transform duration-500 ease-entrance group-hover:-translate-y-0.5" />
      {variant === "full" ? (
        // Hidden from assistive tech: the link's name is its aria-label, so the visible
        // wordmark must not add words that the label does not contain.
        <span aria-hidden="true" className={cn("flex items-center gap-3", wordmarkClassName)}>
          <span aria-hidden="true" className="h-9 w-px bg-line" />
          <span className="flex flex-col gap-1 leading-none">
            <span className="logo-name">YASIR ABDULLAH</span>
            <span className="logo-tagline">SOFTWARE &amp; NETWORK ENGINEER</span>
          </span>
        </span>
      ) : null}
    </Link>
  );
}
