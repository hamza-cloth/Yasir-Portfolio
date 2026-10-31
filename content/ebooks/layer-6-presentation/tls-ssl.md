TLS (Transport Layer Security) is what puts the padlock in the address bar. It does three jobs at once: it **encrypts** the traffic, it proves the server is **who it claims to be**, and it detects any **tampering** on the way. SSL was its predecessor; every SSL version is broken and switched off, but the name stuck.

## The TLS 1.3 handshake

1. **ClientHello:** the browser lists the TLS versions and ciphers it supports and sends a key share for the key exchange.
2. **ServerHello:** the server picks the version and cipher and sends its own key share. From these two shares, both sides independently compute the same secret. It never crosses the wire.
3. **Certificate and signature:** the server sends its certificate and signs the handshake with the matching private key, proving it holds it.
4. **Finished:** both sides confirm the handshake was not altered.

Everything after that, the HTTP request included, is encrypted. TLS 1.3 needs only one round trip; TLS 1.2 needed two.

## Certificates and trust

A certificate binds a domain name to a public key and is signed by a **certificate authority** (CA). The browser checks:

- The name in the certificate matches the site.
- It is within its valid dates.
- It chains up, through intermediate certificates, to a root CA the device already trusts.
- It has not been revoked.

Free, automated certificates from Let's Encrypt have made HTTPS the default; most hosting platforms renew them for you.

## Inspecting a site

```bash
openssl s_client -connect example.com:443 -servername example.com </dev/null
curl -vI https://example.com
```

Look for the protocol version, the cipher, the certificate's subject and issuer, and `Verify return code: 0 (ok)`.

## Settings worth having

- Only **TLS 1.2 and 1.3** enabled.
- **HSTS**, so browsers never try plain HTTP again:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

- Redirect all HTTP to HTTPS.
- Monitor certificate expiry.

## When it goes wrong

| Error                             | Usual cause                                              |
| --------------------------------- | -------------------------------------------------------- |
| Certificate expired               | Renewal failed or was never automated                    |
| Name mismatch                     | Certificate for `example.com`, site is `www.example.com` |
| Unable to get local issuer        | Server did not send the intermediate certificate         |
| Works in browser, fails in an app | The app has an old trust store or pins a certificate     |
| Many sites fail on one PC         | Wrong system clock, or antivirus intercepting HTTPS      |
