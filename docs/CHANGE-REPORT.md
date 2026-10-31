# Change report: 8-phase upgrade

Branch `feature/backend-motion`, 7 commits on top of `main`: 193 files changed
(91 added, 79 modified, 22 removed, 1 renamed), +9,666 / −2,185 lines.
The audit made before any change is in [AUDIT.md](AUDIT.md).

## What changed, by phase

| Phase           | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Size & layout | 1280px container with a 16–32px gutter; fluid `clamp()` type; 14px text floor and 44px tap targets on phones; auto-fit grids and container queries; `100svh`/`100dvh`; safe-area insets.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2 Overlays      | One z-index scale (0/50/100/200/300/400/500); a shared `Dialog` (100dvh, `role="dialog"`, `aria-modal`, focus trap and return, Esc/backdrop/route-change close, scroll lock without layout shift); command menu and terminal built and lazy-loaded; mobile menu rebuilt in CSS, inert when closed; page curtain with try/finally and a 1.5s failsafe.                                                                                                                                                                                                                                                                                                      |
| 3 Looks         | Porcelain, Midnight Ops, Sunset Fibre, Terminal (since removed), Aurora as token sets on `data-look`; a blocking pre-paint script (no repeat on refresh, kept on inner pages, survives blocked storage, admin excluded); all headlines in HTML with CSS showing one; per-look hero art, accent fill, button and card radius; _Change look_ button with a View Transition; admin looks manager with live previews.                                                                                                                                                                                                                                          |
| 4 Photo         | `next/image` avatar with accent ring and online dot (hero), 4:5 portrait (About), admin avatar, Open Graph image; AVIF/WebP, blur placeholder, `preload` on the hero only; same-size initials fallback when missing or broken.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 5 Admin         | argon2id (older scrypt hashes still verify); 5 logins / 15 min per IP and per account; `proxy.ts` gate plus per-action session checks; CSP and security headers; audit log; collapsible sidebar and phone drawer, search, light/dark, avatar; toasts, confirm dialogs, unsaved-changes guard; dashboard with privacy-friendly page views and activity; photo upload with 1:1 crop (2 MB, signature-checked, 800/256 px in Vercel Blob); open-to-work toggle; drag-to-reorder projects and covers; résumé versions with a live download; message star/archive/spam; SEO overrides, share image, robots and sitemap toggles; media library with safe delete. |
| 6 Speed         | Home first-load JS 213 → **155 KB** gzip (Motion off the first load, Lenis on idle, globe on view with fewer dots on phones); one observer/listener instead of a client component per reveal and tile; only transform/opacity animated; LCP element never starts invisible.                                                                                                                                                                                                                                                                                                                                                                                |
| 7 Stability     | `error.tsx` (site, admin), `global-error.tsx`, `not-found.tsx`; guarded canvas, storage and clipboard; monitoring hook; zod kept out of the browser.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 8 QA            | Results below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## Bugs fixed

1. ⌘K and _Open terminal_ did nothing: no component listened for their events.
2. Mobile menu was not a labelled dialog and stayed open on the browser's back button.
3. The page curtain could stick if an animation threw; closed, it still caught clicks.
4. Locking scroll under an overlay shifted the page; backdrops left a strip at the scrollbar edge.
5. Labels and small text were 11.5–12px on phones; buttons and links were 40px tall.
6. No error, global-error or not-found pages.
7. Forms lost everything typed after a server error (contact and admin).
8. The production build failed on three type errors; code blocks broke prerendering.
9. Admin could open in the Terminal look with its fonts and scanlines.
10. Faint text, a mockup badge and mockup tabs failed contrast; no favicon (console 404).
11. zod shipped to the browser and tripped a Firefox CSP report; `upgrade-insecure-requests` broke Safari over plain http.

## QA results

