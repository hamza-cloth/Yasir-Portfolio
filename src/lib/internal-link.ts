const SKIPPED_PREFIXES = ["/api/", "/admin"];

// Returns the destination when a click is a plain same-origin page navigation we can animate.
export function internalNavigationTarget(event: MouseEvent, location: Location): URL | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;

  const anchor = (event.target as Element | null)?.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download") || anchor.dataset.noCurtain !== undefined) return null;

  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return null;
  if (url.pathname === location.pathname) return null;
  if (SKIPPED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return null;

  return url;
}
