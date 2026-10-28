// Applies pending migrations during a deploy, but only when a database is configured,
// so builds without one (previews, forks) still succeed and serve the default content.
import { execSync } from "node:child_process";

if (process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED) {
  execSync("prisma migrate deploy", { stdio: "inherit" });
} else {
  console.log("No DATABASE_URL set; skipping migrations.");
}
