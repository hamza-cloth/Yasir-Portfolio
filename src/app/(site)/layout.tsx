import type { ReactNode } from "react";

import { BackToTop } from "@/components/layout/BackToTop";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageCurtain } from "@/components/layout/PageCurtain";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SkipLink } from "@/components/layout/SkipLink";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { OverlayHost } from "@/components/overlay/OverlayHost";
import { getProjectSummaries } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { getSkills } from "@/lib/data/skills";
import { buildTerminalContext } from "@/lib/terminal/context";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, projects, skills] = await Promise.all([
    getSiteSettings(),
    getProjectSummaries(),
    getSkills(),
  ]);

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
      <OverlayHost
        email={settings.email}
        terminalContext={buildTerminalContext(settings, projects, skills)}
      />
    </>
  );
}
