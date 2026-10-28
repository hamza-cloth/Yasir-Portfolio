const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&<>/";

export type DecodeCell = {
  char: string;
  settled: boolean;
};

type DecodeOptions = {
  // Position of this text's first character within everything being decoded together.
  offset?: number;
  total?: number;
};

// At progress 0 every letter is random; letters then lock in left to right until progress 1.
export function decodeFrame(
  text: string,
  progress: number,
  random: () => number,
  { offset = 0, total = text.length }: DecodeOptions = {},
): DecodeCell[] {
  return [...text].map((char, index) => {
    if (char.trim() === "") return { char, settled: true };
    const settleAt = 0.2 + 0.8 * ((offset + index + 1) / Math.max(total, 1));
    if (progress >= settleAt) return { char, settled: true };
    return { char: GLYPHS[Math.floor(random() * GLYPHS.length)] ?? char, settled: false };
  });
}
