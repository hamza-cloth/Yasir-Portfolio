import { describe, expect, it } from "vitest";

import { isActivePath, routeLabel } from "@/lib/site-nav";

describe("isActivePath", () => {
  it("matches a section and its children", () => {
    expect(isActivePath("/work", "/work")).toBe(true);
    expect(isActivePath("/work/hamza-cloth", "/work")).toBe(true);
  });

  it("does not match a different section that shares a prefix", () => {
    expect(isActivePath("/workshop", "/work")).toBe(false);
  });

  it("matches home only on the root path", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/about", "/")).toBe(false);
  });
});

describe("routeLabel", () => {
  it("uses page names for known pages", () => {
    expect(routeLabel("/")).toBe("Home");
    expect(routeLabel("/experience")).toBe("Experience");
    expect(routeLabel("/contact")).toBe("Contact");
  });

  it("labels nested pages by their section", () => {
    expect(routeLabel("/work/earthix-ai-healthcare")).toBe("Case study");
    expect(routeLabel("/notes/subnetting-without-the-headache")).toBe("Note");
    expect(routeLabel("/somewhere/else")).toBe("Loading");
  });
});
