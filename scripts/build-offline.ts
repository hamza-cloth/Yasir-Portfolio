// A production build that never touches a database: the URLs are blanked for this process, so
// every page prerenders from the built-in content. Used by `npm run check`, which must pass
// whether or not the local database is running. (Vercel builds use `vercel-build` instead.)
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DATABASE_URL: "", DATABASE_URL_UNPOOLED: "" },
});

process.exit(result.status ?? 1);
