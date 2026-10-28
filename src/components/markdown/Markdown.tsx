import { cn } from "@/lib/cn";
import { renderMarkdown } from "@/lib/markdown/render";

type MarkdownProps = {
  source: string;
  className?: string;
};

export async function Markdown({ source, className }: MarkdownProps) {
  return <div className={cn("prose-fibre", className)}>{await renderMarkdown(source)}</div>;
}
