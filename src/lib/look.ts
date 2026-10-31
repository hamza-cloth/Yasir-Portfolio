import { REDUCED_MOTION_QUERY } from "./motion";

// The complete design looks. Each is a set of CSS variables on <html data-look="…">; layout and
// content never change between them. Midnight Ink is the brand and comes first.
export const LOOKS = [
  "midnight-ink",
  "porcelain",
  "midnight-ops",
  "sunset-fibre",
  "aurora",
] as const;

export type Look = (typeof LOOKS)[number];
export type ColorTheme = "dark" | "light";
export type LookMode = "random" | "sequential" | "fixed";

export const DEFAULT_LOOK: Look = "midnight-ink";

export const LOOK_LABELS: Record<Look, string> = {
  "midnight-ink": "Midnight Ink",
  porcelain: "Porcelain",
  "midnight-ops": "Midnight Ops",
  "sunset-fibre": "Sunset Fibre",
  aurora: "Aurora",
};

export const LOOK_THEMES: Record<Look, ColorTheme> = {
  "midnight-ink": "dark",
  porcelain: "light",
  "midnight-ops": "dark",
  "sunset-fibre": "light",
  aurora: "dark",
};

// Swatches for the admin preview and the look picker: background, surface, accent.
export const LOOK_SWATCHES: Record<Look, [string, string, string]> = {
  "midnight-ink": ["#0b0d12", "#12151c", "#c9a45c"],
  porcelain: ["#f5f6f8", "#ffffff", "#2b59ff"],
  "midnight-ops": ["#0a0f1e", "#111a30", "#22d3ee"],
  "sunset-fibre": ["#fbf5ec", "#fffdf9", "#f97316"],
  aurora: ["#0d0b26", "#171442", "#a78bfa"],
};

export type LookConfig = {
  enabled: Look[];
  mode: LookMode;
  fixed: Look;
};

// Every refresh shows a new look (never the last one); visitors can still switch with the picker.
export const DEFAULT_LOOK_CONFIG: LookConfig = {
  enabled: [...LOOKS],
  mode: "random",
  fixed: DEFAULT_LOOK,
};

// localStorage remembers the last look shown, so the next refresh never repeats it;
// sessionStorage the one in use.
export const LAST_LOOK_KEY = "ya-look-last";
export const CURRENT_LOOK_KEY = "ya-look";
// The look a visitor picked: written to localStorage so other open tabs follow it. It lasts until
// the next refresh, which picks a new look.
export const CHOICE_KEY = "ya-theme";

// Looks that were removed, mapped to the closest one still offered, so a value already stored in
// a browser or the database keeps resolving.
export const RETIRED_LOOKS: Readonly<Record<string, Look>> = { terminal: "midnight-ops" };

export function isLook(value: unknown): value is Look {
  return typeof value === "string" && (LOOKS as readonly string[]).includes(value);
}

export function isLookMode(value: unknown): value is LookMode {
  return value === "random" || value === "sequential" || value === "fixed";
}

// Cleans an untrusted config (from the database) into one that always has a usable look.
export function normaliseLookConfig(config: Partial<LookConfig> | null | undefined): LookConfig {
  const enabled = (config?.enabled ?? []).filter(isLook);
  const retired = typeof config?.fixed === "string" ? RETIRED_LOOKS[config.fixed] : undefined;
  const fixed = isLook(config?.fixed) ? config.fixed : (retired ?? DEFAULT_LOOK);
  return {
    enabled: enabled.length > 0 ? [...new Set(enabled)] : [DEFAULT_LOOK],
    mode: isLookMode(config?.mode) ? config.mode : "random",
    fixed,
  };
}

// The rule the pre-paint script applies: fixed → that look; sequential → the next enabled one
// after the last; random → any enabled look except the last one shown.
export function pickLook(config: LookConfig, last: string | null, random: number): Look {
  const { enabled, mode, fixed } = config;
  if (mode === "fixed") return fixed;
  if (enabled.length === 1) return enabled[0] ?? DEFAULT_LOOK;

  const lastIndex = enabled.indexOf(last as Look);
  if (mode === "sequential") return enabled[(lastIndex + 1) % enabled.length] ?? DEFAULT_LOOK;

  const choices = enabled.filter((look) => look !== last);
  return choices[Math.floor(random * choices.length) % choices.length] ?? DEFAULT_LOOK;
}

export function nextLook(current: Look, enabled: readonly Look[]): Look {
  const list = enabled.length > 0 ? enabled : LOOKS;
  const index = list.indexOf(current);
  return list[(index + 1) % list.length] ?? DEFAULT_LOOK;
}

export function applyLook(root: HTMLElement, look: Look): void {
  root.dataset.look = look;
  root.dataset.theme = LOOK_THEMES[look];
}

export function getDocumentLook(): Look {
  const value = document.documentElement.dataset.look;
  return isLook(value) ? value : DEFAULT_LOOK;
}

// The looks the pre-paint script was configured with, so client controls cycle the same list.
export function getEnabledLooks(): Look[] {
  const list = (document.documentElement.dataset.looks ?? "").split(",").filter(isLook);
  return list.length > 0 ? list : [...LOOKS];
}

// A picked look also counts as the last one shown, so the next refresh moves on from it.
function remember(look: Look): void {
  try {
    window.sessionStorage.setItem(CURRENT_LOOK_KEY, look);
    window.localStorage.setItem(CHOICE_KEY, look);
    window.localStorage.setItem(LAST_LOOK_KEY, look);
  } catch {
    // Storage can be blocked; the look still applies to this page.
  }
}

// Another tab picked a look: follow it here too, without the transition.
export function followLookFromOtherTabs(): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CHOICE_KEY && isLook(event.newValue)) {
      applyLook(document.documentElement, event.newValue);
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export function setLook(look: Look): void {
  const root = document.documentElement;
  const update = () => applyLook(root, look);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

  if (typeof document.startViewTransition === "function" && !reducedMotion) {
    root.dataset.transition = "look";
    const transition = document.startViewTransition(update);
    void transition.finished.finally(() => {
      delete root.dataset.transition;
    });
  } else if (!reducedMotion) {
    // No View Transitions: a short fade instead.
    root.dataset.transition = "look-fade";
    update();
    window.setTimeout(() => delete root.dataset.transition, 300);
  } else {
    update();
  }

  remember(look);
}

export function cycleLook(): Look {
  const look = nextLook(getDocumentLook(), getEnabledLooks());
  setLook(look);
  return look;
}
