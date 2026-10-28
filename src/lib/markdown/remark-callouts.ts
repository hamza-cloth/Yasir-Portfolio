import type { Blockquote, Parent, Root, RootContent } from "mdast";

export const CALLOUT_TYPES = ["note", "tip", "warning"] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

const MARKER = /^\[!(NOTE|TIP|WARNING)\]\s*/i;

function toCallout(node: Blockquote): void {
  const paragraph = node.children[0];
  if (paragraph?.type !== "paragraph") return;
  const text = paragraph.children[0];
  if (text?.type !== "text") return;

  const match = MARKER.exec(text.value);
  if (!match?.[1]) return;

  text.value = text.value.slice(match[0].length);
  node.data = {
    hName: "aside",
    hProperties: { className: ["callout"], dataCallout: match[1].toLowerCase() },
  };
}

function walk(node: Root | RootContent): void {
  if (node.type === "blockquote") toCallout(node);
  if ("children" in node) (node as Parent).children.forEach(walk);
}

// GitHub-style "> [!NOTE]" blockquotes become <aside class="callout" data-callout="note">.
export function remarkCallouts() {
  return (tree: Root) => walk(tree);
}
