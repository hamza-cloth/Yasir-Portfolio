import type { Permission } from "@/lib/admin/roles";

// The admin's sections, grouped as in the sidebar; the command palette and the breadcrumbs read
// the same list. Icons are 24×24 stroke paths.

export type NavBadge = "messages" | "leads";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: NavBadge;
  // Hidden for roles without it; the page and its actions check again on the server.
  permission?: Permission;
  keywords?: string;
};

export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: "M4 13h6V4H4zM14 20h6v-9h-6zM14 4v4h6V4zM4 20h6v-4H4z",
        keywords: "home kpi",
      },
      {
        href: "/admin/analytics",
        label: "Analytics",
        icon: "M4 20V10M10 20V4M16 20v-7M22 20H2",
        keywords: "views visitors referrers devices",
      },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", icon: "M3 7h18v13H3zM8 7V4h8v3" },
      {
        href: "/admin/notes",
        label: "Notes",
        icon: "M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4",
        keywords: "blog ebooks",
      },
      {
        href: "/admin/skills",
        label: "Skills",
        icon: "M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 15.6 7 18.2l1-5.5-4-3.9 5.5-.8z",
      },
      { href: "/admin/experience", label: "Experience", icon: "M4 8h16v12H4zM9 8V5h6v3" },
      {
        href: "/admin/credentials",
        label: "Education & labs",
        icon: "M3 9l9-5 9 5-9 5zM7 11v5c3 2 7 2 10 0v-5",
        keywords: "certifications ccna",
      },
      {
        href: "/admin/testimonials",
        label: "Testimonials",
        icon: "M5 5h14v10H9l-4 4zM9 9h6M9 12h4",
        keywords: "reviews quotes",
      },
      { href: "/admin/resume", label: "Résumé", icon: "M7 3h7l4 4v14H7zM12 11v6M9 14l3 3 3-3" },
      {
        href: "/admin/media",
        label: "Media",
        icon: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5",
        keywords: "images uploads",
      },
    ],
  },
  {
    label: "Business",
    items: [
      {
        href: "/admin/leads",
        label: "Leads",
        icon: "M3 5h4v14H3zM10 5h4v9h-4zM17 5h4v5h-4z",
        badge: "leads",
        keywords: "pipeline kanban crm",
      },
      {
        href: "/admin/messages",
        label: "Messages",
        icon: "M4 6h16v12H4zM4 7l8 6 8-6",
        badge: "messages",
        keywords: "inbox",
      },
      {
        href: "/admin/estimates",
        label: "Estimates",
        icon: "M6 3h12v18H6zM9 7h6M9 11h6M9 15h3",
        keywords: "quotes calculator",
      },
      {
        href: "/admin/clients",
        label: "Clients",
        icon: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M21 20a6 6 0 0 0-4-5.6",
      },
      {
        href: "/admin/invoices",
        label: "Invoices",
        icon: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
        keywords: "billing gst",
      },
    ],
  },
  {
    label: "Growth",
    items: [
      {
        href: "/admin/seo",
        label: "SEO",
        icon: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
        keywords: "meta og share",
      },
      {
        href: "/admin/subscribers",
        label: "Subscribers",
        icon: "M4 6h16v12H4zM4 7l8 6 8-6M18 3v4M16 5h4",
        keywords: "newsletter",
      },
      {
        href: "/admin/redirects",
        label: "Redirects",
        icon: "M4 12h12M12 6l6 6-6 6M20 5v14",
        permission: "manage",
        keywords: "301 links",
      },
    ],
  },
  {
    label: "Site",
    items: [
      {
        href: "/admin/settings",
        label: "Profile",
        icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0",
        keywords: "photo bio socials",
      },
      {
        href: "/admin/looks",
        label: "Home looks",
        icon: "M12 3a9 9 0 1 0 9 9c0-1-1-1.5-2-1.5h-2a2 2 0 0 1-2-2V7c0-1-.5-2-1.5-2z",
        keywords: "theme",
      },
      {
        href: "/admin/appearance",
        label: "Appearance",
        icon: "M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4",
        permission: "manage",
        keywords: "watermark globe sections announcement maintenance",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        href: "/admin/security",
        label: "Users & security",
        icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
        keywords: "2fa password sessions invite roles",
      },
      {
        href: "/admin/activity",
        label: "Activity log",
        icon: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
        keywords: "audit history",
      },
      {
        href: "/admin/trash",
        label: "Trash",
        icon: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
        keywords: "restore deleted",
      },
      {
        href: "/admin/health",
        label: "System health",
        icon: "M3 12h4l3-7 4 14 3-7h4",
        keywords: "status backup export",
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export const NEW_ACTIONS = [
  { href: "/admin/projects/new", label: "Project" },
  { href: "/admin/notes/new", label: "Note" },
  { href: "/admin/leads/new", label: "Lead" },
  { href: "/admin/clients/new", label: "Client" },
  { href: "/admin/invoices/new", label: "Invoice" },
  { href: "/admin/testimonials/new", label: "Testimonial" },
];

// The nav item a path belongs to: the longest matching href.
export function activeItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.filter((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}

export function groupOf(item: NavItem): NavGroup | undefined {
  return NAV_GROUPS.find((group) => group.items.includes(item));
}
