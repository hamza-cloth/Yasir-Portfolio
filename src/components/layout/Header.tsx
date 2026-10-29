"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";

import { CommandButton } from "./CommandButton";
import { Logo } from "./Logo";
import { LookButton } from "./LookButton";
import { MenuButton } from "./MenuButton";
import { MobileMenu } from "./MobileMenu";
import { NavPills } from "./NavPills";

const MOBILE_MENU_ID = "mobile-menu";

export function Header() {
  const pathname = usePathname();
  const { hidden, scrolled } = useHideOnScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <header
        ref={headerRef}
        data-hidden={hidden && !menuOpen}
        data-scrolled={scrolled}
        data-menu-open={menuOpen}
        className="site-header fixed inset-x-0 top-0 z-(--z-header) pt-[env(safe-area-inset-top)]"
      >
        <Container className="flex h-(--header-h) items-center">
          <div className="header-pill flex h-16 w-full items-center gap-3 rounded-pill border border-line bg-surface/80 pr-2 pl-3 shadow-(--shadow-soft) backdrop-blur-xl backdrop-saturate-150">
            <Logo />
            <NavPills pathname={pathname} className="mx-auto hidden lg:block" />
            <div className="ml-auto flex min-w-0 items-center gap-1.5 lg:ml-0">
              <CommandButton className="max-sm:hidden" />
              <LookButton />
              <Button href="/contact" variant="accent" size="sm" className="max-lg:hidden">
                Hire me
                <Icon name="arrow-up-right" size={15} />
              </Button>
              <MenuButton
                ref={menuButtonRef}
                open={menuOpen}
                onToggle={() => setMenuOpen((open) => !open)}
                controls={MOBILE_MENU_ID}
                className="lg:hidden"
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
