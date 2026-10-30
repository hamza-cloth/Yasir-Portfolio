Before TCP sends a single byte of data, both sides agree to talk and agree on where their byte numbering starts. That agreement takes three packets.

## Opening a connection

1. **SYN:** the client picks a random initial sequence number, x, and sends a segment with the SYN flag set.
2. **SYN-ACK:** the server picks its own number, y, and replies with SYN and ACK set, acknowledging x + 1.
3. **ACK:** the client acknowledges y + 1.

Both sides are now **ESTABLISHED**. Each knows the other is reachable, and each knows the other's starting sequence number, so every later byte can be counted and acknowledged.

Random starting numbers make it hard for an attacker to inject fake segments into someone else's connection.

## Closing a connection

Each direction closes on its own:

1. The side that has finished sends **FIN**.
2. The other side **ACK**s it, sends any last data, then sends its own **FIN**.
3. The first side **ACK**s that.

The side that closed first then waits in `TIME_WAIT` for a short while, so any stray late segments die out before the same port pair is reused. Seeing many `TIME_WAIT` lines on a busy server is normal.

A connection can also be cut abruptly with **RST** (reset), for example when a packet arrives for a port where nothing is listening.

## Watching it happen

```bash
sudo tcpdump -n -i any 'tcp port 443 and (tcp[tcpflags] & (tcp-syn|tcp-fin|tcp-rst) != 0)'
```

In Wireshark, the filter `tcp.flags.syn == 1` shows only connection attempts. A SYN with no SYN-ACK in reply means the server never answered.

## What the handshake tells you when troubleshooting

| What you see                    | Likely cause                                         |
| ------------------------------- | ---------------------------------------------------- |
| SYN, no reply, SYN again        | Firewall dropping it, or the server is unreachable   |
| SYN, then RST                   | Server reachable, nothing listening on that port     |
| Handshake completes, then stall | Application problem, or MTU issue on large packets   |
| Many half-open SYN_RECEIVED     | A SYN flood, or clients that cannot get replies back |

> [!TIP]
> "Connection refused" and "connection timed out" are not the same problem. Refused means the handshake got an RST: the host is there. Timed out means nothing came back at all.
