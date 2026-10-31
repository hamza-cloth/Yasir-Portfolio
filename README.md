# Yasir Abdullah · portfolio

The personal site of Yasir Abdullah, a CCNA-trained Software & Network Engineer from India,
with a password-protected admin panel for editing every piece of content.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Motion ·
Prisma 7 + PostgreSQL (Neon) · Vercel Blob · Resend.

## Run it locally

```bash
npm install
cp .env.example .env          # then fill it in (see below)
npm run db:up                 # local Postgres in Docker; or: npx prisma dev
npm run db:deploy             # apply migrations
npm run db:seed               # admin account + first-time content (only fills empty tables)
npm run dev                   # http://localhost:3000
```

Without `DATABASE_URL` the public site still runs on the built-in content; the contact form
and `/admin` need a database.

Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## Environment variables

| Variable                                           | Needed for                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`                             | Canonical links, sitemap, share cards.                                         |
| `DATABASE_URL`                                     | Postgres for content, messages and the admin. Neon's pooled URL in production. |
| `DATABASE_URL_UNPOOLED`                            | Direct connection used only by `prisma migrate`.                               |
| `IP_HASH_SALT`                                     | Salt for hashing visitor IPs in rate limits (any long random string).          |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`                    | Local `.env` only. Read by `npm run db:seed`, which stores an argon2id hash.   |
| `BLOB_READ_WRITE_TOKEN`                            | Uploads (photo, covers, résumé PDFs). Set by the Vercel Blob integration.      |
| `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_TO_EMAIL` | Optional email alert for each contact message.                                 |
| `NEXT_PUBLIC_SENTRY_DSN`                           | Optional; see `src/lib/monitoring.ts`.                                         |

Deploys run `vercel-build`, which applies pending migrations when a database is configured.

## The admin panel

Sign in at `/admin` with the email and password the seed was run with (5 attempts per 15 minutes
per IP and per email). To set or change them, put `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+
characters) in your local `.env` and run `npm run db:seed` against the target database: it creates
or updates the one admin account, stores only an argon2id hash of the password, removes any other
account and signs everyone out. Re-running it with the same values changes nothing. The deployed app
never reads these two variables, so they are not set on Vercel. From there you can edit the profile, projects (drag to reorder),
notes, experience, education, skills and SEO; read and sort messages; upload the photo, covers
and résumé PDFs; and choose the home-page looks. Every save refreshes only the affected pages,
and every change is written to the audit log on the dashboard.

## Change the profile photo

Either:

- **Admin:** _Profile_ → _Choose a photo…_ → drag and zoom to crop it square → _Save photo_.
  JPG, PNG or WebP up to 2 MB. It is stored at 800 px and 256 px and used in the hero, the About
  page, the admin avatar and the share card. _Remove photo_ brings back the "YA" initials.
- **File:** put the photo in `public/` as `yasir.jpg` (or `.png` / `.webp`) and redeploy.
  An uploaded photo takes priority over the file.

Use a real photo. If none is set, or it fails to load, a same-size initials avatar is shown.

## Add a new look

A look is a set of CSS variables; layout and content never change.

1. **Name it** in `src/lib/look.ts`: add it to `LOOKS`, `LOOK_LABELS`, `LOOK_THEMES` and
   `LOOK_SWATCHES`.
2. **Tokens:** in `src/styles/tokens.css`, copy an existing `[data-look="…"]` block and change the
   colours, `--accent-fill`, `--feature-bg`, `--r-*` radii and `--underline-svg`. A light or dark
   look that keeps the default fonts also goes in the shared type block at the top.
3. **Headline:** add a line for it in `HEADLINES` in `src/components/home/HeroHeadline.tsx`
   (facts only), and its selector to the `.headline-*` list in `src/styles/motion.css`.
4. **Hero art (optional):** add a `hero-art-<name>` layer in `src/components/home/HeroArt.tsx`
   and its selector next to the others in `motion.css`.
5. **Label:** add its selector to the `.look-label` list in `src/styles/components.css`.
6. Run `npm test` (the look tests check every look is valid), then enable it in _Admin → Home
   looks_. On an existing site a new look starts switched off until you enable it there.

The pre-paint script in `src/lib/look-script.ts` picks the look before first paint, never repeats
the last one on the home page, keeps it on inner pages, and leaves `/admin` on its own theme.

## Project layout

```
src/app/(site)      public pages        src/app/admin     admin panel and server actions
src/components      UI by area          src/lib           data, auth, looks, media, SEO
prisma/             schema, migrations, seed          docs/   audit and change report
```
