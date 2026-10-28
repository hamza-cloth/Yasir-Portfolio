import "server-only";

import { createCssVariablesTheme, createHighlighter, type Highlighter } from "shiki";

import { CISCO_GRAMMAR } from "./cisco-grammar";

// Token colours come from --shiki-* variables in tokens.css, so code follows the active skin.
export const CODE_THEME = createCssVariablesTheme({
  name: "fibre",
  variablePrefix: "--shiki-",
  variableDefaults: {},
  fontStyle: true,
});

const LANGUAGES = ["bash", "bat", "json", "typescript", "tsx", CISCO_GRAMMAR];

let highlighter: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: [CODE_THEME], langs: LANGUAGES });
  return highlighter;
}
