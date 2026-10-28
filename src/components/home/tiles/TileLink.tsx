import Link from "next/link";

import { Icon } from "@/components/ui/Icon";

type TileLinkProps = {
  href: string;
  children: string;
};

export function TileLink({ href, children }: TileLinkProps) {
  return (
    <Link
      href={href}
      className="group/link label-mono tile-foot mt-auto inline-flex min-h-11 items-center gap-2 self-start text-c1-text transition-colors hover:text-fg"
    >
      {children}
      <Icon
        name="arrow-right"
        size={14}
        className="transition-transform duration-300 group-hover/link:translate-x-1"
      />
    </Link>
  );
}
