import { cacheLife } from "next/cache";

import { cn } from "@/lib/cn";
import { renderMarkdown } from "@/lib/markdown/render";

type MarkdownProps = {
  source: string;
  className?: string;
};

// Cached: Shiki reads the clock while highlighting, which a prerender may not do uncached.
export async function Markdown({ source, className }: MarkdownProps) {
  "use cache";
  cacheLife("max");

  return <div className={cn("prose-fibre", className)}>{await renderMarkdown(source)}</div>;
}
