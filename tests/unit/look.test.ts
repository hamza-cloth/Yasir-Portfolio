import { runInNewContext } from "node:vm";

import { describe, expect, it } from "vitest";

import {
  CURRENT_LOOK_KEY,
  DEFAULT_LOOK,
  LAST_LOOK_KEY,
  LOOKS,
  nextLook,
  normaliseLookConfig,
  pickLook,
  type LookConfig,
} from "@/lib/look";
import { buildLookScript } from "@/lib/look-script";

const ALL: LookConfig = { enabled: [...LOOKS], mode: "random", fixed: "porcelain" };

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
}

const blocked = {
  getItem: (): string | null => {
    throw new Error("blocked");
  },
  setItem: (): void => {
    throw new Error("blocked");
  },
};

type Run = {
  config?: Partial<LookConfig>;
  path?: string;
  local?: ReturnType<typeof memoryStorage> | typeof blocked;
  session?: ReturnType<typeof memoryStorage> | typeof blocked;
  random?: number;
};

function runScript({ config = ALL, path = "/", local, session, random = 0.5 }: Run = {}) {
  const root = { dataset: {} as Record<string, string> };
  runInNewContext(buildLookScript(config), {
    document: { documentElement: root },
    location: { pathname: path },
    localStorage: local ?? memoryStorage(),
    sessionStorage: session ?? memoryStorage(),
    Math: { floor: Math.floor, random: () => random },
  });
  return root.dataset;
}

describe("pickLook", () => {
  it("never repeats the last look in random mode", () => {
    for (const last of LOOKS) {
      for (const random of [0, 0.2, 0.5, 0.8, 0.999]) {
        expect(pickLook(ALL, last, random)).not.toBe(last);
      }
    }
  });

  it("walks the enabled list in sequential mode", () => {
    const config: LookConfig = { ...ALL, mode: "sequential", enabled: ["porcelain", "aurora"] };
    expect(pickLook(config, null, 0)).toBe("porcelain");
    expect(pickLook(config, "porcelain", 0)).toBe("aurora");
    expect(pickLook(config, "aurora", 0)).toBe("porcelain");
  });

  it("always returns the fixed look in fixed mode", () => {
    expect(pickLook({ ...ALL, mode: "fixed", fixed: "terminal" }, "terminal", 0.3)).toBe(
      "terminal",
    );
  });

  it("cycles through the enabled looks for the change-look button", () => {
    expect(nextLook("aurora", ["porcelain", "aurora"])).toBe("porcelain");
  });

  it("cleans untrusted config", () => {
    expect(normaliseLookConfig({ enabled: ["neon" as never], mode: "wild" as never })).toEqual({
      enabled: [DEFAULT_LOOK],
      mode: "random",
      fixed: DEFAULT_LOOK,
    });
  });
});

describe("pre-paint look script", () => {
  it("sets a look, its colour theme and the enabled list", () => {
    const data = runScript();
    expect(LOOKS).toContain(data.look);
    expect(data.theme).toMatch(/^(light|dark)$/);
    expect(data.looks).toBe(LOOKS.join(","));
    expect(data.js).toBe("true");
  });

  it("never shows the same look twice in a row across 10 home-page loads", () => {
    const local = memoryStorage();
    const seen: string[] = [];
    for (let load = 0; load < 10; load += 1) {
      seen.push(runScript({ local, random: (load * 0.37) % 1 }).look ?? "");
    }
    for (let index = 1; index < seen.length; index += 1) {
      expect(seen[index]).not.toBe(seen[index - 1]);
    }
    expect(local.values.get(LAST_LOOK_KEY)).toBe(seen.at(-1));
  });

  it("keeps the visit's look on inner pages", () => {
    const session = memoryStorage({ [CURRENT_LOOK_KEY]: "aurora" });
    expect(runScript({ path: "/work", session }).look).toBe("aurora");
  });

  it("keeps the admin on the default look and leaves the visitor's history alone", () => {
    const local = memoryStorage({ [LAST_LOOK_KEY]: "aurora" });
    expect(runScript({ path: "/admin/messages", local }).look).toBe(DEFAULT_LOOK);
    expect(local.values.get(LAST_LOOK_KEY)).toBe("aurora");
  });

  it("falls back to the default look when storage is blocked and only one look is on", () => {
    const data = runScript({
      local: blocked,
      session: blocked,
      config: { enabled: ["porcelain"] },
    });
    expect(data.look).toBe("porcelain");
  });

  it("still picks a valid look when storage is blocked", () => {
    expect(LOOKS).toContain(runScript({ local: blocked, session: blocked }).look);
  });
});
