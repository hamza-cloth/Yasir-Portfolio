export type NavItem = {
  href: string;
  label: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/labs", label: "Labs" },
  { href: "/notes", label: "Notes" },
  { href: "/resume", label: "Resume" },
];

export const ALL_PAGES: readonly NavItem[] = [
  { href: "/", label: "Home" },
  ...NAV_ITEMS,
  { href: "/contact", label: "Contact" },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const NESTED_LABELS: Record<string, string> = {
  work: "Case study",
  notes: "Note",
};

// The curtain shows this while the next page loads. Nested pages get a generic label,
// because a slug cannot be turned back into a correctly capitalised title.
export function routeLabel(pathname: string): string {
  const page = ALL_PAGES.find((item) => item.href === pathname);
  if (page) return page.label;

  const [section] = pathname.split("/").filter(Boolean);
  return (section && NESTED_LABELS[section]) ?? "Loading";
}
