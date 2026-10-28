import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type TileLinkProps = {
  href: string;
  children: string;
  className?: string;
};

export function TileLink({ href, children, className }: TileLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group/link mt-auto inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold transition-opacity hover:opacity-80",
        className,
      )}
    >
      {children}
      <Icon
        name="arrow-right"
        size={15}
        className="transition-transform duration-300 group-hover/link:translate-x-1"
      />
    </Link>
  );
}
