import { Geist, Geist_Mono, Instrument_Serif, VT323 } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

// The serif is only used for italic accent words inside headings.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

// Only the Terminal skin uses VT323, so it is not preloaded for everyone.
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
  display: "swap",
  preload: false,
});

export const fontVariables = [geist, geistMono, instrumentSerif, vt323]
  .map((font) => font.variable)
  .join(" ");
