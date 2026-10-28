// Mirrors --easing-entrance and --easing-wipe in tokens.css for Motion, which needs arrays.
export const EASE_ENTRANCE = [0.2, 0.8, 0.2, 1] as const;
export const EASE_WIPE = [0.76, 0, 0.24, 1] as const;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
