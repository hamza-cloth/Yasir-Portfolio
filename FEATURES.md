# Admin feature matrix

Status from reading the admin pages (`src/app/admin`), server actions
(`src/app/admin/actions.ts`, `media-actions.ts`), the Prisma schema and the public forms.
EXISTS = works end to end · PARTIAL = some of it · BROKEN = present but failing ·
MISSING = not built.

## P0

| #   | Feature            | Status  | What exists                                                                                                                                                                        | What is missing                                                                                                            |
| --- | ------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1   | Auth & security    | PARTIAL | argon2id password login, httpOnly DB sessions, server-side check on every action, 5 tries / 15 min per IP and per account, login/logout in the audit log, CSP and security headers | Password reset by email, TOTP 2FA + backup codes, active sessions list + sign out everywhere, login history with IP/device |
| 2   | Roles & users      | MISSING | One admin user                                                                                                                                                                     | Owner / Editor / Viewer, invites, per-role checks                                                                          |
| 3   | Dashboard          | PARTIAL | Counts, unread messages, 7-day views chart, latest messages, quick links, recent audit entries                                                                                     | KPI sparklines + % change, date ranges, referrers/devices/countries, leads, health widget, open-to-work toggle             |
| 4   | Profile            | PARTIAL | Name, role line, story, location, availability, open to work, socials, photo upload with 1:1 crop, file-signature check                                                            | Explicit 2 MB limit message, AVIF variant                                                                                  |
| 5   | Projects           | PARTIAL | CRUD, drag-to-reorder, status label, categories, stack tags, cover upload, overview + decisions, draft/publish                                                                     | Featured toggle, gallery, case-study blocks, live/GitHub links field, per-project SEO                                      |
| 6   | Blog / Notes       | PARTIAL | CRUD, tags, featured, draft/publish, Markdown with preview, reading time                                                                                                           | Rich-text (Tiptap) editor, scheduled publishing, revision history                                                          |
| 7   | Messages inbox     | PARTIAL | List, read/unread, star, archive, spam, delete; hire inquiries arrive here                                                                                                         | Labels, reply by email, saved templates, thread view                                                                       |
| 8   | Leads              | MISSING | Hire Me inquiries are stored as messages                                                                                                                                           | Lead model, pipeline board, stages, value, follow-ups, convert to client, CSV                                              |
| 9   | Calculator manager | MISSING | Prices in `src/config/pricing.ts` (code)                                                                                                                                           | Admin editing, USD, GST rate, discounts, min/max, preview                                                                  |
| 10  | Media library      | PARTIAL | Blob uploads tracked in `MediaAsset`, list, usage-safe delete                                                                                                                      | Folders, bulk upload, required alt text, crop, AVIF/responsive sizes, storage usage                                        |
| 11  | SEO & settings     | PARTIAL | Per-page title/description, OG image upload, indexable + sitemap toggles, site name/contact/socials; Person JSON-LD on `/hire`                                                     | Auto-generated OG, site-wide Person JSON-LD                                                                                |
| 12  | Appearance         | PARTIAL | Looks: enable/disable, fixed/random/sequential                                                                                                                                     | Accent picker + contrast check, watermark on/off/intensity, animation intensity, live preview                              |
| 13  | Activity log       | PARTIAL | `AuditLog` written on every mutation; latest shown on the dashboard                                                                                                                | Full log page, filters, before/after diff                                                                                  |
| 14  | Trash              | MISSING | Deletes are permanent                                                                                                                                                              | Soft delete, restore, 30-day purge                                                                                         |

## P1

| #   | Feature                                     | Status  | What exists                                                                       | What is missing                                                         |
| --- | ------------------------------------------- | ------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 15  | Pages & sections                            | MISSING | —                                                                                 | Section visibility/order, hero text, role lines, CTAs, announcement bar |
| 16  | Navigation & footer                         | MISSING | Nav in `src/lib/site-nav.ts` (code)                                               | Editor                                                                  |
| 17  | Skills / Experience / Certifications & Labs | PARTIAL | CRUD for all three, draft/publish; projects reorder                               | Drag-reorder for these, certificate file upload, skill level            |
| 18  | Testimonials                                | MISSING | —                                                                                 | Everything, incl. public submit queue                                   |
| 19  | Services & pricing                          | MISSING | Services in `src/lib/hire.ts` (code)                                              | Editor, package tiers                                                   |
| 20  | Résumé                                      | PARTIAL | PDF upload, versions, set active, delete                                          | Download counter                                                        |
| 21  | Estimates                                   | MISSING | Calculator is client-only; "Get Exact Quote" pre-fills the inquiry                | Estimate model, list, PDF quote, email, status                          |
| 22  | Analytics                                   | PARTIAL | Cookie-less daily page views per path                                             | Unique visitors, referrers, devices, countries, ranges                  |
| 23  | Notifications                               | PARTIAL | Email per message (Resend)                                                        | In-app bell, Telegram                                                   |
| 24  | Global search                               | PARTIAL | Admin search page (projects, notes, experience, skills, messages); public ⌘K menu | Admin ⌘K palette with actions, media/settings results                   |

## P2

| #   | Feature                  | Status                                                                 |
| --- | ------------------------ | ---------------------------------------------------------------------- |
| 25  | Clients & invoices       | MISSING                                                                |
| 26  | Subscribers              | MISSING                                                                |
| 27  | Redirects + broken links | MISSING                                                                |
| 28  | Backups                  | MISSING                                                                |
| 29  | Maintenance mode         | MISSING                                                                |
| 30  | System health            | PARTIAL — the dashboard warns when email or uploads are not configured |

## Nothing found BROKEN

Every existing admin action re-checks the session server-side, validates with zod and
writes an audit entry.
