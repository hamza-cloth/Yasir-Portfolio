import { runInNewContext } from "node:vm";

import { describe, expect, it } from "vitest";

import {
  CHOICE_KEY,
  CURRENT_LOOK_KEY,
  DEFAULT_LOOK,
  DEFAULT_LOOK_CONFIG,
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
  cookie?: string;
};

function runScript({
  config = ALL,
  path = "/",
  local,
  session,
  random = 0.5,
  cookie = "",
}: Run = {}) {
  const root = { dataset: {} as Record<string, string> };
  runInNewContext(buildLookScript(config), {
    document: { documentElement: root, cookie },
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
    expect(pickLook({ ...ALL, mode: "fixed", fixed: "aurora" }, "aurora", 0.3)).toBe("aurora");
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

  it("drops the removed Terminal look and maps a fixed Terminal to Midnight Ops", () => {
    expect(
      normaliseLookConfig({ enabled: ["terminal" as never, "aurora"], fixed: "terminal" as never }),
    ).toEqual({ enabled: ["aurora"], mode: "random", fixed: "midnight-ops" });
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

  it("shows a new look on every refresh of an inner page too", () => {
    const local = memoryStorage();
    const session = memoryStorage({ [CURRENT_LOOK_KEY]: "aurora" });
    const seen: string[] = [];
    for (let load = 0; load < 10; load += 1) {
      seen.push(runScript({ path: "/work", local, session, random: (load * 0.61) % 1 }).look ?? "");
    }
    for (let index = 1; index < seen.length; index += 1) {
      expect(seen[index]).not.toBe(seen[index - 1]);
    }
    expect(local.values.get(LAST_LOOK_KEY)).toBe(seen.at(-1));
  });

  it("defaults to random, so a refresh changes the look with no admin setup", () => {
    expect(DEFAULT_LOOK_CONFIG.mode).toBe("random");
    const local = memoryStorage({ [LAST_LOOK_KEY]: "midnight-ink" });
    expect(runScript({ config: DEFAULT_LOOK_CONFIG, local }).look).not.toBe("midnight-ink");
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

  it("reads a stored Terminal look as Midnight Ops, so the refresh moves on from it", () => {
    for (const random of [0, 0.3, 0.6, 0.999]) {
      const local = memoryStorage({ [LAST_LOOK_KEY]: "terminal" });
      const look = runScript({ path: "/work", local, random }).look;
      expect(LOOKS).toContain(look);
      expect(look).not.toBe("midnight-ops");
    }
  });

  it("never shows Terminal on the home page, whatever is stored", () => {
    for (const random of [0, 0.3, 0.6, 0.999]) {
      const local = memoryStorage({ [LAST_LOOK_KEY]: "terminal" });
      expect(LOOKS).toContain(runScript({ local, random }).look);
    }
  });

  it("still picks a valid look when storage is blocked", () => {
    expect(LOOKS).toContain(runScript({ local: blocked, session: blocked }).look);
  });
});

describe("a visitor's own pick", () => {
  const fixedInk: LookConfig = { enabled: [...LOOKS], mode: "fixed", fixed: "midnight-ink" };

  it("lasts until the refresh, which moves on to a new look", () => {
    // setLook() stores the pick as the choice and as the last look shown.
    const local = memoryStorage({ [CHOICE_KEY]: "porcelain", [LAST_LOOK_KEY]: "porcelain" });
    for (const random of [0, 0.4, 0.999]) {
      expect(runScript({ local, random }).look).not.toBe("porcelain");
    }
  });

  it("no longer comes back from storage or the cookie on a refresh", () => {
    const local = memoryStorage({ [CHOICE_KEY]: "aurora" });
    expect(runScript({ config: fixedInk, path: "/work", local }).look).toBe("midnight-ink");
    const data = runScript({
      config: fixedInk,
      local: blocked,
      session: blocked,
      cookie: `x=1; ${CHOICE_KEY}=sunset-fibre`,
    });
    expect(data.look).toBe("midnight-ink");
  });

  it("never touches the admin", () => {
    const picked = memoryStorage({ [CHOICE_KEY]: "porcelain" });
    expect(runScript({ path: "/admin", local: picked }).look).toBe(DEFAULT_LOOK);
  });
});
