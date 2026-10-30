import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { SKILLS } from "@/lib/content/skills";
import { EBOOKS, findChapter } from "@/lib/ebooks/catalog";
import type { Diagram } from "@/lib/ebooks/types";

const chapters = EBOOKS.flatMap((book) => book.chapters.map((chapter) => ({ book, chapter })));

// Every id a diagram refers to must exist, or a link or packet silently disappears.
function danglingIds(diagram: Diagram): string[] {
  if (diagram.type === "topology") {
    const ids = new Set(diagram.nodes.map((node) => node.id));
    const used = [
      ...diagram.links.flatMap((link) => [link.from, link.to]),
      ...(diagram.flows ?? []).flatMap((flow) => flow.path),
    ];
    return used.filter((id) => !ids.has(id));
  }
  if (diagram.type === "sequence") {
    const ids = new Set(diagram.actors.map((actor) => actor.id));
    return diagram.messages
      .flatMap((message) => [message.from, message.to])
      .filter((id) => !ids.has(id));
  }
  return [];
}

describe("ebooks", () => {
  it("has one book per OSI layer, in order", () => {
    expect(EBOOKS.map((book) => book.layer)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("gives every listed skill exactly one chapter, in its own layer's book", () => {
    for (const skill of SKILLS) {
      const matches = chapters.filter(({ chapter }) => chapter.skill === skill.name);
      expect(matches, skill.name).toHaveLength(1);
      expect(matches[0]?.book.layer, skill.name).toBe(skill.layer);
    }
    expect(chapters).toHaveLength(SKILLS.length);
  });

  it("has a markdown file for every chapter", () => {
    for (const { book, chapter } of chapters) {
      const file = path.join(process.cwd(), "content", "ebooks", book.slug, `${chapter.slug}.md`);
      expect(existsSync(file), file).toBe(true);
    }
  });

  it("uses unique slugs and only ids that exist in each diagram", () => {
    expect(new Set(EBOOKS.map((book) => book.slug)).size).toBe(EBOOKS.length);
    for (const { book, chapter } of chapters) {
      expect(findChapter(book.slug, chapter.slug)?.chapter).toBe(chapter);
      expect(danglingIds(chapter.diagram), chapter.slug).toEqual([]);
    }
    for (const book of EBOOKS) {
      expect(new Set(book.chapters.map((chapter) => chapter.slug)).size).toBe(book.chapters.length);
    }
  });

  it("keeps topology nodes on the floor", () => {
    for (const { chapter } of chapters) {
      if (chapter.diagram.type !== "topology") continue;
      for (const node of chapter.diagram.nodes) {
        expect(node.x, `${chapter.slug}/${node.id}`).toBeGreaterThanOrEqual(0);
        expect(node.x, `${chapter.slug}/${node.id}`).toBeLessThanOrEqual(100);
        expect(node.y, `${chapter.slug}/${node.id}`).toBeGreaterThanOrEqual(0);
        expect(node.y, `${chapter.slug}/${node.id}`).toBeLessThanOrEqual(60);
      }
    }
  });
});
