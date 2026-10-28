import type { ComponentProps } from "react";

import { CodeCopyButton } from "./CodeCopyButton";

const LANGUAGE_LABELS: Record<string, string> = {
  cisco: "Cisco IOS",
  bat: "Windows cmd",
  bash: "Shell",
  text: "Text",
};

type CodeBlockProps = ComponentProps<"pre"> & {
  "data-source"?: string;
  "data-lang"?: string;
};

// Code scrolls sideways inside its own block; it never widens the page.
export function CodeBlock({
  "data-source": source = "",
  "data-lang": lang = "text",
  children,
  className,
  ...props
}: CodeBlockProps) {
  return (
    <figure className="code-block">
      <figcaption className="code-block-bar">
        <span className="label-mono text-muted">{LANGUAGE_LABELS[lang] ?? lang}</span>
        <CodeCopyButton value={source.replace(/\n$/, "")} />
      </figcaption>
      <pre className={className} {...props} tabIndex={0}>
        {children}
      </pre>
    </figure>
  );
}
