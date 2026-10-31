import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

import { countRedirectHit, findRedirectForProxy } from "@/lib/redirect-rules";

// Two jobs. For /admin: a fast first gate (no session cookie, no admin page); it is only an
// optimistic check, and every admin page and server action still verifies the session against
// the database itself. For paths that match no page: the admin's redirects (admin → Redirects).
export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) {
    // Sign-in, its two-factor step, password reset and invitations work without a session.
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/"))
      return NextResponse.next();

    if (!request.cookies.has("ya_admin")) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const rule = await findRedirectForProxy(pathname);
  if (!rule) return NextResponse.next();
  event.waitUntil(countRedirectHit(rule.id));
  return NextResponse.redirect(new URL(rule.to, request.url), rule.permanent ? 308 : 307);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    // Every other path except the site's own sections and files, so real pages never wait on
    // the proxy; only addresses that would be a 404 are looked up.
    "/((?!(?:admin|api|_next|about|contact|estimate|experience|hire|notes|resume|skills|subscribe|work)(?:/|$))[^.]+)",
  ],
};
