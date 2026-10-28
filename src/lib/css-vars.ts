import type { CSSProperties } from "react";

type CssVariables = Record<`--${string}`, string | number>;

// React's CSSProperties type has no slot for custom properties; this keeps the cast in one place.
export function cssVars(variables: CssVariables): CSSProperties {
  return variables as CSSProperties;
}

export function readCssVar(
  name: `--${string}`,
  element: Element = document.documentElement,
): string {
  return getComputedStyle(element).getPropertyValue(name).trim();
}
