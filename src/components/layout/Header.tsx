"use client";

import { useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { INLINE_NAV_QUERY } from "@/lib/site-nav";

import { CommandButton } from "./CommandButton";
import { Logo } from "./Logo";
import { LookButton } from "./LookButton";
import { MenuButton } from "./MenuButton";
import { MobileMenu } from "./MobileMenu";
import { NavPills } from "./NavPills";

const MOBILE_MENU_ID = "mobile-menu";

// announcement: the admin's announcement bar, rendered on the server and shown above the nav.
export function Header({ announcement }: { announcement?: ReactNode }) {
  const pathname = usePathname();
  const { hidden, scrolled } = useHideOnScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // Widening the window to the inline-nav breakpoint closes the menu (and releases its scroll
  // lock); adjusted during render, as derived state.
  const inlineNav = useMediaQuery(INLINE_NAV_QUERY);
  if (inlineNav && menuOpen) setMenuOpen(false);

  return (
    <>
      <header
        ref={headerRef}
        data-hidden={hidden && !menuOpen}
        data-scrolled={scrolled}
        data-menu-open={menuOpen}
        // Open, the header sits above the menu (a utility, so it beats z-(--z-header)), keeping
        // the close button in view.
        className={cn(
          "site-header fixed inset-x-0 top-0 pt-[env(safe-area-inset-top)]",
          menuOpen ? "z-[calc(var(--z-overlay)+1)]" : "z-(--z-header)",
        )}
      >
        {announcement}
        <Container className="flex h-[calc(var(--header-h)-var(--announce-h))] items-center">
          <div className="flex h-16 w-full items-center gap-3">
            {/* Full logo where there is room: from 640px, except beside the inline nav until 1320px. */}
            <Logo wordmarkClassName="max-[40rem]:hidden laptop:max-xl:hidden" />
            <NavPills pathname={pathname} className="mx-auto hidden laptop:block" />
            <div className="ml-auto flex min-w-0 items-center gap-1.5 laptop:ml-0">
              <CommandButton className="max-sm:hidden" />
              <LookButton />
              <Button href="/hire" variant="accent" size="sm" className="max-laptop:hidden">
                Hire me
                <Icon name="arrow-up-right" size={15} />
              </Button>
              <MenuButton
                ref={menuButtonRef}
                open={menuOpen}
                onToggle={() => setMenuOpen((open) => !open)}
                controls={MOBILE_MENU_ID}
                className="laptop:hidden"
              />
            </div>
          </div>
        </Container>
      </header>
      <MobileMenu
        id={MOBILE_MENU_ID}
        open={menuOpen}
        pathname={pathname}
        onClose={() => setMenuOpen(false)}
        headerRef={headerRef}
        triggerRef={menuButtonRef}
      />
    </>
  );
}
