import { runInNewContext } from "node:vm";

import { describe, expect, it } from "vitest";

import {
  DEFAULT_SKIN,
  isSkin,
  nextSkin,
  readStoredSkin,
  SKIN_STORAGE_KEY,
  storeSkin,
} from "@/lib/skin";
import { skinScript } from "@/lib/skin-script";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
}

const throwingStorage = {
  getItem: (): string | null => {
    throw new Error("blocked");
  },
  setItem: (): void => {
    throw new Error("blocked");
  },
};

function runSkinScript(stored: string | null | Error) {
  const root = { dataset: {} as Record<string, string> };
  runInNewContext(skinScript, {
    document: { documentElement: root },
    localStorage: {
      getItem: () => {
        if (stored instanceof Error) throw stored;
        return stored;
      },
    },
  });
  return root.dataset;
}

describe("skin state", () => {
  it("cycles Paper → Ops → Terminal → Paper", () => {
    expect(nextSkin("paper")).toBe("ops");
    expect(nextSkin("ops")).toBe("terminal");
    expect(nextSkin("terminal")).toBe("paper");
  });

  it("recognises only known skins", () => {
    expect(isSkin("paper")).toBe(true);
    expect(isSkin("Paper")).toBe(false);
    expect(isSkin(null)).toBe(false);
  });

  it("reads a stored skin and falls back for unknown or blocked storage", () => {
    expect(readStoredSkin(memoryStorage({ [SKIN_STORAGE_KEY]: "terminal" }))).toBe("terminal");
    expect(readStoredSkin(memoryStorage({ [SKIN_STORAGE_KEY]: "neon" }))).toBe(DEFAULT_SKIN);
    expect(readStoredSkin(throwingStorage)).toBe(DEFAULT_SKIN);
    expect(readStoredSkin(null)).toBe(DEFAULT_SKIN);
  });

  it("stores the skin and ignores storage errors", () => {
    const storage = memoryStorage();
    storeSkin(storage, "paper");
    expect(storage.getItem(SKIN_STORAGE_KEY)).toBe("paper");
    expect(() => storeSkin(throwingStorage, "paper")).not.toThrow();
  });
});

describe("pre-paint skin script", () => {
  it("applies the stored skin and its colour theme", () => {
    expect(runSkinScript("ops")).toEqual({ skin: "ops", theme: "dark", js: "true" });
    expect(runSkinScript("terminal")).toEqual({ skin: "terminal", theme: "dark", js: "true" });
  });

  it("falls back to Paper for missing, unknown or blocked storage", () => {
    expect(runSkinScript(null)).toEqual({ skin: "paper", theme: "light", js: "true" });
    expect(runSkinScript("__proto__")).toEqual({ skin: "paper", theme: "light", js: "true" });
    expect(runSkinScript(new Error("blocked"))).toEqual({
      skin: "paper",
      theme: "light",
      js: "true",
    });
  });
});
