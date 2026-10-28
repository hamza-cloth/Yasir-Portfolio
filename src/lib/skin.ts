import { REDUCED_MOTION_QUERY } from "./motion";

export const SKINS = ["paper", "ops", "terminal"] as const;

export type Skin = (typeof SKINS)[number];
export type ColorTheme = "dark" | "light";

export const DEFAULT_SKIN: Skin = "paper";
export const SKIN_STORAGE_KEY = "ya-skin";

export const SKIN_LABELS: Record<Skin, string> = {
  ops: "Dark",
  paper: "Light",
  terminal: "Terminal",
};

export const SKIN_THEMES: Record<Skin, ColorTheme> = {
  ops: "dark",
  paper: "light",
  terminal: "dark",
};

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function isSkin(value: unknown): value is Skin {
  return typeof value === "string" && (SKINS as readonly string[]).includes(value);
}

export function nextSkin(current: Skin): Skin {
  const index = SKINS.indexOf(current);
  return SKINS[(index + 1) % SKINS.length] ?? DEFAULT_SKIN;
}

// Storage access throws in some private-browsing modes, so every call is guarded.
export function readStoredSkin(storage: ReadableStorage | null): Skin {
  try {
    const value = storage?.getItem(SKIN_STORAGE_KEY);
    return isSkin(value) ? value : DEFAULT_SKIN;
  } catch {
    return DEFAULT_SKIN;
  }
}

export function storeSkin(storage: WritableStorage | null, skin: Skin): void {
  try {
    storage?.setItem(SKIN_STORAGE_KEY, skin);
  } catch {
    // The choice still applies for this page view; it just won't persist.
  }
}

export function applySkin(root: HTMLElement, skin: Skin): void {
  root.dataset.skin = skin;
  root.dataset.theme = SKIN_THEMES[skin];
}

export function getDocumentSkin(): Skin {
  const value = document.documentElement.dataset.skin;
  return isSkin(value) ? value : DEFAULT_SKIN;
}

function getLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function setSkin(skin: Skin): void {
  const update = () => applySkin(document.documentElement, skin);
  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

  if (typeof document.startViewTransition === "function" && !prefersReducedMotion) {
    document.documentElement.dataset.transition = "skin";
    const transition = document.startViewTransition(update);
    void transition.finished.finally(() => {
      delete document.documentElement.dataset.transition;
    });
  } else {
    update();
  }

  storeSkin(getLocalStorage(), skin);
}

export function cycleSkin(): Skin {
  const skin = nextSkin(getDocumentSkin());
  setSkin(skin);
  return skin;
}
