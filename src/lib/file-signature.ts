export type ImageKind = "jpeg" | "png" | "webp";

// Trust the bytes, not the file name or the browser's MIME type.
export function sniffImage(bytes: Uint8Array): ImageKind | null {
  const at = (index: number) => bytes[index];
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return "jpeg";
  if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) return "png";
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

export function isPdf(bytes: Uint8Array): boolean {
  return String.fromCharCode(...bytes.subarray(0, 5)) === "%PDF-";
}
