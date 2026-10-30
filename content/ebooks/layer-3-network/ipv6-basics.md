IPv4 has about 4.3 billion addresses, and they ran out years ago. IPv6 uses 128 bits instead of 32, which is enough for every device to have a real, globally unique address with no NAT in the way.

## Reading an address

An IPv6 address is eight groups of four hexadecimal digits, separated by colons:

```text
2001:0db8:0000:0001:0000:0000:0000:0025
```

Two rules make it shorter:

1. **Drop leading zeros** in any group: `0db8` becomes `db8`, `0001` becomes `1`.
2. **Replace one run of all-zero groups** with `::`. Only once per address, or it would be ambiguous.

```text
2001:db8:0:1::25
```

## Prefix and interface ID

Almost every LAN uses a **/64**. The first 64 bits are the network prefix, the same for every device on the link. The last 64 bits are the interface ID, unique to each device.

| Part         | Example           |
| ------------ | ----------------- |
| Prefix       | 2001:db8:0:1::/64 |
| Interface ID | ::25              |

## Address types to recognise

| Starts with | Type           | Meaning                                        |
| ----------- | -------------- | ---------------------------------------------- |
| 2000::/3    | Global unicast | Public, routable on the internet               |
| fe80::/10   | Link-local     | Every interface has one; never leaves the link |
| fc00::/7    | Unique local   | Private, like 10.x.x.x                         |
| ff00::/8    | Multicast      | IPv6 has no broadcast; multicast replaces it   |
| ::1         | Loopback       | This machine                                   |

## Getting an address

- **SLAAC:** the router advertises the prefix and the device builds its own interface ID. No DHCP server needed.
- **DHCPv6:** a server hands out addresses, like DHCP for IPv4.
- **Static:** typed in, as for servers and routers.

## Checking a machine

```bat
ipconfig
ping -6 google.com
```

```cisco
show ipv6 interface brief
show ipv6 route
```

> [!TIP]
> A device that shows only an `fe80::` address has IPv6 switched on but never heard a router advertisement. Check that the router has `ipv6 unicast-routing` enabled.

## When it goes wrong

- **Some sites slow, others fine:** IPv6 is partly broken, so the browser tries it, waits and falls back to IPv4.
- **No global address:** no router advertisements reaching the device.
- **Firewall rules only for IPv4:** IPv6 traffic is either wide open or blocked. Write rules for both.
