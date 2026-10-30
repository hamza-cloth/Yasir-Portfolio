<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Dev server safety — mandatory after EVERY change

The dev server runs on **http://localhost:3000** (`npm run dev`; `predev` frees the port first). The production build previews on http://localhost:3001 (`npm run preview`).

1. Never change the dev port, host or package.json scripts unless asked.
2. After any code change, run `npm run check` (lint + type check + unit tests + production build). If it fails, fix every error before finishing. Never end a task with a failing build.
3. When adding a package, install it so package.json and the lockfile are updated. Never import a package that isn't installed.
4. When creating, moving or renaming files, update every import (case-sensitive paths).
5. Start the dev server and confirm it responds: `curl -I http://localhost:3000` must return HTTP 200 (or 3xx), and the terminal must show no errors. Also open the changed pages and check the browser console for runtime errors.
6. Finish every task with: changed files, the result of `npm run check`, and the working URL http://localhost:3000.
7. If the dev server was started inside the AI tool's session, remind the user it may stop when the session ends, and that they should run `npm run dev` in their own terminal.

Notes for this project:

- A database URL in `.env` that points at a stopped database no longer breaks dev: `src/instrumentation.ts` skips it with a warning and the site renders its built-in content. To use the real local data, start `npx prisma dev --name yasir-portfolio` first, then `npm run dev`.
- `npm run check` builds without a database on purpose (`scripts/build-offline.ts`), so it passes whether or not the local database is running.
