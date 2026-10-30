import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { LOOKS } from "@/lib/look";

const css = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");

// The body of the rule whose selector list ends with [data-look="<look>"].
function lookBlock(look: string): string {
  const start = css.indexOf(`[data-look="${look}"] {`);
  expect(start, `no token block for ${look}`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("\n}", start));
}

// Colours each look must supply for the shared recipes (fills, wash, globe arcs).
const COLOURS = [
  "--c1",
  "--c2",
  "--c2-text",
  "--glow-2",
  "--fill-1",
  "--fill-2",
  "--on-fill",
  "--wash-1",
  "--wash-2",
];
// Shape and surface recipes that live once, in the shared block, so every look matches.
const SHARED = [
  "--r-panel",
  "--r-tile",
  "--r-card",
  "--r-button",
  "--accent-fill",
  "--feature-bg",
  "--card-sheen",
  "--page-wash",
  "--line-hover",
];

describe("look tokens", () => {
  it.each(LOOKS)("%s supplies every colour the shared design needs", (look) => {
    const block = lookBlock(look);
    for (const name of COLOURS) expect(block, `${look} is missing ${name}`).toContain(`${name}:`);
  });

  it.each(LOOKS)("%s does not override the shared shape or surfaces", (look) => {
    const block = lookBlock(look);
    for (const name of SHARED) expect(block, `${look} overrides ${name}`).not.toContain(`${name}:`);
  });

  it("defines the shared recipes once, for every look", () => {
    const start = css.indexOf(":root,\n[data-look] {");
    expect(start).toBeGreaterThan(-1);
    const block = css.slice(start, css.indexOf("\n}", start));
    for (const name of SHARED) expect(block).toContain(`${name}:`);
  });
});
