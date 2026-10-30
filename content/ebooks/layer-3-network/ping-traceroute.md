`ping` asks "can I reach you?" `traceroute` asks "which way does the path go, and where does it stop?" Between them they solve a large share of network tickets.

## ping

ping sends ICMP **echo request** packets and waits for **echo replies**.

```bat
ping 8.8.8.8
ping -n 20 192.168.1.1
ping -t 10.0.0.5
```

```text
Reply from 8.8.8.8: bytes=32 time=18ms TTL=117
```

| Result                       | What it suggests                                 |
| ---------------------------- | ------------------------------------------------ |
| Replies, low time            | The path works                                   |
| Request timed out            | No reply: down, filtered or no route back        |
| Destination host unreachable | A router or your own PC has no way to deliver it |
| General failure              | Your own network stack or adapter is the problem |
| Some replies lost            | Congestion, a bad cable or Wi-Fi trouble         |

> [!NOTE]
> Many servers and firewalls block ping on purpose. A failed ping proves less than a successful one.

## Ping in a sensible order

1. `127.0.0.1`: the network stack works.
2. Your own IP address: the adapter is up.
3. The default gateway: the local network works.
4. A public IP such as `8.8.8.8`: routing and the internet link work.
5. A name such as `google.com`: DNS works.

The first step that fails tells you where to look.

## traceroute

Every IP packet carries a **TTL** (time to live). Each router lowers it by one and drops the packet when it reaches zero, sending back a "time exceeded" message. traceroute uses this on purpose: it sends packets with TTL 1, then 2, then 3, so each router on the path reveals itself in turn.

```bat
tracert google.com
```

```bash
traceroute google.com
mtr google.com
```

## Reading the output

```text
 1    1 ms    1 ms    1 ms  192.168.1.1
 2    9 ms    8 ms    9 ms  10.20.0.1
 3    *       *       *     Request timed out.
 4   18 ms   17 ms   18 ms  142.250.183.14
```

- Each line is a hop, with three timing samples.
- `* * *` on one hop, with later hops answering, just means that router does not reply to traceroute. Ignore it.
- `* * *` from some hop **to the end** means the path stops there.
- A sudden jump in time that continues to every later hop marks a slow link. A jump on one hop only is that router being slow to answer, not slow to forward.

## When it goes wrong

- **Gateway pings, internet does not:** the router, its NAT or the ISP link.
- **IP works, names do not:** DNS, not the network.
- **Trace loops between two addresses:** a routing loop, usually two static routes pointing at each other.
