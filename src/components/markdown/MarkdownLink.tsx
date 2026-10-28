import type { ComponentProps } from "react";
import Link from "next/link";

export function MarkdownLink({ href = "", children, ...props }: ComponentProps<"a">) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...props}
      {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
    >
      {children}
    </a>
  );
}
