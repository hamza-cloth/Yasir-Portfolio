DNS (the Domain Name System) turns names that people remember, such as `www.example.com`, into the IP addresses that computers need. Almost everything on a network depends on it, which is why "the internet is down" so often turns out to be DNS.

## How a name is resolved

1. The laptop asks its configured **resolver** (the router, the ISP, or a public one such as 1.1.1.1 or 8.8.8.8).
2. If the resolver has a cached answer, it replies at once.
3. Otherwise it asks a **root** server, which points it to the servers for `.com`.
4. The `.com` servers point it to the **authoritative** name servers for `example.com`.
5. Those servers give the actual answer.
6. The resolver caches the answer for its **TTL** and returns it to the laptop, which caches it too.

## Record types

| Type  | Holds                                | Example                                    |
| ----- | ------------------------------------ | ------------------------------------------ |
| A     | IPv4 address                         | `example.com → 93.184.216.34`              |
| AAAA  | IPv6 address                         | `example.com → 2606:2800:…`                |
| CNAME | Alias to another name                | `www → example.com`                        |
| MX    | Mail servers, with priority          | `10 mail.example.com`                      |
| TXT   | Text: SPF, DKIM, domain verification | `v=spf1 include:_spf.google.com ~all`      |
| NS    | The domain's authoritative servers   | `ns1.provider.net`                         |
| PTR   | Reverse lookup: IP to name           | `34.216.184.93.in-addr.arpa → example.com` |

## Asking DNS yourself

```bat
nslookup example.com
nslookup -type=mx example.com 8.8.8.8
ipconfig /displaydns
ipconfig /flushdns
```

```bash
dig example.com
dig +short MX example.com
dig @1.1.1.1 example.com
```

Asking a specific server (`8.8.8.8`, `1.1.1.1`) tells you whether the problem is your resolver or the record itself.

## TTL and changes

A record's TTL says how long resolvers may cache it. Before moving a site to a new server, lower the TTL (say to 300 seconds) a day ahead. After the move, raise it again.

## When it goes wrong

| Symptom                                       | Likely cause                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| `ping 8.8.8.8` works, `ping google.com` fails | The PC's DNS server is wrong or unreachable                             |
| New site works for some people only           | Old answer still cached; wait out the TTL                               |
| One internal name fails                       | Missing record on the internal DNS server                               |
| Email not arriving                            | Missing or wrong MX, or SPF/DKIM records                                |
| Everything slow to start, then fine           | A dead DNS server listed first; the PC times out before trying the next |
