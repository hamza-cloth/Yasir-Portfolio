import { describe, expect, it } from "vitest";

import { PROJECTS } from "@/lib/content/projects";
import { filterProjects, parseWorkFilter, workFilterHref } from "@/lib/work-filters";

describe("parseWorkFilter", () => {
  it("accepts known filters, aliases and any letter case", () => {
    expect(parseWorkFilter("web")).toBe("web");
    expect(parseWorkFilter("Products")).toBe("products");
    expect(parseWorkFilter("network")).toBe("networking");
    expect(parseWorkFilter(["web", "products"])).toBe("web");
  });

  it("falls back to all for missing or unknown values", () => {
    expect(parseWorkFilter(undefined)).toBe("all");
    expect(parseWorkFilter("<script>")).toBe("all");
  });
});

describe("filterProjects", () => {
  it("keeps projects in the chosen category", () => {
    expect(filterProjects(PROJECTS, "all")).toHaveLength(3);
    expect(filterProjects(PROJECTS, "products").map((p) => p.slug)).toEqual([
      "earthix-ai-healthcare",
      "hamza-cloth",
    ]);
    expect(filterProjects(PROJECTS, "web").map((p) => p.slug)).toEqual([
      "hamza-cloth",
      "the-peoples-library",
    ]);
    expect(filterProjects(PROJECTS, "networking")).toEqual([]);
  });

  it("builds clean URLs", () => {
    expect(workFilterHref("all")).toBe("/work");
    expect(workFilterHref("networking")).toBe("/work?filter=networking");
  });
});
