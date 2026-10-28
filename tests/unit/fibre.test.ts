import { describe, expect, it } from "vitest";

import { createFibreLines, fibreY, transparentVersion } from "@/lib/canvas/fibre";

describe("createFibreLines", () => {
  it("creates the requested number of lines, identical for the same seed", () => {
    const first = createFibreLines(9, 3);
    expect(first).toHaveLength(9);
    expect(createFibreLines(9, 3)).toEqual(first);
    expect(createFibreLines(9, 4)).not.toEqual(first);
  });

  it("keeps every line inside the canvas height", () => {
    for (const line of createFibreLines(9)) {
      expect(line.baseY - line.amplitude).toBeGreaterThan(0);
      expect(line.baseY + line.amplitude).toBeLessThan(1);
    }
  });
});

describe("fibreY", () => {
  const [line] = createFibreLines(1);

  it("bends toward a nearby pointer and ignores a distant one", () => {
    if (!line) throw new Error("expected a line");
    const resting = fibreY(line, 400, 800, 600, 0, null);
    const pulled = fibreY(line, 400, 800, 600, 0, { x: 400, y: 0 });
    const far = fibreY(line, 400, 800, 600, 0, { x: 4000, y: 0 });

    expect(pulled).toBeLessThan(resting);
    expect(far).toBeCloseTo(resting, 3);
  });
});

describe("transparentVersion", () => {
  it("keeps the hue of a hex colour at zero alpha", () => {
    expect(transparentVersion("#0091a6")).toBe("rgba(0, 145, 166, 0)");
    expect(transparentVersion("#FFB020")).toBe("rgba(255, 176, 32, 0)");
  });

  it("falls back to transparent for other formats", () => {
    expect(transparentVersion("rgb(1, 2, 3)")).toBe("transparent");
  });
});
