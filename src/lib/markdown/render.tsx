import "server-only";

import type { ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import type { Root } from "hast";
import { toJsxRuntime, type Components } from "hast-util-to-jsx-runtime";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { ShikiTransformer } from "shiki";
import { unified } from "unified";

import { Callout } from "@/components/markdown/Callout";
import { CodeBlock } from "@/components/markdown/CodeBlock";
import { MarkdownLink } from "@/components/markdown/MarkdownLink";
import { TableScroll } from "@/components/markdown/TableScroll";
import { CODE_THEME_NAME, getHighlighter } from "@/lib/code/highlighter";

import { remarkCallouts } from "./remark-callouts";

const COMPONENTS: Partial<Components> = {
  a: MarkdownLink,
  table: TableScroll,
  pre: CodeBlock,
  aside: Callout,
};

// Keeps the original source and language on <pre>, for the copy button and the label.
const keepSource: ShikiTransformer = {
  name: "keep-source",
  pre(node) {
    node.properties["data-source"] = this.source;
    node.properties["data-lang"] = this.options.lang;
  },
};

const SHIKI_OPTIONS = {
  theme: CODE_THEME_NAME,
  defaultLanguage: "text",
  fallbackLanguage: "text",
  transformers: [keepSource],
};

function toReact(tree: Root): ReactNode {
  return toJsxRuntime(tree, { Fragment, jsx, jsxs, components: COMPONENTS });
}

// Raw HTML in the source is dropped (remark-rehype's default), so admin-written text cannot inject markup.
export async function renderMarkdown(source: string): Promise<ReactNode> {
  const highlighter = await getHighlighter();
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCallouts)
    .use(remarkRehype)
    .use(rehypeShikiFromHighlighter, highlighter, SHIKI_OPTIONS);
  return toReact(await processor.run(processor.parse(source)));
}

export async function renderCode(code: string, lang: string): Promise<ReactNode> {
  const highlighter = await getHighlighter();
  const known = highlighter.getLoadedLanguages().includes(lang) ? lang : "text";
  const tree = highlighter.codeToHast(code, {
    lang: known,
    theme: CODE_THEME_NAME,
    transformers: [keepSource],
  });
  return toReact(tree);
}
