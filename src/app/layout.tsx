import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import { InlineScript } from "@/components/layout/InlineScript";
import { getLookConfig } from "@/lib/data/settings";
import { fontVariables } from "@/lib/fonts";
import { buildLookScript } from "@/lib/look-script";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: "Yasir Abdullah",
  authors: [{ name: "Yasir Abdullah" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    siteName: "Yasir Abdullah",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: "#0b0d12",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-IN"
      data-look="midnight-ink"
      data-theme="dark"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={buildLookScript(await getLookConfig())} />
      </head>
      <body>{children}</body>
    </html>
  );
}
