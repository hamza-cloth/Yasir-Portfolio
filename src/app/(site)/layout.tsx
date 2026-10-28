import type { ReactNode } from "react";

import { BackToTop } from "@/components/layout/BackToTop";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageCurtain } from "@/components/layout/PageCurtain";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SkipLink } from "@/components/layout/SkipLink";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { getSiteSettings } from "@/lib/data/settings";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <SkipLink />
      <ScrollProgress />
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer settings={settings} />
      <BackToTop />
      <PageCurtain />
      <CustomCursor />
      <SmoothScroll />
    </>
  );
}
