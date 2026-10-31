import { isMobile } from "@/lib/admin/device";

// Classifies a visit for the cookie-less analytics (admin → Analytics). Only these coarse buckets
// are stored, counted once per visitor per day: no IP addresses, user agents or full URLs.

// The referring site's host, "direct" when there is none, or null for a link from this site.
export function referrerSource(referrer: unknown, siteHost: string | null): string | null {
  if (typeof referrer !== "string" || referrer === "") return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (!host) return "direct";
    if (
      siteHost &&
      host ===
        siteHost
          .replace(/^www\./, "")
          .replace(/:\d+$/, "")
          .toLowerCase()
    )
      return null;
    return host.slice(0, 100);
  } catch {
    return "direct";
  }
}

export function deviceType(userAgent: string | null): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet|Android(?!.*Mobile)/.test(userAgent ?? "")) return "tablet";
  return isMobile(userAgent) ? "mobile" : "desktop";
}

// Vercel's two-letter country header; anything else is "unknown".
export function countryCode(header: string | null): string {
  return header && /^[A-Z]{2}$/.test(header) && header !== "XX" ? header : "unknown";
}
