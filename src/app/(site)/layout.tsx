import type { ReactNode } from "react";

import { WhatsAppFloat } from "@/components/hire/WhatsAppFloat";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { BackToTop } from "@/components/layout/BackToTop";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MaintenancePage } from "@/components/layout/MaintenancePage";
import { PageCurtain } from "@/components/layout/PageCurtain";
import { PageViewTracker } from "@/components/layout/PageViewTracker";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SkipLink } from "@/components/layout/SkipLink";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { OverlayHost } from "@/components/overlay/OverlayHost";
import { RevealController } from "@/components/ui/RevealController";
import { SpotlightController } from "@/components/ui/SpotlightController";
import { getProjectSummaries } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { getSiteConfig } from "@/lib/data/site-config";
import { getSkills } from "@/lib/data/skills";
import { buildTerminalContext } from "@/lib/terminal/context";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, projects, skills, announcement, maintenance, appearance] = await Promise.all([
    getSiteSettings(),
    getProjectSummaries(),
    getSkills(),
    getSiteConfig("announcement"),
    getSiteConfig("maintenance"),
    getSiteConfig("appearance"),
  ]);

  // Maintenance mode (admin → Appearance) replaces every public page; /admin is not affected.
  if (maintenance.enabled) {
    return (
      <MaintenancePage name={settings.name} message={maintenance.message} email={settings.email} />
    );
  }

  return (
    <>
      <SkipLink />
      <ScrollProgress />
      <Header announcement={<AnnouncementBar announcement={announcement} />} />
      {/* Clip, not hidden: sections waiting to reveal lean in 3D and project wider than the
          screen, which WebKit counts as page width; clip keeps the sticky project cards working. */}
      <main id="main" tabIndex={-1} className="overflow-x-clip">
        {children}
      </main>
      <Footer settings={settings} />
      <BackToTop />
      <WhatsAppFloat />
      <PageCurtain />
      {/* "Calm" motion (admin → Appearance) drops the decorative cursor and smooth scrolling. */}
      {appearance.motion === "full" ? (
        <>
          <CustomCursor />
          <SmoothScroll />
        </>
      ) : null}
      <RevealController />
      <SpotlightController />
      <PageViewTracker />
      <OverlayHost
        email={settings.email}
        terminalContext={buildTerminalContext(settings, projects, skills)}
      />
    </>
  );
}
