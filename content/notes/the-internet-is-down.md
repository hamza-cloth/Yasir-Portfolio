"The internet is down" is the most common support ticket there is, and it almost never means the internet is down. It means something between the user and a website stopped working. The fastest way to find it is to walk up the layers, from the cable to the browser, and stop at the first one that fails.

## Before you touch anything

Ask three questions. They save more time than any command.

1. **Is it just you?** One user, one floor, or everyone?
2. **What exactly fails?** Every site, one site, or one app?
3. **What changed?** A new cable, a moved desk, an update, a password change.

## Layer 1: is there a link?

- Look at the port lights on the PC and the switch. No light usually means no link.
- Reseat the cable at both ends, then try a known-good cable.
- On Wi-Fi, check the adapter is on and the laptop is not in airplane mode.

## Layer 2: is the device on the right network?

- On Wi-Fi, confirm the SSID. Guest and staff networks often look alike.
- On a wired port, the switch port may be in the wrong VLAN or shut down by port security after a device change.

## Layer 3: does the device have a usable address?

Run this on Windows:

```bat
ipconfig /all
```

| What you see                                | What it means                              |
| ------------------------------------------- | ------------------------------------------ |
| An address like 192.168.1.25 with a gateway | DHCP worked, move on                       |
| 169.254.x.x                                 | DHCP failed: no reply from the DHCP server |
| An address but no default gateway           | Wrong static settings or a bad DHCP scope  |
| "Media disconnected"                        | Back to layer 1                            |

A 169.254 address is the classic sign of a DHCP problem. Try `ipconfig /release` and `ipconfig /renew`, then check the DHCP server or relay.

Now test outward, one hop at a time:

```bat
ping 192.168.1.1
ping 8.8.8.8
tracert 8.8.8.8
```

- **Gateway fails:** the problem is local, such as the cable, VLAN or address.
- **Gateway works, 8.8.8.8 fails:** the problem is past the router, such as the ISP link, a firewall or NAT.
- **tracert stops at a hop:** that hop is where to look next.

> [!NOTE]
> Some servers block ping on purpose. A failed ping to a website is a clue, not proof.

## Layers 4–7: the network works but the app does not

If `ping 8.8.8.8` works but websites do not load, suspect DNS first:

```bat
nslookup example.com
```

- **No answer or a timeout:** the DNS server is unreachable or wrong. Check the DNS servers in `ipconfig /all`.
- **It resolves but the site still fails:** check the browser, a proxy, the date and time (TLS certificates fail when the clock is wrong), or a firewall rule on that port.

To see what a machine is actually connected to:

```bat
netstat -an
```

## Close the ticket properly

Write down what failed, the layer it was at, and what fixed it. The next person with the same symptom, often you, will thank you.

> [!TIP]
> Most tickets end at layer 1 or at DHCP. Check those before anything clever.
