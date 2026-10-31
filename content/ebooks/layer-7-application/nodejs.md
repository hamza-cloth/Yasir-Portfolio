Node.js runs JavaScript outside the browser, on servers and command lines. Your JavaScript runs on **one thread**, yet a single Node process can serve thousands of connections. The reason is the **event loop**: slow work is handed off, and your code is only run when there is something ready to do.

## Non-blocking I/O

```ts
import { readFile } from "node:fs/promises";

const data = await readFile("report.csv", "utf8");
```

While the file is being read, Node does not sit and wait. It hands the job to the operating system (or its own small thread pool), and the thread goes on serving other requests. When the read finishes, the callback is queued, and the event loop runs it as soon as the call stack is empty.

## Don't block the loop

Because there is one JavaScript thread, anything that keeps it busy stalls **every** user:

```ts
// Blocks the whole server while it runs
const hash = crypto.pbkdf2Sync(password, salt, 600_000, 32, "sha256");

// Hands the work off; other requests keep flowing
const hash = await promisify(crypto.pbkdf2)(password, salt, 600_000, 32, "sha256");
```

- Prefer the async versions of file, crypto and compression functions.
- Move heavy CPU work, such as large image processing, to worker threads or a separate service.
- Avoid huge synchronous loops over big arrays in request handlers.

## Modules and packages

```json
{
  "type": "module",
  "scripts": { "start": "node server.js", "dev": "node --watch server.js" },
  "engines": { "node": ">=22" }
}
```

- `npm install` adds packages; commit `package-lock.json` so every machine installs the same versions.
- `npm ci` installs exactly from the lockfile; use it in CI and production builds.
- Keep secrets in environment variables, read with `process.env.NAME`, never in the code.

## A minimal server

```ts
import { createServer } from "node:http";

createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true }));
}).listen(3000);
```

Frameworks such as Express, Fastify and NestJS build on this.

## Errors that crash the process

An exception that nobody catches, or a rejected promise that nobody handles, can stop the process. Always `await` promises inside `try/catch` where failure is possible, and run production servers under a supervisor (systemd, PM2, a container platform) that restarts them.

## When it goes wrong

- **The whole API freezes for seconds at a time:** something synchronous and heavy is blocking the loop.
- **Memory climbs until the process dies:** an ever-growing cache, array or listener list.
- **Works locally, not on the server:** different Node version. Pin it in `engines` and in the deployment settings.
