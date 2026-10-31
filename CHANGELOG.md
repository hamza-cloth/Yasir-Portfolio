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

### Phase 10 — mobile menu and phone polish (2026-11-01)

- **Menu button:** three lines that fold into a cross; open, it becomes an accent pill reading
  "Close". Fixed a bug where the open menu covered the header, hiding the close button.
- **Mobile menu:** opens as a circle from the button over a drifting backdrop; each page has a
  number, a one-line description and an arrow, with "You’re here" on the current one; quick
  actions (Hire me, Estimate, WhatsApp); a new **Admin panel** section linking to the admin
  sign-in; the look picker; and a large "Close menu" button within thumb reach. Blocks rise in
  one after another. Esc, the header button and the bottom button all close it.
- **Phones:** the hero buttons span the width, the email link and look picker share one line,
  and look swatches are 44px tap targets.

### Phase 9 — a new look on every refresh (2026-11-01)

- **Every refresh changes the look:** each full page load (the home page or any other page) picks
  a new look at random, never the one shown last. Moving around the site keeps the current look.
- A look picked with the look picker lasts until the next refresh, which moves on from it. This
  replaces the phase 2a rule where a picked look stayed across refreshes and browser restarts.
- Random is now the default, and a migration switches the saved setting from fixed to random.
  Admin → Looks can still choose fixed (always one look) or sequential.

### Phase 8 — résumé redesign and a 3D profile (2026-11-01)

- **Résumé (/resume):** a new professional sheet: an ink header band with a gold rule, the photo,
  name, role, tags and every contact (email, phone, location, LinkedIn, GitHub, website); a main
  column with profile, an experience rail, projects with status and stack, and education; a
  tinted side column with key numbers and skills as chips. It prints edge to edge on one A4
  page and tips into place on screen.
- **3D profile (home):** the portrait is a 3D stage. With a mouse it turns towards the pointer
  with a moving glare; on phones it sways on its own. Two plates stack behind the photo, the
  caption and badges float in front, and the orbits and globe sit further back.

### Phase 7 — home page redesign (2026-11-01)

- **Hero:** a status pill (open to work, location), a larger name with a sheen on the surname, the
  role, tagline and CTAs (the main one with a passing sheen), socials beside the look picker, and
  a glass stats bar with icons. The photo sits in a tall card with a turning accent edge, a
  caption bar, three floating badges and two orbits; the backdrop adds a faint grid, drifting
  aurora light and a cursor light. On phones the text comes first, then the photo.
- **Sections:** eyebrows become pills with a glowing dot, and sections are split by a fading
  hairline with a soft glow instead of a plain rule (home only).
- **Services:** a ghost number, an icon tile with a ring, an arrow that turns and an accent bar
  on hover. **Process:** a rail that fills between the steps, step labels and a pulsing ring on
  each number (also on Work and Experience). **Marquee:** a second row with the everyday stack,
  running the other way.

### Phase 6 — launch pricing and the planner redesign (2026-11-01)

- **Launch pricing:** no estimate goes above ₹1,50,000 for now. Bigger builds keep their full
  scope, timeline and complexity; the report shows the standard rate struck through and the range
  held at ₹1,06,000 – ₹1,50,000. The ceiling is `PRICING.maxPrice` and can be changed or removed
  (0) from Admin → Pricing.
- **Planner redesign (/estimate):** a two-column hero with an animated project blueprint; a
  connected stepper; each step in one card with a large step number; cards with a pointer
  spotlight and a gradient edge when chosen; feature switches grouped with counts; level meters
  for design, users and speed; a "live blueprint" sidebar with a progress ring and scope counts.
- **Analysis and report:** a radar scan while analysing; the report counts its price up, shows a
  complexity gauge, module bars that grow in, a phase timeline on a shared week axis, a payment
  track, stack tiles and a closing call to action. Every animation stops under reduced motion.

### Phase 5 — direct replies and branded email (2026-10-31)

- **Reply from the admin:** each message has "Reply as Yasir Portfolio" with four templates and a
  live preview of the exact email; sent replies show under the message as a thread.
- **Branded email:** one premium template (logo, ink header with a gold rule, signature with
  contact links, quoted original) for replies, invitations, password resets, the newsletter,
  subscription confirmations and the admin's alerts. Sender name "Yasir Portfolio".
- **Gmail SMTP:** with `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` set, email goes through SMTP and reaches
  anyone without a domain; System health explains the setup.

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
