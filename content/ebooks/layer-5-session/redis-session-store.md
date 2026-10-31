If sessions live in an app server's memory, they vanish on every restart and only that one server knows about them. Put two servers behind a load balancer and users are logged out whenever a request lands on the other one. A shared session store fixes both problems, and **Redis** is the usual choice.

## Why Redis fits

- **In memory:** a lookup takes well under a millisecond.
- **Expiry built in:** every key can have a time to live, so old sessions delete themselves.
- **Shared:** every app server talks to the same Redis, so any server can answer any request.
- **Simple:** a session is just a key and a value.

## The shape of a session

```bash
SET sess:7f3a9c… '{"userId":42,"role":"staff","tenant":"clinic-a"}' EX 1800
GET sess:7f3a9c…
TTL sess:7f3a9c…
DEL sess:7f3a9c…
```

- `EX 1800` expires the key after 30 minutes.
- Refresh the TTL on each request for a sliding timeout.
- `DEL` on logout ends the session instantly, everywhere.

## In a Node.js app

```ts
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export async function saveSession(id: string, data: object) {
  await redis.set(`sess:${id}`, JSON.stringify(data), { EX: 1800 });
}

export async function readSession(id: string) {
  const raw = await redis.get(`sess:${id}`);
  return raw ? JSON.parse(raw) : null;
}
```

## Keeping it safe and healthy

- Never expose Redis to the internet. Bind it to a private network, require a password (or ACL users) and use TLS between servers.
- Set `maxmemory` and an eviction policy, and watch memory use. A full Redis that cannot evict will refuse writes.
- Decide what happens if Redis restarts: with persistence (AOF or RDB snapshots) sessions survive; without it, everyone logs in again, which may be acceptable.
- Prefix keys (`sess:`, `rate:`, `cache:`) so different uses never collide.

## Checking it

```bash
redis-cli ping
redis-cli info memory
redis-cli --scan --pattern 'sess:*' | head
```

## When it goes wrong

- **Everyone logged out at once:** Redis restarted without persistence, or memory filled and sessions were evicted.
- **Slow logins:** the app opens a new Redis connection per request. Reuse one client.
- **Sessions never expire:** they were written without a TTL. Check with `TTL key`; `-1` means none.
