import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import { InlineScript } from "@/components/layout/InlineScript";
import { ScanlineOverlay } from "@/components/layout/ScanlineOverlay";
import { fontVariables } from "@/lib/fonts";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import { skinScript } from "@/lib/skin-script";

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
  themeColor: "#07080b",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-IN"
      data-skin="ops"
      data-theme="dark"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={skinScript} />
      </head>
      <body>
        {children}
        <ScanlineOverlay />
      </body>
    </html>
  );
}
