import { JetBrains_Mono, Space_Grotesk } from "next/font/google";

// Brand type: Space Grotesk for headings, wordmark and body; JetBrains Mono for labels, tags
// and code. Self-hosted by next/font, so there is no request to Google and no layout shift.
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariables = [grotesk, jetbrainsMono].map((font) => font.variable).join(" ");
