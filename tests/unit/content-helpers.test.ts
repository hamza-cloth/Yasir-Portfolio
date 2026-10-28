import { describe, expect, it } from "vitest";

import { SKILLS } from "@/lib/content/skills";
import { groupSkillsByLayer } from "@/lib/osi";
import { statusTone } from "@/lib/project-status";
import { countWords, readingMinutes } from "@/lib/reading-time";

describe("reading time", () => {
  it("counts prose words and ignores code and markdown symbols", () => {
    expect(countWords("## Hello world\n\n```cisco\nshow vlan brief\n```\n- one `two`")).toBe(3);
  });

  it("rounds up and never returns less than a minute", () => {
    expect(readingMinutes("short")).toBe(1);
    expect(readingMinutes(Array.from({ length: 221 }, () => "word").join(" "))).toBe(2);
  });
});

describe("statusTone", () => {
  it("maps status wording to a tag colour", () => {
    expect(statusTone("Working build")).toBe("ok");
    expect(statusTone("In development (MVP)")).toBe("amber");
    expect(statusTone("v2 in progress")).toBe("accent");
  });
});

describe("groupSkillsByLayer", () => {
  it("returns all seven layers from L7 down with their skills", () => {
    const groups = groupSkillsByLayer(SKILLS);
    expect(groups.map((group) => group.layer)).toEqual([7, 6, 5, 4, 3, 2, 1]);
    expect(groups.find((group) => group.layer === 3)?.skills).toContain("OSPF");
    expect(groups.every((group) => group.skills.length > 0)).toBe(true);
  });
});
