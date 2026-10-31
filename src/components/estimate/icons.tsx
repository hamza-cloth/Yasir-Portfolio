import type { CategoryId, PlatformId } from "@/config/pricing";

const CATEGORY_PATHS: Record<CategoryId, string> = {
  websites: "M3 5h18v14H3zM3 9h18M6.5 7h.01M9 7h.01",
  commerce: "M3 4h2l2.4 11h10.2L20 8H6.2M9 20h.01M17 20h.01",
  business: "M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z",
  social:
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7M22 21a7 7 0 0 0-4-6.3",
  earning: "M3 8h18v12H3zM3 12h18M12 8v12M12 8c-2-3-6-3-6 0M12 8c2-3 6-3 6 0",
  gaming:
    "M7 10h4M9 8v4M15 11h.01M18 9h.01M8 5h8a5 5 0 0 1 5 5l1 6a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2l1-6a5 5 0 0 1 5-5z",
  ai: "M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3M6 6h12v12H6zM10 10h4v4h-4z",
  other: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z",
};

const PLATFORM_PATHS: Record<PlatformId, string> = {
  web: "M3 5h18v14H3zM3 9h18M6.5 7h.01M9 7h.01",
  pwa: "M12 3v11M7.5 9.5 12 14l4.5-4.5M5 20h14",
  android: "M7 3h10v18H7zM11 18h2",
  ios: "M7 3h10v18H7zM10.5 5h3M11 18h2",
  desktop: "M3 4h18v12H3zM8 20h8M12 16v4",
};

function Glyph({ path, size = 22 }: { path: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export function CategoryIcon({ category, size }: { category: CategoryId; size?: number }) {
  return <Glyph path={CATEGORY_PATHS[category]} size={size} />;
}

export function PlatformIcon({ platform, size }: { platform: PlatformId; size?: number }) {
  return <Glyph path={PLATFORM_PATHS[platform]} size={size} />;
}

// The extra services (step 5), by feature id.
const SERVICE_PATHS: Record<string, string> = {
  contentWriting: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  branding:
    "M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1-.8-1.4-.8-2.3 0-.9.7-1.7 1.7-1.7H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5zM7.5 11h.01M10 7h.01M14.5 7h.01",
  deployment:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z",
  migration: "M4 7h13l-3-3M20 17H7l3 3",
  training: "M4 5h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v14h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4zM12 6v14",
};

export function ServiceIcon({ id, size }: { id: string; size?: number }) {
  return <Glyph path={SERVICE_PATHS[id] ?? CATEGORY_PATHS.other} size={size} />;
}

export function SearchIcon({ size = 18 }: { size?: number }) {
  return <Glyph path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" size={size} />;
}
