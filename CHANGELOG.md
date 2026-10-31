# Changelog

## Unreleased — admin & site upgrade

### Phase 0 — audit and feature matrix (2026-10-31)

- Added `AUDIT.md`: automated layout sweep of 12 pages × 7 widths × 5 looks, the root cause
  of the "theme resets on refresh" report, and current Lighthouse numbers.
- Added `FEATURES.md`: status of all 30 requested admin features (0 broken, 13 partial,
  17 missing).

## Already shipped before this upgrade

- Cost calculator at `/estimate` (prices in `src/config/pricing.ts`).
- Hire Me section and `/hire` with a project inquiry form, 3D build diagram, WhatsApp.
- Midnight Ink rebrand, YA monogram, favicons, OG image.
- Seven layer ebooks with 3D diagrams under Notes.
- Dev-server safety: fixed port 3000, `npm run check`, unreachable local DB skipped.
