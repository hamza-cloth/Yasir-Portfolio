import { connect } from "node:net";

const TIMEOUT_MS = 1500;
const URL_KEYS = ["DATABASE_URL", "DATABASE_URL_UNPOOLED"] as const;

function canReach(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host, port });
    const done = (reachable: boolean) => {
      socket.destroy();
      resolve(reachable);
    };
    socket.setTimeout(TIMEOUT_MS, () => done(false));
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
  });
}

// Development only. When .env points at a database that is not running (usually the local
// `prisma dev` server), every page would fail with a 500. Instead, clear the URL for this
// process so getDb() returns null and the site renders its built-in content, and say so once.
export async function skipUnreachableDatabase(): Promise<void> {
  const raw = process.env.DATABASE_URL;
  if (!raw) return;

  let host: string;
  let port: number;
  try {
    const url = new URL(raw);
    host = url.hostname;
    port = Number(url.port) || 5432;
  } catch {
    return;
  }

  if (await canReach(host, port)) return;

  for (const key of URL_KEYS) process.env[key] = "";
  // eslint-disable-next-line no-console -- the developer must see why the database is skipped
  console.warn(
    [
      "",
      `  ⚠ Database not reachable at ${host}:${port}. Running with the built-in content instead.`,
      "    To use the local database, start it in another terminal and restart `npm run dev`:",
      "      npx prisma dev --name yasir-portfolio",
      "",
    ].join("\n"),
  );
}
