# Admin feature matrix

Status after phase 4 (2026-10-31). The phase 0 audit (13 partial, 17 missing) is in git history.
EXISTS = works end to end · PARTIAL = some of it · MISSING = not built.

## P0

| #   | Feature            | Status  | What exists                                                                                                                                                           | What is missing                             |
| --- | ------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | Auth & security    | EXISTS  | argon2id login, rate limits, password reset by email, TOTP two-factor with QR code and 8 backup codes, active sessions with sign-out, sign-in history                 | —                                           |
| 2   | Roles & users      | EXISTS  | Owner / Editor / Viewer, checked on every page and action; invitations by email or link; change role, remove user                                                     | —                                           |
| 3   | Dashboard          | EXISTS  | KPIs with % change (new leads, open pipeline, visitors, views, unread), follow-ups due, open-to-work switch, activity                                                 | —                                           |
| 4   | Profile            | PARTIAL | Name, story, socials, photo with 1:1 crop                                                                                                                             | Explicit 2 MB message, AVIF variant         |
| 5   | Projects           | EXISTS  | CRUD, reorder, covers, draft/publish, featured first, live and source links, gallery, per-project search title and description                                        | —                                           |
| 6   | Blog / Notes       | PARTIAL | CRUD, tags, Markdown preview, the last 20 versions with restore                                                                                                       | Rich-text editor, scheduled publishing      |
| 7   | Messages inbox     | EXISTS  | Folders, labels with filter, direct replies as “Yasir Portfolio” in a branded email with live preview and four templates, the thread of sent replies, trash on delete | —                                           |
| 8   | Leads              | EXISTS  | Pipeline board, stages, value, follow-ups, convert to client, CSV; every inquiry becomes a lead                                                                       | —                                           |
| 9   | Calculator manager | EXISTS  | Admin → Pricing edits every base and feature price and the launch-pricing ceiling (₹1,50,000); only changed values are stored; reset                                  | —                                           |
| 10  | Media library      | PARTIAL | Blob uploads, list, usage-safe delete                                                                                                                                 | Folders, bulk upload, alt text, crop        |
| 11  | SEO & settings     | PARTIAL | Per-page title/description, OG image, robots/sitemap toggles                                                                                                          | Auto-generated OG, site-wide Person JSON-LD |
| 12  | Appearance         | PARTIAL | Globe on/off and strength, calm motion, announcement bar, home section order and visibility                                                                           | Accent picker, live preview                 |
| 13  | Activity log       | EXISTS  | Full log with filters and before/after diff                                                                                                                           | —                                           |
| 14  | Trash              | EXISTS  | Snapshot soft delete for 9 content types, restore, 30-day purge                                                                                                       | —                                           |

## P1

| #   | Feature                                     | Status  | Notes                                                                                                |
| --- | ------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| 15  | Pages & sections                            | PARTIAL | Section order/visibility and announcement bar; no hero text or CTA editor                            |
| 16  | Navigation & footer                         | MISSING | Nav still in `src/lib/site-nav.ts`                                                                   |
| 17  | Skills / Experience / Certifications & Labs | PARTIAL | CRUD; no drag-reorder, certificate upload or skill level UI                                          |
| 18  | Testimonials                                | EXISTS  | Admin approval; approved ones on the home page; clients submit at /testimonial                       |
| 19  | Services & pricing                          | MISSING | Services in `src/lib/hire.ts`                                                                        |
| 20  | Résumé                                      | EXISTS  | Versions; downloads counted through /api/resume                                                      |
| 21  | Estimates                                   | PARTIAL | Planner with a full-stack report and PDF; saved with each inquiry; list and status; no emailed quote |
| 22  | Analytics                                   | EXISTS  | Views, unique visitors, sources, devices, countries, 7/30/90 days, % change                          |
| 23  | Notifications                               | PARTIAL | In-app bell and per-type email switches; no Telegram                                                 |
| 24  | Global search                               | EXISTS  | ⌘K command palette with pages and actions                                                            |

## P2

| #   | Feature                  | Status  | Notes                                                                         |
| --- | ------------------------ | ------- | ----------------------------------------------------------------------------- |
| 25  | Clients & invoices       | EXISTS  | Clients, invoices with GST and print                                          |
| 26  | Subscribers              | EXISTS  | Footer sign-up, double opt-in, list, CSV, send a newsletter (test copy first) |
| 27  | Redirects + broken links | PARTIAL | Redirects with visit counts; no broken-link checker                           |
| 28  | Backups                  | PARTIAL | Full JSON backup download; no restore                                         |
| 29  | Maintenance mode         | EXISTS  | Visitors see a maintenance page; the admin keeps working                      |
| 30  | System health            | EXISTS  | Configuration checks, database latency, exports, stored counts                |
