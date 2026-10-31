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

## Already shipped before this upgrade

- Cost calculator at `/estimate` (prices in `src/config/pricing.ts`).
- Hire Me section and `/hire` with a project inquiry form, 3D build diagram, WhatsApp.
- Midnight Ink rebrand, YA monogram, favicons, OG image.
- Seven layer ebooks with 3D diagrams under Notes.
- Dev-server safety: fixed port 3000, `npm run check`, unreachable local DB skipped.
