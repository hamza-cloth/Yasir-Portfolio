const WORDS_PER_MINUTE = 220;

export function countWords(markdown: string): number {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/[#>*_|[\]()!-]/g, " ");
  return prose.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.ceil(countWords(markdown) / WORDS_PER_MINUTE));
}
