An IP address gets data to a machine. A **port** gets it to the right program on that machine. Port numbers run from 0 to 65535, separately for TCP and for UDP.

## Well-known ports

Servers listen on agreed ports so clients know where to knock.

| Port   | Protocol | Service                     |
| ------ | -------- | --------------------------- |
| 20, 21 | TCP      | FTP                         |
| 22     | TCP      | SSH                         |
| 25     | TCP      | SMTP (mail between servers) |
| 53     | UDP/TCP  | DNS                         |
| 67, 68 | UDP      | DHCP                        |
| 80     | TCP      | HTTP                        |
| 123    | UDP      | NTP (time)                  |
| 443    | TCP/UDP  | HTTPS (UDP for HTTP/3)      |
| 3389   | TCP      | Remote Desktop              |
| 5432   | TCP      | PostgreSQL                  |
| 6379   | TCP      | Redis                       |

Ports 0 to 1023 are the well-known range. The client side uses a random **ephemeral** port, usually 49152 to 65535 on Windows.

## Sockets

A socket is one end of a conversation: an IP address plus a port. A TCP connection is identified by **both** ends, plus the protocol:

```text
192.168.1.20:51514  ↔  93.184.216.34:443   (TCP)
```

That pair is why a web server can talk to thousands of clients on the same port 443 at once. Each connection has a different client address or port, so each pair is unique. It is also why one laptop can open ten tabs to the same site: each tab gets its own ephemeral port.

## Listening

A server program opens a socket and **listens** on its port. If nothing is listening, a TCP connection attempt gets an immediate refusal.

Test whether a port is reachable:

```powershell
Test-NetConnection example.com -Port 443
```

```bash
nc -vz example.com 443
```

## Finding what owns a port

```bat
netstat -ano | findstr :443
tasklist /fi "PID eq 4120"
```

```bash
ss -tlnp
```

## When it goes wrong

- **"Connection refused":** the machine answered, but nothing is listening on that port.
- **"Connection timed out":** nothing answered at all; usually a firewall dropping the packets, or the wrong address.
- **"Address already in use" when starting a service:** another program already holds that port. Find it with netstat and stop it, or pick another port.