| Check                                                                                                                                    | Result                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Horizontal scroll, 11 pages × 360–1920px                                                                                                 | None                                                                                                       |
| Overlays (19 checks: cover, focus, Esc, backdrop, route change, inert when closed, curtain)                                              | All pass                                                                                                   |
| 10 home loads in a row                                                                                                                   | Look changed every time, no repeat, one headline, CLS ≤ 0.022                                              |
| Photo upload, removal → initials                                                                                                         | Pass                                                                                                       |
| Admin end-to-end (15 checks: proxy, login, rate limit, looks, photo, signature check, résumé, SEO, messages, dashboard, search, headers) | All pass                                                                                                   |
| Navigation                                                                                                                               | 28 client-side navigations, 0 full reloads                                                                 |
| Leaks after 28 navigations                                                                                                               | DOM nodes 1704 → 1704, listeners 431 → 431, heap 5.8 → 6.1 MB                                              |
| Chromium / Firefox / WebKit, desktop and phone                                                                                           | No overflow, overlays work, no errors (WebKit logs aborted prefetches during rapid test navigation only)   |
| Keyboard                                                                                                                                 | First Tab reaches _Skip to content_ (Chromium, Firefox); Safari tabs links only with Option+Tab, by design |
| Unit tests / lint / type-check / build                                                                                                   | 69 pass / clean / clean / 41 pages                                                                         |

**Lighthouse, mobile, on the live site** (https://yasir-portfolio-zeta.vercel.app, default 4× CPU
throttling, machine benchmark index 1,240–1,640): Home Performance **83–84**, Work 87, Contact 92;
Accessibility, Best Practices and SEO **100** on every page tested; CLS 0; LCP 2.4–2.7 s;
TBT 260–420 ms. Runs taken while the machine was busy (benchmark index ~400) scored far lower and
are not representative; PageSpeed Insights could not be used (its anonymous daily quota was spent).

## Follow-up: admin login, Terminal look removed, audit

- **Admin login:** the password hash now lives in the database (`User.passwordHash`, argon2id),
  written by `npm run db:seed` from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in the local `.env`. The seed
  normalises the email, removes every other account, ends all sessions when anything changed, and
  does nothing on a re-run. Login checks the database hash (constant-time argon2 verify, a decoy
  hash for unknown emails), returns one message for a wrong email or password, and keeps the
  5-per-15-minutes limit per IP and per email. `ADMIN_PASSWORD_HASH` and `npm run admin:hash` are
  gone, along with the legacy scrypt path.
- **Looks:** Terminal is removed (tokens, VT323, scanlines, glow, `terminal:` variant, headline,
  hero art, globe override). Four looks remain: Porcelain, Midnight Ops, Sunset Fibre, Aurora. A
  stored `terminal` (browser storage or the database) becomes Midnight Ops. The backtick console
  stays; its `theme` command takes the four looks plus `dark` / `light`.
- **Audit fixes:** the CCNA tile's shadow class had been corrupted into an invalid token; the logo
  link's accessible name did not contain its visible text (WCAG 2.5.3); Porcelain's green status
  text was below AA contrast; a nested `zod` in `@vercel/blob`'s dependency tree had a high-severity
  advisory (pinned to the project's patched `zod` with an npm override).

## Not finished, or needs you

- **Deployed:** Neon database provisioned, migrated and seeded; production admin password set;
  the branch is live at https://yasir-portfolio-zeta.vercel.app (merge the PR to bring `main` level).
- **Profile photo:** not provided yet; the site shows the initials avatar until you add
  `public/yasir.jpg` or upload one in the admin.
- **Lighthouse targets:** on the live site the home page scores 83–84 (target 90) with LCP about
  2.7 s (target 2.5 s); Work and Contact are at or near target. The remaining cost is mostly React
  hydration of the home page's interactive pieces.
- **Real devices:** iOS Safari and Android Chrome were emulated (WebKit, Chromium mobile), not
  tested on hardware.
- **Optional items not built:** TOTP 2FA; Sentry itself (the hook is ready); drag-to-reorder for
  notes and skills; a Labs page (the table exists, there is no content).
- **By decision:** auth stays on the hardened custom sessions rather than Auth.js; scripts keep
  `'unsafe-inline'` in the CSP so pages stay static on the CDN.
- **Email alerts:** off until a Resend API key is added; messages are stored either way.
