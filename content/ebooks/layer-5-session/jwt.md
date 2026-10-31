A JSON Web Token is a small, signed piece of JSON. Instead of storing a session on the server, the server hands the client a token that carries the facts itself, such as who the user is and when the token expires, plus a signature that proves nobody changed them.

## The three parts

A JWT is three base64url strings joined by dots:

```text
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiIsInJvbGUiOiJzdGFmZiIsImV4cCI6MTczMDAwMDAwMH0.5mX…Qe8
```

1. **Header:** the signing algorithm, for example `{"alg": "HS256"}`.
2. **Payload:** the claims.
3. **Signature:** computed over the header and payload with a secret key (HS256) or a private key (RS256, ES256).

```json
{
  "sub": "42",
  "role": "staff",
  "iat": 1730000000,
  "exp": 1730000900
}
```

`sub` is the subject (the user), `iat` when it was issued, `exp` when it expires.

> [!WARNING]
> The payload is **encoded, not encrypted**. Anyone holding the token can read it. Never put passwords, personal details or secrets in a JWT.

## Verifying a token

On every request, the server must:

1. Check the signature with the expected key and **the expected algorithm only**. Reject `alg: none`.
2. Check `exp` (and `nbf` if present).
3. Check `iss` and `aud` if you use them.
4. Only then trust the claims.

```ts
import { jwtVerify } from "jose";

const { payload } = await jwtVerify(token, secret, {
  algorithms: ["HS256"],
  issuer: "https://api.example.com",
});
```

## The revocation problem

A valid JWT stays valid until it expires, even if the user logs out or is disabled. The usual answer:

- Keep **access tokens short-lived**, around 5 to 15 minutes.
- Use a longer-lived **refresh token**, stored server-side so it can be revoked, to get new access tokens.
- Keep a deny-list for the rare emergency.

## Where to keep it in a browser

An `HttpOnly`, `Secure` cookie is safer than `localStorage`, which any script on the page, including an injected one, can read.

## When it goes wrong

- **"Invalid signature" after a deploy:** the signing secret changed or differs between servers.
- **Tokens rejected a few minutes early or late:** the server clocks disagree. Sync them with NTP and allow a little leeway.
- **User still has access after being removed:** the access token has not expired yet.
