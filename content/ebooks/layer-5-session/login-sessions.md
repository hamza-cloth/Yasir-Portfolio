HTTP forgets everything between requests. A login session is how a server remembers that the person asking for `/dashboard` is the same person who typed the right password a minute ago.

## How a session works

1. The user submits their email and password once.
2. The server checks the password against a slow, salted hash (Argon2 or bcrypt), never a plain copy.
3. It creates a **session**: a long random ID mapped to the user, stored on the server.
4. It sends the ID back in a cookie.
5. On every later request the browser sends the cookie, and the server looks the ID up.

The session ID itself means nothing. It is just a key; all the real information stays on the server.

## Cookie settings that matter

```text
Set-Cookie: sid=Hk3…9pQ; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800
```

| Attribute  | Why                                                      |
| ---------- | -------------------------------------------------------- |
| `HttpOnly` | JavaScript cannot read it, so an XSS bug cannot steal it |
| `Secure`   | Only sent over HTTPS                                     |
| `SameSite` | Not sent on most cross-site requests, which blocks CSRF  |
| `Max-Age`  | The session ends on its own                              |

## Rules for safe sessions

- Generate IDs from a cryptographically secure random source, at least 128 bits.
- **Issue a new session ID at login**, so an ID planted before login is useless (session fixation).
- Expire sessions after inactivity, and absolutely after a fixed time.
- On logout, delete the session **on the server**, not just the cookie.
- Store only a hash of the session ID in the database, so a leaked table cannot be replayed.
- Rate-limit login attempts per account and per address.

## Sessions or tokens?

Server-side sessions are simple and can be revoked instantly: delete the row and the user is out. Self-contained tokens such as JWTs avoid a lookup but are hard to revoke before they expire. For a normal web app with its own backend, sessions are usually the better choice.

## When it goes wrong

- **Users logged out at random:** sessions are stored in one server's memory and the load balancer sends them to another server. Use a shared store such as Redis or the database.
- **Logged in on HTTP, logged out on HTTPS:** a `Secure` cookie is not sent over HTTP. Redirect everything to HTTPS.
- **Login works locally, not in production:** the cookie's domain or `SameSite` setting does not match the real site.
