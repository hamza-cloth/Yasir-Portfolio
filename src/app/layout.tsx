import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import { InlineScript } from "@/components/layout/InlineScript";
import { ScanlineOverlay } from "@/components/layout/ScanlineOverlay";
import { getLookConfig } from "@/lib/data/settings";
import { fontVariables } from "@/lib/fonts";
import { buildLookScript } from "@/lib/look-script";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yasir Abdullah · Software & Network Engineer",
    template: "%s · Yasir Abdullah",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Yasir Abdullah",
  authors: [{ name: "Yasir Abdullah" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: "#f5f6f8",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-IN"
      data-look="porcelain"
      data-theme="light"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={buildLookScript(await getLookConfig())} />
      </head>
      <body>
        {children}
        <ScanlineOverlay />
      </body>
    </html>
  );
}
