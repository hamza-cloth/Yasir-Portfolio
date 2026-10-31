# Audit — public site and admin

Run on 2026-10-31 against the local build (`npm run dev`, no database: built-in content).
Pages checked: `/`, `/work`, `/about`, `/skills`, `/experience`, `/notes`, `/resume`,
`/contact`, `/hire`, `/estimate`, `/work/hamza-cloth`, an ebook chapter. Widths: 360, 390,
768, 1024, 1280 (×720), 1440 (×900), 1920. Home in all five looks; other pages in
Midnight Ink. Automated checks: page scroll width, non-decorative elements crossing the
viewport edge, images without dimensions, hero photo position. Plus screenshots.

## Layout

| Page           | Element         | Width / look        | Problem                                                              | Root cause                                                                                                                                 | Fix                                                                                                           |
| -------------- | --------------- | ------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| all            | page            | 320–1920, all looks | **No horizontal scroll found**                                       | `main` uses `overflow-x: clip`; blur filters were removed earlier                                                                          | —                                                                                                             |
| `/`            | Look picker row | 360, all looks      | Spills 4–8px past the left edge                                      | A centred flex row (label + 5 × 36px swatches + look name) wider than the 320px column, no wrap                                            | Let the row wrap and drop the look name under 380px                                                           |
| `/`            | Hero photo      | 1280×720, 1440×900  | Photo sits lower than the name and reads as "too low"                | The grid centres the photo on the **whole** text column (eyebrow → look picker, ~600px tall), so its centre lands 100px+ below the heading | Align the photo with the heading block (top-aligned grid with an offset), keep it fully in the first viewport |
| `/experience`  | Interface table | 360, 390            | 640px table wider than the screen                                    | —                                                                                                                                          | False positive: it sits in `overflow-x: auto` with `role="region"` and is meant to scroll                     |
| ebook chapters | Code blocks     | 360, 390            | Long lines exceed the screen                                         | —                                                                                                                                          | False positive: `pre` scrolls horizontally on purpose                                                         |
| `/`            | Hero photo      | all                 | Fully visible in the first viewport (258–668 of 720; 252–692 of 900) | —                                                                                                                                          | Keep after the fix above                                                                                      |
| all            | Images          | all                 | Every `main img` has width/height                                    | `next/image` everywhere                                                                                                                    | —                                                                                                             |

## Theme resets on refresh — root cause

The site has five **looks** (`midnight-ink` default, `porcelain`, `midnight-ops`,
`sunset-fibre`, `aurora`), set before first paint by an inline script
(`src/lib/look-script.ts`), with a picker in the hero and the header.

1. **The home page ignores the visitor's choice by design.** On `/` the script always
   picks from the admin rule: `fixed` (current production setting: always Midnight Ink)
   or `random`/`sequential` (a different look each load). A visitor who picks Porcelain
   and refreshes the home page gets Midnight Ink again.
2. **The choice is kept in `sessionStorage` only** (`ya-look`), so even on inner pages it
   is lost when the browser closes. `localStorage` (`ya-look-last`) only remembers what
   the home page last showed, for the random/sequential rule, not what the visitor chose.
3. **No cookie**, so the server cannot render the chosen look; the inline script must
   always run first (it does, so there is no flash, but there is also no persistence).
4. The brief's names ("Ops / Paper / Terminal") do not match the code: "Terminal" was
   retired (mapped to Midnight Ops), and there are five looks, not three.

Fix (Phase 2): a visitor's explicit pick wins everywhere and persists — `localStorage`
`ya-theme` + a `ya-theme` cookie (1 year, `SameSite=Lax`), read by the blocking script
before paint, synced across tabs with the `storage` event; the admin rule applies only to
visitors who never picked.

## Performance (mobile Lighthouse, local, noisy machine)

| Page        | Perf   | A11y | Best | SEO | Notes                                                                  |
| ----------- | ------ | ---- | ---- | --- | ---------------------------------------------------------------------- |
| `/`         | ~80–86 | 100  | 100  | 100 | Longest page; style/layout and hydration dominate. LCP ~3.4s simulated |
| `/hire`     | 86–92  | 100  | 100  | 100 | 3D waits for first interaction                                         |
| `/estimate` | 90–93  | 100  | 100  | 100 |                                                                        |
| `/contact`  | 89–93  | 100  | 100  | 100 |                                                                        |

Brief targets LCP < 2.5s and Accessibility ≥ 95: accessibility passes everywhere; the
simulated LCP (3.0–3.6s) does not yet, mostly from hydration of the shared shell (header,
command menu, cursor, curtain, reveal controller) on a throttled CPU.

## Admin

Not audited in a browser yet: the admin needs a database, and the local one is not
running (see `src/instrumentation.ts`). Code review findings are in `FEATURES.md`.
Visual audit of the admin will run against `npx prisma dev` in Phase 3.
