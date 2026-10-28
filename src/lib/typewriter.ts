export type TypewriterPhase = "typing" | "holding" | "deleting";

export type TypewriterState = {
  index: number;
  length: number;
  phase: TypewriterPhase;
};

export const TYPEWRITER_DELAYS = {
  type: 55,
  delete: 28,
  hold: 1900,
  gap: 380,
} as const;

export const INITIAL_TYPEWRITER_STATE: TypewriterState = { index: 0, length: 0, phase: "typing" };

export function nextTypewriterState(
  state: TypewriterState,
  words: readonly string[],
): { state: TypewriterState; delay: number } {
  const word = words[state.index] ?? "";

  if (state.phase === "typing") {
    const length = Math.min(state.length + 1, word.length);
    return length === word.length
      ? { state: { ...state, length, phase: "holding" }, delay: TYPEWRITER_DELAYS.hold }
      : { state: { ...state, length }, delay: TYPEWRITER_DELAYS.type };
  }

  if (state.phase === "holding") {
    return { state: { ...state, phase: "deleting" }, delay: TYPEWRITER_DELAYS.delete };
  }

  const length = Math.max(state.length - 1, 0);
  if (length > 0) return { state: { ...state, length }, delay: TYPEWRITER_DELAYS.delete };

  const index = words.length > 0 ? (state.index + 1) % words.length : 0;
  return { state: { index, length: 0, phase: "typing" }, delay: TYPEWRITER_DELAYS.gap };
}
