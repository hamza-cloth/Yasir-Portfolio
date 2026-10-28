# Portfolio audit and upgrade plan

Audit of the codebase on branch `feature/backend-motion`, made before the 8-phase upgrade.
Status column: **Fixed** (done in this branch), **Open** (planned), **Blocked** (needs an outside decision or account).

## 1. Stack: target vs current

| Target | Current | Gap | Proposed path |
| --- | --- | --- | --- |
| Next.js App Router | Next.js 16.4 App Router, Cache Components, Turbopack | none | keep |
| TypeScript | TypeScript 6, strict | none | keep |
| Tailwind CSS | Tailwind 4 with CSS-variable design tokens | none | keep |
| Framer Motion | `motion` 14 (`motion/react`), the renamed Framer Motion package | name only | keep; it is the same library |
| Prisma + PostgreSQL | Prisma 7 + `@prisma/adapter-pg`; Neon planned for production | database not provisioned | accept the Neon terms on Vercel, then migrate and seed |
| Auth.js | Custom: scrypt password hash in env, DB sessions (hashed token, httpOnly cookie), 8 logins / 15 min per IP | different library | **Proposal below** |

### Auth: smallest safe path (recommended)

Keep the existing session layer, which reuses the Auth.js-shaped `User` and `Session` tables, and harden it to the spec:

1. Hash with argon2id (`@node-rs/argon2`); accept the old scrypt hash once and re-hash on login.
2. Rate limit 5 attempts / 15 min **per IP and per account**.
3. A `proxy.ts` guard (Next 16's name for middleware) on `/admin/*` and `/api/admin/*`, on top of the per-action checks that already exist.
4. CSP and security headers in `next.config.ts`; an `AuditLog` table written by every mutation; optional TOTP.

Migrating to Auth.js v5 instead is possible but buys little here: its Credentials provider only supports JWT sessions, so the existing database sessions would be dropped, and Auth.js v5 is still a beta. Choose it if you want OAuth (GitHub/Google) sign-in later.

## 2. Inventory

**Public pages (11):** `/`, `/work`, `/work/[slug]` (3), `/about`, `/skills`, `/experience`, `/notes`, `/notes/[slug]` (3), `/resume`, `/contact`, plus not-found.
`/labs` is linked from nowhere now; the `Lab` table exists but has no content or page.

**Admin routes (13):** `/admin/login`, `/admin`, `/admin/messages`, `/admin/settings`, `/admin/projects` (+ `[id]`), `/admin/notes` (+ `[id]`), `/admin/experience` (+ `[id]`), `/admin/credentials` (+ `[id]`), `/admin/skills`.

**Overlays (7):** mobile menu, command menu, terminal, page curtain, work preview card, custom cursor, back-to-top.

**Components:** 106 across about, admin, canvas, contact, diagrams, experience, home (+ tiles), layout, markdown, mockups, notes, overlay, page, resume, skills, terminal, ui and work.

## 3. Bugs found

| # | Area | Bug | Status |
| --- | --- | --- | --- |
| 1 | Overlays | ⌘K button and "Open terminal" dispatched events no component listened to: both did nothing | Fixed: command menu and terminal built, lazy-loaded |
| 2 | Overlays | Mobile menu had no `role="dialog"`/`aria-modal`, did not close on browser back | Fixed |
| 3 | Overlays | Page curtain could stay on screen if an animation threw (no try/finally); fallback was 2.5 s | Fixed: try/finally + 1.5 s failsafe |
| 4 | Overlays | Closed curtain kept `pointer-events` | Fixed |
| 5 | Overlays | Scroll lock shifted layout (no scrollbar compensation) | Fixed: `scrollbar-gutter: stable` |
| 6 | Overlays | Backdrops left a 15 px strip uncovered at the scrollbar edge | Fixed: full-viewport `w-screen h-dvh` |
| 7 | Overlays | z-index values ad hoc (60-150) | Fixed: one scale 0/50/100/200/300/400/500 |
| 8 | Responsive | Mono labels and `text-xs` at 11.5-12 px on phones (up to 98 per page) | Fixed: 14 px floor below 720 px |
| 9 | Responsive | Small buttons, chips, nav and footer links 40 px tall | Fixed: 44 px minimum |
| 10 | Responsive | Code blocks 13.8 px on phones | Fixed |
| 11 | Stability | No `error.tsx`, `global-error.tsx` or `not-found.tsx` | Fixed |
| 12 | Stability | Canvas `getContext` unguarded | Fixed |
| 13 | Forms | React reset forms after a server error, wiping typed values (contact + admin) | Fixed earlier on this branch |
| 14 | Build | Three Shiki type errors failed `next build`; code blocks broke prerender | Fixed earlier |
| 15 | Data | No migrations or seed; contact form and admin did not exist | Fixed earlier on this branch (needs a database to go live) |

Responsive audit result after fixes, 11 pages × 8 widths (360-1920 px), production build: **0 horizontal overflow, 0 console errors or warnings.** Remaining mobile flags are inline links inside sentences (exempt under WCAG 2.5.8) and visually hidden radio inputs whose labels are the tap targets.

## 4. Remaining phases

| Phase | What is left | Blocked by |
| --- | --- | --- |
| 3 Looks | 5 looks on `data-look`, no-repeat pre-paint script, headline variants in CSS, admin looks manager, "Change look" button | none |
| 4 Photo | `next/image` hero + About photo with ring and fallback, OG image, admin upload with 1:1 crop, 800 and 256 px | **your photo**, and a file store |
| 5 Admin | argon2 + per-account limit, `proxy.ts`, CSP, audit log, TOTP; dashboard views, star/archive/spam, looks, résumé versions, SEO, media library, drag reorder, toasts, confirm dialogs, unsaved-changes guard, dark mode | auth decision; a file store for uploads |
| 6 Speed | dynamic globe, JS budget check, Lighthouse runs | a deployed URL for real scores |
| 8 QA | cross-browser | Chrome/Edge/Firefox/WebKit can be automated here; real iOS Safari and Android devices cannot |

**Outside accounts needed:** the Neon terms on Vercel (database), a file store for photo/résumé/media uploads (Vercel Blob recommended), and optionally a Sentry DSN.
