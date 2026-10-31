HTTP is the language browsers and servers speak: the client sends a **request**, the server sends back a **response**. HTTPS is the same conversation carried inside TLS, so nobody in between can read or change it.

## A request

```text
GET /pricing HTTP/1.1
Host: example.com
Accept: text/html
Cookie: sid=Hk3…
User-Agent: Mozilla/5.0 …
```

The first line has the **method**, the **path** and the version. Headers follow. A POST or PUT adds a blank line and a **body**.

## A response

```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: max-age=600
Set-Cookie: theme=dark; Path=/

<!doctype html>…
```

The status line, headers, a blank line, then the body.

## Status code families

| Range | Meaning       | Examples                                |
| ----- | ------------- | --------------------------------------- |
| 1xx   | Informational | 101 Switching Protocols                 |
| 2xx   | Success       | 200 OK, 201 Created, 204 No Content     |
| 3xx   | Redirect      | 301 Moved Permanently, 304 Not Modified |
| 4xx   | Client error  | 400, 401, 403, 404, 429                 |
| 5xx   | Server error  | 500, 502 Bad Gateway, 503, 504          |

**502 and 504** usually mean a proxy or load balancer could not get an answer from the app behind it. The app, not the proxy, is where to look.

## Headers worth knowing

- `Cache-Control`: how long browsers and CDNs may reuse a response.
- `Location`: where a redirect or a new resource points.
- `Content-Type`: what the body is, and its charset.
- `Authorization`: credentials such as a bearer token.
- `Strict-Transport-Security`, `Content-Security-Policy`: security policies for the browser.

## What the S adds

Before any HTTP is sent, HTTPS performs a TLS handshake. From then on every request and response, including the path, headers and cookies, is encrypted. Only the server's address and, usually, its name are visible to the network.

## HTTP/1.1, 2 and 3

- **HTTP/1.1:** one request at a time per connection; browsers open several connections.
- **HTTP/2:** many requests multiplexed on one TCP connection, with compressed headers.
- **HTTP/3:** runs over QUIC on UDP, so one lost packet no longer stalls every request.

The requests and responses look the same to your application in all three.

## Inspecting traffic

```bash
curl -I https://example.com
curl -v https://example.com/api/health
```

In the browser, the **Network** tab in DevTools shows every request, its status, headers, timing and body.

## When it goes wrong

- **Redirect loop:** the app redirects to HTTPS, and a proxy in front forwards as HTTP, so the app redirects again. Trust the proxy's `X-Forwarded-Proto` header.
- **Old version after a deploy:** a cache is still serving it. Check `Cache-Control` and the CDN.
- **Mixed content warnings:** an HTTPS page loads a script or image over HTTP. Load everything over HTTPS.
