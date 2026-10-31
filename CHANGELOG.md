# Changelog

## Unreleased — admin & site upgrade

### Phase 0 — audit and feature matrix (2026-10-31)

- Added `AUDIT.md`: automated layout sweep of 12 pages × 7 widths × 5 looks, the root cause
  of the "theme resets on refresh" report, and current Lighthouse numbers.
- Added `FEATURES.md`: status of all 30 requested admin features (0 broken, 13 partial,
  17 missing).

### Phase 2a — theme persistence and hero (2026-10-31)

- **Theme no longer resets.** A look the visitor picks is saved in `localStorage` and a
  `ya-theme` cookie (1 year, `SameSite=Lax`) and wins on every page, the home page
  included, across refreshes and browser restarts; other tabs follow via the `storage`
  event. The admin's fixed/random rule now applies only to visitors who never picked.
- **Hero photo aligned with the pitch.** The hero is two rows (pitch, then links/stats/look);
  the photo shares the pitch row, so it sits beside the name and stays fully in the first
  viewport (1280×720: top 137px, was 258px).
- Look picker wraps on small phones instead of spilling past the edge at 360px.

### Phase 4 — project planner and the missing features (2026-10-31)

- **Project planner (/estimate):** no price while requirements are gathered (project, platforms,
  features, design and scale, extra services, review). "Analyse my project" opens a full-stack
  report: range, timeline, complexity, cost by module, tech stack, phases and a 30/40/30 payment
  plan; the PDF carries it too. Five new features and five extra services.
- **Pricing (admin):** every base and feature price is editable; leads are recalculated with it.
- **Dashboard:** KPIs with % change, follow-ups due, open-to-work switch.
- **Projects:** featured first, live and source links, gallery, per-project search title and
  description.
- **Notes:** the last 20 versions are kept and can be restored.
- **Testimonials:** clients write one at /testimonial; it waits for approval.
- **Newsletter:** compose and send to confirmed subscribers, with a test copy first.
- **Résumé:** downloads are counted.
- Local `prisma dev` databases get a single connection, so busy pages no longer drop it.

### Phase 3 — admin upgrade (2026-10-31)

- **Sign-in and security:** password reset by email (30-minute link), TOTP two-factor with a
  QR code and 8 one-time backup codes (secrets encrypted with `ADMIN_ENCRYPTION_KEY`), active
  sessions with sign-out per device or everywhere else, and a sign-in history.
- **Users and roles:** Owner / Editor / Viewer, checked on the server for every page and action;
  owners invite people by email (or a copyable link when email is off).
- **Business:** leads pipeline board (every inquiry becomes a lead, calculator inquiries keep their
  estimate), estimates, clients and invoices with GST and print.
- **Content:** testimonials with approval, shown on the home page once approved; deletes go to a
  30-day trash with restore; a full activity log with before/after changes.
- **Inbox:** labels with a filter, replies by email with three templates.
- **Site switches (Appearance):** announcement bar above the header, maintenance page, home
  section order and visibility, globe strength, calm motion.
- **Growth:** cookie-less analytics with unique visitors, sources, devices and countries; redirects
  for addresses that no longer exist (real 308/307 from the proxy, visits counted); newsletter
  sign-up in the footer with double opt-in, subscriber list and CSV.
- **System:** health page (configuration checks, database latency, stored counts), CSV exports and
  a full JSON backup; in-app notification bell and ⌘K command palette; email alerts can be
  switched off per type.

## Already shipped before this upgrade

- Cost calculator at `/estimate` (prices in `src/config/pricing.ts`).
- Hire Me section and `/hire` with a project inquiry form, 3D build diagram, WhatsApp.
- Midnight Ink rebrand, YA monogram, favicons, OG image.
- Seven layer ebooks with 3D diagrams under Notes.
- Dev-server safety: fixed port 3000, `npm run check`, unreachable local DB skipped.
